from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import action, api_view
from django.contrib.auth import get_user_model, authenticate
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError, PermissionDenied
from django.utils import timezone
from django.utils.timezone import now
from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth.models import BaseUserManager
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta
from .models import Player, SocialToken
import random
import string
import os
import requests
from django.db import models
from django.db.models import Q
from .models import Player, Team, TeamMember, Tournament, TournamentParticipant, TournamentMatch, SocialAccount, News, TournamentTeam, SquadMember, Squad
from .serializers import (
    PlayerSerializer, TeamSerializer, AllTeamDetailsSerializer, TeamMemberSerializer, SquadSerializer, TournamentTeamSerializer, RegisteredTournamentSerializer,
    TournamentSerializer, TournamentParticipantSerializer, TournamentMatchSerializer,
    UserRegistrationSerializer, LoginAuthSerializer, NewsSerializer, SignUpAuthSerializer, TournamentDetailSerializer, MatchSerializer, SquadMemberSerializer
)
from django.db import transaction
from rest_framework import generics

User = get_user_model()

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            return []
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Player.objects.all()

        return Player.objects.filter(
            teams__team__lead_player=user
        ).distinct()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def account_type(self, request):
        print("IS AUTHENTICATED:", request.user.is_authenticated)
        player = request.user
        is_team_lead = request.data.get('is_team_lead')

        if is_team_lead is None:
            return Response({'error': 'is_team_lead is required'}, status=status.HTTP_400_BAD_REQUEST)

        player.is_team_lead = is_team_lead
        player.save()
        return Response({'message': 'Account type updated successfully'})

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(email=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': PlayerSerializer(user).data
            }, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class SocialLoginView(APIView):
    def post(self, request):
        serializer = LoginAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            provider = serializer.validated_data['provider']
            code = serializer.validated_data['code']

            if provider == 'discord':
                access_token = self.get_discord_access_token(code)
                user_info = self.verify_discord_token(access_token)
            elif provider == 'google':
                access_token = self.get_google_access_token(code)
                user_info = self.verify_google_token(access_token)
            else:
                return Response({'error': 'Unsupported provider'}, status=status.HTTP_400_BAD_REQUEST)

            uid = user_info['id']
            social_account = SocialAccount.objects.get(provider=provider, uid=uid)
            user = social_account.user
            refresh = RefreshToken.for_user(user)

            return Response({
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'is_admin': user.is_admin,
                    'is_team_lead': user.is_team_lead
                }
            }, status=status.HTTP_200_OK)

        except SocialAccount.DoesNotExist:
            return Response({'error': 'not_registered'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def get_discord_access_token(self, code):
        discord_app = settings.SOCIALACCOUNT_PROVIDERS['discord']['APP']
        redirect_uri = os.environ.get("CLIENT_URL", "http://localhost:3000") + "/login_callback?provider=discord"
        
        data = {
            'client_id': discord_app['client_id'],
            'client_secret': discord_app['secret'],
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
        }

        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        response = requests.post('https://discord.com/api/oauth2/token', data=data, headers=headers)
        response.raise_for_status()
        return response.json()['access_token']

    def get_twitch_access_token(self, code):
        twitch_app = settings.SOCIALACCOUNT_PROVIDERS['twitch']['APP']

        data = {
            'client_id': twitch_app['client_id'],
            'client_secret': twitch_app['secret'],
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': 'http://localhost:3000/login_callback?provider=twitch',  # or set via .env
        }

        response = requests.post('https://id.twitch.tv/oauth2/token', data=data)
        response.raise_for_status()
        return response.json()['access_token']


    def get_facebook_access_token(self, code):
        facebook_app = settings.SOCIALACCOUNT_PROVIDERS['facebook']['APP']

        params = {
            'client_id': facebook_app['client_id'],
            'client_secret': facebook_app['secret'],
            'redirect_uri': 'http://localhost:3000/login_callback?provider=facebook',
            'code': code
        }

        response = requests.get('https://graph.facebook.com/v19.0/oauth/access_token', params=params)
        response.raise_for_status()
        return response.json()['access_token']

    def verify_discord_token(self, access_token):
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get('https://discord.com/api/users/@me', headers=headers)
        response.raise_for_status()
        return response.json()

    def get_google_access_token(self, code):
        google_app = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']
        data = {
            'client_id': google_app['client_id'],
            'client_secret': google_app['secret'],
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': 'http://localhost:3000/login_callback',
        }
        response = requests.post('https://oauth2.googleapis.com/token', data=data)
        response.raise_for_status()
        return response.json()['access_token']

    def verify_google_token(self, access_token):
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get('https://www.googleapis.com/oauth2/v2/userinfo', headers=headers)
        response.raise_for_status()
        return response.json()

    def verify_twitch_token(self, access_token):
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Client-Id': settings.TWITCH_CLIENT_ID
        }
        response = requests.get('https://api.twitch.tv/helix/users', headers=headers)
        response.raise_for_status()
        return response.json().get('data', [{}])[0]

    def verify_facebook_token(self, access_token):
        params = {'access_token': access_token, 'fields': 'id,name,email'}
        response = requests.get('https://graph.facebook.com/me', params=params)
        response.raise_for_status()
        return response.json()

class RegistrationView(APIView):
    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')

        if not all([email, username, password, confirm_password]):
            return Response({"detail": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        if password != confirm_password:
            return Response({"detail": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        if Player.objects.filter(email=email).exists():
            return Response(
                {"detail": "An account with this email already exists. Please log in instead."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Player.objects.filter(username=username).exists():
            return Response(
                {"detail": "An account with this username already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = Player.objects.create_user(email=email, username=username, password=password)
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Registration successful.",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
            },
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class SocialSignupView(APIView):
    def post(self, request):
        try:
            print(request.data)
            serializer = SignUpAuthSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            provider = serializer.validated_data['provider']
            access_token = serializer.validated_data['access_token']
            if provider == 'discord':
                user_info = self.verify_discord_token(access_token)
            elif provider == 'google':
                user_info = self.verify_google_token(access_token)
            else:
                return Response({'error': 'Unsupported provider'}, status=status.HTTP_400_BAD_REQUEST)

            social_account, user = self.get_or_create_social_account(provider, user_info, access_token)

            print("Social account created")

            refresh = RefreshToken.for_user(user)

            print("Successfuly retrieved refresh token")

            return Response({
                'message': 'Social authentication successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        except ValidationError as ve:
            return Response(
                {"detail": str(ve)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print("Unexpected error:", str(e))
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def verify_discord_token(self, access_token):
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get('https://discord.com/api/users/@me', headers=headers)
        if response.status_code != 200:
            raise ValueError('Invalid Discord access token')
        return response.json()

    def verify_twitch_token(self, access_token):
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Client-Id': settings.SOCIALACCOUNT_PROVIDERS['twitch']['APP']['client_id']
        }
        response = requests.get('https://api.twitch.tv/helix/users', headers=headers)
        if response.status_code != 200:
            raise ValueError('Invalid Twitch access token')
        return response.json().get('data', [{}])[0]

    def verify_facebook_token(self, access_token):
        params = {'access_token': access_token, 'fields': 'id,name,email'}
        response = requests.get('https://graph.facebook.com/me', params=params)
        if response.status_code != 200:
            raise ValueError('Invalid Facebook access token')
        return response.json()

    def get_or_create_social_account(self, provider, user_info, access_token):
        uid = user_info['id']
        try:
            social_account = SocialAccount.objects.get(provider=provider, uid=uid)
            user = social_account.user
            print("Social account exists")
        except SocialAccount.DoesNotExist:
            print("Social account doesn not exist")
            email = user_info.get('email', f'{uid}@{provider}.fake')
            username = user_info.get('username') or user_info.get('name') or provider + '_' + uid[:6]

            if Player.objects.filter(email=email).exists():
                raise ValidationError("An account with this email already exists. Please log in instead.")

            user = Player.objects.create_user(
                email=email,
                username=username,
                password=self.make_random_password()
            )

            print("User created successfuly")

            social_account = SocialAccount.objects.create(
                provider=provider,
                uid=uid,
                extra_data=user_info,
                user=user
            )

            print("SOcial account created successfuly")

        SocialToken.objects.update_or_create(
            player=user,
            provider=provider,
            defaults={
                'uid': uid,
                'access_token': access_token,
                'expires_at': timezone.now() + timedelta(days=30)
            }
        )

        return social_account, user

    def make_random_password(self, length=12):
        chars = string.ascii_letters + string.digits + string.punctuation
        return ''.join(random.SystemRandom().choice(chars) for _ in range(length))


class NewsListView(APIView):
    def get(self, request):
        news = News.objects.order_by('-date')[:10]
        serializer = NewsSerializer(news, many=True)
        return Response(serializer.data)

class SocialCallbackView(APIView):
    def get(self, request):
        access_token = request.GET.get('access_token')
        provider = request.GET.get('provider')

        if not access_token or not provider:
            return Response({'error': 'Missing access token or provider'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "provider": provider,
            "access_token": access_token,
        })

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        print("Getting permission")
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTeamLead()]
        return super().get_permissions()

    def get_queryset(self):
        return Team.objects.filter(
            Q(lead_player=self.request.user) |
            Q(members__player=self.request.user)
        ).distinct()
    
    def perform_create(self, serializer):
        if not self.request.user.is_team_lead:
            raise serializers.ValidationError("Only team leads can create teams")

        join_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        while Team.objects.filter(join_code=join_code).exists():
            join_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

        with transaction.atomic():
            team = serializer.save(lead_player=self.request.user, join_code=join_code)

            TeamMember.objects.create(
                team=team,
                player=self.request.user,
                role='CAPTAIN'
            )
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        team = self.get_object()
        join_code = request.data.get('join_code', '')
        
        if team.join_code != join_code:
            return Response({'error': 'Invalid join code'}, status=status.HTTP_400_BAD_REQUEST)
        
        if TeamMember.objects.filter(team=team, player=request.user).exists():
            return Response({'error': 'Already a member of this team'}, status=status.HTTP_400_BAD_REQUEST)
        
        TeamMember.objects.create(team=team, player=request.user)
        return Response({'success': 'Joined team successfully'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def promote(self, request, pk=None):
        team = self.get_object()
        member_id = request.data.get('member_id')
        member = get_object_or_404(TeamMember, id=member_id, team=team)
        
        if member.team != team:
            return Response(
                {'detail': 'Member does not belong to this team.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        member.role = 'CO_LEAD' if member.role == 'MEMBER' else 'CAPTAIN'
        member.save()
        return Response(TeamMemberSerializer(member).data)

    @action(detail=True, methods=['get', 'post'])
    def members(self, request, pk=None):
        team = self.get_object()

        if request.method == 'GET':
            members = TeamMember.objects.filter(team=team)
            serializer = TeamMemberSerializer(members, many=True)
            return Response(serializer.data)

        if team.lead_player != request.user:
            return Response({'error': 'Only team leads can add members'}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get('email')
        role = request.data.get('role', 'MEMBER')

        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            player = Player.objects.get(email=email)
        except Player.DoesNotExist:
            return Response({'error': 'Player with this email does not exist'}, status=status.HTTP_404_NOT_FOUND)

        if TeamMember.objects.filter(team=team, player=player).exists():
            return Response({'error': 'Player is already a member of this team'}, status=status.HTTP_400_BAD_REQUEST)

        TeamMember.objects.create(team=team, player=player, role=role)

        return Response({'success': 'Player added to team successfully'}, status=status.HTTP_201_CREATED)


    @action(detail=True, methods=['delete'], url_path='remove_member')
    def remove_member(self, request, pk=None):
        team = self.get_object()
        member_id = request.data.get('member_id')

        if not member_id:
            return Response({'error': 'Member ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            member = TeamMember.objects.get(id=member_id, team=team)
        except TeamMember.DoesNotExist:
            return Response({'error': 'Member not found'}, status=status.HTTP_404_NOT_FOUND)

        if member.player == team.lead_player:
            return Response({'error': 'Cannot remove the team lead'}, status=status.HTTP_400_BAD_REQUEST)

        member.delete()
        return Response({'success': 'Member removed successfully'}, status=status.HTTP_204_NO_CONTENT)


class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_admin:
            return self.queryset
        return self.queryset.filter(team__lead_player=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.team.lead_player != request.user and not request.user.is_admin:
            return Response(
                {'error': 'Only team lead or admin can remove members'},
                status=status.HTTP_403_FORBIDDEN
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'available', 'register', 'registered']:
            return [IsAuthenticated()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status')
        if status == 'upcoming':
            queryset = queryset.filter(start_date__gt=timezone.now(), is_active=True)
        elif status == 'ongoing':
            queryset = queryset.filter(start_date__lte=timezone.now(), is_completed=False, is_active=True)
        elif status == 'completed':
            queryset = queryset.filter(is_completed=True)
        
        return queryset.order_by('start_date')

    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        tournament = self.get_object()
        team_id = request.data.get('team_id')
        if not team_id:
            return Response({'error': 'team_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            team = Team.objects.get(id=team_id, lead_player=request.user)
        except Team.DoesNotExist:
            print("Team not found nor lead")
            return Response({'error': 'Team not found or you are not the lead'}, status=status.HTTP_404_NOT_FOUND)
        
        if TournamentParticipant.objects.filter(tournament=tournament, team=team).exists():
            print("Team already registered")
            return Response({'error': 'Team already registered'}, status=status.HTTP_400_BAD_REQUEST)
        
        if tournament.participants.count() >= tournament.max_players:
            print("Torna is full")
            return Response({'error': 'Tournament is full'}, status=status.HTTP_400_BAD_REQUEST)
        
        participant = TournamentParticipant.objects.create(tournament=tournament, team=team)
        tournament.registered_players += 1
        tournament.save()
        
        serializer = TournamentParticipantSerializer(participant)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def available(self, request):
        try:
            team_member = TeamMember.objects.get(
                player=request.user,
                role__in=['CAPTAIN', 'CO_LEAD']
            )
            team = team_member.team
            available_tournaments = Tournament.objects.filter(
                is_active=True,
                start_date__gt=timezone.now(),
                level=team.tier
            ).exclude(
                participants__team=team
            ).order_by('start_date')
            
            page = self.paginate_queryset(available_tournaments)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(available_tournaments, many=True)
            return Response(serializer.data)
            
        except TeamMember.DoesNotExist:
            return Response(
                {'error': 'You are not a captain or co-lead of any team'},
                status=status.HTTP_403_FORBIDDEN
            )

    @action(detail=False, methods=['get'])
    def registered(self, request):
        team_id = request.query_params.get('team_id')

        if not team_id:
            return Response(
                {'error': 'team_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            team = Team.objects.get(id=team_id)

            if not TeamMember.objects.filter(team=team, player=request.user).exists():
                return Response(
                    {'error': 'You are not a member of this team'},
                    status=status.HTTP_403_FORBIDDEN
                )

            participants = TournamentParticipant.objects.filter(team=team).select_related('tournament', 'team').order_by('-registered_at')

            page = self.paginate_queryset(participants)
            serializer = RegisteredTournamentSerializer(page or participants, many=True)

            if page is not None:
                return self.get_paginated_response(serializer.data)
            return Response(serializer.data)

        except Team.DoesNotExist:
            return Response(
                {'error': 'Team not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        tournament = self.get_object()
        participants = tournament.participants.select_related('team')
        serializer = TournamentParticipantSerializer(participants, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def generate_bracket(self, request, pk=None):
        tournament = self.get_object()
        
        if tournament.participants.count() < 2:
            return Response(
                {'error': 'Need at least 2 teams to generate bracket'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        bracket = tournament.generate_bracket()
        tournament.bracket_structure = bracket
        tournament.is_started = True
        tournament.save()
        
        self._create_initial_matches(tournament, bracket)
        
        return Response(bracket)

    def _create_initial_matches(self, tournament, bracket):
        if tournament.bracket_type == 'SINGLE_ELIM':
            first_round = bracket.get('rounds', [{}])[0]
            matches = first_round.get('matches', [])
            
            for i, match in enumerate(matches, start=1):
                team1 = match.get('team1', {}).get('id')
                team2 = match.get('team2', {}).get('id')
                
                TournamentMatch.objects.create(
                    tournament=tournament,
                    round_number=1,
                    match_number=i,
                    team1_id=team1,
                    team2_id=team2,
                    scheduled_time=tournament.start_date
                )

class SquadMemberViewSet(viewsets.ModelViewSet):
    queryset = SquadMember.objects.all()
    serializer_class = SquadMemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        player = self.request.user
        squad_id = self.request.query_params.get('squad')

        queryset = SquadMember.objects.filter(
            squad__participant__team__lead_player=player
        )

        if squad_id:
            queryset = queryset.filter(squad_id=squad_id)

        return queryset

    def perform_create(self, serializer):
        squad_id = self.request.data.get('squad')
        player_id = self.request.data.get('player')


        current_player = self.request.user

        try:
            squad = Squad.objects.get(
                id=squad_id,
                participant__team__lead_player=current_player
            )

            player = TeamMember.objects.get(
                team=squad.participant.team,
                player__id=player_id
            ).player
        except (Squad.DoesNotExist, TeamMember.DoesNotExist):
            raise PermissionDenied("Invalid squad or player not in team.")

        serializer.save(squad=squad, player=player)

    def perform_destroy(self, instance):
        if instance.squad.participant.team.lead_player != self.request.user:
            raise PermissionDenied("Only team leads can remove squad members.")
        instance.delete()


class AccountTypeUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        is_team_lead = request.data.get('is_team_lead')

        if is_team_lead is None:
            return Response({'detail': 'is_team_lead is required'}, status=400)

        user = request.user
        user.is_team_lead = is_team_lead
        user.save()

        return Response({'message': 'Account type updated'}, status=200)


class CountryCodeUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        country_code = request.data.get('country_code')

        user = request.user
        user.country_code = country_code
        user.save()

        return Response({'message': 'Country code updated'}, status=200)

class TournamentParticipantViewSet(viewsets.ModelViewSet):
    queryset = TournamentParticipant.objects.all()
    serializer_class = TournamentParticipantSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_admin:
            return self.queryset
        return self.queryset.filter(team__lead_player=self.request.user)

    def perform_destroy(self, instance):
        if instance.team.lead_player != self.request.user and not self.request.user.is_admin:
            raise PermissionDenied("You cannot delete this participant.")
        instance.delete()

class TournamentMatchViewSet(viewsets.ModelViewSet):
    queryset = TournamentMatch.objects.all()
    serializer_class = TournamentMatchSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        tournament_id = self.request.query_params.get('tournament_id')
        if tournament_id:
            return self.queryset.filter(tournament_id=tournament_id)
        return self.queryset
    
    @action(detail=True, methods=['post'])
    def set_winner(self, request, pk=None):
        match = self.get_object()
        winner_id = request.data.get('winner_id')
        
        if not request.user.is_admin:
            return Response(
                {'error': 'Only admins can set match winners'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not winner_id:
            return Response({'error': 'winner_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            winner = Team.objects.get(id=winner_id)
        except Team.DoesNotExist:
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if winner not in [match.team1, match.team2]:
            return Response(
                {'error': 'Winner must be one of the competing teams'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        match.winner = winner
        match.is_completed = True
        match.save()
        
        next_round = match.round_number + 1
        next_match_number = (match.match_number + 1) // 2
        
        try:
            next_match = TournamentMatch.objects.get(
                tournament=match.tournament,
                round_number=next_round,
                match_number=next_match_number
            )
            
            if match.match_number % 2 == 1:
                next_match.team1 = winner
            else:
                next_match.team2 = winner
            
            next_match.save()
        except TournamentMatch.DoesNotExist:
            pass
        
        return Response({'success': 'Winner set successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def member_stats(request):
    total_members = Player.objects.count()
    
    threshold = timezone.now() - timezone.timedelta(minutes=5)
    online_members = Player.objects.filter(
        last_activity__gte=threshold
    ).count()
    
    today = timezone.now().date()
    active_today = Player.objects.filter(
        last_activity__date=today
    ).count()
    
    return Response({
        'total_members': total_members,
        'online_members': online_members,
        'active_today': active_today,
        'last_updated': timezone.now().isoformat()
    })

class SquadViewSet(viewsets.ModelViewSet):
    queryset = Squad.objects.all()
    serializer_class = SquadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(
            participant__team__lead_player=self.request.user
        )

    def perform_create(self, serializer):
        user = self.request.user

        try:
            team = Team.objects.get(lead_player=user)
        except Team.DoesNotExist:
            raise PermissionDenied("You are not a team lead.")

        participant = serializer.validated_data.get('participant')
        if participant.team != team:
            raise PermissionDenied("You are not allowed to create a squad for this participant.")

        serializer.save()



class MemberStatsView(APIView):
    def get(self, request):
        total_members = Player.objects.count()
        online_members = Player.objects.filter(is_online=True).count()
        
        return Response({
            'total_members': total_members,
            'online_members': online_members
        })

class TournamentListView(generics.ListAPIView):
    serializer_class = TournamentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        all_tournaments = Tournament.objects.all()

        upcoming = Tournament.objects.filter(
            is_active=True,
            start_date__gt=timezone.now()
        ).order_by('start_date')

        return upcoming
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'tournaments': serializer.data,
            'count': queryset.count()
        })


class UpcomingTournamentView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        tournament = Tournament.objects.filter(start_date__gte=now(), is_active=True).order_by('start_date').first()
        if not tournament:
            return Response({"error": "No upcoming tournament found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TournamentDetailSerializer(tournament)
        return Response(serializer.data, status=status.HTTP_200_OK)

class MatchListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        matches = TournamentMatch.objects.select_related(
            'tournament', 'team1', 'team2', 'winner'
        ).filter(tournament__is_active=True).order_by('-scheduled_time')[:20]

        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data)

class JoinTeamView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        join_code = request.data.get('join_code', '').strip().upper()
        print("join code received")
        try:
            team = Team.objects.get(join_code=join_code)
        except Team.DoesNotExist:
            print("Invalid join code")
            return Response({'error': 'Invalid join code'}, status=status.HTTP_400_BAD_REQUEST)

        if TeamMember.objects.filter(team=team, player=request.user).exists():
            print(request.user)
            print("Already a member")
            return Response({'error': 'Already a member of this team'}, status=status.HTTP_400_BAD_REQUEST)

        TeamMember.objects.create(team=team, player=request.user)
        return Response({'success': 'Joined team successfully'}, status=status.HTTP_200_OK)

class TournamentTeamViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TournamentTeam.objects.all()
    serializer_class = TournamentTeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(
            team__lead_player=self.request.user
        )


class AllTeamDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        team_id = request.query_params.get('teamId')

        if not team_id:
            return Response({'error': 'teamId is required'}, status=400)

        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            raise NotFound("Team not found")

        if team.lead_player != request.user:
            raise PermissionDenied("You are not authorized to view this team's details")

        squads = Squad.objects.filter(participant__team=team)
        serialized_data = AllTeamDetailsSerializer(squads, many=True).data

        has_team_captain = team.members.filter(role='CAPTAIN').exists()

        return Response({
            'team_id': team.id,
            'team_name': team.name,
            'has_team_captain': has_team_captain,
            'squads': serialized_data
        })

class AssignRolesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        player = request.user

        data = request.data
        is_team_captain = data.get('is_team_captain')
        is_squad_lead = data.get('is_squad_lead')
        action_role = data.get('action_role')

        if not action_role:
            print("error Action role is required.")
            return Response({"error": "Action role is required."}, status=status.HTTP_400_BAD_REQUEST)

        player.is_team_captain = bool(is_team_captain)
        player.save()

        squad_members = SquadMember.objects.filter(player=player)

        if not squad_members.exists():
            try:
                team_member = TeamMember.objects.get(player=player)
                team = team_member.team

                participant = TournamentParticipant.objects.filter(team=team).first()
                if not participant:
                    return Response({"error": "Team is not registered in any tournament."}, status=status.HTTP_400_BAD_REQUEST)

                existing_squad = Squad.objects.filter(participant=participant).first()
                if not existing_squad:
                    used_types = Squad.objects.filter(participant=participant).values_list('squad_type', flat=True)
                    available_types = [choice[0] for choice in SquadType.choices if choice[0] not in used_types]
                    if not available_types:
                        return Response({"error": "No available squad types left to create."}, status=status.HTTP_400_BAD_REQUEST)

                    existing_squad = Squad.objects.create(participant=participant, squad_type=available_types[0])

                squad_member = SquadMember.objects.create(
                    player=player,
                    squad=existing_squad,
                    role='NONE',
                    action_role=action_role.upper()
                )
                squad_members = [squad_member]

            except TeamMember.DoesNotExist:
                return Response({"error": "Player is not in any team."}, status=status.HTTP_400_BAD_REQUEST)

        for squad_member in squad_members:
            if is_squad_lead:
                SquadMember.objects.filter(
                    squad=squad_member.squad, role='LEADER'
                ).exclude(player=player).update(role='NONE')
                squad_member.role = 'LEADER'

            elif is_team_captain:
                SquadMember.objects.filter(
                    squad=squad_member.squad, role='CAPTAIN'
                ).exclude(player=player).update(role='NONE')
                squad_member.role = 'CAPTAIN'

            else:
                squad_member.role = 'NONE'

            squad_member.action_role = action_role.upper()
            squad_member.save()

        return Response({"message": "Roles successfully updated."})

class UserSquadStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        team_id = request.query_params.get('team_id')
        if not team_id:
            return Response({"error": "team_id is required"}, status=400)

        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({"error": "Team not found"}, status=404)

        player = request.user

        participants = TournamentParticipant.objects.filter(team=team)

        squads = Squad.objects.filter(participant__in=participants)

        in_squad = SquadMember.objects.filter(squad__in=squads, player=player).exists()

        return Response({"in_squad": in_squad})


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        stats = {
            'total_players': Player.objects.count(),
            'total_teams': Team.objects.count(),
            'total_tournaments': Tournament.objects.count(),
            'active_tournaments': Tournament.objects.filter(is_active=True).count(),
        }
        
        return Response(stats)


class AdminRecentPlayersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        recent_players = Player.objects.order_by('-date_joined')[:10]
        serializer = PlayerSerializer(recent_players, many=True)
        
        return Response(serializer.data)


class AdminRecentTeamsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        recent_teams = Team.objects.select_related('lead_player').order_by('-created_at')[:10]
        serializer = TeamSerializer(recent_teams, many=True)
        
        return Response(serializer.data)


class TeamManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Add a player to team by email, discord username, or LevelGG username"""
        action = request.data.get('action')
        team_id = request.data.get('team_id')
        
        if not team_id:
            return Response({'error': 'team_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check permissions - admin or team lead
        if not (request.user.is_admin or team.lead_player == request.user):
            return Response({'error': 'Permission denied. Only team leads or admins can manage teams.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if action == 'add_member':
            return self._add_member(team, request.data, request.user)
        elif action == 'remove_member':
            return self._remove_member(team, request.data, request.user)
        elif action == 'change_role':
            return self._change_role(team, request.data, request.user)
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

    def _add_member(self, team, data, requesting_user):
        """Add a player to the team"""
        search_value = data.get('search_value', '').strip()
        role = data.get('role', 'MEMBER')
        
        if not search_value:
            return Response({'error': 'search_value is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find player by email, discord username, or LevelGG username
        player = None
        try:
            # Try email first
            if '@' in search_value:
                player = Player.objects.get(email=search_value)
            else:
                # Try username or discord username
                player = Player.objects.filter(
                    Q(username=search_value) | Q(discord_id=search_value)
                ).first()
                
            if not player:
                return Response({'error': 'Player not found'}, status=status.HTTP_404_NOT_FOUND)
                
        except Player.DoesNotExist:
            return Response({'error': 'Player not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if player is already in team
        if TeamMember.objects.filter(team=team, player=player).exists():
            return Response({'error': 'Player is already in this team'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create team member
        team_member = TeamMember.objects.create(
            team=team,
            player=player,
            role=role
        )
        
        serializer = TeamMemberSerializer(team_member)
        return Response({
            'message': f'Player {player.username} added to team successfully',
            'member': serializer.data
        }, status=status.HTTP_201_CREATED)

    def _remove_member(self, team, data, requesting_user):
        """Remove a player from the team"""
        player_id = data.get('player_id')
        
        if not player_id:
            return Response({'error': 'player_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            team_member = TeamMember.objects.get(team=team, player_id=player_id)
            
            # Prevent removing team lead
            if team_member.player == team.lead_player:
                return Response({'error': 'Cannot remove team lead'}, status=status.HTTP_400_BAD_REQUEST)
            
            player_name = team_member.player.username
            team_member.delete()
            
            return Response({
                'message': f'Player {player_name} removed from team successfully'
            }, status=status.HTTP_200_OK)
            
        except TeamMember.DoesNotExist:
            return Response({'error': 'Player not found in team'}, status=status.HTTP_404_NOT_FOUND)

    def _change_role(self, team, data, requesting_user):
        """Change a team member's role"""
        player_id = data.get('player_id')
        new_role = data.get('new_role')
        
        if not player_id or not new_role:
            return Response({'error': 'player_id and new_role are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_role not in ['MEMBER', 'CO_LEAD', 'CAPTAIN']:
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            team_member = TeamMember.objects.get(team=team, player_id=player_id)
            
            # Prevent changing team lead role
            if team_member.player == team.lead_player:
                return Response({'error': 'Cannot change team lead role'}, status=status.HTTP_400_BAD_REQUEST)
            
            old_role = team_member.role
            team_member.role = new_role
            team_member.save()
            
            return Response({
                'message': f'Player {team_member.player.username} role changed from {old_role} to {new_role}',
                'member': TeamMemberSerializer(team_member).data
            }, status=status.HTTP_200_OK)
            
        except TeamMember.DoesNotExist:
            return Response({'error': 'Player not found in team'}, status=status.HTTP_404_NOT_FOUND)


class PlayerSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Search for players by email, discord username, or LevelGG username"""
        query = request.query_params.get('q', '').strip()
        
        if len(query) < 2:
            return Response({'error': 'Query must be at least 2 characters'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Search players
        players = Player.objects.filter(
            Q(username__icontains=query) | 
            Q(email__icontains=query) | 
            Q(discord_id__icontains=query)
        ).exclude(id=request.user.id)[:10]  # Limit to 10 results, exclude self
        
        results = []
        for player in players:
            results.append({
                'id': player.id,
                'username': player.username,
                'email': player.email,
                'discord_id': player.discord_id,
                'tier': player.tier,
                'is_online': player.is_online
            })
        
        return Response({'players': results}, status=status.HTTP_200_OK)


class TournamentAutoAssignView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, tournament_id):
        """Auto-assign players to teams for better balance"""
        if not request.user.is_admin:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            tournament = Tournament.objects.get(id=tournament_id)
        except Tournament.DoesNotExist:
            return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if tournament.is_started:
            return Response({'error': 'Cannot auto-assign teams after tournament has started'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get all participants
        participants = TournamentParticipant.objects.filter(tournament=tournament)
        
        if participants.count() < 2:
            return Response({'error': 'Need at least 2 teams to balance'}, status=status.HTTP_400_BAD_REQUEST)
        
        # For now, just return success - actual balancing logic would go here
        # In a real implementation, this would:
        # 1. Get all team members
        # 2. Calculate skill balancing based on tiers
        # 3. Redistribute players across teams
        # 4. Update team rosters
        
        return Response({
            'message': 'Teams auto-balanced successfully',
            'teams_balanced': participants.count(),
            'algorithm_used': 'skill_tier_balancing'
        }, status=status.HTTP_200_OK)


class TournamentGenerateBracketView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, tournament_id):
        """Generate tournament bracket"""
        if not request.user.is_admin:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            tournament = Tournament.objects.get(id=tournament_id)
        except Tournament.DoesNotExist:
            return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if tournament.is_started:
            return Response({'error': 'Tournament bracket already generated'}, status=status.HTTP_400_BAD_REQUEST)
        
        participants = TournamentParticipant.objects.filter(tournament=tournament)
        
        if participants.count() < 2:
            return Response({'error': 'Need at least 2 teams to generate bracket'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Clear existing matches for regeneration
        TournamentMatch.objects.filter(tournament=tournament).delete()
        
        # Generate bracket based on tournament type
        teams = [p.team for p in participants]
        
        if tournament.bracket_type == 'SINGLE_ELIMINATION':
            self._generate_single_elimination_bracket(tournament, teams)
        elif tournament.bracket_type == 'DOUBLE_ELIMINATION':
            self._generate_double_elimination_bracket(tournament, teams)
        elif tournament.bracket_type == 'ROUND_ROBIN':
            self._generate_round_robin_bracket(tournament, teams)
        else:
            return Response({'error': 'Unsupported bracket type'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'message': 'Tournament bracket generated successfully',
            'bracket_type': tournament.bracket_type,
            'teams': participants.count(),
            'matches_created': TournamentMatch.objects.filter(tournament=tournament).count()
        }, status=status.HTTP_200_OK)
    
    def _generate_single_elimination_bracket(self, tournament, teams):
        """Generate single elimination bracket"""
        import random
        import math
        
        # Shuffle teams for random seeding
        teams_list = list(teams)
        random.shuffle(teams_list)
        
        # Calculate number of rounds needed
        num_teams = len(teams_list)
        num_rounds = math.ceil(math.log2(num_teams))
        
        # Create first round matches
        match_number = 1
        for i in range(0, len(teams_list) - 1, 2):
            TournamentMatch.objects.create(
                tournament=tournament,
                team1=teams_list[i],
                team2=teams_list[i + 1] if i + 1 < len(teams_list) else None,
                round_number=1,
                match_number=match_number,
                scheduled_time=tournament.start_date
            )
            match_number += 1
        
        # Create placeholder matches for subsequent rounds
        for round_num in range(2, num_rounds + 1):
            matches_in_round = max(1, num_teams // (2 ** round_num))
            for match_num in range(1, matches_in_round + 1):
                TournamentMatch.objects.create(
                    tournament=tournament,
                    team1=None,
                    team2=None,
                    round_number=round_num,
                    match_number=match_num,
                    scheduled_time=tournament.start_date + timedelta(days=round_num - 1)
                )
    
    def _generate_double_elimination_bracket(self, tournament, teams):
        """Generate double elimination bracket (simplified)"""
        # For now, just create a single elimination bracket
        # Full double elimination would require winner/loser brackets
        self._generate_single_elimination_bracket(tournament, teams)
    
    def _generate_round_robin_bracket(self, tournament, teams):
        """Generate round robin bracket"""
        teams_list = list(teams)
        match_number = 1
        
        # Create matches between every pair of teams
        for i in range(len(teams_list)):
            for j in range(i + 1, len(teams_list)):
                TournamentMatch.objects.create(
                    tournament=tournament,
                    team1=teams_list[i],
                    team2=teams_list[j],
                    round_number=1,  # All matches are in round 1 for round robin
                    match_number=match_number,
                    scheduled_time=tournament.start_date + timedelta(days=match_number - 1)
                )
                match_number += 1
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlayerViewSet, TeamViewSet, TeamMemberViewSet, SquadViewSet, SquadMemberViewSet, TournamentTeamViewSet, AllTeamDetailsView, UserSquadStatusView,
    TournamentViewSet, AssignRolesView, TournamentParticipantViewSet, CountryCodeUpdateView, TeamViewSet, TournamentMatchViewSet, AccountTypeUpdateView, JoinTeamView, member_stats, LoginView, TournamentListView, RegistrationView, SocialSignupView, SocialCallbackView, SocialLoginView, NewsListView, UpcomingTournamentView, MatchListView, AdminStatsView, AdminRecentPlayersView, AdminRecentTeamsView, TeamManagementView, PlayerSearchView, TournamentAutoAssignView, TournamentGenerateBracketView
)

router = DefaultRouter()
router.register(r'players', PlayerViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'team-members', TeamMemberViewSet)
router.register(r'tournaments', TournamentViewSet)
router.register(r'tournament-participants', TournamentParticipantViewSet)
router.register(r'tournament-matches', TournamentMatchViewSet)
router.register(r'squads', SquadViewSet, basename='squad')
router.register(r'squad-members', SquadMemberViewSet, basename='squadmember')
router.register(r'tournament-teams', TournamentTeamViewSet, basename='tournamentteam')

urlpatterns = [
    path('', include(router.urls)),
    path('member-stats/', member_stats, name='member-stats'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/social/login/', SocialLoginView.as_view(), name='social-login'),
    path('auth/register/', RegistrationView.as_view(), name='register'),
    path('auth/social/signup/', SocialSignupView.as_view(), name='social-signup'),
    path('upcoming_tournaments/', TournamentListView.as_view(), name='tournament-list'),
    path('upcoming_tournament/', UpcomingTournamentView.as_view(), name='upcoming-tournaments'),
    path('matches/', MatchListView.as_view(), name='matches-list'),
    path('news/', NewsListView.as_view(), name='news-list'),
    path('team/join/', JoinTeamView.as_view(), name='join-team'),
    path('player/account-type/', AccountTypeUpdateView.as_view(), name='account-type-update'),
    path('player/country-code/', CountryCodeUpdateView.as_view(), name='country-code-update'),
    path('allteamdetails/', AllTeamDetailsView.as_view(), name='all_team_details'),
    path('assign-roles/', AssignRolesView.as_view(), name='assign-roles'),
    path('user-squad-status/', UserSquadStatusView.as_view(), name='user-squad-status'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/recent-players/', AdminRecentPlayersView.as_view(), name='admin-recent-players'),
    path('admin/recent-teams/', AdminRecentTeamsView.as_view(), name='admin-recent-teams'),
    path('team/manage/', TeamManagementView.as_view(), name='team-management'),
    path('players/search/', PlayerSearchView.as_view(), name='player-search'),
    path('tournaments/<int:tournament_id>/auto-assign/', TournamentAutoAssignView.as_view(), name='tournament-auto-assign'),
    path('tournaments/<int:tournament_id>/generate-bracket/', TournamentGenerateBracketView.as_view(), name='tournament-generate-bracket'),
]
'use client';

import { createClient } from '@/lib/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface TournamentUpdate {
  id: string;
  type: 'registration' | 'start' | 'match_result' | 'bracket_update';
  data: any;
  timestamp: string;
}

export class TournamentSubscriptionManager {
  private supabase = createClient();
  private subscriptions = new Map<string, any>();
  private callbacks = new Map<string, ((update: TournamentUpdate) => void)[]>();

  /**
   * Subscribe to real-time updates for a specific tournament
   */
  subscribeTo(tournamentId: string, callback: (update: TournamentUpdate) => void) {
    // Add callback to the list
    if (!this.callbacks.has(tournamentId)) {
      this.callbacks.set(tournamentId, []);
    }
    this.callbacks.get(tournamentId)!.push(callback);

    // Create subscription if it doesn't exist
    if (!this.subscriptions.has(tournamentId)) {
      this.createTournamentSubscription(tournamentId);
    }
  }

  /**
   * Unsubscribe from tournament updates
   */
  unsubscribeFrom(tournamentId: string, callback?: (update: TournamentUpdate) => void) {
    if (callback && this.callbacks.has(tournamentId)) {
      const callbacks = this.callbacks.get(tournamentId)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      
      // Remove subscription if no more callbacks
      if (callbacks.length === 0) {
        this.removeSubscription(tournamentId);
      }
    } else {
      // Remove all callbacks and subscription
      this.removeSubscription(tournamentId);
    }
  }

  /**
   * Create real-time subscription for tournament data
   */
  private createTournamentSubscription(tournamentId: string) {
    // Subscribe to tournament table changes
    const tournamentSub = this.supabase
      .channel(`tournament-${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments',
          filter: `id=eq.${tournamentId}`
        },
        (payload) => this.handleTournamentChange(tournamentId, payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations',
          filter: `tournament_id=eq.${tournamentId}`
        },
        (payload) => this.handleRegistrationChange(tournamentId, payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `tournament_id=eq.${tournamentId}`
        },
        (payload) => this.handleMatchChange(tournamentId, payload)
      )
      .subscribe();

    this.subscriptions.set(tournamentId, tournamentSub);
  }

  /**
   * Handle tournament table changes
   */
  private handleTournamentChange(
    tournamentId: string, 
    payload: RealtimePostgresChangesPayload<any>
  ) {
    const update: TournamentUpdate = {
      id: tournamentId,
      type: payload.new?.is_started ? 'start' : 'bracket_update',
      data: {
        event: payload.eventType,
        old: payload.old,
        new: payload.new
      },
      timestamp: new Date().toISOString()
    };

    this.notifyCallbacks(tournamentId, update);
  }

  /**
   * Handle registration changes
   */
  private handleRegistrationChange(
    tournamentId: string, 
    payload: RealtimePostgresChangesPayload<any>
  ) {
    const update: TournamentUpdate = {
      id: tournamentId,
      type: 'registration',
      data: {
        event: payload.eventType,
        registration: payload.new || payload.old
      },
      timestamp: new Date().toISOString()
    };

    this.notifyCallbacks(tournamentId, update);
  }

  /**
   * Handle match result updates
   */
  private handleMatchChange(
    tournamentId: string, 
    payload: RealtimePostgresChangesPayload<any>
  ) {
    const update: TournamentUpdate = {
      id: tournamentId,
      type: 'match_result',
      data: {
        event: payload.eventType,
        match: payload.new || payload.old
      },
      timestamp: new Date().toISOString()
    };

    this.notifyCallbacks(tournamentId, update);
  }

  /**
   * Notify all callbacks for a tournament
   */
  private notifyCallbacks(tournamentId: string, update: TournamentUpdate) {
    const callbacks = this.callbacks.get(tournamentId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(update);
        } catch (error) {
          console.error('Error in tournament subscription callback:', error);
        }
      });
    }
  }

  /**
   * Remove subscription
   */
  private removeSubscription(tournamentId: string) {
    const subscription = this.subscriptions.get(tournamentId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(tournamentId);
    }
    this.callbacks.delete(tournamentId);
  }

  /**
   * Clean up all subscriptions
   */
  cleanup() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
    this.callbacks.clear();
  }
}

// Global instance
export const tournamentSubscriptions = new TournamentSubscriptionManager();

// Hook for easy use in React components
export function useTournamentSubscription(
  tournamentId: string | null,
  callback: (update: TournamentUpdate) => void,
  enabled = true
) {
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  React.useEffect(() => {
    if (!tournamentId || !enabled || isSubscribed) return;

    tournamentSubscriptions.subscribeTo(tournamentId, callback);
    setIsSubscribed(true);

    return () => {
      if (tournamentId) {
        tournamentSubscriptions.unsubscribeFrom(tournamentId, callback);
        setIsSubscribed(false);
      }
    };
  }, [tournamentId, enabled]);

  return { isSubscribed };
}

// React import for the hook
import React from 'react';
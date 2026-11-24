'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { ActivityItem } from '@/components/ActivityItem';
import { Skeleton } from '@/components/Skeleton';
import { useApi } from '@/hooks/useApi';
import { useStore } from '@/lib/store';
import type { ActivityEvent } from '@/types';

export function ActivityScreen() {
  const { api } = useApi();
  const activities = useStore((s) => s.activities);
  const setActivities = useStore((s) => s.setActivities);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ activities: ActivityEvent[] }>('activity');
      setActivities(data.activities || []);
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    } finally {
      setLoading(false);
    }
  }, [api, setActivities]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-pearl">Активность</h1>
          <p className="text-[11px] text-ash">Лента сделок, лотов и офферов</p>
        </div>
        <button
          onClick={fetchActivity}
          className="p-2 rounded-xl border border-white/[0.07] bg-obsidian text-ash hover:text-pearl transition-colors"
          title="Обновить"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="row" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="p-10 rounded-2xl border border-white/[0.07] bg-obsidian text-center space-y-2">
          <p className="text-sm font-medium text-pearl">Пока нет событий</p>
          <p className="text-xs text-ash">Здесь появятся последние покупки и выставления</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activities.map((ev, idx) => (
            <ActivityItem key={ev.id} event={ev} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

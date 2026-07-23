"use client";

import { useCallback, useEffect, useState } from "react";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EnterpriseStatusBanner from "@/components/enterprise-collaboration/EnterpriseStatusBanner";
import CollaborationStatePanel from "@/components/enterprise-collaboration/CollaborationStatePanel";
import { cbaiBtnSecondary, cbaiFocusRing, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import { useAuth } from "@/components/platform/context/AuthProvider";
import type { EnterpriseMention } from "@/lib/enterprise-collaboration/types";
import type { UserNotification } from "@/lib/notifications/user-notification-store";
import {
  countInboxUnread,
  countUnreadMentionsCloud,
  fetchInboxNotifications,
  fetchMentionsForUser,
  markInboxNotificationRead,
  markMentionReadCloud,
} from "@/lib/enterprise-collaboration/cloud-persistence";

export default function NotificationCenter() {
  const { cloudUser } = useAuth();
  const userId = cloudUser?.id ?? resolveActorId();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [mentions, setMentions] = useState<EnterpriseMention[]>([]);
  const [unread, setUnread] = useState(0);
  const [unreadMentions, setUnreadMentions] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setMentions([]);
      setUnread(0);
      setUnreadMentions(0);
      setLoaded(true);
      return;
    }
    setError(null);
    try {
      const [notes, mens, u, um] = await Promise.all([
        fetchInboxNotifications(userId),
        fetchMentionsForUser(userId),
        countInboxUnread(userId),
        countUnreadMentionsCloud(userId),
      ]);
      setNotifications(notes);
      setMentions(mens);
      setUnread(u);
      setUnreadMentions(um);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notifications.");
    } finally {
      setLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <OperatingPageShell
      title="Notification Center"
      description="Mentions, invitations, and approvals from Preview Supabase (user_notifications + enterprise_mentions). Email/push delivery is not connected."
      showMissionContext={false}
    >
      <EnterpriseStatusBanner />

      <section className="grid gap-3 sm:grid-cols-2">
        <div className={`${cbaiGlassCard} p-4`}>
          <p className={cbaiSectionEyebrow}>Unread notifications</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-100">{unread}</p>
        </div>
        <div className={`${cbaiGlassCard} p-4`}>
          <p className={cbaiSectionEyebrow}>Unread mentions</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-100">{unreadMentions}</p>
        </div>
      </section>

      <CollaborationStatePanel
        state={!loaded ? "loading" : !userId ? "signed_out" : error ? "error" : "ready"}
        message={error}
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <section className={`${cbaiGlassCard} space-y-2 p-4`}>
            <p className={cbaiSectionEyebrow}>Notifications</p>
            {notifications.length === 0 ? (
              <p className="text-sm text-zinc-500">No notifications yet.</p>
            ) : (
              <ul className="space-y-2">
                {notifications.slice(0, 30).map((n) => (
                  <li key={n.id} className="flex items-start justify-between gap-2 text-sm text-zinc-300">
                    <div>
                      <p>{n.notificationType}</p>
                      <p className="text-xs text-zinc-500">
                        {n.objectType ?? "item"}
                        {n.organizationId ? ` · org ${n.organizationId.slice(0, 8)}…` : ""}
                      </p>
                      <p className="text-xs text-zinc-600">{n.createdAt}</p>
                    </div>
                    {!n.readAt ? (
                      <button
                        type="button"
                        className={`${cbaiBtnSecondary} ${cbaiFocusRing}`}
                        onClick={() => {
                          void (async () => {
                            await markInboxNotificationRead(n.id, userId!);
                            await reload();
                          })();
                        }}
                      >
                        Mark read
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-600">Read</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={`${cbaiGlassCard} space-y-2 p-4`}>
            <p className={cbaiSectionEyebrow}>Mentions</p>
            {mentions.length === 0 ? (
              <p className="text-sm text-zinc-500">No @mentions yet.</p>
            ) : (
              <ul className="space-y-2">
                {mentions.slice(0, 30).map((m) => (
                  <li key={m.id} className="flex items-start justify-between gap-2 text-sm text-zinc-300">
                    <div>
                      <p>
                        Mention on {m.targetType}/{m.targetId}
                      </p>
                      <p className="text-xs text-zinc-500">from {m.mentionedBy.slice(0, 8)}…</p>
                    </div>
                    {!m.readAt ? (
                      <button
                        type="button"
                        className={`${cbaiBtnSecondary} ${cbaiFocusRing}`}
                        onClick={() => {
                          void (async () => {
                            await markMentionReadCloud(m.id, userId!);
                            await reload();
                          })();
                        }}
                      >
                        Mark read
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-600">Read</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </CollaborationStatePanel>
    </OperatingPageShell>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EnterpriseStatusBanner from "@/components/enterprise-collaboration/EnterpriseStatusBanner";
import { cbaiBtnSecondary, cbaiFocusRing, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import {
  countUnreadMentions,
  loadMentionsForUser,
  markMentionRead,
} from "@/lib/enterprise-collaboration";
import {
  countUnreadNotifications,
  loadUserNotifications,
  markNotificationRead,
} from "@/lib/notifications/user-notification-store";
import { loadMembershipForUser } from "@/lib/organization-os/organization-membership-store";

export default function NotificationCenter() {
  const [tick, setTick] = useState(0);
  const userId = resolveActorId();

  useEffect(() => setTick(1), []);

  const notifications = useMemo(() => {
    void tick;
    if (!userId) return [];
    return loadUserNotifications(userId).filter((n) => {
      if (!n.organizationId) return true;
      return Boolean(loadMembershipForUser(userId, n.organizationId));
    });
  }, [tick, userId]);

  const mentions = useMemo(() => {
    void tick;
    if (!userId) return [];
    return loadMentionsForUser(userId);
  }, [tick, userId]);

  const unread = userId ? countUnreadNotifications(userId) : 0;
  const unreadMentions = userId ? countUnreadMentions(userId) : 0;

  return (
    <OperatingPageShell
      title="Notification Center"
      description="In-app notifications and mentions for your account. Email/push delivery is not connected."
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

      {!userId ? (
        <p className="text-sm text-zinc-500">Sign in to load notifications.</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <section className={`${cbaiGlassCard} space-y-2 p-4`}>
            <p className={cbaiSectionEyebrow}>Notifications</p>
            {notifications.length === 0 ? (
              <p className="text-sm text-zinc-500">No notifications yet.</p>
            ) : (
              <ul className="space-y-2">
                {notifications.slice(0, 20).map((n) => (
                  <li key={n.id} className="flex items-start justify-between gap-2 text-sm text-zinc-300">
                    <div>
                      <p>{n.notificationType}</p>
                      <p className="text-xs text-zinc-500">{n.createdAt}</p>
                    </div>
                    {!n.readAt ? (
                      <button
                        type="button"
                        className={`${cbaiBtnSecondary} ${cbaiFocusRing}`}
                        onClick={() => {
                          markNotificationRead(n.id, userId);
                          setTick((x) => x + 1);
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
                {mentions.slice(0, 20).map((m) => (
                  <li key={m.id} className="flex items-start justify-between gap-2 text-sm text-zinc-300">
                    <div>
                      <p>
                        @{m.mentionedUserId} mentioned by {m.mentionedBy}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {m.targetType}/{m.targetId}
                      </p>
                    </div>
                    {!m.readAt ? (
                      <button
                        type="button"
                        className={`${cbaiBtnSecondary} ${cbaiFocusRing}`}
                        onClick={() => {
                          markMentionRead(m.id, userId);
                          setTick((x) => x + 1);
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
      )}
    </OperatingPageShell>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import {
  createLiveRoom,
  getEmptyLiveRoomsSnapshot,
  linkRelatedEntity,
  listLiveRooms,
  subscribeLiveRooms,
  type LiveIntelligenceRoom,
} from "@/lib/live-intelligence-rooms";
import { useMemo, useSyncExternalStore } from "react";

type CountryLiveRoomsPanelProps = {
  countryId: string;
  countryName: string;
};

function typeLabel(
  copy: ReturnType<typeof getDictionary>["liveRooms"],
  type: LiveIntelligenceRoom["roomType"],
): string {
  switch (type) {
    case "laboratory":
      return copy.typeLab;
    case "practice":
      return copy.typePractice;
    case "collaboration":
      return copy.typeCollab;
    default:
      return copy.typeMeeting;
  }
}

export default function CountryLiveRoomsPanel({ countryId, countryName }: CountryLiveRoomsPanelProps) {
  const router = useRouter();
  const { language } = useTranslation();
  const copy = getDictionary(language).liveRooms;
  const roomsSnapshot = useSyncExternalStore(
    subscribeLiveRooms,
    listLiveRooms,
    getEmptyLiveRoomsSnapshot,
  );
  const rooms = useMemo(
    () =>
      roomsSnapshot.filter((room) =>
        room.relatedEntities.some((e) => e.kind === "country" && e.id === countryId),
      ),
    [roomsSnapshot, countryId],
  );

  function createCountryMeetingHall() {
    const room = createLiveRoom({
      roomType: "meeting_hall",
      title: `${countryName} — ${copy.typeMeeting}`,
      objective: "",
      hostDisplayName: "Host",
      hostSpeakLocale: language,
      hostReadLocale: language,
      hostHearLocale: language,
      createdLocale: language,
      sourceRoute: `/countries?country=${encodeURIComponent(countryId)}`,
    });
    linkRelatedEntity(room.roomId, { kind: "country", id: countryId, name: countryName });
    router.push(`/rooms/session?id=${encodeURIComponent(room.roomId)}`);
  }

  return (
    <section
      aria-labelledby="country-live-rooms-heading"
      className="space-y-4 rounded-2xl border border-teal-500/20 bg-[color:var(--cbai-surface-glass)] p-5 shadow-[inset_0_1px_0_rgba(45,212,191,0.08)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2
            id="country-live-rooms-heading"
            className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-200/90"
          >
            {copy.countryPanelTitle}
          </h2>
          <p className="text-xs text-[color:var(--cbai-text-secondary)]">{countryName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/rooms"
            className="rounded-lg border border-[color:var(--cbai-border-subtle)] px-3 py-1.5 text-xs font-medium text-[color:var(--cbai-accent-primary)]"
          >
            {copy.countryPanelOpenRooms}
          </Link>
          <button
            type="button"
            onClick={createCountryMeetingHall}
            className="rounded-lg bg-teal-600/90 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-teal-500/90"
          >
            {copy.countryPanelCreate}
          </button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[color:var(--cbai-border-subtle)] px-4 py-6 text-center text-sm text-[color:var(--cbai-text-secondary)]">
          {copy.countryPanelEmpty}
        </p>
      ) : (
        <ul className="space-y-2">
          {rooms.map((room) => (
            <li
              key={room.roomId}
              className="flex flex-col gap-2 rounded-xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)]/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-wider text-[color:var(--cbai-text-secondary)]">
                  {typeLabel(copy, room.roomType)}
                </p>
                <p className="text-sm font-medium text-[color:var(--cbai-text-primary)]">{room.title}</p>
              </div>
              <Link
                href={`/rooms/session?id=${encodeURIComponent(room.roomId)}`}
                className="text-sm font-medium text-[color:var(--cbai-accent-primary)]"
              >
                {copy.openRoom}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

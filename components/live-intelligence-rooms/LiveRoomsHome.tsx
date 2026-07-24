"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import {
  createLiveRoom,
  getEmptyLiveRoomsSnapshot,
  listLiveRooms,
  subscribeLiveRooms,
  type LiveRoomType,
} from "@/lib/live-intelligence-rooms";

const ROOM_TYPES: LiveRoomType[] = ["meeting_hall", "laboratory", "practice", "collaboration"];

function typeLabel(copy: ReturnType<typeof getDictionary>["liveRooms"], type: LiveRoomType): string {
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

export default function LiveRoomsHome() {
  const router = useRouter();
  const { language } = useTranslation();
  const copy = getDictionary(language).liveRooms;
  const rooms = useSyncExternalStore(subscribeLiveRooms, listLiveRooms, getEmptyLiveRoomsSnapshot);
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [hostName, setHostName] = useState("Host");
  const [roomType, setRoomType] = useState<LiveRoomType>("meeting_hall");
  const [speak, setSpeak] = useState(language);
  const [read, setRead] = useState(language);
  const [hear, setHear] = useState(language);
  const [recordingAllowed, setRecordingAllowed] = useState(false);
  const [translationAudioAllowed, setTranslationAudioAllowed] = useState(false);
  const locales = useMemo(() => ["en", "uz", "ru", "tr"] as const, []);

  function onCreate() {
    const room = createLiveRoom({
      roomType,
      title: title.trim() || typeLabel(copy, roomType),
      objective: objective.trim(),
      hostDisplayName: hostName.trim() || "Host",
      hostSpeakLocale: speak,
      hostReadLocale: read,
      hostHearLocale: hear,
      recordingAllowed,
      translationAudioAllowed,
      createdLocale: language,
      sourceRoute: "/rooms",
    });
    router.push(`/rooms/session?id=${encodeURIComponent(room.roomId)}`);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--cbai-accent-primary)]">
          CBAI
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--cbai-text-primary)] sm:text-4xl">
          {copy.homeTitle}
        </h1>
        <p className="max-w-3xl text-base text-[color:var(--cbai-text-secondary)]">{copy.homeSubtitle}</p>
        <p className="max-w-3xl text-sm text-[color:var(--cbai-text-secondary)]">{copy.homeDescription}</p>
        <p className="rounded-xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-glass)] px-4 py-3 text-sm text-[color:var(--cbai-text-secondary)]">
          {copy.multipartyNotice}
        </p>
      </header>

      <section
        aria-labelledby="create-room-heading"
        className="space-y-4 rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-solid)] p-5"
      >
        <h2 id="create-room-heading" className="text-lg font-semibold text-[color:var(--cbai-text-primary)]">
          {copy.createTitle}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-[color:var(--cbai-text-secondary)]">{copy.fieldTitle}</span>
            <input
              className="w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-[color:var(--cbai-text-primary)]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[color:var(--cbai-text-secondary)]">{copy.fieldHostName}</span>
            <input
              className="w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-[color:var(--cbai-text-primary)]"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
            />
          </label>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="text-[color:var(--cbai-text-secondary)]">{copy.fieldObjective}</span>
          <textarea
            className="min-h-[72px] w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-[color:var(--cbai-text-primary)]"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
        </label>
        <fieldset className="space-y-2">
          <legend className="text-sm text-[color:var(--cbai-text-secondary)]">{copy.fieldRoomType}</legend>
          <div className="flex flex-wrap gap-2">
            {ROOM_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setRoomType(type)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  roomType === type
                    ? "border-[color:var(--cbai-accent-primary)] text-[color:var(--cbai-accent-primary)]"
                    : "border-[color:var(--cbai-border-subtle)] text-[color:var(--cbai-text-secondary)]"
                }`}
              >
                {typeLabel(copy, type)}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              [copy.fieldSpeak, speak, setSpeak],
              [copy.fieldRead, read, setRead],
              [copy.fieldHear, hear, setHear],
            ] as const
          ).map(([label, value, setter]) => (
            <label key={label} className="space-y-1 text-sm">
              <span className="text-[color:var(--cbai-text-secondary)]">{label}</span>
              <select
                className="w-full rounded-lg border border-[color:var(--cbai-border-subtle)] bg-transparent px-3 py-2 text-[color:var(--cbai-text-primary)]"
                value={value}
                onChange={(e) => setter(e.target.value)}
              >
                {locales.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div className="space-y-2 rounded-xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-glass)] p-4">
          <h3 className="text-sm font-semibold text-[color:var(--cbai-text-primary)]">{copy.consentTitle}</h3>
          <label className="flex items-start gap-2 text-sm text-[color:var(--cbai-text-secondary)]">
            <input
              type="checkbox"
              checked={recordingAllowed}
              onChange={(e) => setRecordingAllowed(e.target.checked)}
              className="mt-1"
            />
            {copy.consentRecording}
          </label>
          <label className="flex items-start gap-2 text-sm text-[color:var(--cbai-text-secondary)]">
            <input
              type="checkbox"
              checked={translationAudioAllowed}
              onChange={(e) => setTranslationAudioAllowed(e.target.checked)}
              className="mt-1"
            />
            {copy.consentTranslatedAudio}
          </label>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="rounded-xl bg-[color:var(--cbai-accent-primary)] px-4 py-2.5 text-sm font-semibold text-slate-950"
        >
          {copy.createCta}
        </button>
      </section>

      <section aria-labelledby="room-list-heading" className="space-y-4">
        <h2 id="room-list-heading" className="text-lg font-semibold text-[color:var(--cbai-text-primary)]">
          {copy.homeTitle}
        </h2>
        {rooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[color:var(--cbai-border-subtle)] p-8 text-center">
            <p className="font-medium text-[color:var(--cbai-text-primary)]">{copy.emptyTitle}</p>
            <p className="mt-2 text-sm text-[color:var(--cbai-text-secondary)]">{copy.emptyBody}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {rooms.map((room) => (
              <li
                key={room.roomId}
                className="flex flex-col gap-3 rounded-2xl border border-[color:var(--cbai-border-subtle)] bg-[color:var(--cbai-surface-glass)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs uppercase tracking-wider text-[color:var(--cbai-text-secondary)]">
                    {typeLabel(copy, room.roomType)} · {room.lifecycle}
                  </p>
                  <h3 className="text-base font-semibold text-[color:var(--cbai-text-primary)]">{room.title}</h3>
                  <p className="text-sm text-[color:var(--cbai-text-secondary)]">{room.objective || room.description}</p>
                </div>
                <Link
                  href={`/rooms/session?id=${encodeURIComponent(room.roomId)}`}
                  className="inline-flex items-center justify-center rounded-xl border border-[color:var(--cbai-accent-primary)] px-4 py-2 text-sm font-medium text-[color:var(--cbai-accent-primary)]"
                >
                  {copy.openRoom}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

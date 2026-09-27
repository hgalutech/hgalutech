"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  GripVertical,
  Users,
  Briefcase,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Settings2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeskBackLink } from "@/features/admin-desk/components/desk-back-link";
import { corporateStatusTone } from "@/features/admin-desk/components/corporate-form-ui";
import {
  fetchPeopleApi,
  reorderPeopleApi,
} from "@/features/admin-desk/lib/corporate-api";
import type { PersonDTO } from "@/modules/corporate/browser";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  badge: string;
};

const DEFAULT_SECTIONS: Section[] = [
  {
    id: "board",
    label: "Board of Directors",
    description: "Strategic oversight & governance",
    icon: <Users className="size-4" />,
    accent: "from-blue-600 to-indigo-700",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  {
    id: "operational",
    label: "Operational Leadership",
    description: "Senior management & functional leads",
    icon: <Briefcase className="size-4" />,
    accent: "from-slate-600 to-slate-800",
    badge: "bg-slate-50 text-slate-700 ring-slate-200",
  },
];

const ROLE_LABEL: Record<PersonDTO["role"], string> = {
  director: "Director",
  chairman: "Chairman",
  md: "Managing Director",
  company_secretary: "Company Secretary",
  executive: "Executive",
};

// ─── Drag state tracking ───────────────────────────────────────────────────────

type DragState = {
  personId: string;
  fromSection: string;
  fromIndex: number;
};

// ─── Main component ────────────────────────────────────────────────────────────

export function CorporatePeopleBoard() {
  const [allPeople, setAllPeople] = useState<PersonDTO[]>([]);
  const [boardMap, setBoardMap] = useState<Record<string, PersonDTO[]>>({
    board: [],
    operational: [],
  });
  const [initialBoardMap, setInitialBoardMap] = useState<Record<string, PersonDTO[]>>({
    board: [],
    operational: [],
  });
  const [sections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [showDraftToo, setShowDraftToo] = useState(true);

  // Drag state refs for pointer events
  const dragState = useRef<DragState | null>(null);
  const dragClone = useRef<HTMLElement | null>(null);
  const dragOver = useRef<{ sectionId: string; index: number } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    sectionId: string;
    index: number;
  } | null>(null);

  // ── Load ───────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPeopleApi({ q: query || undefined });
      const people = data.items;
      setAllPeople(people);

      // Distribute into sections by leadershipSection field
      const map: Record<string, PersonDTO[]> = {
        board: [],
        operational: [],
      };
      for (const p of people) {
        const sec = p.leadershipSection ?? "board";
        if (map[sec]) map[sec].push(p);
        else map[sec] = [p];
      }
      // Sort each section by sortOrder
      for (const sec of Object.keys(map)) {
        (map[sec] ?? []).sort((a, b) => a.sortOrder - b.sortOrder);
        map[sec] = map[sec] ?? [];
      }
      setBoardMap(map);
      setInitialBoardMap(map);
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load people");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  // ── Save order ─────────────────────────────────────────────────────────────

  async function saveOrder() {
    setSaving(true);
    setError(null);
    try {
      const items: {
        id: string;
        section: "board" | "operational";
        sectionOrder: number;
      }[] = [];
      for (const [sectionId, people] of Object.entries(boardMap)) {
        if (sectionId !== "board" && sectionId !== "operational") continue;
        people.forEach((p, idx) => {
          items.push({
            id: p.id,
            section: sectionId as "board" | "operational",
            sectionOrder: idx,
          });
        });
      }
      await reorderPeopleApi(items);
      setInitialBoardMap(boardMap);
      setSaved(true);
      setDirty(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // ── Drag & Drop via HTML5 (pointer-event-free approach for SSR safety) ─────

  function onDragStart(
    e: React.DragEvent,
    personId: string,
    fromSection: string,
    fromIndex: number,
  ) {
    dragState.current = { personId, fromSection, fromIndex };
    setDraggingId(personId);
    e.dataTransfer.effectAllowed = "move";
    // Transparent ghost
    const ghost = document.createElement("div");
    ghost.style.position = "fixed";
    ghost.style.top = "-9999px";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    dragClone.current = ghost;
  }

  function onDragEnd() {
    setDraggingId(null);
    setDropTarget(null);
    dragState.current = null;
    dragClone.current?.remove();
    dragClone.current = null;
  }

  function onDragOver(e: React.DragEvent, sectionId: string, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    dragOver.current = { sectionId, index };
    setDropTarget({ sectionId, index });
  }

  function onDrop(e: React.DragEvent, toSection: string, toIndex: number) {
    e.preventDefault();
    const ds = dragState.current;
    if (!ds) return;

    setBoardMap((prev) => {
      const next = { ...prev };
      // Collect from all sections (handles cross-section moves)
      for (const s of Object.keys(next)) {
        next[s] = [...(next[s] ?? [])];
      }

      // Remove from source
      const person = (next[ds.fromSection] ?? []).splice(ds.fromIndex, 1)[0];
      if (!person) return prev;

      // Ensure target section exists
      if (!next[toSection]) next[toSection] = [];

      // Insert at target
      let insertAt = toIndex;
      if (ds.fromSection === toSection && ds.fromIndex < toIndex) {
        insertAt = toIndex - 1;
      }
      next[toSection].splice(Math.max(0, insertAt), 0, person);

      return next;
    });

    setDirty(true);
    setDraggingId(null);
    setDropTarget(null);
  }

  // ── Move via buttons (accessibility) ──────────────────────────────────────

  function moveInSection(sectionId: string, fromIdx: number, toIdx: number) {
    setBoardMap((prev) => {
      const arr = [...(prev[sectionId] ?? [])];
      const [item] = arr.splice(fromIdx, 1);
      if (!item) return prev;
      arr.splice(toIdx, 0, item);
      return { ...prev, [sectionId]: arr };
    });
    setDirty(true);
  }

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filteredMap: Record<string, PersonDTO[]> = {};
  for (const [sec, people] of Object.entries(boardMap)) {
    filteredMap[sec] = showDraftToo
      ? people
      : people.filter((p) => p.status === "published");
  }

  // People not yet in any named section (edge case for newly-created without field)
  const knownIds = new Set(
    Object.values(boardMap)
      .flat()
      .map((p) => p.id),
  );
  const uncategorized = allPeople.filter((p) => !knownIds.has(p.id));

  const totalPeople = allPeople.length;
  const publishedCount = allPeople.filter((p) => p.status === "published").length;

  return (
    <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-5 pb-8">
      {/* ── Page header ── */}
      <header className="flex flex-col gap-2">
        <DeskBackLink href="/admin/pages" label="Back to pages" />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">
              Leadership Board
            </h1>
            <p className="text-muted-foreground mt-0.5 text-[0.8125rem]">
              Drag people between Board &amp; Operational sections. Changes take effect on
              Save.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              className="h-9 text-[0.8125rem]"
              render={<Link href="/admin/corporate/people/new" />}
            >
              <Plus className="size-3.5" />
              New person
            </Button>
          </div>
        </div>
      </header>

      {/* ── Stats bar ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#d2d2d7] bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-ink">{totalPeople}</span>
          <span className="text-muted-foreground">total people</span>
        </div>
        <div className="h-4 w-px bg-[#e5e5ea]" />
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-green-600">{publishedCount}</span>
          <span className="text-muted-foreground">published</span>
        </div>
        <div className="h-4 w-px bg-[#e5e5ea]" />
        {sections.map((sec) => (
          <div key={sec.id} className="flex items-center gap-1.5 text-sm">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1",
                sec.badge,
              )}
            >
              {sec.icon}
              {boardMap[sec.id]?.length ?? 0}
            </span>
            <span className="text-muted-foreground">{sec.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDraftToo((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[0.75rem] font-medium transition",
              showDraftToo
                ? "border-[#d2d2d7] bg-white text-ink hover:bg-[#f5f5f7]"
                : "border-transparent bg-[#f5f5f7] text-muted-foreground hover:bg-[#eaeaec]",
            )}
          >
            {showDraftToo ? (
              <Eye className="size-3.5" />
            ) : (
              <EyeOff className="size-3.5" />
            )}
            {showDraftToo ? "Showing drafts" : "Published only"}
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(q.trim());
        }}
      >
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#aeaeb2]" />
          <input
            className="border-line h-9 w-full rounded-md border bg-white pr-3 pl-8 text-[0.8125rem] outline-none focus:border-[#0071e3]"
            placeholder="Search name, role, slug…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" className="h-9 text-[0.8125rem]">
          Search
        </Button>
        {query && (
          <Button
            type="button"
            variant="outline"
            className="h-9 text-[0.8125rem]"
            onClick={() => {
              setQ("");
              setQuery("");
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {/* ── Error / status ── */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="size-4 shrink-0" />
          Order saved — public site will reflect the changes shortly.
        </div>
      )}

      {/* ── Board: two swimlanes ── */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
          <Loader2 className="size-4 animate-spin" />
          Loading people…
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sections.map((section) => {
            const people = filteredMap[section.id] ?? [];
            return (
              <SectionColumn
                key={section.id}
                section={section}
                people={people}
                draggingId={draggingId}
                dropTarget={dropTarget}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onMoveInSection={moveInSection}
              />
            );
          })}
        </div>
      )}

      {/* ── Uncategorized fallback ── */}
      {uncategorized.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-1.5">
            <Settings2 className="size-4" />
            {uncategorized.length} people not yet assigned to a section — open their
            profile to assign.
          </p>
          <ul className="flex flex-wrap gap-2">
            {uncategorized.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/corporate/people/${p.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 transition"
                >
                  {p.name.en}
                  <ChevronRight className="size-3" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Sticky save footer ── */}
      {dirty && (
        <div className="sticky bottom-4 z-20 mt-2">
          <div className="mx-auto flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-[#d2d2d7] bg-white px-4 py-3 shadow-xl ring-1 ring-black/5">
            <span className="text-[0.8125rem] font-medium text-ink">
              Unsaved order changes
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.75rem] font-medium text-muted-foreground hover:bg-[#f5f5f7] transition"
                onClick={() => {
                  setBoardMap(initialBoardMap);
                  setDirty(false);
                }}
                disabled={saving}
              >
                <RotateCcw className="size-3" />
                Discard
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0071e3] px-4 py-1.5 text-[0.75rem] font-semibold text-white transition hover:bg-[#0077ed] disabled:opacity-50"
                onClick={() => void saveOrder()}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3" />
                )}
                {saving ? "Saving…" : "Save order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section Column ────────────────────────────────────────────────────────────

function SectionColumn({
  section,
  people,
  draggingId,
  dropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onMoveInSection,
}: {
  section: Section;
  people: PersonDTO[];
  draggingId: string | null;
  dropTarget: { sectionId: string; index: number } | null;
  onDragStart: (
    e: React.DragEvent,
    personId: string,
    fromSection: string,
    fromIndex: number,
  ) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, sectionId: string, index: number) => void;
  onDrop: (e: React.DragEvent, toSection: string, toIndex: number) => void;
  onMoveInSection: (sectionId: string, from: number, to: number) => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#d2d2d7] bg-white shadow-sm">
      {/* Column header */}
      <div className={cn("bg-gradient-to-r p-4", section.accent)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-lg bg-white/20 p-1.5 text-white">
              {section.icon}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white leading-tight">
                {section.label}
              </h2>
              <p className="text-[11px] text-white/75 leading-tight">
                {section.description}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1",
              "bg-white/20 text-white ring-white/30",
            )}
          >
            {people.length}
          </span>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          "min-h-[200px] flex-1 p-3 transition-colors",
          dropTarget?.sectionId === section.id && draggingId
            ? "bg-blue-50/60"
            : "bg-white",
        )}
        onDragOver={(e) => onDragOver(e, section.id, people.length)}
        onDrop={(e) => onDrop(e, section.id, people.length)}
      >
        {people.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-[#d2d2d7] text-xs text-muted-foreground">
            Drop people here
          </div>
        )}

        <ul className="flex flex-col gap-2">
          {people.map((person, idx) => (
            <PersonCard
              key={person.id}
              person={person}
              index={idx}
              sectionId={section.id}
              isDragging={draggingId === person.id}
              isDropTarget={
                dropTarget?.sectionId === section.id && dropTarget?.index === idx
              }
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onMoveUp={
                idx > 0 ? () => onMoveInSection(section.id, idx, idx - 1) : undefined
              }
              onMoveDown={
                idx < people.length - 1
                  ? () => onMoveInSection(section.id, idx, idx + 1)
                  : undefined
              }
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Person Card ───────────────────────────────────────────────────────────────

function PersonCard({
  person,
  index,
  sectionId,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onMoveUp,
  onMoveDown,
}: {
  person: PersonDTO;
  index: number;
  sectionId: string;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: (
    e: React.DragEvent,
    personId: string,
    fromSection: string,
    fromIndex: number,
  ) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, sectionId: string, index: number) => void;
  onDrop: (e: React.DragEvent, toSection: string, toIndex: number) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  return (
    <li
      draggable
      onDragStart={(e) => onDragStart(e, person.id, sectionId, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, sectionId, index)}
      onDrop={(e) => {
        e.stopPropagation();
        onDrop(e, sectionId, index);
      }}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-all select-none",
        isDragging
          ? "scale-95 opacity-40 border-blue-300 bg-blue-50"
          : isDropTarget
            ? "border-blue-400 bg-blue-50/60 shadow-sm"
            : "border-[#e5e5ea] bg-white hover:border-[#c7c7cc] hover:shadow-sm",
      )}
    >
      {/* Drag handle */}
      <div className="cursor-grab text-[#aeaeb2] transition hover:text-[#636366] active:cursor-grabbing">
        <GripVertical className="size-4" />
      </div>

      {/* Position badge */}
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-[10px] font-bold text-[#636366]">
        {index + 1}
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="truncate text-[0.8125rem] font-semibold text-ink">
            {person.name.en}
          </span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0 text-[0.6rem] font-semibold uppercase tracking-wide",
              corporateStatusTone(person.status),
            )}
          >
            {person.status}
          </span>
        </div>
        <p className="text-muted-foreground mt-0.5 truncate text-[0.6875rem]">
          {person.boardDesignation || ROLE_LABEL[person.role]}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        {/* Up/Down */}
        <div className="flex flex-col">
          <button
            type="button"
            className="flex h-4 w-5 items-center justify-center rounded text-[#aeaeb2] hover:bg-[#f5f5f7] hover:text-ink disabled:opacity-30 transition"
            onClick={onMoveUp}
            disabled={!onMoveUp}
            title="Move up"
          >
            <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor">
              <path d="M4 0L7.464 5H.536L4 0z" />
            </svg>
          </button>
          <button
            type="button"
            className="flex h-4 w-5 items-center justify-center rounded text-[#aeaeb2] hover:bg-[#f5f5f7] hover:text-ink disabled:opacity-30 transition"
            onClick={onMoveDown}
            disabled={!onMoveDown}
            title="Move down"
          >
            <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor">
              <path d="M4 5L.536 0H7.464L4 5z" />
            </svg>
          </button>
        </div>

        {/* Edit */}
        <Link
          href={`/admin/corporate/people/${person.id}`}
          className="flex h-6 w-6 items-center justify-center rounded text-[#aeaeb2] hover:bg-[#f5f5f7] hover:text-ink transition"
          title="Edit profile"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M9 1.5L10.5 3 4.5 9H3V7.5L9 1.5z" />
            <path d="M1.5 10.5h9" />
          </svg>
        </Link>
      </div>
    </li>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { CloudinaryPicker } from "@/features/admin-desk/components/cloudinary-picker";
import { DeskBackLink } from "@/features/admin-desk/components/desk-back-link";
import { DeskSaveBar } from "@/features/admin-desk/components/desk-save-bar";
import {
  CheckRow,
  CorporateField,
  corporateInputClass,
  slugify,
} from "@/features/admin-desk/components/corporate-form-ui";
import {
  ApiClientError,
  createPersonApi,
  deletePersonApi,
  fetchPersonApi,
  updatePersonApi,
} from "@/features/admin-desk/lib/corporate-api";
import {
  PERSON_ROLES,
  type PersonDTO,
  type PersonRole,
} from "@/modules/corporate/browser";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<PersonRole, string> = {
  director: "Director",
  chairman: "Chairman",
  md: "Managing Director",
  company_secretary: "Company Secretary",
  executive: "Executive",
};

type Draft = {
  nameEn: string;
  slug: string;
  role: PersonRole;
  leadershipSection: "board" | "operational";
  boardDesignation: string;
  yearsExperience: number;
  bioEn: string;
  photoUrl: string;
  photoId: string | null;
  showOnInvestorPage: boolean;
  showOnChairmansPage: boolean;
};

function fromPerson(p: PersonDTO): Draft {
  return {
    nameEn: p.name.en,
    slug: p.slug,
    role: p.role,
    leadershipSection: p.leadershipSection ?? "board",
    boardDesignation: p.boardDesignation,
    yearsExperience: p.yearsExperience,
    bioEn: p.bio.en,
    photoUrl: p.photoUrl ?? "",
    photoId: p.photoId,
    showOnInvestorPage: p.showOnInvestorPage,
    showOnChairmansPage: p.showOnChairmansPage,
  };
}

const emptyDraft = (): Draft => ({
  nameEn: "",
  slug: "",
  role: "director",
  leadershipSection: "board",
  boardDesignation: "",
  yearsExperience: 0,
  bioEn: "",
  photoUrl: "",
  photoId: null,
  showOnInvestorPage: false,
  showOnChairmansPage: false,
});

export function CorporatePeopleEditor({ personId }: { personId: string | "new" }) {
  const router = useRouter();
  const isNew = personId === "new";
  const [id, setId] = useState<string | null>(isNew ? null : personId);
  const [version, setVersion] = useState(1);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(draft) !== baseline, [draft, baseline]);

  const canPublish = Boolean(draft.nameEn.trim()) && Boolean(draft.slug.trim());

  const patch = (partial: Partial<Draft>) => setDraft((d) => ({ ...d, ...partial }));

  const load = useCallback(async () => {
    if (isNew) {
      setBaseline(JSON.stringify(emptyDraft()));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const p = await fetchPersonApi(personId);
      const d = fromPerson(p);
      setDraft(d);
      setBaseline(JSON.stringify(d));
      setVersion(p.version);
      setStatus(p.status);
      setId(p.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load person");
    } finally {
      setLoading(false);
    }
  }, [isNew, personId]);

  useEffect(() => {
    void load();
  }, [load]);

  function payload(nextStatus?: "draft" | "published") {
    return {
      name: { en: draft.nameEn.trim() },
      slug: draft.slug.trim(),
      role: draft.role,
      leadershipSection: draft.leadershipSection,
      boardDesignation: draft.boardDesignation.trim(),
      yearsExperience: draft.yearsExperience,
      bio: { en: draft.bioEn.trim() },
      photoUrl: draft.photoUrl.trim() || null,
      photoId: draft.photoId,
      showOnInvestorPage: draft.showOnInvestorPage,
      showOnChairmansPage: draft.showOnChairmansPage,
      ...(nextStatus ? { status: nextStatus } : {}),
    };
  }

  async function onSave() {
    if (!draft.nameEn.trim() || !draft.slug.trim()) {
      setError("Name and slug are required.");
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      if (!id) {
        const created = await createPersonApi(payload());
        setId(created.id);
        setVersion(created.version);
        setStatus(created.status);
        const d = fromPerson(created);
        setDraft(d);
        setBaseline(JSON.stringify(d));
        setMessage("Person created.");
        router.replace(`/admin/corporate/people/${created.id}`);
      } else {
        const updated = await updatePersonApi(id, {
          ...payload(),
          version,
        });
        setVersion(updated.version);
        setStatus(updated.status);
        const d = fromPerson(updated);
        setDraft(d);
        setBaseline(JSON.stringify(d));
        setMessage("Draft saved.");
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "CONFLICT") {
        setError("Someone else saved first. Reload and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    } finally {
      setSaving(false);
    }
  }

  async function onPublish() {
    if (!canPublish) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      // Single full payload — never status-only PATCH (Zod wipe bug).
      if (!id) {
        const created = await createPersonApi(payload("published"));
        setId(created.id);
        setVersion(created.version);
        setStatus(created.status);
        const d = fromPerson(created);
        setDraft(d);
        setBaseline(JSON.stringify(d));
        router.replace(`/admin/corporate/people/${created.id}`);
        setMessage("Published.");
        return;
      }
      const published = await updatePersonApi(id, {
        ...payload("published"),
        version,
      });
      setVersion(published.version);
      setStatus(published.status);
      const d = fromPerson(published);
      setDraft(d);
      setBaseline(JSON.stringify(d));
      setMessage("Published — live on leadership / chairman pages.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading person…</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-[52rem] flex-col pb-2">
      <header className="mb-4 flex flex-col gap-2">
        <DeskBackLink href="/admin/corporate/people" label="Back to people" />
        <h1 className="font-display text-xl font-semibold tracking-tight">
          {isNew && !id ? "New person" : draft.nameEn || "Person"}
        </h1>
        <p className="text-muted-foreground text-[0.8125rem]">
          Name and slug are required before publish.
        </p>
      </header>

      {error && !message ? (
        <p className="mb-3 text-sm text-destructive">{error}</p>
      ) : null}

      <div className="overflow-hidden rounded-[10px] border border-[#d2d2d7] bg-white">
        <div className="grid gap-2.5 p-3 sm:grid-cols-2">
          <CorporateField label="Name" className="sm:col-span-2">
            <input
              className={corporateInputClass}
              value={draft.nameEn}
              onChange={(e) => {
                const nameEn = e.target.value;
                patch({
                  nameEn,
                  slug: isNew && !id ? slugify(nameEn) : draft.slug,
                });
              }}
            />
          </CorporateField>
          <CorporateField label="Slug">
            <input
              className={corporateInputClass}
              value={draft.slug}
              onChange={(e) => patch({ slug: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Role">
            <select
              className={corporateInputClass}
              value={draft.role}
              onChange={(e) => patch({ role: e.target.value as PersonRole })}
            >
              {PERSON_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </CorporateField>
          <CorporateField label="Board designation">
            <input
              className={corporateInputClass}
              value={draft.boardDesignation}
              onChange={(e) => patch({ boardDesignation: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Years experience">
            <input
              type="number"
              className={corporateInputClass}
              value={draft.yearsExperience}
              onChange={(e) => patch({ yearsExperience: Number(e.target.value) || 0 })}
            />
          </CorporateField>
          <CorporateField label="Leadership section">
            <select
              className={corporateInputClass}
              value={draft.leadershipSection}
              onChange={(e) =>
                patch({ leadershipSection: e.target.value as "board" | "operational" })
              }
            >
              <option value="board">Board of Directors</option>
              <option value="operational">Operational Leadership</option>
            </select>
          </CorporateField>
          <div className="sm:col-span-2">
            <CloudinaryPicker
              kind="image"
              label="Photo"
              help="Upload a portrait. Replaces any previous photo URL."
              valueUrl={draft.photoUrl}
              onChange={({ url, mediaId }) =>
                patch({
                  photoUrl: url,
                  photoId: mediaId ?? draft.photoId,
                })
              }
            />
          </div>
          <CorporateField label="Bio" className="sm:col-span-2">
            <textarea
              className={cn(corporateInputClass, "h-auto min-h-[120px] resize-y py-2")}
              value={draft.bioEn}
              onChange={(e) => patch({ bioEn: e.target.value })}
              rows={5}
            />
          </CorporateField>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <CheckRow
              label="Show on investor / leadership page"
              checked={draft.showOnInvestorPage}
              onChange={(v) => patch({ showOnInvestorPage: v })}
            />
            <CheckRow
              label="Show on Chairman’s Message"
              checked={draft.showOnChairmansPage}
              onChange={(v) => patch({ showOnChairmansPage: v })}
            />
          </div>
        </div>
      </div>

      {id ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-8 text-[12px] text-[#ff3b30]"
            disabled={saving}
            onClick={async () => {
              if (!confirm("Move this person to trash?")) return;
              try {
                await deletePersonApi(id);
                router.push("/admin/corporate/people");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Delete failed");
              }
            }}
          >
            Trash
          </Button>
        </div>
      ) : null}

      <DeskSaveBar
        saving={saving}
        dirty={dirty || !id}
        canPublish={canPublish}
        publishBlockedReason={
          canPublish ? undefined : "Add name and slug before publish."
        }
        statusLabel={status}
        onSave={() => void onSave()}
        onPublish={() => void onPublish()}
        message={message}
        error={error}
      />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
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
  createExpansionProjectApi,
  deleteExpansionProjectApi,
  fetchExpansionProjectApi,
  updateExpansionProjectApi,
} from "@/features/admin-desk/lib/corporate-api";
import {
  EXPANSION_STATUSES,
  type ExpansionProjectDTO,
  type ExpansionStatus,
} from "@/modules/corporate/browser";
import { cn } from "@/lib/utils";

type Draft = {
  titleEn: string;
  slug: string;
  status: ExpansionStatus;
  descriptionEn: string;
  locationNote: string;
  expectedStart: string;
  expectedCommissioning: string;
  projectCostInr: string;
  estimatedRevenueInr: string;
  publicDisclosureApproved: boolean;
  sortOrder: number;
};

function fromProject(p: ExpansionProjectDTO): Draft {
  return {
    titleEn: p.title.en,
    slug: p.slug,
    status: p.status,
    descriptionEn: p.description.en,
    locationNote: p.locationNote,
    expectedStart: p.expectedStart,
    expectedCommissioning: p.expectedCommissioning,
    projectCostInr: p.projectCostInr == null ? "" : String(p.projectCostInr),
    estimatedRevenueInr:
      p.estimatedRevenueInr == null ? "" : String(p.estimatedRevenueInr),
    publicDisclosureApproved: p.publicDisclosureApproved,
    sortOrder: p.sortOrder,
  };
}

const emptyDraft = (): Draft => ({
  titleEn: "",
  slug: "",
  status: "planned",
  descriptionEn: "",
  locationNote: "",
  expectedStart: "",
  expectedCommissioning: "",
  projectCostInr: "",
  estimatedRevenueInr: "",
  publicDisclosureApproved: false,
  sortOrder: 0,
});

function parseOptionalNumber(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function CorporateExpansionEditor({ projectId }: { projectId: string | "new" }) {
  const router = useRouter();
  const isNew = projectId === "new";
  const [id, setId] = useState<string | null>(isNew ? null : projectId);
  const [version, setVersion] = useState(1);
  const [publishStatus, setPublishStatus] = useState<"draft" | "published">("draft");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(draft) !== baseline, [draft, baseline]);

  const canPublish = Boolean(draft.titleEn.trim()) && Boolean(draft.slug.trim());

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
      const p = await fetchExpansionProjectApi(projectId);
      const d = fromProject(p);
      setDraft(d);
      setBaseline(JSON.stringify(d));
      setVersion(p.version);
      setPublishStatus(p.publishStatus);
      setId(p.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [isNew, projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  function payload(nextPublish?: "draft" | "published") {
    return {
      title: { en: draft.titleEn.trim() },
      slug: draft.slug.trim(),
      status: draft.status,
      description: { en: draft.descriptionEn.trim() },
      locationNote: draft.locationNote.trim(),
      expectedStart: draft.expectedStart.trim(),
      expectedCommissioning: draft.expectedCommissioning.trim(),
      projectCostInr: parseOptionalNumber(draft.projectCostInr),
      estimatedRevenueInr: parseOptionalNumber(draft.estimatedRevenueInr),
      publicDisclosureApproved: draft.publicDisclosureApproved,
      sortOrder: draft.sortOrder,
      ...(nextPublish ? { publishStatus: nextPublish } : {}),
    };
  }

  async function onSave() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      if (!id) {
        const created = await createExpansionProjectApi(payload());
        setId(created.id);
        setVersion(created.version);
        setPublishStatus(created.publishStatus);
        const d = fromProject(created);
        setDraft(d);
        setBaseline(JSON.stringify(d));
        setMessage("Project created.");
        router.replace(`/admin/corporate/expansion/${created.id}`);
      } else {
        const updated = await updateExpansionProjectApi(id, {
          ...payload(),
          version,
        });
        setVersion(updated.version);
        setPublishStatus(updated.publishStatus);
        const d = fromProject(updated);
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
      // Always send full payload — never status-only (Zod default leak bug).
      if (!id) {
        const created = await createExpansionProjectApi(payload("published"));
        setId(created.id);
        setVersion(created.version);
        setPublishStatus(created.publishStatus);
        const d = fromProject(created);
        setDraft(d);
        setBaseline(JSON.stringify(d));
        router.replace(`/admin/corporate/expansion/${created.id}`);
        setMessage("Published.");
        return;
      }
      const published = await updateExpansionProjectApi(id, {
        ...payload("published"),
        version,
      });
      setVersion(published.version);
      setPublishStatus(published.publishStatus);
      const d = fromProject(published);
      setDraft(d);
      setBaseline(JSON.stringify(d));
      setMessage("Published — live on expansion roadmap.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading project…</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-[52rem] flex-col pb-2">
      <header className="mb-4 flex flex-col gap-2">
        <DeskBackLink href="/admin/corporate/expansion" label="Back to expansion" />
        <h1 className="font-display text-xl font-semibold tracking-tight">
          {isNew && !id ? "New expansion project" : draft.titleEn || "Project"}
        </h1>
      </header>

      {error && !message ? (
        <p className="mb-3 text-sm text-destructive">{error}</p>
      ) : null}

      <div className="overflow-hidden rounded-[10px] border border-[#d2d2d7] bg-white">
        <div className="grid gap-2.5 p-3 sm:grid-cols-2">
          <CorporateField label="Title" className="sm:col-span-2">
            <input
              className={corporateInputClass}
              value={draft.titleEn}
              onChange={(e) => {
                const titleEn = e.target.value;
                patch({
                  titleEn,
                  slug: isNew && !id ? slugify(titleEn) : draft.slug,
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
          <CorporateField label="Project status">
            <select
              className={corporateInputClass}
              value={draft.status}
              onChange={(e) => patch({ status: e.target.value as ExpansionStatus })}
            >
              {EXPANSION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </CorporateField>
          <CorporateField label="Location note" className="sm:col-span-2">
            <input
              className={corporateInputClass}
              value={draft.locationNote}
              onChange={(e) => patch({ locationNote: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Expected start">
            <input
              className={corporateInputClass}
              value={draft.expectedStart}
              onChange={(e) => patch({ expectedStart: e.target.value })}
              placeholder="2026 Q1"
            />
          </CorporateField>
          <CorporateField label="Expected commissioning">
            <input
              className={corporateInputClass}
              value={draft.expectedCommissioning}
              onChange={(e) => patch({ expectedCommissioning: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Project cost (INR)">
            <input
              className={corporateInputClass}
              value={draft.projectCostInr}
              onChange={(e) => patch({ projectCostInr: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Estimated revenue (INR)">
            <input
              className={corporateInputClass}
              value={draft.estimatedRevenueInr}
              onChange={(e) => patch({ estimatedRevenueInr: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Sort order">
            <input
              type="number"
              className={corporateInputClass}
              value={draft.sortOrder}
              onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })}
            />
          </CorporateField>
          <CorporateField label="Description" className="sm:col-span-2">
            <textarea
              className={cn(corporateInputClass, "h-auto min-h-[100px] resize-y py-2")}
              value={draft.descriptionEn}
              onChange={(e) => patch({ descriptionEn: e.target.value })}
              rows={4}
            />
          </CorporateField>
          <div className="sm:col-span-2">
            <CheckRow
              label="Public disclosure approved (show INR figures)"
              checked={draft.publicDisclosureApproved}
              onChange={(v) => patch({ publicDisclosureApproved: v })}
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
              if (!confirm("Move this project to trash?")) return;
              try {
                await deleteExpansionProjectApi(id);
                router.push("/admin/corporate/expansion");
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
          canPublish ? undefined : "Add title and slug before publish."
        }
        statusLabel={publishStatus}
        onSave={() => void onSave()}
        onPublish={() => void onPublish()}
        message={message}
        error={error}
      />
    </div>
  );
}

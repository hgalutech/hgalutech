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
  createCaseStudyApi,
  deleteCaseStudyApi,
  fetchCaseStudyApi,
  updateCaseStudyApi,
} from "@/features/admin-desk/lib/corporate-api";
import type { CaseStudyDTO } from "@/modules/corporate/browser";
import { cn } from "@/lib/utils";

type Draft = {
  titleEn: string;
  slug: string;
  industry: string;
  region: string;
  summaryEn: string;
  approvedForWebsite: boolean;
};

function fromCase(c: CaseStudyDTO): Draft {
  return {
    titleEn: c.title.en,
    slug: c.slug,
    industry: c.industry,
    region: c.region,
    summaryEn: c.summary.en,
    approvedForWebsite: c.approvedForWebsite,
  };
}

const emptyDraft = (): Draft => ({
  titleEn: "",
  slug: "",
  industry: "",
  region: "",
  summaryEn: "",
  approvedForWebsite: false,
});

export function CorporateCaseStudiesEditor({
  caseStudyId,
}: {
  caseStudyId: string | "new";
}) {
  const router = useRouter();
  const isNew = caseStudyId === "new";
  const [id, setId] = useState<string | null>(isNew ? null : caseStudyId);
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
  const canPublishBlocked = !draft.approvedForWebsite
    ? "Mark \u201cApproved for website\u201d before publish."
    : !draft.titleEn.trim() || !draft.slug.trim()
      ? "Add title and slug before publish."
      : undefined;
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
      const c = await fetchCaseStudyApi(caseStudyId);
      const d = fromCase(c);
      setDraft(d);
      setBaseline(JSON.stringify(d));
      setVersion(c.version);
      setPublishStatus(c.publishStatus);
      setId(c.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load case study");
    } finally {
      setLoading(false);
    }
  }, [isNew, caseStudyId]);

  useEffect(() => {
    void load();
  }, [load]);

  function payload(nextPublish?: "draft" | "published") {
    return {
      title: { en: draft.titleEn.trim() },
      slug: draft.slug.trim(),
      industry: draft.industry.trim(),
      region: draft.region.trim(),
      summary: { en: draft.summaryEn.trim() },
      approvedForWebsite: draft.approvedForWebsite,
      ...(nextPublish ? { publishStatus: nextPublish } : {}),
    };
  }

  async function persist(publish?: "draft" | "published") {
    if (publish === "published" && !draft.approvedForWebsite) {
      setError("Mark \u201cApproved for website\u201d before publish.");
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      // Always send full payload — never status-only (Zod default leak bug).
      if (!id) {
        const created = await createCaseStudyApi(payload(publish ?? "draft"));
        setId(created.id);
        setVersion(created.version);
        setPublishStatus(created.publishStatus);
        const d = fromCase(created);
        setDraft(d);
        setBaseline(JSON.stringify(d));
        router.replace(`/admin/corporate/case-studies/${created.id}`);
        setMessage(publish === "published" ? "Published." : "Case study created.");
        return;
      }
      const updated = await updateCaseStudyApi(id, {
        ...payload(publish),
        version,
      });
      setVersion(updated.version);
      setPublishStatus(updated.publishStatus);
      const d = fromCase(updated);
      setDraft(d);
      setBaseline(JSON.stringify(d));
      setMessage(publish === "published" ? "Published." : "Draft saved.");
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

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading case study…</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-[52rem] flex-col pb-2">
      <header className="mb-4 flex flex-col gap-2">
        <DeskBackLink href="/admin/corporate/case-studies" label="Back to case studies" />
        <h1 className="font-display text-xl font-semibold tracking-tight">
          {isNew && !id ? "New case study" : draft.titleEn || "Case study"}
        </h1>
      </header>

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
          <CorporateField label="Industry">
            <input
              className={corporateInputClass}
              value={draft.industry}
              onChange={(e) => patch({ industry: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Region">
            <input
              className={corporateInputClass}
              value={draft.region}
              onChange={(e) => patch({ region: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Summary" className="sm:col-span-2">
            <textarea
              className={cn(corporateInputClass, "h-auto min-h-[80px] resize-y py-2")}
              value={draft.summaryEn}
              onChange={(e) => patch({ summaryEn: e.target.value })}
              rows={3}
            />
          </CorporateField>
          <div className="sm:col-span-2">
            <CheckRow
              label="Approved for website"
              checked={draft.approvedForWebsite}
              onChange={(v) => patch({ approvedForWebsite: v })}
            />
          </div>
        </div>
      </div>

      {id ? (
        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            className="h-8 text-[12px] text-[#ff3b30]"
            disabled={saving}
            onClick={async () => {
              if (!confirm("Move this case study to trash?")) return;
              try {
                await deleteCaseStudyApi(id);
                router.push("/admin/corporate/case-studies");
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
        canPublish={canPublish && !canPublishBlocked}
        publishBlockedReason={canPublishBlocked}
        statusLabel={publishStatus}
        onSave={() => void persist()}
        onPublish={() => void persist("published")}
        message={message}
        error={error}
      />
    </div>
  );
}

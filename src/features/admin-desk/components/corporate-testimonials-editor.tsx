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
} from "@/features/admin-desk/components/corporate-form-ui";
import {
  ApiClientError,
  createTestimonialApi,
  deleteTestimonialApi,
  fetchTestimonialApi,
  updateTestimonialApi,
} from "@/features/admin-desk/lib/corporate-api";
import type { TestimonialDTO } from "@/modules/corporate/browser";
import { cn } from "@/lib/utils";

type Draft = {
  quoteEn: string;
  authorName: string;
  authorTitle: string;
  company: string;
  approvedForWebsite: boolean;
  sortOrder: number;
};

function fromTestimonial(t: TestimonialDTO): Draft {
  return {
    quoteEn: t.quote.en,
    authorName: t.authorName,
    authorTitle: t.authorTitle,
    company: t.company,
    approvedForWebsite: t.approvedForWebsite,
    sortOrder: t.sortOrder,
  };
}

const emptyDraft = (): Draft => ({
  quoteEn: "",
  authorName: "",
  authorTitle: "",
  company: "",
  approvedForWebsite: false,
  sortOrder: 0,
});

export function CorporateTestimonialsEditor({
  testimonialId,
}: {
  testimonialId: string | "new";
}) {
  const router = useRouter();
  const isNew = testimonialId === "new";
  const [id, setId] = useState<string | null>(isNew ? null : testimonialId);
  const [version, setVersion] = useState(1);
  const [publishStatus, setPublishStatus] = useState<"draft" | "published">("draft");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(draft) !== baseline, [draft, baseline]);
  const canPublish = Boolean(draft.quoteEn.trim()) && Boolean(draft.authorName.trim());
  const canPublishBlocked = !draft.approvedForWebsite
    ? "Mark \u201cApproved for website\u201d before publish."
    : !draft.quoteEn.trim() || !draft.authorName.trim()
      ? "Add quote and author before publish."
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
      const t = await fetchTestimonialApi(testimonialId);
      const d = fromTestimonial(t);
      setDraft(d);
      setBaseline(JSON.stringify(d));
      setVersion(t.version);
      setPublishStatus(t.publishStatus);
      setId(t.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load testimonial");
    } finally {
      setLoading(false);
    }
  }, [isNew, testimonialId]);

  useEffect(() => {
    void load();
  }, [load]);

  function payload(nextPublish?: "draft" | "published") {
    return {
      quote: { en: draft.quoteEn.trim() },
      authorName: draft.authorName.trim(),
      authorTitle: draft.authorTitle.trim(),
      company: draft.company.trim(),
      approvedForWebsite: draft.approvedForWebsite,
      sortOrder: draft.sortOrder,
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
        const created = await createTestimonialApi(payload(publish ?? "draft"));
        setId(created.id);
        setVersion(created.version);
        setPublishStatus(created.publishStatus);
        const d = fromTestimonial(created);
        setDraft(d);
        setBaseline(JSON.stringify(d));
        router.replace(`/admin/corporate/testimonials/${created.id}`);
        setMessage(publish === "published" ? "Published." : "Testimonial created.");
        return;
      }
      const updated = await updateTestimonialApi(id, {
        ...payload(publish),
        version,
      });
      setVersion(updated.version);
      setPublishStatus(updated.publishStatus);
      const d = fromTestimonial(updated);
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
    return <p className="text-muted-foreground text-sm">Loading testimonial…</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-[52rem] flex-col pb-2">
      <header className="mb-4 flex flex-col gap-2">
        <DeskBackLink href="/admin/corporate/testimonials" label="Back to testimonials" />
        <h1 className="font-display text-xl font-semibold tracking-tight">
          {isNew && !id ? "New testimonial" : draft.authorName || "Testimonial"}
        </h1>
      </header>

      <div className="overflow-hidden rounded-[10px] border border-[#d2d2d7] bg-white">
        <div className="grid gap-2.5 p-3 sm:grid-cols-2">
          <CorporateField label="Quote" className="sm:col-span-2">
            <textarea
              className={cn(corporateInputClass, "h-auto min-h-[80px] resize-y py-2")}
              value={draft.quoteEn}
              onChange={(e) => patch({ quoteEn: e.target.value })}
              rows={3}
            />
          </CorporateField>
          <CorporateField label="Author name">
            <input
              className={corporateInputClass}
              value={draft.authorName}
              onChange={(e) => patch({ authorName: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Author title">
            <input
              className={corporateInputClass}
              value={draft.authorTitle}
              onChange={(e) => patch({ authorTitle: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Company">
            <input
              className={corporateInputClass}
              value={draft.company}
              onChange={(e) => patch({ company: e.target.value })}
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
              if (!confirm("Move this testimonial to trash?")) return;
              try {
                await deleteTestimonialApi(id);
                router.push("/admin/corporate/testimonials");
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

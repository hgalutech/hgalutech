"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DeskBackLink } from "@/features/admin-desk/components/desk-back-link";
import { DeskSaveBar } from "@/features/admin-desk/components/desk-save-bar";
import {
  CorporateField,
  corporateInputClass,
  slugify,
} from "@/features/admin-desk/components/corporate-form-ui";
import {
  ApiClientError,
  createCapacityMetricApi,
  deleteCapacityMetricApi,
  fetchCapacityMetricApi,
  updateCapacityMetricApi,
} from "@/features/admin-desk/lib/corporate-api";
import {
  CAPACITY_CATEGORIES,
  type CapacityCategory,
  type CapacityMetricDTO,
} from "@/modules/corporate/browser";

type Draft = {
  key: string;
  labelEn: string;
  value: string;
  unit: string;
  category: CapacityCategory;
  sourceNote: string;
  verificationStatus: CapacityMetricDTO["verificationStatus"];
  displayOrder: number;
};

function fromMetric(m: CapacityMetricDTO): Draft {
  return {
    key: m.key,
    labelEn: m.label.en,
    value: m.value,
    unit: m.unit,
    category: m.category,
    sourceNote: m.sourceNote,
    verificationStatus: m.verificationStatus,
    displayOrder: m.displayOrder,
  };
}

const emptyDraft = (): Draft => ({
  key: "",
  labelEn: "",
  value: "",
  unit: "",
  category: "extrusion",
  sourceNote: "",
  verificationStatus: "draft",
  displayOrder: 0,
});

export function CorporateCapacityEditor({ metricId }: { metricId: string | "new" }) {
  const router = useRouter();
  const isNew = metricId === "new";
  const [id, setId] = useState<string | null>(isNew ? null : metricId);
  const [version, setVersion] = useState(1);
  const [publishStatus, setPublishStatus] = useState<"hidden" | "published">("hidden");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(draft) !== baseline, [draft, baseline]);

  const canPublish =
    Boolean(draft.key.trim()) &&
    Boolean(draft.labelEn.trim()) &&
    Boolean(draft.value.trim());

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
      const m = await fetchCapacityMetricApi(metricId);
      const d = fromMetric(m);
      setDraft(d);
      setBaseline(JSON.stringify(d));
      setVersion(m.version);
      setPublishStatus(m.publishStatus);
      setId(m.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load metric");
    } finally {
      setLoading(false);
    }
  }, [isNew, metricId]);

  useEffect(() => {
    void load();
  }, [load]);

  function payload(nextPublish?: "hidden" | "published") {
    return {
      key: draft.key.trim(),
      label: { en: draft.labelEn.trim() },
      value: draft.value.trim(),
      unit: draft.unit.trim(),
      category: draft.category,
      sourceNote: draft.sourceNote.trim(),
      verificationStatus: draft.verificationStatus,
      displayOrder: draft.displayOrder,
      ...(nextPublish ? { publishStatus: nextPublish } : {}),
    };
  }

  async function onSave() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      if (!id) {
        const created = await createCapacityMetricApi(payload());
        setId(created.id);
        setVersion(created.version);
        setPublishStatus(created.publishStatus);
        const d = fromMetric(created);
        setDraft(d);
        setBaseline(JSON.stringify(d));
        setMessage("Metric created.");
        router.replace(`/admin/corporate/capacity/${created.id}`);
      } else {
        const updated = await updateCapacityMetricApi(id, {
          ...payload(),
          version,
        });
        setVersion(updated.version);
        setPublishStatus(updated.publishStatus);
        const d = fromMetric(updated);
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
        const created = await createCapacityMetricApi(payload("published"));
        setId(created.id);
        setVersion(created.version);
        setPublishStatus(created.publishStatus);
        const d = fromMetric(created);
        setDraft(d);
        setBaseline(JSON.stringify(d));
        router.replace(`/admin/corporate/capacity/${created.id}`);
        setMessage("Published.");
        return;
      }
      const published = await updateCapacityMetricApi(id, {
        ...payload("published"),
        version,
      });
      setVersion(published.version);
      setPublishStatus(published.publishStatus);
      const d = fromMetric(published);
      setDraft(d);
      setBaseline(JSON.stringify(d));
      setMessage("Published — live on capacity / about stats.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading metric…</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-[52rem] flex-col pb-2">
      <header className="mb-4 flex flex-col gap-2">
        <DeskBackLink href="/admin/corporate/capacity" label="Back to capacity" />
        <h1 className="font-display text-xl font-semibold tracking-tight">
          {isNew && !id ? "New capacity metric" : draft.labelEn || "Metric"}
        </h1>
        <p className="text-muted-foreground text-[0.8125rem]">
          Key, label and value are required before publish.
        </p>
      </header>

      {error && !message ? (
        <p className="mb-3 text-sm text-destructive">{error}</p>
      ) : null}

      <div className="overflow-hidden rounded-[10px] border border-[#d2d2d7] bg-white">
        <div className="grid gap-2.5 p-3 sm:grid-cols-2">
          <CorporateField label="Label" className="sm:col-span-2">
            <input
              className={corporateInputClass}
              value={draft.labelEn}
              onChange={(e) => {
                const labelEn = e.target.value;
                patch({
                  labelEn,
                  key: isNew && !id ? slugify(labelEn) : draft.key,
                });
              }}
            />
          </CorporateField>
          <CorporateField label="Key">
            <input
              className={corporateInputClass}
              value={draft.key}
              onChange={(e) => patch({ key: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Category">
            <select
              className={corporateInputClass}
              value={draft.category}
              onChange={(e) => patch({ category: e.target.value as CapacityCategory })}
            >
              {CAPACITY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </CorporateField>
          <CorporateField label="Value">
            <input
              className={corporateInputClass}
              value={draft.value}
              onChange={(e) => patch({ value: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Unit">
            <input
              className={corporateInputClass}
              value={draft.unit}
              onChange={(e) => patch({ unit: e.target.value })}
              placeholder="MT / yr, presses…"
            />
          </CorporateField>
          <CorporateField label="Verification">
            <select
              className={corporateInputClass}
              value={draft.verificationStatus}
              onChange={(e) =>
                patch({
                  verificationStatus: e.target.value as Draft["verificationStatus"],
                })
              }
            >
              <option value="draft">Draft</option>
              <option value="needs_verification">Needs verification</option>
              <option value="verified">Verified</option>
            </select>
          </CorporateField>
          <CorporateField label="Display order">
            <input
              type="number"
              className={corporateInputClass}
              value={draft.displayOrder}
              onChange={(e) => patch({ displayOrder: Number(e.target.value) || 0 })}
            />
          </CorporateField>
          <CorporateField label="Source note" className="sm:col-span-2">
            <input
              className={corporateInputClass}
              value={draft.sourceNote}
              onChange={(e) => patch({ sourceNote: e.target.value })}
            />
          </CorporateField>
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
              if (!confirm("Move this metric to trash?")) return;
              try {
                await deleteCapacityMetricApi(id);
                router.push("/admin/corporate/capacity");
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
          canPublish ? undefined : "Add key, label and value before publish."
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

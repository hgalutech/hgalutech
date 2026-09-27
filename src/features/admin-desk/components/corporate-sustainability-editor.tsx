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
  createSustainabilityMetricApi,
  deleteSustainabilityMetricApi,
  fetchSustainabilityMetricApi,
  updateSustainabilityMetricApi,
} from "@/features/admin-desk/lib/corporate-api";
import {
  DISCLOSURE_TIERS,
  type DisclosureTier,
  type SustainabilityMetricDTO,
} from "@/modules/corporate/browser";

type Draft = {
  key: string;
  labelEn: string;
  value: string;
  unit: string;
  disclosureTier: DisclosureTier;
  methodologyNote: string;
  verificationStatus: SustainabilityMetricDTO["verificationStatus"];
};

function fromMetric(m: SustainabilityMetricDTO): Draft {
  return {
    key: m.key,
    labelEn: m.label.en,
    value: m.value ?? "",
    unit: m.unit,
    disclosureTier: m.disclosureTier,
    methodologyNote: m.methodologyNote,
    verificationStatus: m.verificationStatus,
  };
}

const emptyDraft = (): Draft => ({
  key: "",
  labelEn: "",
  value: "",
  unit: "",
  disclosureTier: "initiative",
  methodologyNote: "",
  verificationStatus: "draft",
});

export function CorporateSustainabilityEditor({
  metricId,
}: {
  metricId: string | "new";
}) {
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
  const canPublish = Boolean(draft.key.trim()) && Boolean(draft.labelEn.trim());
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
      const m = await fetchSustainabilityMetricApi(metricId);
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
      value: draft.value.trim() || null,
      unit: draft.unit.trim(),
      disclosureTier: draft.disclosureTier,
      methodologyNote: draft.methodologyNote.trim(),
      verificationStatus: draft.verificationStatus,
      ...(nextPublish ? { publishStatus: nextPublish } : {}),
    };
  }

  async function persist(publish?: "hidden" | "published") {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      // Always send full payload — never status-only (Zod default leak bug).
      if (!id) {
        const created = await createSustainabilityMetricApi(payload(publish ?? "hidden"));
        setId(created.id);
        setVersion(created.version);
        setPublishStatus(created.publishStatus);
        const d = fromMetric(created);
        setDraft(d);
        setBaseline(JSON.stringify(d));
        router.replace(`/admin/corporate/sustainability/${created.id}`);
        setMessage(publish === "published" ? "Published." : "Metric created.");
        return;
      }
      const updated = await updateSustainabilityMetricApi(id, {
        ...payload(publish),
        version,
      });
      setVersion(updated.version);
      setPublishStatus(updated.publishStatus);
      const d = fromMetric(updated);
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
    return <p className="text-muted-foreground text-sm">Loading metric…</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-[52rem] flex-col pb-2">
      <header className="mb-4 flex flex-col gap-2">
        <DeskBackLink
          href="/admin/corporate/sustainability"
          label="Back to sustainability"
        />
        <h1 className="font-display text-xl font-semibold tracking-tight">
          {isNew && !id ? "New sustainability metric" : draft.labelEn || "Metric"}
        </h1>
      </header>

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
          <CorporateField label="Disclosure tier">
            <select
              className={corporateInputClass}
              value={draft.disclosureTier}
              onChange={(e) =>
                patch({ disclosureTier: e.target.value as DisclosureTier })
              }
            >
              {DISCLOSURE_TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
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
              <option value="verified">Verified</option>
            </select>
          </CorporateField>
          <CorporateField label="Methodology note" className="sm:col-span-2">
            <input
              className={corporateInputClass}
              value={draft.methodologyNote}
              onChange={(e) => patch({ methodologyNote: e.target.value })}
            />
          </CorporateField>
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
              if (!confirm("Move this metric to trash?")) return;
              try {
                await deleteSustainabilityMetricApi(id);
                router.push("/admin/corporate/sustainability");
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
          canPublish ? undefined : "Add key and label before publish."
        }
        statusLabel={publishStatus}
        onSave={() => void persist()}
        onPublish={() => void persist("published")}
        message={message}
        error={error}
      />
    </div>
  );
}

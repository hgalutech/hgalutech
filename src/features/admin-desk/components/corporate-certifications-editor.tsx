"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DeskBackLink } from "@/features/admin-desk/components/desk-back-link";
import { DeskSaveBar } from "@/features/admin-desk/components/desk-save-bar";
import {
  CorporateField,
  corporateInputClass,
} from "@/features/admin-desk/components/corporate-form-ui";
import {
  ApiClientError,
  createCertificationApi,
  deleteCertificationApi,
  fetchCertificationApi,
  updateCertificationApi,
} from "@/features/admin-desk/lib/corporate-api";
import {
  CERTIFICATION_TYPES,
  type CertificationDTO,
  type CertificationType,
} from "@/modules/corporate/browser";

type Draft = {
  name: string;
  type: CertificationType;
  issuer: string;
  validFrom: string;
  validTo: string;
  documentId: string;
};

function fromCert(c: CertificationDTO): Draft {
  return {
    name: c.name,
    type: c.type,
    issuer: c.issuer,
    validFrom: c.validFrom ?? "",
    validTo: c.validTo ?? "",
    documentId: c.documentId ?? "",
  };
}

const emptyDraft = (): Draft => ({
  name: "",
  type: "iso",
  issuer: "",
  validFrom: "",
  validTo: "",
  documentId: "",
});

export function CorporateCertificationsEditor({
  certificationId,
}: {
  certificationId: string | "new";
}) {
  const router = useRouter();
  const isNew = certificationId === "new";
  const [id, setId] = useState<string | null>(isNew ? null : certificationId);
  const [version, setVersion] = useState(1);
  const [publishStatus, setPublishStatus] = useState<"draft" | "published">("draft");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(draft) !== baseline, [draft, baseline]);

  const canPublish = Boolean(draft.name.trim());

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
      const c = await fetchCertificationApi(certificationId);
      const d = fromCert(c);
      setDraft(d);
      setBaseline(JSON.stringify(d));
      setVersion(c.version);
      setPublishStatus(c.publishStatus);
      setId(c.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load certification");
    } finally {
      setLoading(false);
    }
  }, [isNew, certificationId]);

  useEffect(() => {
    void load();
  }, [load]);

  function payload(nextPublish?: "draft" | "published") {
    return {
      name: draft.name.trim(),
      type: draft.type,
      issuer: draft.issuer.trim(),
      validFrom: draft.validFrom.trim() || null,
      validTo: draft.validTo.trim() || null,
      documentId: draft.documentId.trim() || null,
      ...(nextPublish ? { publishStatus: nextPublish } : {}),
    };
  }

  async function onSave() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      if (!id) {
        const created = await createCertificationApi(payload());
        setId(created.id);
        setVersion(created.version);
        setPublishStatus(created.publishStatus);
        const d = fromCert(created);
        setDraft(d);
        setBaseline(JSON.stringify(d));
        setMessage("Certification created.");
        router.replace(`/admin/corporate/certifications/${created.id}`);
      } else {
        const updated = await updateCertificationApi(id, {
          ...payload(),
          version,
        });
        setVersion(updated.version);
        setPublishStatus(updated.publishStatus);
        const d = fromCert(updated);
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
        const created = await createCertificationApi(payload("published"));
        setId(created.id);
        setVersion(created.version);
        setPublishStatus(created.publishStatus);
        const d = fromCert(created);
        setDraft(d);
        setBaseline(JSON.stringify(d));
        router.replace(`/admin/corporate/certifications/${created.id}`);
        setMessage("Published.");
        return;
      }
      const published = await updateCertificationApi(id, {
        ...payload("published"),
        version,
      });
      setVersion(published.version);
      setPublishStatus(published.publishStatus);
      const d = fromCert(published);
      setDraft(d);
      setBaseline(JSON.stringify(d));
      setMessage("Published.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading certification…</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-[52rem] flex-col pb-2">
      <header className="mb-4 flex flex-col gap-2">
        <DeskBackLink
          href="/admin/corporate/certifications"
          label="Back to certifications"
        />
        <h1 className="font-display text-xl font-semibold tracking-tight">
          {isNew && !id ? "New certification" : draft.name || "Certification"}
        </h1>
      </header>

      {error && !message ? (
        <p className="mb-3 text-sm text-destructive">{error}</p>
      ) : null}

      <div className="overflow-hidden rounded-[10px] border border-[#d2d2d7] bg-white">
        <div className="grid gap-2.5 p-3 sm:grid-cols-2">
          <CorporateField label="Name" className="sm:col-span-2">
            <input
              className={corporateInputClass}
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Type">
            <select
              className={corporateInputClass}
              value={draft.type}
              onChange={(e) => patch({ type: e.target.value as CertificationType })}
            >
              {CERTIFICATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </CorporateField>
          <CorporateField label="Issuer">
            <input
              className={corporateInputClass}
              value={draft.issuer}
              onChange={(e) => patch({ issuer: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Valid from">
            <input
              type="date"
              className={corporateInputClass}
              value={draft.validFrom}
              onChange={(e) => patch({ validFrom: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Valid to">
            <input
              type="date"
              className={corporateInputClass}
              value={draft.validTo}
              onChange={(e) => patch({ validTo: e.target.value })}
            />
          </CorporateField>
          <CorporateField label="Document ID" className="sm:col-span-2">
            <input
              className={corporateInputClass}
              value={draft.documentId}
              onChange={(e) => patch({ documentId: e.target.value })}
              placeholder="Media / Cloudinary id"
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
              if (!confirm("Move this certification to trash?")) return;
              try {
                await deleteCertificationApi(id);
                router.push("/admin/corporate/certifications");
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
        publishBlockedReason={canPublish ? undefined : "Add a name before publish."}
        statusLabel={publishStatus}
        onSave={() => void onSave()}
        onPublish={() => void onPublish()}
        message={message}
        error={error}
      />
    </div>
  );
}

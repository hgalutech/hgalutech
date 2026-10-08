"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DeskBackLink } from "@/features/admin-desk/components/desk-back-link";
import { ApiClientError } from "@/features/admin-desk/lib/api";
import { fetchLeadApi, updateLeadStatusApi } from "@/features/admin-desk/lib/leads-api";
import type { EnquiryDTO, EnquiryStatus } from "@/modules/enquiries/browser";
import { cn } from "@/lib/utils";

function Field({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div>
      <dt className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.08em] uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-[0.875rem] text-ink">{value}</dd>
    </div>
  );
}

export function LeadDetail({ id }: { id: string }) {
  const router = useRouter();
  const [lead, setLead] = useState<EnquiryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeadApi(id);
      setLead(data);
      if (data.status === "new") {
        try {
          const updated = await updateLeadStatusApi(id, "read");
          setLead(updated);
        } catch {
          /* viewers can read but not update status */
        }
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load lead");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(status: EnquiryStatus) {
    if (!lead) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateLeadStatusApi(lead.id, status);
      setLead(updated);
      setMessage(
        status === "archived"
          ? "Archived."
          : status === "new"
            ? "Marked as new."
            : "Marked as read.",
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading lead…</p>;
  }
  if (!lead) {
    return (
      <div>
        <DeskBackLink href="/admin/leads" label="Back to leads" />
        <p className="text-destructive mt-4 text-sm">{error ?? "Lead not found"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[40rem] flex-col gap-5 pb-8">
      <header className="flex flex-col gap-2">
        <DeskBackLink href="/admin/leads" label="Back to leads" />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">
              {lead.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-[0.8125rem]">
              {lead.email}
              {lead.company ? ` · ${lead.company}` : ""}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[0.65rem] font-bold tracking-wide uppercase",
              lead.status === "new" && "bg-brand-red/10 text-brand-red",
              lead.status === "read" && "bg-brand-blue-light text-brand-blue",
              lead.status === "archived" && "bg-[#f5f5f7] text-[#86868b]",
            )}
          >
            {lead.status}
          </span>
        </div>
      </header>

      <dl className="grid gap-4 rounded-lg border border-line bg-white p-4 min-[560px]:grid-cols-2">
        <Field label="Phone" value={lead.phone} />
        <Field label="Product" value={lead.productInterest} />
        <Field label="Alloy" value={lead.alloy} />
        <Field label="Temper" value={lead.temper} />
        <Field label="Monthly tonnage" value={lead.monthlyTonnage} />
        <Field label="Destination" value={lead.destination} />
        <Field label="Source" value={lead.source} />
        <Field
          label="Received"
          value={new Date(lead.createdAt).toLocaleString("en-IN")}
        />
        <div className="min-[560px]:col-span-2">
          <dt className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.08em] uppercase">
            Notes
          </dt>
          <dd className="mt-1 whitespace-pre-wrap text-[0.875rem] text-ink">
            {lead.message}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2">
        {lead.status !== "archived" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={() => void setStatus("archived")}
          >
            Archive
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={() => void setStatus("read")}
          >
            Unarchive
          </Button>
        )}
        {lead.status === "read" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={saving}
            onClick={() => void setStatus("new")}
          >
            Mark as new
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          render={<a href={`mailto:${lead.email}?subject=Re: your HG Alutek RFQ`} />}
        >
          Reply by email
        </Button>
      </div>

      {message ? <p className="text-sm text-teal-700">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

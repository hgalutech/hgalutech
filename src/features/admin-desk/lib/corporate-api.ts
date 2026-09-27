import { ApiClientError } from "@/features/admin-desk/lib/api";
import type {
  CapacityMetricDTO,
  CaseStudyDTO,
  CertificationDTO,
  CompanyProfileDTO,
  CustomerLogoDTO,
  ExpansionProjectDTO,
  PersonDTO,
  SustainabilityMetricDTO,
  TestimonialDTO,
} from "@/modules/corporate/browser";

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = {
  success: false;
  error: { code: string; message: string };
};

async function parse<T>(res: Response): Promise<T> {
  const json = (await res.json()) as ApiSuccess<T> | ApiFailure;
  if (!json.success) {
    throw new ApiClientError(
      json.error.message || "Request failed",
      json.error.code,
      res.status,
    );
  }
  return json.data;
}

type ListParams = { q?: string; trash?: boolean };

function listQuery(params?: ListParams) {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.trash) sp.set("trash", "1");
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

/* ── Company ─────────────────────────────────────────────── */

export async function fetchCompanyApi() {
  const res = await fetch("/api/v1/corporate/company");
  return parse<CompanyProfileDTO | null>(res);
}

export async function updateCompanyApi(body: Record<string, unknown>) {
  const res = await fetch("/api/v1/corporate/company", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<CompanyProfileDTO>(res);
}

/* ── People ──────────────────────────────────────────────── */

export async function fetchPeopleApi(params?: ListParams) {
  const res = await fetch(`/api/v1/corporate/people${listQuery(params)}`);
  return parse<{ items: PersonDTO[] }>(res);
}

export async function fetchPersonApi(id: string) {
  const res = await fetch(`/api/v1/corporate/people/${id}`);
  return parse<PersonDTO>(res);
}

export async function createPersonApi(body: Record<string, unknown>) {
  const res = await fetch("/api/v1/corporate/people", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<PersonDTO>(res);
}

export async function updatePersonApi(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/v1/corporate/people/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<PersonDTO>(res);
}

export async function deletePersonApi(id: string) {
  const res = await fetch(`/api/v1/corporate/people/${id}`, {
    method: "DELETE",
  });
  return parse<PersonDTO>(res);
}

export async function reorderPeopleApi(
  items: { id: string; section: "board" | "operational"; sectionOrder: number }[],
) {
  const res = await fetch("/api/v1/corporate/people/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  return parse<{ updated: number }>(res);
}

/* ── Capacity metrics ─────────────────────────────────────── */

export async function fetchCapacityMetricsApi(params?: ListParams) {
  const res = await fetch(`/api/v1/corporate/capacity-metrics${listQuery(params)}`);
  return parse<{ items: CapacityMetricDTO[] }>(res);
}

export async function fetchCapacityMetricApi(id: string) {
  const res = await fetch(`/api/v1/corporate/capacity-metrics/${id}`);
  return parse<CapacityMetricDTO>(res);
}

export async function createCapacityMetricApi(body: Record<string, unknown>) {
  const res = await fetch("/api/v1/corporate/capacity-metrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<CapacityMetricDTO>(res);
}

export async function updateCapacityMetricApi(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/v1/corporate/capacity-metrics/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<CapacityMetricDTO>(res);
}

export async function deleteCapacityMetricApi(id: string) {
  const res = await fetch(`/api/v1/corporate/capacity-metrics/${id}`, {
    method: "DELETE",
  });
  return parse<CapacityMetricDTO>(res);
}

/* ── Certifications ───────────────────────────────────────── */

export async function fetchCertificationsApi(params?: ListParams) {
  const res = await fetch(`/api/v1/corporate/certifications${listQuery(params)}`);
  return parse<{ items: CertificationDTO[] }>(res);
}

export async function fetchCertificationApi(id: string) {
  const res = await fetch(`/api/v1/corporate/certifications/${id}`);
  return parse<CertificationDTO>(res);
}

export async function createCertificationApi(body: Record<string, unknown>) {
  const res = await fetch("/api/v1/corporate/certifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<CertificationDTO>(res);
}

export async function updateCertificationApi(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/v1/corporate/certifications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<CertificationDTO>(res);
}

export async function deleteCertificationApi(id: string) {
  const res = await fetch(`/api/v1/corporate/certifications/${id}`, {
    method: "DELETE",
  });
  return parse<CertificationDTO>(res);
}

/* ── Sustainability ───────────────────────────────────────── */

export async function fetchSustainabilityMetricsApi(params?: ListParams) {
  const res = await fetch(`/api/v1/corporate/sustainability${listQuery(params)}`);
  return parse<{ items: SustainabilityMetricDTO[] }>(res);
}

export async function fetchSustainabilityMetricApi(id: string) {
  const res = await fetch(`/api/v1/corporate/sustainability/${id}`);
  return parse<SustainabilityMetricDTO>(res);
}

export async function createSustainabilityMetricApi(body: Record<string, unknown>) {
  const res = await fetch("/api/v1/corporate/sustainability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<SustainabilityMetricDTO>(res);
}

export async function updateSustainabilityMetricApi(
  id: string,
  body: Record<string, unknown>,
) {
  const res = await fetch(`/api/v1/corporate/sustainability/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<SustainabilityMetricDTO>(res);
}

export async function deleteSustainabilityMetricApi(id: string) {
  const res = await fetch(`/api/v1/corporate/sustainability/${id}`, {
    method: "DELETE",
  });
  return parse<SustainabilityMetricDTO>(res);
}

/* ── Customer logos ───────────────────────────────────────── */

export async function fetchCustomerLogosApi(params?: ListParams) {
  const res = await fetch(`/api/v1/corporate/customer-logos${listQuery(params)}`);
  return parse<{ items: CustomerLogoDTO[] }>(res);
}

export async function fetchCustomerLogoApi(id: string) {
  const res = await fetch(`/api/v1/corporate/customer-logos/${id}`);
  return parse<CustomerLogoDTO>(res);
}

export async function createCustomerLogoApi(body: Record<string, unknown>) {
  const res = await fetch("/api/v1/corporate/customer-logos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<CustomerLogoDTO>(res);
}

export async function updateCustomerLogoApi(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/v1/corporate/customer-logos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<CustomerLogoDTO>(res);
}

export async function deleteCustomerLogoApi(id: string) {
  const res = await fetch(`/api/v1/corporate/customer-logos/${id}`, {
    method: "DELETE",
  });
  return parse<CustomerLogoDTO>(res);
}

/* ── Case studies ─────────────────────────────────────────── */

export async function fetchCaseStudiesApi(params?: ListParams) {
  const res = await fetch(`/api/v1/corporate/case-studies${listQuery(params)}`);
  return parse<{ items: CaseStudyDTO[] }>(res);
}

export async function fetchCaseStudyApi(id: string) {
  const res = await fetch(`/api/v1/corporate/case-studies/${id}`);
  return parse<CaseStudyDTO>(res);
}

export async function createCaseStudyApi(body: Record<string, unknown>) {
  const res = await fetch("/api/v1/corporate/case-studies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<CaseStudyDTO>(res);
}

export async function updateCaseStudyApi(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/v1/corporate/case-studies/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<CaseStudyDTO>(res);
}

export async function deleteCaseStudyApi(id: string) {
  const res = await fetch(`/api/v1/corporate/case-studies/${id}`, {
    method: "DELETE",
  });
  return parse<CaseStudyDTO>(res);
}

/* ── Testimonials ─────────────────────────────────────────── */

export async function fetchTestimonialsApi(params?: ListParams) {
  const res = await fetch(`/api/v1/corporate/testimonials${listQuery(params)}`);
  return parse<{ items: TestimonialDTO[] }>(res);
}

export async function fetchTestimonialApi(id: string) {
  const res = await fetch(`/api/v1/corporate/testimonials/${id}`);
  return parse<TestimonialDTO>(res);
}

export async function createTestimonialApi(body: Record<string, unknown>) {
  const res = await fetch("/api/v1/corporate/testimonials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<TestimonialDTO>(res);
}

export async function updateTestimonialApi(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/v1/corporate/testimonials/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<TestimonialDTO>(res);
}

export async function deleteTestimonialApi(id: string) {
  const res = await fetch(`/api/v1/corporate/testimonials/${id}`, {
    method: "DELETE",
  });
  return parse<TestimonialDTO>(res);
}

/* ── Expansion ────────────────────────────────────────────── */

export async function fetchExpansionProjectsApi(params?: ListParams) {
  const res = await fetch(`/api/v1/corporate/expansion${listQuery(params)}`);
  return parse<{ items: ExpansionProjectDTO[] }>(res);
}

export async function fetchExpansionProjectApi(id: string) {
  const res = await fetch(`/api/v1/corporate/expansion/${id}`);
  return parse<ExpansionProjectDTO>(res);
}

export async function createExpansionProjectApi(body: Record<string, unknown>) {
  const res = await fetch("/api/v1/corporate/expansion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<ExpansionProjectDTO>(res);
}

export async function updateExpansionProjectApi(
  id: string,
  body: Record<string, unknown>,
) {
  const res = await fetch(`/api/v1/corporate/expansion/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<ExpansionProjectDTO>(res);
}

export async function deleteExpansionProjectApi(id: string) {
  const res = await fetch(`/api/v1/corporate/expansion/${id}`, {
    method: "DELETE",
  });
  return parse<ExpansionProjectDTO>(res);
}

export { ApiClientError };

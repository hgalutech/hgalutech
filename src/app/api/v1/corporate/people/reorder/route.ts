import { z } from "zod";
import { authorize } from "@/modules/identity";
import { respondError, respondSuccess } from "@/lib/http/respond";
import { revalidateCorporate } from "@/lib/cms/revalidate-pages";
import { reorderPeople } from "@/modules/corporate";

const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        section: z.enum(["board", "operational"]),
        sectionOrder: z.number().int().min(0),
      }),
    )
    .min(1),
});

export async function PATCH(req: Request) {
  const authz = await authorize("corporate.write");
  if ("error" in authz) return authz.error;
  try {
    const body = await req.json();
    const { items } = reorderSchema.parse(body);
    const result = await reorderPeople(items);
    revalidateCorporate();
    return respondSuccess(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid payload";
    return respondError("VALIDATION_ERROR", message, 400);
  }
}

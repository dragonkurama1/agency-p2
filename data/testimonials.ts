import { unstable_cache } from "next/cache";
import { isGoogleSheetsConfigured, getSheetRows } from "@/lib/google/sheets";
import { parseBool, parseNumber } from "@/lib/parse";
import { testimonials as seedTestimonials } from "@/lib/seed-data";

export interface Testimonial {
  id: string;
  client_name: string;
  company: string;
  message: string;
  rating: number;
  service: string;
  active: boolean;
}

function mapRow(row: Record<string, string>): Testimonial {
  return {
    id: row.id,
    client_name: row.client_name,
    company: row.company || "",
    message: row.message,
    rating: parseNumber(row.rating, 5),
    service: row.service || "",
    active: parseBool(row.active, true),
  };
}

async function fetchTestimonials(): Promise<Testimonial[]> {
  if (!isGoogleSheetsConfigured()) return seedTestimonials;
  try {
    const rows = await getSheetRows<Record<string, string>>("testimonials");
    const mapped = rows.map(mapRow).filter((t) => t.active);
    return mapped.length ? mapped : seedTestimonials;
  } catch {
    return seedTestimonials;
  }
}

export const getTestimonials = unstable_cache(fetchTestimonials, ["testimonials"], {
  tags: ["testimonials"],
  revalidate: 3600,
});

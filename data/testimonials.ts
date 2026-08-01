import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";
import { parseNumber } from "@/lib/parse";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): Testimonial {
  return {
    id: row.id,
    client_name: row.client_name,
    company: row.company || "",
    message: row.message || "",
    rating: parseNumber(row.rating, 5),
    service: row.service || "",
    active: row.active ?? true,
  };
}

async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const mapped = (data ?? []).map(mapRow);
    return mapped.length ? mapped : seedTestimonials;
  } catch {
    return seedTestimonials;
  }
}

export const getTestimonials = unstable_cache(fetchTestimonials, ["testimonials"], {
  tags: ["testimonials"],
  revalidate: 3600,
});

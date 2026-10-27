import { cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Photo } from "@/components/Gallery";
import { byCategory } from "@/lib/categories";
import { getDictionary, type Locale } from "@/app/[lang]/dictionaries";

// Photos live in Supabase; the admin changes them and calls updateTag("photos") to refresh this cache.
export async function getPhotos(lang: Locale): Promise<Photo[]> {
  "use cache";
  cacheTag("photos");
  const { alt } = getDictionary(lang).gallery;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data, error } = await supabase.from("photos").select("path, category, blur").order("position").order("created_at");
  if (error) throw new Error(`photos: ${error.code} ${error.message}`);
  return byCategory(data).map((p) => ({
    src: supabase.storage.from("gallery").getPublicUrl(p.path).data.publicUrl,
    category: p.category,
    alt: alt[p.category as Photo["category"]],
    blur: p.blur,
  }));
}

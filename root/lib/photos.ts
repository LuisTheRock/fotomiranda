import { readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { Photo } from "@/components/Gallery";
import { getDictionary, type Locale } from "@/app/[lang]/dictionaries";

// wedding first: it is the main service and the gallery opens on the first page of this list.
// To add a category (e.g. "batizado"): add it here and to Category in Gallery.tsx, then give it
// a label and alt text under gallery in dictionaries.ts and a button in the Gallery filters.
const ORDER: Photo["category"][] = ["casamento", "casal", "bebes"];

export async function getPhotos(lang: Locale): Promise<Photo[]> {
  "use cache";
  const { alt } = getDictionary(lang).gallery;
  const dir = path.join(process.cwd(), "public/gallery");
  const files = readdirSync(dir).filter((f) => f.endsWith(".jpg"));
  const unknown = files.find((f) => !ORDER.includes(f.split("-")[0] as Photo["category"]));
  if (unknown) throw new Error(`public/gallery/${unknown}: unknown category prefix, add it to ORDER in lib/photos.ts`);
  files.sort((a, b) => ORDER.indexOf(a.split("-")[0] as Photo["category"]) - ORDER.indexOf(b.split("-")[0] as Photo["category"]) || a.localeCompare(b));
  return Promise.all(
    files.map(async (f) => {
      const category = f.split("-")[0] as Photo["category"];
      const tiny = await sharp(path.join(dir, f)).resize(16).jpeg({ quality: 50 }).toBuffer();
      return {
        src: `/gallery/${f}`,
        category,
        alt: alt[category],
        blur: `data:image/jpeg;base64,${tiny.toString("base64")}`,
      };
    }),
  );
}

import { readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { Photo } from "@/components/Gallery";
import { getDictionary, type Locale } from "@/app/[lang]/dictionaries";

export async function getPhotos(lang: Locale): Promise<Photo[]> {
  "use cache";
  const { alt } = getDictionary(lang).gallery;
  const dir = path.join(process.cwd(), "public/gallery");
  const files = readdirSync(dir).filter((f) => f.endsWith(".jpg")).sort();
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

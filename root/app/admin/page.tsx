import { Suspense } from "react";
import { requireUser } from "@/lib/supabase/server";
import { byCategory } from "@/lib/categories";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { logout } from "./actions";
import AdminGallery from "./AdminGallery";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <Suspense fallback={<p className="font-mono text-xs text-muted">A carregar...</p>}>
        <Gallery />
      </Suspense>
    </main>
  );
}

async function Gallery() {
  const supabase = await requireUser();
  const { data, error } = await supabase.from("photos").select("id, path, category").order("position").order("created_at");
  if (error) throw new Error(`photos: ${error.code} ${error.message}`);
  const photos = byCategory(data).map((p) => ({
    id: p.id,
    category: p.category,
    url: supabase.storage.from("gallery").getPublicUrl(p.path).data.publicUrl,
  }));
  const { gallery } = getDictionary("pt");
  const labels = { casamento: gallery.casamento, casal: gallery.casal, bebes: gallery.bebes };

  return (
    <>
      <header className="mb-12 flex items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">FotoMiranda / Administração</p>
          <h1 className="serif mt-3 text-4xl md:text-5xl">Galeria</h1>
          <p className="mt-3 font-mono text-xs text-muted">{String(photos.length).padStart(2, "0")} fotografias</p>
        </div>
        <form action={logout}>
          <button className="rounded-md border border-line bg-surface px-4 py-2 text-sm transition-colors hover:bg-bone active:scale-[0.98]">
            Terminar sessão
          </button>
        </form>
      </header>
      <AdminGallery photos={photos} labels={labels} />
    </>
  );
}

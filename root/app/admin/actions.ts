"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireUser } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/categories";

export type Result = { error?: string };

const done = (): Result => {
  updateTag("photos");
  return {};
};
const isCategory = (v: unknown) => CATEGORIES.includes(v as string);

export async function login(_prev: Result, form: FormData): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
  });
  if (error) return { error: "Email ou palavra-passe incorretos." };
  redirect("/admin");
}

export async function logout() {
  await (await createClient()).auth.signOut();
  redirect("/");
}

// The browser has already uploaded the file to Storage; this registers it at the end of the gallery.
export async function addPhoto(path: string, category: string, blur: string): Promise<Result> {
  const supabase = await requireUser();
  if (!/^[\w-]+\.jpg$/.test(path) || !isCategory(category) || !/^data:image\/jpeg;base64,[\w+/=]{1,3000}$/.test(blur)) {
    return { error: "Fotografia inválida." };
  }
  const { data } = await supabase.from("photos").select("position").order("position", { ascending: false }).limit(1);
  const { error } = await supabase.from("photos").insert({ path, category, blur, position: (data?.[0]?.position ?? -1) + 1 });
  return error ? { error: "Não foi possível guardar." } : done();
}

export async function deletePhotos(ids: string[]): Promise<Result> {
  const supabase = await requireUser();
  const uuid = /^[0-9a-f-]{36}$/i;
  if (!ids.length || ids.length > 500 || !ids.every((id) => uuid.test(id))) return { error: "Seleção inválida." };
  const { data } = await supabase.from("photos").select("path").in("id", ids);
  const { error } = await supabase.from("photos").delete().in("id", ids);
  if (error) return { error: "Não foi possível apagar." };
  if (data?.length) await supabase.storage.from("gallery").remove(data.map((p) => p.path));
  return done();
}

export async function setCategory(id: string, category: string): Promise<Result> {
  const supabase = await requireUser();
  if (!isCategory(category)) return { error: "Categoria inválida." };
  const { error } = await supabase.from("photos").update({ category }).eq("id", id);
  return error ? { error: "Não foi possível guardar." } : done();
}

// shortcut: one UPDATE per photo, fine for a few hundred rows; use an rpc if the gallery grows past that.
export async function reorder(ids: string[]): Promise<Result> {
  const supabase = await requireUser();
  const results = await Promise.all(ids.map((id, position) => supabase.from("photos").update({ position }).eq("id", id)));
  return results.some((r) => r.error) ? { error: "Não foi possível guardar a ordem." } : done();
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, byCategory } from "@/lib/categories";
import {
  addPhoto,
  deletePhotos,
  reorder,
  setCategory,
  type Result,
} from "./actions";

type Item = { id: string; url: string; category: string };

const MAX_WIDTH = 1600;

// Resize in the browser: keeps uploads small and gives us the 16 px blur preview without sharp.
async function prepare(file: File) {
  const bitmap = await createImageBitmap(file);
  const draw = (w: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = Math.round((bitmap.height * w) / bitmap.width);
    canvas
      .getContext("2d")!
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas;
  };
  const blob = await new Promise<Blob>((ok, no) =>
    draw(Math.min(MAX_WIDTH, bitmap.width)).toBlob(
      (b) => (b ? ok(b) : no(new Error("encode"))),
      "image/jpeg",
      0.85,
    ),
  );
  return { blob, blur: draw(16).toDataURL("image/jpeg", 0.5) };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function AdminGallery({
  photos,
  labels,
}: {
  photos: Item[];
  labels: Record<string, string>;
}) {
  const [items, setItems] = useState(photos);
  const [seen, setSeen] = useState(photos);
  const [category, setUploadCategory] = useState("casamento");
  const [confirm, setConfirm] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmMany, setConfirmMany] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const from = useRef<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const busy = pending || progress !== null;

  // Leaving mid-upload loses the photos still waiting; make the browser ask first.
  const uploading = progress !== null;
  useEffect(() => {
    if (!uploading) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [uploading]);

  // The server sends a fresh list after every change (an upload adds one at a time); adopt it.
  if (photos !== seen) {
    setSeen(photos);
    setItems(photos);
  }

  const run = (job: () => Promise<Result>) =>
    start(async () => {
      setMessage("");
      try {
        const { error } = await job();
        if (error) setMessage(error);
      } catch {
        setMessage("Algo correu mal. Tente novamente.");
      }
    });

  const upload = (files: FileList | null) => {
    const list = Array.from(files ?? []);
    if (!list.length) return;
    setProgress({ done: 0, total: list.length });
    run(async () => {
      try {
        const supabase = createClient();
        for (const file of list) {
          const { blob, blur } = await prepare(file);
          const path = `${category}-${crypto.randomUUID().slice(0, 8)}.jpg`;
          const { error } = await supabase.storage
            .from("gallery")
            .upload(path, blob, { contentType: "image/jpeg" });
          if (error)
            return { error: "Não foi possível carregar a fotografia." };
          const result = await addPhoto(path, category, blur);
          if (result.error) return result;
          setProgress((p) => p && { ...p, done: p.done + 1 });
        }
        return {};
      } finally {
        setProgress(null);
      }
    });
  };

  const toggle = (ids: string[], on: boolean) =>
    setSelected((a) =>
      on ? [...new Set([...a, ...ids])] : a.filter((id) => !ids.includes(id)),
    );

  const removeMany = async (ids: string[]) => {
    const r = await deletePhotos(ids);
    if (!r.error) {
      setItems((a) => a.filter((x) => !ids.includes(x.id)));
      setSelected((a) => a.filter((id) => !ids.includes(id)));
    }
    return r;
  };

  // Dragging only reorders inside one category; the flat list stays grouped by category.
  const move = (targetId: string) => {
    const dragged = from.current;
    if (!dragged || dragged === targetId) return;
    setItems((a) => {
      const f = a.findIndex((x) => x.id === dragged);
      const t = a.findIndex((x) => x.id === targetId);
      if (a[f].category !== a[t].category) return a;
      const next = [...a];
      next.splice(t, 0, next.splice(f, 1)[0]);
      return next;
    });
  };

  // The photo goes to the end of its new category; then the whole order is saved.
  const recategorize = (id: string, value: string) => {
    const moved = items.find((x) => x.id === id)!;
    const next = byCategory([
      ...items.filter((x) => x.id !== id),
      { ...moved, category: value },
    ]);
    setItems(next);
    run(async () => {
      const r = await setCategory(id, value);
      return r.error ? r : reorder(next.map((x) => x.id));
    });
  };

  return (
    <>
      <section
        onDragOver={(e) =>
          e.dataTransfer.types.includes("Files") && e.preventDefault()
        }
        onDrop={(e) => {
          if (!e.dataTransfer.files.length || busy) return;
          e.preventDefault();
          upload(e.dataTransfer.files);
        }}
        className="card p-6 sm:p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Carregar para
            </p>
            <div
              className="mt-3 flex flex-wrap gap-2"
              role="group"
              aria-label="Categoria do carregamento"
            >
              {Object.entries(labels).map(([key, label]) => (
                <button
                  key={key}
                  aria-pressed={category === key}
                  disabled={busy}
                  onClick={() => setUploadCategory(key)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    category === key
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-surface text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => input.current?.click()}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm text-white transition hover:bg-[#333] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 256 256"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden
            >
              <path d="M224 144v64a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-64a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0ZM93.66 77.66 120 51.31V144a8 8 0 0 0 16 0V51.31l26.34 26.35a8 8 0 0 0 11.32-11.32l-40-40a8 8 0 0 0-11.32 0l-40 40a8 8 0 0 0 11.32 11.32Z" />
            </svg>
            {progress ? "A carregar..." : "Escolher fotografias"}
          </button>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(e) => {
              upload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {progress && (
          <div className="mt-6">
            <div
              className="bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={progress.total}
              aria-valuenow={progress.done}
              aria-label="Progresso do carregamento"
            >
              <i
                style={{
                  transform: `scaleX(${progress.done / progress.total})`,
                }}
              />
            </div>
            <p className="mt-2 font-mono text-xs text-muted">
              {pad(progress.done)} / {pad(progress.total)} carregadas. Não feche
              esta página.
            </p>
          </div>
        )}

        <div
          role="status"
          className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-4 text-sm text-muted"
        >
          <p>
            Pode também largar as fotografias aqui. Arraste os cartões abaixo
            para mudar a ordem dentro de cada categoria.
          </p>
          <span className="font-mono text-xs">
            {message ? (
              <span className="text-[#9f2f2d]">{message}</span>
            ) : pending && !progress ? (
              "A guardar..."
            ) : (
              ""
            )}
          </span>
        </div>
      </section>

      {CATEGORIES.map((cat) => {
        const group = items.filter((x) => x.category === cat);
        return (
          <section key={cat} className="mt-12">
            <div className="mb-4 flex items-baseline justify-between border-b border-line pb-3">
              <h2 className="serif text-2xl">{labels[cat]}</h2>
              <span className="flex items-center gap-4 font-mono text-xs text-muted">
                {group.length > 0 && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      toggle(
                        group.map((x) => x.id),
                        !group.every((x) => selected.includes(x.id)),
                      )
                    }
                    className="underline-offset-4 transition-colors hover:text-ink hover:underline disabled:opacity-50"
                  >
                    {group.every((x) => selected.includes(x.id))
                      ? "Limpar seleção"
                      : "Selecionar todas"}
                  </button>
                )}
                {pad(group.length)} fotografias
              </span>
            </div>
            {group.length === 0 ? (
              <p className="text-sm text-muted">
                Ainda sem fotografias nesta categoria.
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {group.map((p, i) => (
                  <li
                    key={p.id}
                    draggable={!busy}
                    onDragStart={() => {
                      from.current = p.id;
                      setDragging(p.id);
                    }}
                    onDragEnter={() => move(p.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnd={() => {
                      from.current = null;
                      setDragging(null);
                      run(() => reorder(items.map((x) => x.id)));
                    }}
                    style={
                      {
                        "--i": Math.min(i, 12),
                        opacity: dragging === p.id ? 0.4 : undefined,
                      } as React.CSSProperties
                    }
                    className={`card rise overflow-hidden transition-opacity ${selected.includes(p.id) ? "!border-ink" : ""} ${busy ? "" : "cursor-grab active:cursor-grabbing"}`}
                  >
                    <div className="relative aspect-[4/3] bg-bone">
                      <Image
                        src={p.url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        draggable={false}
                        className="object-cover"
                      />
                      <span className="kbd absolute left-2 top-2">
                        {pad(i + 1)}
                      </span>
                      <button
                        role="checkbox"
                        aria-checked={selected.includes(p.id)}
                        aria-label="Selecionar fotografia"
                        disabled={busy}
                        onClick={() => toggle([p.id], !selected.includes(p.id))}
                        className={`absolute right-2 top-2 grid h-6 w-6 place-items-center rounded border transition-colors disabled:opacity-50 ${
                          selected.includes(p.id)
                            ? "border-ink bg-ink text-white"
                            : "border-line bg-white/90 text-transparent hover:text-muted"
                        }`}
                      >
                        <svg
                          viewBox="0 0 256 256"
                          width="14"
                          height="14"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path d="M229.66 77.66l-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-line p-2.5">
                      {confirm === p.id ? (
                        <>
                          <span
                            className="tag"
                            style={{ background: "#fdebec", color: "#9f2f2d" }}
                          >
                            Apagar?
                          </span>
                          <span className="flex gap-1 text-xs">
                            <button
                              disabled={busy}
                              onClick={() => {
                                setConfirm(null);
                                run(async () => {
                                  return removeMany([p.id]);
                                });
                              }}
                              className="rounded border border-line px-2 py-1 transition-colors hover:bg-bone disabled:opacity-50"
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setConfirm(null)}
                              className="rounded border border-line px-2 py-1 transition-colors hover:bg-bone"
                            >
                              Não
                            </button>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="relative min-w-0">
                            <select
                              value={p.category}
                              disabled={busy}
                              aria-label="Categoria"
                              onChange={(e) => {
                                recategorize(p.id, e.target.value);
                              }}
                              className="min-w-0 appearance-none rounded-md border border-line bg-surface py-1 pl-2 pr-6 text-xs outline-none focus:border-ink disabled:opacity-50"
                            >
                              {Object.entries(labels).map(([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              ))}
                            </select>
                            <svg
                              viewBox="0 0 256 256"
                              width="12"
                              height="12"
                              fill="currentColor"
                              aria-hidden
                              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted"
                            >
                              <path d="M213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32Z" />
                            </svg>
                          </span>
                          <button
                            onClick={() => setConfirm(p.id)}
                            disabled={busy}
                            aria-label="Apagar fotografia"
                            className="grid h-7 w-7 shrink-0 place-items-center rounded text-muted transition-colors hover:bg-bone hover:text-[#9f2f2d] disabled:opacity-50"
                          >
                            <svg
                              viewBox="0 0 256 256"
                              width="16"
                              height="16"
                              fill="currentColor"
                              aria-hidden
                            >
                              <path d="M216 48h-40v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H40a8 8 0 0 0 0 16h8v144a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16V64h8a8 8 0 0 0 0-16ZM96 40a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v8H96Zm96 168H64V64h128Zm-80-104v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Zm48 0v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Z" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
      {selected.length > 0 && (
        <div
          className="rise fixed inset-x-4 bottom-6 z-10 mx-auto flex max-w-xl items-center justify-between gap-4 rounded-xl border border-line bg-surface p-3 pl-5"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}
        >
          <span className="font-mono text-xs text-muted" role="status">
            {pad(selected.length)} selecionadas
          </span>
          {confirmMany ? (
            <span className="flex items-center gap-2 text-sm">
              <span
                className="tag"
                style={{ background: "#fdebec", color: "#9f2f2d" }}
              >
                Apagar {selected.length}?
              </span>
              <button
                disabled={busy}
                onClick={() => {
                  setConfirmMany(false);
                  run(() => removeMany(selected));
                }}
                className="rounded-md px-3 py-1.5 transition-colors disabled:opacity-50"
                style={{ background: "#fdebec", color: "#9f2f2d" }}
              >
                Sim, apagar
              </button>
              <button
                onClick={() => setConfirmMany(false)}
                className="rounded-md border border-line px-3 py-1.5 transition-colors hover:bg-bone"
              >
                Não
              </button>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setSelected([])}
                disabled={busy}
                className="rounded-md border border-line px-3 py-1.5 transition-colors hover:bg-bone disabled:opacity-50"
              >
                Limpar
              </button>
              <button
                onClick={() => setConfirmMany(true)}
                disabled={busy}
                className="rounded-md bg-ink px-3 py-1.5 text-white transition hover:bg-[#333] active:scale-[0.98] disabled:opacity-50"
              >
                Apagar selecionadas
              </button>
            </span>
          )}
        </div>
      )}
    </>
  );
}

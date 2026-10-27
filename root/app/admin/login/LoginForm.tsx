"use client";

import { useActionState } from "react";
import { login } from "../actions";

const field = "mt-2 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-ink";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="card w-full p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">FotoMiranda</p>
      <h1 className="serif mt-3 text-4xl">Administração</h1>
      <p className="mb-8 mt-2 text-sm text-muted">Entre para gerir as fotografias da galeria.</p>
      <label className="block text-sm">
        Email
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>
      <label className="mt-4 block text-sm">
        Palavra-passe
        <input name="password" type="password" required autoComplete="current-password" className={field} />
      </label>
      {state.error && (
        <p role="alert" className="mt-4 rounded-md bg-[#fdebec] px-3 py-2 text-sm text-[#9f2f2d]">
          {state.error}
        </p>
      )}
      <button disabled={pending} className="btn mt-6 w-full disabled:opacity-60">
        {pending ? "A entrar..." : "Entrar"}
      </button>
    </form>
  );
}

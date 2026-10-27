import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center px-6" style={{ background: "radial-gradient(60rem 40rem at 50% 0%, rgba(120, 100, 70, 0.05), transparent)" }}>
      <div className="mx-auto w-full max-w-sm">
        <Suspense>
          <Guard />
        </Suspense>
      </div>
    </main>
  );
}

// Already logged in: skip the form.
async function Guard() {
  const { data } = await (await createClient()).auth.getUser();
  if (data.user) redirect("/admin");
  return <LoginForm />;
}

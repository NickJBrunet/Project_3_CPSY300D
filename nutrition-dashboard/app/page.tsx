import OAuthSection from "../components/auth/OAuthSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40 sm:p-10">
          <div className="mb-8 flex flex-col gap-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Diet Tracker</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Sign in or create an account
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
              Secure access to your dashboard with email/password or OAuth providers.
            </p>
          </div>

          <OAuthSection />
        </div>
      </div>
    </main>
  );
}

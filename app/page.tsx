import SettingsForm from "@/components/settings-form";

export default function Home() {
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-slate-600">Edit your profile details below.</p>
      <div className="mt-6">
        <SettingsForm />
      </div>
    </main>
  );
}
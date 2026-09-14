import SettingsForm from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-slate-600">Edit your profile details below.</p>
      <div className="mt-6">
        <SettingsForm />
      </div>
    </div>
  );
}
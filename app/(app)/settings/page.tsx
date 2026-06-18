import { GoogleSyncPanel } from "@/components/settings/GoogleSyncPanel";
import { AccountPrivacyControls } from "@/components/settings/AccountPrivacyControls";

export default function SettingsPage({ searchParams }: { searchParams?: { google?: string; deleted?: string } }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[32px] border border-stone-200 bg-white p-7 shadow-medium">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-[#E57200]">Compass</div>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-[#172033]">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-stone-600">Connect Google, manage sync, and control your account data.</p>
      </div>

      {searchParams?.google ? <div className="rounded-[24px] border border-[#FFE0BD] bg-[#FFF3E7] p-4 text-sm font-bold text-[#B85C00]">Google status: {searchParams.google}</div> : null}

      <GoogleSyncPanel />
      <AccountPrivacyControls />
    </div>
  );
}

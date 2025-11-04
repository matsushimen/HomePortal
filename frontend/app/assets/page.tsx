import { AssetSummary } from "@/components/AssetSummary";
import { fetchAssetSummary } from "@/lib/api";

export default async function AssetsPage() {
  const summary = await fetchAssetSummary().catch(() => []);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Assets</h1>
        <p className="text-sm text-slate-400">Manual CSV imports power this dashboard. Upload via admin tools.</p>
      </header>
      <AssetSummary items={summary} />
      <section className="card">
        <h2 className="text-lg font-semibold">Import Format</h2>
        <p className="mt-2 text-sm text-slate-400">
          Prepare a CSV file with the headers <code>date,account_name,balance,currency</code>. Upload it using the admin action in the backend.
        </p>
      </section>
    </div>
  );
}

import { AssetSummary } from "@/components/AssetSummary";
import { LinkList } from "@/components/LinkList";
import { TodoList } from "@/components/TodoList";
import { fetchAssetSummary, fetchLinks, fetchTodos } from "@/lib/api";

export default async function DashboardPage() {
  const [links, todos, assetItems] = await Promise.all([
    fetchLinks().catch(() => []),
    fetchTodos().catch(() => []),
    fetchAssetSummary().catch(() => [])
  ]);
  const topLinks = links.slice(0, 5);
  const topTodos = todos.slice(0, 5);
  const recentAssets = assetItems.slice(-6);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-400">At-a-glance insight for today&apos;s household priorities.</p>
      </header>
      <div className="card-grid md:grid-cols-2">
        <LinkList links={topLinks} heading="Quick Links" />
        <TodoList todos={topTodos} heading="Today&apos;s Tasks" />
        <AssetSummary items={recentAssets} />
      </div>
    </div>
  );
}

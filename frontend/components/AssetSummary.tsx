import { AssetSummaryItem } from "@/lib/api";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);
}

type Props = {
  items: AssetSummaryItem[];
};

export function AssetSummary({ items }: Props) {
  return (
    <section className="card">
      <h2 className="text-lg font-semibold">Assets</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-400">
            <tr>
              <th className="px-3 py-2">Month</th>
              <th className="px-3 py-2">Totals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {items.map((item) => (
              <tr key={item.month}>
                <td className="px-3 py-2 font-medium">{item.month}</td>
                <td className="px-3 py-2">
                  <ul className="flex flex-wrap gap-3 text-xs text-slate-300">
                    {Object.entries(item.totals).map(([currency, amount]) => (
                      <li key={currency} className="rounded-full bg-slate-800 px-3 py-1">
                        {currency} {formatCurrency(amount, currency)}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

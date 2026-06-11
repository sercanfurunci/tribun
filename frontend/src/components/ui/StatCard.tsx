interface StatCardProps {
  label: string;
  value: string | number;
  /** Small muted prefix (e.g. "#" for rank) so symbols never outweigh the metric digits */
  prefix?: string;
}

export function StatCard({ label, value, prefix }: StatCardProps) {
  return (
    <div className="bg-white border border-[#D9D4CC] rounded-lg px-4 py-3.5 min-h-[76px] flex flex-col items-center justify-center text-center gap-1">
      <div className="flex items-baseline justify-center gap-0.5 leading-none">
        {prefix && (
          <span className="font-heading font-black text-sm text-[#999390]">{prefix}</span>
        )}
        <span className="font-display text-2xl leading-none text-[#111111]">{value}</span>
      </div>
      <div className="text-[10px] text-[#999390] uppercase tracking-widest font-heading leading-none">
        {label}
      </div>
    </div>
  );
}

type StatItem = {
  title: string;
  value: string;
  description: string;
};

type StatsCardsProps = {
  items: StatItem[];
};

export function StatsCards({ items }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className="p-6 glass border-white/5 shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">{item.title}</h3>
          <p className="mt-4 text-4xl font-extrabold text-foreground">{item.value}</p>
          <div className="flex items-center mt-2 group-hover:translate-x-1 transition-transform">
             <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{item.description}</span>
          </div>
        </div>

      ))}
    </div>
  );
}
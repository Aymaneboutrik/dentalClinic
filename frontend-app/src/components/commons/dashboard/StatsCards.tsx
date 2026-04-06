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
        <div key={item.title} className="p-6 border rounded-xl">
          <h3 className="text-sm font-medium">{item.title}</h3>
          <p className="mt-4 text-3xl font-bold">{item.value}</p>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
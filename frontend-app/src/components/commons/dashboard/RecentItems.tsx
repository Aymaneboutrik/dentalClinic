type RecentItem = {
  title: string;
  name: string;
  time: string;
};

type RecentItemsProps = {
  items: RecentItem[];
};

export function RecentItems({ items }: RecentItemsProps) {
  return (
    <div className="p-6 border rounded-xl">
      <h2 className="mb-4 text-xl font-semibold">Activités récentes</h2>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between pb-3 border-b last:border-b-0"
          >
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-muted-foreground">{item.name}</p>
            </div>

            <span>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
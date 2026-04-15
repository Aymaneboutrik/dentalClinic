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
<<<<<<< HEAD
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
=======
    <div className="glass p-8 border-white/5 shadow-2xl rounded-[2rem]">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Activités récentes</h2>
        <span className="text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Temps réel</span>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all duration-200 group border border-transparent hover:border-white/5"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="text-lg font-bold">{item.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</p>
                <p className="text-sm text-muted-foreground font-medium">{item.name}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-semibold text-muted-foreground/80">{item.time}</span>
            </div>
>>>>>>> origin/main
          </div>
        ))}
      </div>
    </div>
<<<<<<< HEAD
=======

>>>>>>> origin/main
  );
}
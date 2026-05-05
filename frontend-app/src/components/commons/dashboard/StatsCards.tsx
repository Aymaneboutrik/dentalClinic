import { ReactNode } from "react";

type StatItem = {
  title: string;
  value: string;
  description: string;
  icon?: ReactNode;
};

type StatsCardsProps = {
  items: StatItem[];
};

export function StatsCards({ items }: StatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      {items.map((item, index) => (
        <div 
          key={item.title} 
          className={`relative overflow-hidden p-8 glass border-white/10 shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-700 group
            ${index % 2 === 0 ? 'rounded-[4rem_1.5rem_4rem_1.5rem]' : 'rounded-[1.5rem_4rem_1.5rem_4rem]'}
          `}
        >
          {/* Decorative organic glow background */}
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/10 blur-[50px] group-hover:bg-primary/30 transition-all duration-700 rounded-full" />
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-primary/5 blur-[40px] group-hover:bg-primary/15 transition-all duration-700 rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-4 p-4 bg-primary/5 rounded-[2rem] text-primary group-hover:scale-125 group-hover:bg-primary/10 transition-all duration-500 shadow-inner">
              {item.icon}
            </div>
            
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2 group-hover:text-primary transition-colors duration-500">
              {item.title}
            </h3>
            
            <p className="text-5xl font-black text-foreground tracking-tighter italic mb-3 drop-shadow-sm">
              {item.value}
            </p>
            
            <div className="flex items-center">
               <span className="text-[9px] font-black text-primary/70 bg-primary/5 border border-primary/10 px-4 py-1.5 rounded-full uppercase tracking-[0.1em] backdrop-blur-sm">
                 {item.description}
               </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
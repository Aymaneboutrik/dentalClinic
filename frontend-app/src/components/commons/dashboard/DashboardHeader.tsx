type DashboardHeaderProps = {
  title: string;
  subtitle: string;
};

export function DashboardHeader({
  title,
  subtitle,
}: DashboardHeaderProps) {
  return (
    <div className="mb-10 space-y-2">
      <div className="h-1 w-20 bg-primary rounded-full mb-4 shadow-lg shadow-primary/50" />
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{title}</h1>
      <p className="text-lg text-muted-foreground font-medium">{subtitle}</p>
    </div>

  );
}
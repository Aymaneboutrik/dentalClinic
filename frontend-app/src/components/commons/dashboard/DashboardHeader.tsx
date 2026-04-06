type DashboardHeaderProps = {
  title: string;
  subtitle: string;
};

export function DashboardHeader({
  title,
  subtitle,
}: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}
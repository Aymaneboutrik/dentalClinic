import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type DashboardHeaderProps = {
  title: string;
  subtitle: string;
  backPath?: string;
};

export function DashboardHeader({
  title,
  subtitle,
  backPath,
}: DashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-10 space-y-2">
      <div className="flex items-center space-x-4 mb-4">
        {backPath && (
          <button 
            onClick={() => navigate(backPath)}
            className="w-12 h-12 organic-pill bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all active:scale-95 group shadow-xl"
            title="Retour"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
        )}
        <div className="h-1 w-20 bg-primary rounded-full shadow-lg shadow-primary/50" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{title}</h1>
      <p className="text-lg text-muted-foreground font-medium">{subtitle}</p>
    </div>
  );
}
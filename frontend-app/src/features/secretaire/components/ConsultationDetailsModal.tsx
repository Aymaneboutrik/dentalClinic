import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { FileText, Activity, CreditCard, User } from "lucide-react";

interface ConsultationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: any;
}

export function ConsultationDetailsModal({
  isOpen,
  onClose,
  consultation,
}: ConsultationDetailsModalProps) {
  if (!consultation) return null;

  const totalActes = consultation.actes?.reduce((sum: number, acte: any) => sum + (acte.prix || 0), 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] glass border-white/5 shadow-2xl organic-card-reverse max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Suivi Médical</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">Consultation du {consultation.dateConsultation}</p>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Section: Motif */}
          <div className="space-y-3">
            <h4 className="flex items-center text-sm font-bold uppercase tracking-widest text-primary">
              <Activity className="w-4 h-4 mr-2" />
              Motif & Diagnostic
            </h4>
            <div className="p-6 organic-card bg-white/5 border border-white/5 font-medium shadow-inner">
              {consultation.motif}
            </div>
          </div>

          {/* Section: Actes & Soins */}
          <div className="space-y-3">
            <h4 className="flex items-center text-sm font-bold uppercase tracking-widest text-primary">
              <CreditCard className="w-4 h-4 mr-2" />
              Soins Effectués & Honoraires
            </h4>
            {consultation.actes && consultation.actes.length > 0 ? (
              <div className="space-y-2">
                <div className="space-y-2">
                  {consultation.actes.map((acte: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-4 organic-pill bg-white/5 border border-white/5 text-sm shadow-sm">
                      <span className="font-medium">{acte.description}</span>
                      <span className="font-mono font-bold text-primary">{acte.prix?.toLocaleString()} DH</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center p-6 organic-card bg-primary/10 border border-primary/20 mt-4 shadow-lg shadow-primary/5">
                  <span className="font-black text-[10px] uppercase tracking-widest text-primary/60">Total Honoraires</span>
                  <span className="text-2xl font-black text-primary">{totalActes.toLocaleString()} <span className="text-sm font-bold">DH</span></span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic p-4 bg-white/5 rounded-2xl border border-white/5">
                Aucun acte facturé pour cette séance.
              </p>
            )}
          </div>

          {/* Section: Observations */}
          <div className="space-y-3">
            <h4 className="flex items-center text-sm font-bold uppercase tracking-widest text-primary">
              <FileText className="w-4 h-4 mr-2" />
              Historique de suivi (Notes)
            </h4>
            <div className="space-y-3">
              {consultation.observations && consultation.observations.length > 0 ? (
                consultation.observations.map((obs: any, i: number) => (
                  <div key={i} className="p-5 organic-card bg-white/5 border border-white/5 italic text-sm text-muted-foreground relative shadow-sm">
                    <span className="absolute -top-2 left-6 px-3 py-0.5 bg-background text-[9px] font-black uppercase tracking-widest text-primary border border-primary/10 organic-pill shadow-sm">
                      Note {i + 1}
                    </span>
                    "{obs.contenu}"
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic p-4 bg-white/5 rounded-2xl border border-white/5">
                  Aucune note clinique pour cette séance.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

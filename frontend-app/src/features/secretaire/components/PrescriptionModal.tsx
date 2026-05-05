import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import { Input } from "@components/ui/input";
import { Trash2, Plus, Printer, Save, Loader2 } from "lucide-react";
import { patientService } from "@apis/services/patient";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface PrescriptionLine {
  id?: number;
  medicament: string;
  dosage: string;
  duree: string;
  instructions: string;
}

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  consultationId: number | null;
}

export function PrescriptionModal({
  isOpen,
  onClose,
  onSuccess,
  consultationId,
}: PrescriptionModalProps) {
  const { t } = useTranslation();
  const [lignes, setLignes] = useState<PrescriptionLine[]>([
    { medicament: "", dosage: "", duree: "", instructions: "" },
  ]);
  const [ordonnanceId, setOrdonnanceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  useEffect(() => {
    if (isOpen && consultationId) {
      fetchExistingOrdonnance();
    } else if (!isOpen) {
      setLignes([{ medicament: "", dosage: "", duree: "", instructions: "" }]);
      setOrdonnanceId(null);
    }
  }, [isOpen, consultationId]);

  const fetchExistingOrdonnance = async () => {
    if (!consultationId) return;
    setInitialLoading(true);
    try {
      const data = await patientService.getOrdonnanceByConsultation(consultationId);
      if (data && data.lignes) {
        setLignes(data.lignes);
        setOrdonnanceId(data.id);
      }
    } catch (error) {
      // 404 is expected if no ordonnance exists
      setLignes([{ medicament: "", dosage: "", duree: "", instructions: "" }]);
      setOrdonnanceId(null);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAddLine = () => {
    setLignes([...lignes, { medicament: "", dosage: "", duree: "", instructions: "" }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lignes.length > 1) {
      setLignes(lignes.filter((_, i) => i !== index));
    }
  };

  const handleInputChange = (index: number, field: keyof PrescriptionLine, value: string) => {
    const newLignes = [...lignes];
    (newLignes[index] as any)[field] = value;
    setLignes(newLignes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultationId) return;

    if (lignes.some(l => !l.medicament || !l.dosage)) {
        toast.error(t("prescriptions.requiredFieldsError"));
        return;
    }

    setLoading(true);
    try {
      if (ordonnanceId) {
        await patientService.updateOrdonnance(ordonnanceId, lignes);
        toast.success(t("prescriptions.saveSuccess"));
      } else {
        await patientService.createOrdonnance(consultationId, lignes);
        toast.success(t("prescriptions.createSuccess"));
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(t("prescriptions.saveError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!ordonnanceId) return;
    if (window.confirm(t("prescriptions.deleteConfirm"))) {
      setLoading(true);
      try {
        await patientService.deleteOrdonnance(ordonnanceId);
        toast.success(t("prescriptions.deleteSuccess"));
        onSuccess();
        onClose();
      } catch (error) {
        toast.error(t("prescriptions.deleteError"));
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>${t("prescriptions.printTitle")}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 40px; }
            .header h1 { color: #3b82f6; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
            .info { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .date { font-weight: bold; }
            .content { min-height: 400px; }
            .line { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
            .med { font-weight: bold; font-size: 1.1em; color: #1e40af; }
            .details { color: #666; font-size: 0.9em; margin-top: 5px; }
            .footer { border-top: 2px solid #eee; padding-top: 20px; margin-top: 40px; text-align: right; font-style: italic; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${t("prescriptions.printCabinet")}</h1>
            <p>${t("prescriptions.printTitle")}</p>
          </div>
          <div class="info">
            <div>Patient: _______________________</div>
            <div class="date">Date: ${new Date().toLocaleDateString('fr-FR')}</div>
          </div>
          <div class="content">
            ${lignes.map(l => `
              <div class="line">
                <div class="med">${l.medicament} - ${l.dosage}</div>
                <div class="details">${t("prescriptions.duration")}: ${l.duree || '-'} | ${t("prescriptions.instructions")}: ${l.instructions || '-'}</div>
              </div>
            `).join('')}
          </div>
          <div class="footer">
            ${t("prescriptions.printSignature")}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] glass border-white/5 shadow-2xl organic-card-reverse max-h-[90vh] flex flex-col bg-background/95 backdrop-blur-xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-2xl font-black">
            {ordonnanceId ? t("prescriptions.editTitle") : t("prescriptions.newTitle")}
          </DialogTitle>
          <div className="flex items-center space-x-2 pr-6">
            {ordonnanceId && (
              <>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrint}
                  className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {t("common.print")}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("common.delete")}
                </Button>
              </>
            )}
          </div>
        </DialogHeader>

        {initialLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <form id="prescription-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-6 pr-2 custom-scrollbar">
            <div className="space-y-4">
              {lignes.map((ligne, index) => (
                <div key={index} className="p-6 bg-white/5 border border-white/5 organic-card space-y-4 relative group shadow-sm">
                  {lignes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(index)}
                      className="absolute top-4 right-4 p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("prescriptions.medication")}</Label>
                      <Input
                        value={ligne.medicament}
                        onChange={(e) => handleInputChange(index, "medicament", e.target.value)}
                        placeholder={t("prescriptions.medicationPlaceholder")}
                        className="bg-white/5 border-white/10 organic-pill h-10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("prescriptions.dosage")}</Label>
                      <Input
                        value={ligne.dosage}
                        onChange={(e) => handleInputChange(index, "dosage", e.target.value)}
                        placeholder={t("prescriptions.dosagePlaceholder")}
                        className="bg-white/5 border-white/10 organic-pill h-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("prescriptions.duration")}</Label>
                      <Input
                        value={ligne.duree}
                        onChange={(e) => handleInputChange(index, "duree", e.target.value)}
                        placeholder={t("prescriptions.durationPlaceholder")}
                        className="bg-white/5 border-white/10 organic-pill h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("prescriptions.instructions")}</Label>
                      <Input
                        value={ligne.instructions}
                        onChange={(e) => handleInputChange(index, "instructions", e.target.value)}
                        placeholder={t("prescriptions.instructionsPlaceholder")}
                        className="bg-white/5 border-white/10 organic-pill h-10"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddLine}
              className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-white/10 organic-card text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-[10px] font-black uppercase tracking-widest shadow-inner"
            >
              <Plus className="w-4 h-4" />
              <span>{t("prescriptions.addLine")}</span>
            </button>
          </form>
        )}

          <DialogFooter className="pt-6 border-t border-white/5">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold">
              {t("common.cancel")}
            </Button>
            <Button 
              form="prescription-form"
              type="submit" 
              disabled={loading || initialLoading}
              className="organic-button px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 bg-primary text-primary-foreground"
            >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {ordonnanceId ? t("prescriptions.editTitle") : t("prescriptions.newTitle")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

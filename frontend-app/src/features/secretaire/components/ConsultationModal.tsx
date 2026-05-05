import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea"; // Assuming this exists or using a regular textarea
import { Input } from "@components/ui/input";
import { patientService } from "@apis/services/patient";
import { toast } from "sonner";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patientId: number;
}

export function ConsultationModal({
  isOpen,
  onClose,
  onSuccess,
  patientId,
}: ConsultationModalProps) {
  const [formData, setFormData] = useState({
    motif: "",
    observation: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.motif) {
        toast.error("Le motif est obligatoire");
        return;
    }

    setLoading(true);
    try {
      await patientService.addConsultation(patientId, formData);
      toast.success("Consultation enregistrée");
      onSuccess();
      onClose();
      setFormData({ motif: "", observation: "" });
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glass border-white/5 shadow-2xl organic-card bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Nouvelle Consultation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="motif" className="font-bold">Motif de consultation</Label>
            <Input
              id="motif"
              value={formData.motif}
              onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
              placeholder="Ex: Douleur dentaire, Détartrage..."
              className="bg-white/5 border-white/10 organic-pill h-12 px-6"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation" className="font-bold">Observations Médicales</Label>
            <textarea
              id="observation"
              rows={5}
              value={formData.observation}
              onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              placeholder="Détails cliniques, diagnostic, notes..."
              className="w-full bg-white/5 border border-white/10 organic-card p-6 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
            />
          </div>

          <DialogFooter className="mt-8">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold">
              Annuler
            </Button>
            <Button type="submit" loading={loading} className="organic-button px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 bg-primary text-primary-foreground">
              Enregistrer la consultation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

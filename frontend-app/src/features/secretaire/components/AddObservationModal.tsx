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
import { Textarea } from "@components/ui/textarea";
import { patientService } from "@apis/services/patient";
import { toast } from "sonner";
import useAuthStore from "@stores/auth-store";

interface AddObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  consultationId: number | null;
}

export function AddObservationModal({
  isOpen,
  onClose,
  onSuccess,
  consultationId,
}: AddObservationModalProps) {
  const { user } = useAuthStore();
  const [contenu, setContenu] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultationId) return;

    if (!contenu.trim()) {
      toast.error("Veuillez saisir une note");
      return;
    }

    setLoading(true);
    try {
      if (user?.role === "Assistant" || user?.role === "Assistante") {
        await patientService.addAssistantObservation(consultationId, contenu);
      } else {
        await patientService.addObservation(consultationId, contenu);
      }
      toast.success("Note de suivi ajoutée avec succès");
      onSuccess();
      onClose();
      setContenu("");
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la note");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { if (!loading) onClose(); }}>
      <DialogContent className="sm:max-w-[450px] glass border-white/10 shadow-2xl rounded-[1.5rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">
            {user?.role === "Assistant" || user?.role === "Assistante" ? "Ajouter une note de suivi (Assistant)" : "Ajouter une note de suivi"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="contenu" className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
              Description / Observation
            </Label>
            <Textarea
              id="contenu"
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              placeholder="Ex: Le patient a signalé une légère sensibilité..."
              className="bg-white/5 border-white/10 rounded-xl min-h-[120px] resize-none"
              required
            />
          </div>

          <DialogFooter className="mt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading} 
              className="rounded-xl border-white/10 hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              loading={loading} 
              disabled={!contenu.trim() || loading} 
              className="rounded-xl shadow-lg shadow-primary/20 bg-primary text-primary-foreground"
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

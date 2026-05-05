import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Patient, patientService } from "@apis/services/patient";
import { toast } from "sonner";
import useAuthStore from "@stores/auth-store";

interface PatientActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patient?: Patient | null; // If null, we are in "Create" mode
  mode: "view" | "edit" | "create";
}

export function PatientActionModal({
  isOpen,
  onClose,
  onSuccess,
  patient,
  mode,
}: PatientActionModalProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<Partial<Patient>>({
    nom: "",
    prenom: "",
    cin: "",
    email: "",
    telephone: "",
    dateNaissance: "",
    sexe: "M",
    profession: "",
  });
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (patient) {
      setFormData(patient);
    } else {
      setFormData({
        nom: "",
        prenom: "",
        cin: "",
        email: "",
        telephone: "",
        dateNaissance: "",
        sexe: "M",
        profession: "",
      });
    }
    setErrors({});
  }, [patient, isOpen]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    // Format marocain: 10 chiffres commençant par 05, 06 ou 07
    const re = /^(05|06|07)\d{8}$/;
    return re.test(phone);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "view") return;

    const newErrors: Record<string, string> = {};

    // Mandatory fields check
    if (!formData.nom) newErrors.nom = "Le nom est obligatoire";
    if (!formData.prenom) newErrors.prenom = "Le prénom est obligatoire";
    if (!formData.cin) newErrors.cin = "Le CIN est obligatoire";
    if (!formData.dateNaissance) newErrors.dateNaissance = "La date de naissance est obligatoire";
    if (!formData.telephone) {
      newErrors.telephone = "Le numéro de téléphone est obligatoire";
    } else if (formData.telephone.length !== 10) {
      newErrors.telephone = `Le numéro doit avoir exactement 10 chiffres (actuellement : ${formData.telephone.length})`;
    } else if (!validatePhone(formData.telephone)) {
      newErrors.telephone = "Le numéro doit commencer par 05, 06 ou 07";
    }

    if (!formData.email) {
      newErrors.email = "L'adresse email est obligatoire";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.profession) newErrors.profession = "La profession est obligatoire";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setLoading(true);
    try {
      if (mode === "create") {
        if (user?.role === "Secretaire") {
          await patientService.secretaryAddPatient(formData as Patient);
        } else {
          await patientService.addPatient(formData as Patient);
        }
        toast.success("Patient ajouté avec succès");
      } else if (mode === "edit" && patient?.id) {
        if (user?.role === "Secretaire") {
          await patientService.secretaryUpdatePatient(patient.id, formData as Patient);
        } else {
          await patientService.updatePatient(patient.id, formData as Patient);
        }
        toast.success("Informations du patient mises à jour");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de l'enregistrement";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isViewOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] glass border-white/5 shadow-2xl organic-card-reverse bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">
            {mode === "create" ? "Nouveau Patient" : mode === "edit" ? "Modifier Patient" : "Détails du Patient"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom" className="font-bold">Nom</Label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom || ""}
                onChange={handleChange}
                disabled={isViewOnly}
                placeholder="Ex: Alami"
                className={`bg-white/5 border-white/10 organic-pill ${errors.nom ? "border-red-500" : ""}`}
              />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom" className="font-bold">Prénom</Label>
              <Input
                id="prenom"
                name="prenom"
                value={formData.prenom || ""}
                onChange={handleChange}
                disabled={isViewOnly}
                placeholder="Ex: Ahmed"
                className={`bg-white/5 border-white/10 organic-pill ${errors.prenom ? "border-red-500" : ""}`}
              />
              {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cin" className="font-bold">CIN</Label>
              <Input
                id="cin"
                name="cin"
                value={formData.cin || ""}
                onChange={handleChange}
                disabled={isViewOnly}
                placeholder="Ex: AB12345"
                className={`bg-white/5 border-white/10 organic-pill ${errors.cin ? "border-red-500" : ""}`}
              />
              {errors.cin && <p className="text-red-500 text-xs mt-1">{errors.cin}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateNaissance" className="font-bold">Date de Naissance</Label>
              <Input
                id="dateNaissance"
                name="dateNaissance"
                type="date"
                value={formData.dateNaissance ? String(formData.dateNaissance).split("T")[0] : ""}
                onChange={handleChange}
                disabled={isViewOnly}
                className={`bg-white/5 border-white/10 organic-pill ${errors.dateNaissance ? "border-red-500" : ""}`}
              />
              {errors.dateNaissance && <p className="text-red-500 text-xs mt-1">{errors.dateNaissance}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telephone" className="font-bold">Téléphone</Label>
              <Input
                id="telephone"
                name="telephone"
                value={formData.telephone || ""}
                onChange={handleChange}
                disabled={isViewOnly}
                placeholder="06..."
                className={`bg-white/5 border-white/10 organic-pill ${errors.telephone ? "border-red-500" : ""}`}
              />
              {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                disabled={isViewOnly}
                placeholder="email@exemple.com"
                className={`bg-white/5 border-white/10 organic-pill ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sexe" className="font-bold">Sexe</Label>
              <Select
                disabled={isViewOnly}
                onValueChange={(val) => handleSelectChange("sexe", val)}
                value={formData.sexe || "M"}
              >
                <SelectTrigger className={`bg-white/5 border-white/10 organic-pill ${errors.sexe ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Sexe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculin</SelectItem>
                  <SelectItem value="F">Féminin</SelectItem>
                </SelectContent>
              </Select>
              {errors.sexe && <p className="text-red-500 text-xs mt-1">{errors.sexe}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession" className="font-bold">Profession</Label>
              <Input
                id="profession"
                name="profession"
                value={formData.profession || ""}
                onChange={handleChange}
                disabled={isViewOnly}
                placeholder="Ex: Professeur"
                className={`bg-white/5 border-white/10 organic-pill ${errors.profession ? "border-red-500" : ""}`}
              />
              {errors.profession && <p className="text-red-500 text-xs mt-1">{errors.profession}</p>}
            </div>
          </div>

          {!isViewOnly && (
            <DialogFooter className="mt-8">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold">
                Annuler
              </Button>
              <Button type="submit" loading={loading} className="organic-button px-10 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                {mode === "create" ? "Créer" : "Sauvegarder"}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

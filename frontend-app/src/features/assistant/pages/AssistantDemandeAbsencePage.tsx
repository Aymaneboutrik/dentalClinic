import { useEffect, useState } from "react";
import { DashboardHeader } from "../../../components/commons/dashboard/DashboardHeader";
import { Plus, Clock, FileText, Send, X, Calendar } from "lucide-react";
import type {
  DemandeAbsence,
  CreateDemandeAbsenceRequest,
} from "../../../types/demandeAbsence/demandeAbsence";
import {
  createDemandeAbsence,
  getDemandesAbsenceByEmployeId,
  type ApiError,
} from "../services/demandeAbsence.service";
import { toast } from "sonner";

type FormDataType = {
  dateDebut: string;
  dateFin: string;
  typeDemande: string;
  motif: string;
};

type FormFieldErrors = {
  dateDebut?: string;
  dateFin?: string;
  typeDemande?: string;
  motif?: string;
};

const formatDate = (dateValue?: string | null): string => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fr-FR");
};

const getStatutBadgeClass = (statut?: string | null): string => {
  const normalizedStatut = String(statut || "").toLowerCase();
  if (
    normalizedStatut.includes("accept") ||
    normalizedStatut.includes("approuv")
  ) {
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  }
  if (normalizedStatut.includes("refus")) {
    return "bg-red-500/10 text-red-500 border-red-500/20";
  }
  return "bg-amber-500/10 text-amber-500 border-amber-500/20";
};

const AssistantDemandeAbsencePage = () => {
  const initialFormData: FormDataType = {
    dateDebut: "",
    dateFin: "",
    typeDemande: "",
    motif: "",
  };

  const [demandes, setDemandes] = useState<DemandeAbsence[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<FormDataType>(initialFormData);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDemandesAbsenceByEmployeId();
      setDemandes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      setError(apiError.message || "Impossible de charger les demandes d'absence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const resetFormState = () => {
    setFormData(initialFormData);
    setFieldErrors({});
  };

  const handleOpenAddForm = () => {
    resetFormState();
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    resetFormState();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): FormFieldErrors => {
    const errors: FormFieldErrors = {};
    if (!formData.dateDebut.trim()) errors.dateDebut = "La date de début est obligatoire.";
    if (!formData.dateFin.trim()) errors.dateFin = "La date de fin est obligatoire.";
    if (formData.dateDebut && formData.dateFin && formData.dateDebut > formData.dateFin) {
      errors.dateFin = "La date de fin doit être supérieure ou égale à la date de début.";
    }
    if (!formData.typeDemande.trim()) errors.typeDemande = "Le type de demande est obligatoire.";
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setFieldErrors({});
      const frontendErrors = validateForm();
      if (Object.keys(frontendErrors).length > 0) {
        setFieldErrors(frontendErrors);
        toast.error("Veuillez corriger les erreurs dans le formulaire.");
        return;
      }

      const payload: CreateDemandeAbsenceRequest = {
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        typeDemande: formData.typeDemande,
        motif: formData.motif.trim() || null,
      };

      await createDemandeAbsence(payload);
      await fetchDemandes();
      toast.success("Demande d'absence envoyée avec succès.");
      setShowAddForm(false);
      resetFormState();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Erreur lors de l'envoi de la demande.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <DashboardHeader
          title="Demandes d'Absence"
          subtitle="Gérez et suivez vos demandes de congés et d'absences"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <button 
            onClick={handleOpenAddForm}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 organic-pill font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Demande</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="glass border-white/5 p-8 organic-card shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Nouvelle Demande d'Absence</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Remplissez les détails de votre demande ci-dessous</p>
            </div>
            <button onClick={handleCancel} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Date début</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="date"
                    name="dateDebut"
                    value={formData.dateDebut}
                    onChange={handleChange}
                    className={`w-full bg-white/5 border px-12 py-4 rounded-2xl outline-none transition-all focus:bg-white/10 ${fieldErrors.dateDebut ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-primary/50'}`}
                  />
                </div>
                {fieldErrors.dateDebut && <p className="text-[10px] font-bold text-red-500 px-1">{fieldErrors.dateDebut}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Date fin</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="date"
                    name="dateFin"
                    value={formData.dateFin}
                    onChange={handleChange}
                    className={`w-full bg-white/5 border px-12 py-4 rounded-2xl outline-none transition-all focus:bg-white/10 ${fieldErrors.dateFin ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-primary/50'}`}
                  />
                </div>
                {fieldErrors.dateFin && <p className="text-[10px] font-bold text-red-500 px-1">{fieldErrors.dateFin}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Type de demande</label>
                <input
                  type="text"
                  name="typeDemande"
                  value={formData.typeDemande}
                  onChange={handleChange}
                  placeholder="Ex : Congé annuel, Maladie, etc."
                  className={`w-full bg-white/5 border px-6 py-4 rounded-2xl outline-none transition-all focus:bg-white/10 ${fieldErrors.typeDemande ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-primary/50'}`}
                />
                {fieldErrors.typeDemande && <p className="text-[10px] font-bold text-red-500 px-1">{fieldErrors.typeDemande}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Motif</label>
                <textarea
                  name="motif"
                  value={formData.motif}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Précisez le motif de votre absence..."
                  className="w-full bg-white/5 border border-white/5 px-6 py-4 rounded-2xl outline-none transition-all focus:bg-white/10 focus:border-primary/50 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={actionLoading}
                className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 organic-pill font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Envoyer la demande</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass border-white/5 shadow-2xl organic-card">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <h3 className="text-lg font-bold flex items-center space-x-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>Historique des Demandes</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Type</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Période</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Créée le</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Statut</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Motif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8 bg-white/5" />
                  </tr>
                ))
              ) : demandes.length > 0 ? (
                demandes.map((demande) => (
                  <tr key={demande.idDemande} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {demande.typeDemande?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">{demande.typeDemande}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">du {formatDate(demande.dateDebut)}</span>
                        <span className="text-sm font-medium text-muted-foreground">au {formatDate(demande.dateFin)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium">{formatDate(demande.dateCreation)}</td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatutBadgeClass(demande.statut)}`}>
                        {demande.statut}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]" title={demande.motif || ""}>
                        {demande.motif || "---"}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/30">
                        <FileText className="w-8 h-8" />
                      </div>
                      <p className="text-muted-foreground font-medium">Aucune demande trouvée</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssistantDemandeAbsencePage;
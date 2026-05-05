import { useEffect, useState } from "react";
import {
  getRendezVous,
  createRendezVous,
  updateRendezVous,
  cancelRendezVous,
  type ApiError,
} from "@apis/services/rendezvous";
import { getEmployees } from "../../doctor/services/personnel.service";
import { patientService, type Patient } from "@apis/services/patient";
import type { RendezVous } from "../../../types/rendezvous/rendezvous";
import type { Employee } from "../../../types/employee/employee";
import useAuthStore from "@stores/auth-store";
import { DashboardHeader } from "@components/commons/dashboard/DashboardHeader";
import { CalendarDays, Plus, Search, X, Edit3, Trash2, User, Stethoscope, Clock, AlertCircle, CheckCircle2, History, Info, Filter } from "lucide-react";
import { toast } from "sonner";

type FormDataType = {
  patientId: number;
  dentisteId: number;
  date: string;
  heureDebut: string;
  motif: string;
  heureFinPrevue: string;
  estUrgent: boolean;
};

type FormFieldErrors = {
  patientId?: string;
  dentisteId?: string;
  date?: string;
  heureDebut?: string;
  motif?: string;
  heureFinPrevue?: string;
};

const RendezVousPage = () => {
  const { user } = useAuthStore();
  const initialFormData: FormDataType = {
    patientId: 0,
    dentisteId: 0,
    date: "",
    heureDebut: "",
    motif: "",
    heureFinPrevue: "",
    estUrgent: false,
  };

  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormDataType>(initialFormData);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getRendezVous();
      const validAppointments = data.filter((app: RendezVous) => app.statutId !== 3);
      setAppointments(validAppointments.sort((a: RendezVous, b: RendezVous) => {
        const dateA = new Date(`${a.date}T${a.heureDebut}`);
        const dateB = new Date(`${b.date}T${b.heureDebut}`);
        return dateA.getTime() - dateB.getTime();
      }));
    } catch (err) {
      toast.error("Impossible de charger les rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        patientService.secretaryListPatients(),
        getEmployees(),
      ]);

      if (results[0].status === "fulfilled") {
        setPatients(results[0].value);
      }
      if (results[1].status === "fulfilled") {
        const employees = results[1].value;
        setDentists(
          employees.filter(
            (e: any) =>
              e.nomRole?.toLowerCase() === "docteur" ||
              e.nomRole?.toLowerCase() === "dentiste"
          )
        );
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données auxiliaires", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchData();
  }, []);

  const resetFormState = () => {
    setFormData(initialFormData);
    setFieldErrors({});
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: (name === "patientId" || name === "dentisteId") ? Number(val) : val,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validateForm = (): FormFieldErrors => {
    const errors: FormFieldErrors = {};

    if (formData.patientId === 0) errors.patientId = "Veuillez sélectionner un patient.";
    if (formData.dentisteId === 0) errors.dentisteId = "Veuillez sélectionner un dentiste.";
    if (!formData.date) errors.date = "La date est obligatoire.";
    if (!formData.heureDebut) errors.heureDebut = "L'heure de début est obligatoire.";
    if (!formData.heureFinPrevue) errors.heureFinPrevue = "L'heure de fin prévue est obligatoire.";
    if (!formData.motif.trim()) errors.motif = "Le motif est obligatoire.";

    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = "La date ne peut pas être dans le passé.";
      }
    }

    if (formData.heureDebut && formData.heureFinPrevue) {
      if (formData.heureDebut >= formData.heureFinPrevue) {
        errors.heureDebut = "L'heure de début doit être inférieure à l'heure de fin.";
        errors.heureFinPrevue = "L'heure de fin doit être après l'heure de début.";
      }
    }

    return errors;
  };

  const handleOpenAddForm = () => {
    resetFormState();
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (appointment: RendezVous) => {
    setFormData({
      patientId: appointment.patientId,
      dentisteId: appointment.dentisteId,
      date: appointment.date,
      heureDebut: appointment.heureDebut,
      motif: appointment.motif,
      heureFinPrevue: appointment.heureFinPrevue,
      estUrgent: appointment.estUrgent || false,
    });
    setEditingId(appointment.id);
    setIsEditMode(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;

    try {
      setActionLoading(true);
      await cancelRendezVous(id, user?.nom || "Secrétaire");
      toast.success("Rendez-vous annulé avec succès.");
      fetchAppointments();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || "Erreur lors de l'annulation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Veuillez corriger les erreurs dans le formulaire.");
      return;
    }

    try {
      setActionLoading(true);
      if (isEditMode && editingId) {
        await updateRendezVous(editingId, formData);
        toast.success("Rendez-vous mis à jour.");
      } else {
        await createRendezVous(formData);
        toast.success("Rendez-vous planifié avec succès.");
      }
      setShowForm(false);
      resetFormState();
      fetchAppointments();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || "Erreur lors de l'enregistrement.");
    } finally {
      setActionLoading(false);
    }
  };

  const getPatientName = (id: number) => {
    const p = patients.find((p) => p.id === id);
    return p ? `${p.nom} ${p.prenom}` : `Patient #${id}`;
  };

  const getDentistName = (id: number) => {
    const d = dentists.find((d) => d.idEmploye === id);
    return d ? `Dr. ${d.nom} ${d.prenom}` : `Dentiste #${id}`;
  };

  const getStatusLabel = (id: number) => {
    const statuses: Record<number, { label: string; color: string }> = {
      1: { label: "Planifié", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
      3: { label: "Annulé", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
      4: { label: "Effectué", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
      5: { label: "Absent", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
      6: { label: "Reporté", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    };
    return statuses[id] || { label: "Inconnu", color: "bg-white/5 text-muted-foreground border-white/5" };
  };

  const filteredAppointments = appointments.filter(app => 
    getPatientName(app.patientId).toLowerCase().includes(search.toLowerCase()) ||
    getDentistName(app.dentisteId).toLowerCase().includes(search.toLowerCase()) ||
    app.motif.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <DashboardHeader
          title="Agenda du Cabinet"
          subtitle="Planifiez et suivez les rendez-vous des patients"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <button 
            onClick={handleOpenAddForm}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 organic-pill font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Rendez-vous</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass border-white/5 p-8 organic-card shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-inner">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isEditMode ? "Modification du Rendez-vous" : "Nouvelle Planification"}
              </h2>
              <p className="text-sm text-muted-foreground">Définissez le patient, le praticien et le créneau horaire</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Patient concerné</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 pl-12 pr-6 text-sm outline-none focus:border-primary/50 transition-all text-foreground appearance-none"
                  >
                    <option value={0} className="bg-slate-900">Choisir un patient...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900">
                        {p.nom} {p.prenom} ({p.cin})
                      </option>
                    ))}
                  </select>
                </div>
                {fieldErrors.patientId && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-widest">{fieldErrors.patientId}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Praticien (Dentiste)</label>
                <div className="relative">
                  <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <select
                    name="dentisteId"
                    value={formData.dentisteId}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 pl-12 pr-6 text-sm outline-none focus:border-primary/50 transition-all text-foreground appearance-none"
                  >
                    <option value={0} className="bg-slate-900">Choisir un dentiste...</option>
                    {dentists.map((d) => (
                      <option key={d.idEmploye} value={d.idEmploye} className="bg-slate-900">
                        Dr. {d.nom} {d.prenom}
                      </option>
                    ))}
                  </select>
                </div>
                {fieldErrors.dentisteId && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-widest">{fieldErrors.dentisteId}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1 text-center block">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 px-6 text-sm outline-none focus:border-primary/50 transition-all text-foreground"
                />
                {fieldErrors.date && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-widest text-center">{fieldErrors.date}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1 text-center block">Heure Début</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <input
                    type="time"
                    name="heureDebut"
                    value={formData.heureDebut}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 pl-12 pr-6 text-sm outline-none focus:border-primary/50 transition-all text-foreground"
                  />
                </div>
                {fieldErrors.heureDebut && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-widest text-center">{fieldErrors.heureDebut}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1 text-center block">Heure Fin Estimée</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <input
                    type="time"
                    name="heureFinPrevue"
                    value={formData.heureFinPrevue}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 pl-12 pr-6 text-sm outline-none focus:border-primary/50 transition-all text-foreground"
                  />
                </div>
                {fieldErrors.heureFinPrevue && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-widest text-center">{fieldErrors.heureFinPrevue}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Motif de la consultation</label>
              <textarea
                name="motif"
                value={formData.motif}
                onChange={handleChange}
                placeholder="Décrivez brièvement le motif (ex: Détartrage, Urgence douleur...)"
                className="w-full bg-white/5 border border-white/5 rounded-[32px] p-6 text-sm outline-none focus:border-primary/50 transition-all text-foreground h-32 resize-none"
              />
              {fieldErrors.motif && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-widest">{fieldErrors.motif}</p>}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-white/5">
              <label className="flex items-center space-x-4 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="estUrgent"
                    checked={formData.estUrgent}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${formData.estUrgent ? 'bg-rose-500' : 'bg-white/10 group-hover:bg-white/20'}`} />
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.estUrgent ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <span className={`text-xs font-black uppercase tracking-widest transition-colors ${formData.estUrgent ? 'text-rose-500' : 'text-muted-foreground'}`}>
                  Marquer comme URGENCE
                </span>
              </label>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-8 py-3 rounded-xl border border-white/5 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 organic-pill text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? "Enregistrement..." : isEditMode ? "Mettre à jour" : "Confirmer le RDV"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="glass border-white/5 shadow-2xl organic-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-white">Registre des Rendez-vous</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">{appointments.length} RÉSERVATIONS</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                className="bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all w-64"
                placeholder="Rechercher un RDV..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="p-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-muted-foreground transition-all">
               <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Patient & Motif</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Praticien</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date & Heure</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-muted-foreground font-medium animate-pulse">Chargement de l'agenda...</td></tr>
              ) : filteredAppointments.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-muted-foreground text-sm italic">Aucun rendez-vous trouvé dans les registres.</td></tr>
              ) : (
                filteredAppointments.map((app) => {
                  const status = getStatusLabel(app.statutId);
                  return (
                    <tr key={app.id} className="hover:bg-white/5 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                           <div className="flex items-center space-x-2">
                             <span className="font-bold text-foreground">{getPatientName(app.patientId)}</span>
                             {app.estUrgent && (
                               <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">Urgent</span>
                             )}
                           </div>
                           <span className="text-xs text-muted-foreground italic truncate max-w-[200px]">"{app.motif}"</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-primary/80">{getDentistName(app.dentisteId)}</td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-foreground">{app.date}</span>
                           <div className="flex items-center space-x-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                              <Clock className="w-3 h-3" />
                              <span>{app.heureDebut} - {app.heureFinPrevue}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(app)}
                            className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {app.statutId !== 3 && (
                            <button
                              onClick={() => handleCancel(app.id)}
                              className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                              title="Annuler"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RendezVousPage;

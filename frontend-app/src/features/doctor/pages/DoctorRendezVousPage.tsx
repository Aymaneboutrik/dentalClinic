import { useEffect, useState, useMemo } from "react";
import {
  getRendezVous,
  cancelRendezVous,
  markAsAbsent,
  markAsCompleted,
  rescheduleRendezVous,
  type ApiError,
} from "@apis/services/rendezvous";
import { getEmployees } from "../services/personnel.service";
import { patientService, type Patient } from "@apis/services/patient";
import type { RendezVous, RescheduleRendezVousRequest } from "../../../types/rendezvous/rendezvous";
import type { Employee } from "../../../types/employee/employee";
import useAuthStore from "@stores/auth-store";

const getStatusLabel = (id: number) => {
  const statuses: Record<number, { label: string; color: string }> = {
    1: { label: "Planifié", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    3: { label: "Annulé", color: "bg-red-500/15 text-red-400 border-red-500/30" },
    4: { label: "Effectué", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    5: { label: "Absent", color: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
    6: { label: "Reporté", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  };
  return statuses[id] || { label: "Inconnu", color: "bg-gray-500/15 text-gray-400 border-gray-500/30" };
};

const DoctorRendezVousPage = () => {
  const { user } = useAuthStore();
  
  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Employee[]>([]);
  const [currentDoctor, setCurrentDoctor] = useState<Employee | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reschedule Form State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<RescheduleRendezVousRequest>({
    date: "",
    heureDebut: "",
    heureFinPrevue: "",
    modifiePar: 1,
  });
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getRendezVous();
      console.log("Rendez-vous récupérés (Docteur):", data);
      setAppointments(data);
    } catch (err) {
      console.error("Erreur récupération rendez-vous:", err);
      setError("Impossible de charger les rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [patientsData, employeesData] = await Promise.all([
        patientService.secretaryListPatients(),
        getEmployees(),
      ]);
      setPatients(patientsData);
      const docs = employeesData.filter((e) => e.nomRole === "Docteur" || e.nomRole === "Dentiste");
      setDentists(docs);

      // Find current doctor by name match
      if (user) {
        const found = docs.find(
          (d) => d.nom.toLowerCase() === user.nom.toLowerCase() && d.prenom.toLowerCase() === user.prenom.toLowerCase()
        );
        if (found) setCurrentDoctor(found);
      }
    } catch (err) {
      console.error("Erreur data fetching", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchData();
  }, [user]);

  useEffect(() => {
    if (successMessage || error || rescheduleError) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
        setRescheduleError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, rescheduleError]);



  const handleCancel = async (id: number) => {
    if (!window.confirm("Annuler ce rendez-vous ?")) return;
    try {
      setActionLoading(true);
      // Utiliser l'ID de l'employé s'il est trouvé via le store auth
      const author = currentDoctor ? currentDoctor.idEmploye.toString() : (user?.nom || "Docteur");
      await cancelRendezVous(id, author);
      setSuccessMessage("Rendez-vous annulé.");
      fetchAppointments();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAbsent = async (id: number) => {
    try {
      setActionLoading(true);
      await markAsAbsent(id, currentDoctor?.idEmploye || 1);
      setSuccessMessage("Patient marqué comme absent.");
      fetchAppointments();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleted = async (id: number) => {
    try {
      setActionLoading(true);
      await markAsCompleted(id, currentDoctor?.idEmploye || 1);
      setSuccessMessage("Rendez-vous marqué comme effectué.");
      fetchAppointments();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReschedule = (app: RendezVous) => {
    setRescheduleId(app.id);
    setRescheduleError(null);
    setRescheduleData({
      date: app.date,
      heureDebut: app.heureDebut,
      heureFinPrevue: app.heureFinPrevue,
      modifiePar: currentDoctor?.idEmploye || 1,
    });
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleId) return;

    setRescheduleError(null);

    // Validation frontend
    const selectedDate = new Date(rescheduleData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setRescheduleError("La date ne peut pas être dans le passé.");
      return;
    }

    if (rescheduleData.heureDebut && rescheduleData.heureFinPrevue) {
      if (rescheduleData.heureDebut >= rescheduleData.heureFinPrevue) {
        setRescheduleError("L'heure de début doit être inférieure à l'heure de fin.");
        return;
      }
    }

    try {
      setActionLoading(true);
      await rescheduleRendezVous(rescheduleId, rescheduleData);
      setSuccessMessage("Rendez-vous reporté.");
      setShowRescheduleModal(false);
      fetchAppointments();
    } catch (err: any) {
      const apiError = err.response?.data?.message || err.message || "Erreur lors du report.";
      setRescheduleError(apiError);
    } finally {
      setActionLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  // --- Helpers ---
  function getPatientName(id: number) {
    const p = patients.find((p) => p.id === id);
    return p ? `${p.nom} ${p.prenom}` : `Patient #${id}`;
  }

  function getPatientPhone(id: number) {
    const p = patients.find((p) => p.id === id);
    return p ? p.telephone : "N/A";
  }

  function getPatientEmail(id: number) {
    const p = patients.find((p) => p.id === id);
    return p ? p.email : "N/A";
  }

  // --- Variables Calculées ---
  const filteredAppointments = useMemo(() => {
    const filtered = appointments.filter((app) => {
      // RÈGLE MÉTIER : Ne pas afficher les rendez-vous annulés (statut 3)
      if (app.statutId === 3) return false;
      
      if (currentDoctor && app.dentisteId !== currentDoctor.idEmploye) return false;
      const patientName = getPatientName(app.patientId).toLowerCase();
      return patientName.includes(searchTerm.toLowerCase());
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.heureDebut}`);
      const dateB = new Date(`${b.date}T${b.heureDebut}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [appointments, currentDoctor, searchTerm, patients]);

  return (
    <div className="w-full space-y-8">
      <div className="p-8 border shadow-2xl organic-card bg-card/40 backdrop-blur-md border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">Module Docteur</p>
            <h1 className="text-3xl font-bold tracking-tight">Mes Rendez-vous</h1>
            {currentDoctor && <p className="text-sm text-muted-foreground">Connecté en tant que Dr. {currentDoctor.nom} {currentDoctor.prenom}</p>}
          </div>
        </div>
      </div>

      {(successMessage || error) && (
        <div className={`px-4 py-3 text-sm border rounded-2xl ${error ? "border-red-500/20 bg-red-500/10 text-red-400" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"}`}>
          {error || successMessage}
        </div>
      )}

      <div className="border shadow-2xl organic-card bg-card/40 backdrop-blur-md border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left border-b">
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold">Date & Heure</th>
                <th className="px-6 py-4 font-semibold">Motif</th>
                <th className="px-6 py-4 font-semibold">Statut</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Chargement...</td></tr>
              ) : filteredAppointments.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Aucun rendez-vous trouvé.</td></tr>
              ) : (
                filteredAppointments.map((app) => {
                  const status = getStatusLabel(app.statutId);
                  return (
                    <tr key={app.id} className="border-b border-white/10 hover:bg-white/5 transition">
                      <td className="px-6 py-5 font-semibold text-white">
                        {getPatientName(app.patientId)}
                        {app.estUrgent && <span className="ml-2 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">Urgent</span>}
                      </td>
                      <td className="px-6 py-5 text-slate-300">
                        {app.date} à {app.heureDebut}
                      </td>
                      <td className="px-6 py-5 text-slate-300 italic">"{app.motif}"</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2 flex-wrap">

                          {(app.statutId === 1 || app.statutId === 6) && (
                            <>
                              <button
                                onClick={() => handleCompleted(app.id)}
                                className="px-3 py-1.5 text-xs font-semibold text-blue-400 border border-blue-500/30 bg-blue-500/10 rounded-lg hover:bg-blue-500/20"
                              >
                                Effectué
                              </button>
                              <button
                                onClick={() => handleAbsent(app.id)}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-400 border border-slate-500/30 bg-slate-500/10 rounded-lg hover:bg-slate-500/20"
                              >
                                Absent
                              </button>
                            </>
                          )}
                          {app.statutId !== 3 && app.statutId !== 4 && (
                            <button
                              onClick={() => handleOpenReschedule(app)}
                              className="px-3 py-1.5 text-xs font-semibold text-purple-400 border border-purple-500/30 bg-purple-500/10 rounded-lg hover:bg-purple-500/20"
                            >
                              Reporter
                            </button>
                          )}
                          {app.statutId !== 3 && app.statutId !== 4 && (
                            <button
                              onClick={() => handleCancel(app.id)}
                              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-400 border border-red-500/30 bg-red-500/10 organic-pill hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                            >
                              Annuler
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

      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md organic-card-reverse border border-white/5 bg-[#081028]/95 backdrop-blur-xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Reporter le rendez-vous</h2>
            {rescheduleError && <p className="mb-4 text-sm text-red-500">{rescheduleError}</p>}
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Nouvelle Date</label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  className="w-full rounded-xl border border-blue-500/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Heure Début</label>
                  <input
                    type="time"
                    value={rescheduleData.heureDebut}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, heureDebut: e.target.value })}
                    className="w-full rounded-xl border border-blue-500/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Heure Fin Prévue</label>
                  <input
                    type="time"
                    value={rescheduleData.heureFinPrevue}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, heureFinPrevue: e.target.value })}
                    className="w-full rounded-xl border border-blue-500/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="organic-button bg-blue-600 px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-blue-500 shadow-lg shadow-blue-500/20"
                >
                  Reporter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorRendezVousPage;

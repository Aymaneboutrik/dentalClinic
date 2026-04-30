import { useEffect, useState } from "react";
import { getAllHistory, getRendezVous, type ApiError } from "@apis/services/rendezvous";
import { patientService, type Patient } from "@apis/services/patient";
import { getEmployees } from "../services/personnel.service";
import type { HistoriqueRDV, RendezVous } from "../../../types/rendezvous/rendezvous";
import type { Employee } from "../../../types/employee/employee";

const RendezVousHistoryPage = () => {
  const [history, setHistory] = useState<HistoriqueRDV[]>([]);
  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [historyData, rdvData, patientsData, employeesData] = await Promise.all([
        getAllHistory(),
        getRendezVous(),
        patientService.secretaryListPatients(),
        getEmployees(),
      ]);
      setHistory(historyData.sort((a, b) => new Date(b.dateModification).getTime() - new Date(a.dateModification).getTime()));
      setAppointments(rdvData);
      setPatients(patientsData);
      setEmployees(employeesData);
    } catch (err) {
      setError("Impossible de charger l'historique.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getPatientNameForHistory = (item: HistoriqueRDV) => {
    // Si l'historique a sauvegardé le patientId, on l'utilise directement
    if (item.patientId) {
      const p = patients.find(p => p.id === item.patientId);
      return p ? `${p.nom} ${p.prenom}` : `Patient #${item.patientId}`;
    }
    // Fallback à l'ancienne méthode
    const rdv = appointments.find(a => a.id === item.rendezVousId);
    if (!rdv) return "Inconnu";
    const p = patients.find(p => p.id === rdv.patientId);
    return p ? `${p.nom} ${p.prenom}` : `Patient #${rdv.patientId}`;
  };

  const getEmployeeName = (idOrName: string | number | undefined) => {
    if (!idOrName) return "N/A";
    const id = typeof idOrName === "string" ? parseInt(idOrName) : idOrName;
    if (isNaN(id)) return idOrName.toString();
    const emp = employees.find(e => e.idEmploye === id);
    return emp ? `Dr. ${emp.nom} ${emp.prenom}` : `Employé #${id}`;
  };

  const getDentistNameForHistory = (item: HistoriqueRDV) => {
    if (item.dentisteId) return getEmployeeName(item.dentisteId);
    
    // Fallback
    const rdv = appointments.find(a => a.id === item.rendezVousId);
    if (!rdv) return "Inconnu";
    return getEmployeeName(rdv.dentisteId);
  };

  const getStatusLabel = (status: string | number | undefined) => {
    if (status === undefined || status === "" || status === "N/A") return <span className="text-muted-foreground italic">N/A</span>;
    
    const statusMap: Record<string, { label: string, color: string }> = {
      "1": { label: "Planifié", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
      "Planifié": { label: "Planifié", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
      "2": { label: "Confirmé", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
      "Confirmé": { label: "Confirmé", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
      "3": { label: "Annulé", color: "bg-red-500/15 text-red-400 border-red-500/30" },
      "Annulé": { label: "Annulé", color: "bg-red-500/15 text-red-400 border-red-500/30" },
      "4": { label: "Effectué", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
      "Effectué": { label: "Effectué", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
      "5": { label: "Absent", color: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
      "Absent": { label: "Absent", color: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
      "6": { label: "Reporté", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
      "Reporté": { label: "Reporté", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
    };
    
    const s = statusMap[status.toString()];
    return s ? <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${s.color}`}>{s.label}</span> : <span>{status.toString()}</span>;
  };

  const getTypeModification = (type: string | number | undefined) => {
    if (!type) return "N/A";
    
    const typeStr = type.toString().toUpperCase();
    const map: Record<string, string> = {
      "CREATION": "Création",
      "MODIFICATION": "Modification",
      "ANNULATION": "Annulation",
      "REPORT": "Report",
      "EFFECTUE": "Effectué",
      "ABSENT": "Absent",
      "CHANGEMENT_DOCTEUR": "Changement Dentiste",
      // Keep old ones just in case
      "MODIFICATIONSTATUT": "Modification",
    };

    return map[typeStr] || typeStr;
  };

  return (
    <div className="w-full space-y-8">
      <div className="p-6 border shadow-sm rounded-2xl bg-card">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Traçabilité</p>
          <h1 className="text-3xl font-bold tracking-tight">Historique des Rendez-vous</h1>
        </div>
      </div>

      <div className="border shadow-sm rounded-2xl bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left border-b">
                <th className="px-4 py-4 font-semibold">Date Modification</th>
                <th className="px-4 py-4 font-semibold">Patient</th>
                <th className="px-4 py-4 font-semibold">Dentiste</th>
                <th className="px-4 py-4 font-semibold">Date RDV</th>
                <th className="px-4 py-4 font-semibold">Heure RDV</th>
                <th className="px-4 py-4 font-semibold">Motif</th>
                <th className="px-4 py-4 font-semibold">Ancien Statut</th>
                <th className="px-4 py-4 font-semibold">Nouveau Statut</th>
                <th className="px-4 py-4 font-semibold">Action</th>
                <th className="px-4 py-4 font-semibold">Modifié par</th>
                <th className="px-4 py-4 font-semibold">Urgent</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Chargement...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Aucun historique trouvé.</td></tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="border-b border-white/10 hover:bg-white/5 transition">
                    <td className="px-4 py-4 text-slate-300">
                      {new Date(item.dateModification).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 font-semibold text-white">
                      {getPatientNameForHistory(item)}
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      {item.ancienDentisteId ? (
                        <div className="flex flex-col text-xs">
                          <span className="text-muted-foreground line-through">{getEmployeeName(item.ancienDentisteId)}</span>
                          <span className="text-primary font-medium">{getDentistNameForHistory(item)}</span>
                        </div>
                      ) : (
                        getDentistNameForHistory(item)
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      {item.date || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      {item.heureDebut || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-slate-300 max-w-xs truncate" title={item.motif}>
                      {item.motif || "N/A"}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusLabel(item.ancienStatut)}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusLabel(item.nouveauStatut)}
                    </td>
                    <td className="px-4 py-4">
                       <span className="text-[10px] bg-white/5 px-2 py-1 rounded border border-white/10 text-primary font-semibold uppercase">
                         {getTypeModification(item.typeModification)}
                       </span>
                    </td>
                    <td className="px-4 py-4 text-slate-300 font-medium">
                      {getEmployeeName(item.modifiePar)}
                    </td>
                    <td className="px-4 py-4">
                      {item.estUrgent ? (
                        <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">
                          Urgent
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RendezVousHistoryPage;

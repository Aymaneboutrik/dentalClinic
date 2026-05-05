import { useEffect, useState } from "react";
import { DashboardHeader } from "../../../components/commons/dashboard/DashboardHeader";
import { Calendar, ShieldCheck, Clock, FileText } from "lucide-react";
import type { Absence } from "../../../types/absence/absence";
import {
  getAbsencesByEmployeId,
  type ApiError,
} from "../services/absence.service";

const formatDate = (dateValue?: string | null): string => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fr-FR");
};

const isSameDayAbsence = (
  dateDebut?: string | null,
  dateFin?: string | null
): boolean => {
  const formattedDateDebut = formatDate(dateDebut);
  const formattedDateFin = formatDate(dateFin);
  if (formattedDateDebut === "-" || formattedDateFin === "-") {
    return false;
  }
  return formattedDateDebut === formattedDateFin;
};

const SecretaireAbsencePage = () => {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAbsences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAbsencesByEmployeId();
      setAbsences(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      setError(apiError.message || "Impossible de charger les absences.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <DashboardHeader
          title="Mes Absences"
          subtitle="Consultez l'historique complet de vos absences validées"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <div className="glass border-white/5 px-6 py-3 rounded-2xl flex items-center space-x-3 shadow-lg">
             <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck className="w-4 h-4" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Absences</p>
                <p className="text-sm font-bold text-foreground">{absences.length} validée{absences.length > 1 ? 's' : ''}</p>
             </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass border-red-500/20 bg-red-500/10 p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
           <FileText className="w-5 h-5 text-red-500" />
           <p className="text-sm text-red-500 font-medium">{error}</p>
        </div>
      )}

      <div className="glass border-white/5 shadow-2xl organic-card">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <h3 className="text-lg font-bold flex items-center space-x-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>Journal des Absences</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Employé</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Type d'Absence</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Période</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Validée le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-8 bg-white/5" />
                  </tr>
                ))
              ) : absences.length > 0 ? (
                absences.map((absence) => (
                  <tr key={absence.idAbsence} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {absence.nom?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors capitalize">{absence.prenom} {absence.nom}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Secrétaire</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium">
                       <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/5 text-muted-foreground">
                          {absence.typeAbsence || "Standard"}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        {isSameDayAbsence(absence.dateDebut, absence.dateFin) ? (
                          <span className="text-sm font-bold">{formatDate(absence.dateDebut)}</span>
                        ) : (
                          <>
                            <span className="text-sm font-medium">du {formatDate(absence.dateDebut)}</span>
                            <span className="text-sm font-medium text-muted-foreground">au {formatDate(absence.dateFin)}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-primary/40" />
                          <span className="text-sm font-medium">{formatDate(absence.dateValidation)}</span>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/30">
                        <Calendar className="w-8 h-8" />
                      </div>
                      <p className="text-muted-foreground font-medium">Aucune absence enregistrée</p>
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

export default SecretaireAbsencePage;
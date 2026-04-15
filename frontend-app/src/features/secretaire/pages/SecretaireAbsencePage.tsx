import { useEffect, useState } from "react";
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
    <div className="w-full space-y-8">
      <div className="p-6 border shadow-sm rounded-2xl bg-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">
              Gestion des absences
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Mes absences
            </h1>
            <p className="text-sm text-muted-foreground">
              Consultez l’historique de vos absences validées.
            </p>
          </div>

          <div className="px-4 py-3 text-sm text-blue-400 border rounded-2xl border-blue-500/20 bg-blue-500/10">
            <span className="font-semibold">{absences.length}</span> absence
            {absences.length > 1 ? "s" : ""} affichée
            {absences.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 text-sm text-red-400 border rounded-2xl border-red-500/20 bg-red-500/10">
          {error}
        </div>
      )}

      <div className="border shadow-sm rounded-2xl bg-card">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-lg font-semibold">Liste de mes absences</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left border-b">
                <th className="px-6 py-4 font-semibold">Employé</th>
                <th className="px-6 py-4 font-semibold">Type d’absence</th>
                <th className="px-6 py-4 font-semibold">Date début</th>
                <th className="px-6 py-4 font-semibold">Date fin</th>
                <th className="px-6 py-4 font-semibold">Date validation</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-sm text-center text-muted-foreground"
                  >
                    Chargement des absences...
                  </td>
                </tr>
              ) : error && absences.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-sm text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : absences.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-sm text-center text-muted-foreground"
                  >
                    Aucune absence à afficher pour le moment.
                  </td>
                </tr>
              ) : (
                absences.map((absence) => (
                  <tr
                    key={absence.idAbsence}
                    className="transition duration-200 border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="px-6 py-5 font-semibold text-white">
                      {String(absence.nom || "")} {String(absence.prenom || "")}
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {String(absence.typeAbsence || "-")}
                    </td>

                    {isSameDayAbsence(absence.dateDebut, absence.dateFin) ? (
                      <td className="px-6 py-5 text-slate-300" colSpan={2}>
                        {formatDate(absence.dateDebut)}
                      </td>
                    ) : (
                      <>
                        <td className="px-6 py-5 text-slate-300">
                          {formatDate(absence.dateDebut)}
                        </td>

                        <td className="px-6 py-5 text-slate-300">
                          {formatDate(absence.dateFin)}
                        </td>
                      </>
                    )}

                    <td className="px-6 py-5 text-slate-300">
                      {formatDate(absence.dateValidation)}
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

export default SecretaireAbsencePage;
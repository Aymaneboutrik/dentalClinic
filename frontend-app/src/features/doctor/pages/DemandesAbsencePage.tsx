import { useEffect, useState } from "react";
import type { DemandeAbsence } from "../../../types/demandeAbsence/demandeAbsence";
import {
  getDemandesAbsence,
  accepterDemandeAbsence,
  refuserDemandeAbsence,
  type ApiError,
} from "../services/demandeAbsence.service";


///solution temporaire pour récupérer l'id du médecin connecté, à remplacer par une solution plus robuste (ex: contexte d'authentification)
const CURRENT_DOCTOR_ID = Number(localStorage.getItem("userId")) || 7;
const formatDate = (dateValue?: string | null): string => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("fr-FR");
};

const getStatutBadgeClasses = (statut?: string): string => {
  if (statut === "ACCEPTEE") {
    return "border-emerald-500/30 bg-emerald-500/15 text-emerald-400";
  }

  if (statut === "REFUSEE") {
    return "border-red-500/30 bg-red-500/15 text-red-400";
  }

  return "border-amber-500/30 bg-amber-500/15 text-amber-400";
};

const DemandesAbsencePage = () => {
  const [demandes, setDemandes] = useState<DemandeAbsence[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getDemandesAbsence();
      setDemandes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      setError(apiError.message || "Impossible de charger les demandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const handleAccepter = async (idDemande: number) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment accepter cette demande ?"
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(idDemande);
      setError(null);
      setSuccessMessage(null);

      const result = await accepterDemandeAbsence(
        idDemande,
        CURRENT_DOCTOR_ID
      );

      await fetchDemandes();

      setSuccessMessage(result.message || "Demande acceptée avec succès.");
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      setError(apiError.message || "Impossible d'accepter la demande.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRefuser = async (idDemande: number) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment refuser cette demande ?"
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(idDemande);
      setError(null);
      setSuccessMessage(null);

      const result = await refuserDemandeAbsence(
        idDemande,
        CURRENT_DOCTOR_ID
      );

      await fetchDemandes();

      setSuccessMessage(result.message || "Demande refusée avec succès.");
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      setError(apiError.message || "Impossible de refuser la demande.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="p-6 border shadow-sm rounded-2xl bg-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">
              Gestion des demandes d'absence
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Demandes des employés
            </h1>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="px-4 py-3 text-sm border rounded-2xl border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="px-4 py-3 text-sm text-red-400 border rounded-2xl border-red-500/20 bg-red-500/10">
          {error}
        </div>
      )}

      <div className="border shadow-sm rounded-2xl bg-card">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-lg font-semibold">Liste des demandes</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left border-b">
                <th className="px-6 py-4 font-semibold">Employé</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Date début</th>
                <th className="px-6 py-4 font-semibold">Date fin</th>
                <th className="px-6 py-4 font-semibold">Motif</th>
                <th className="px-6 py-4 font-semibold">Statut</th>
                <th className="px-6 py-4 font-semibold">Date traitement</th>
                <th className="px-6 py-4 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-sm text-center text-muted-foreground"
                  >
                    Chargement des demandes...
                  </td>
                </tr>
              ) : error && demandes.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-sm text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : demandes.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-sm text-center text-muted-foreground"
                  >
                    Aucune demande à afficher pour le moment.
                  </td>
                </tr>
              ) : (
                demandes.map((demande) => {
                  const isPending = demande.statut === "EN_ATTENTE";
                  const isCurrentActionLoading =
                    actionLoadingId === demande.idDemande;

                  return (
                    <tr
                      key={demande.idDemande}
                      className="transition duration-200 border-b border-white/10 hover:bg-white/5"
                    >
                      <td className="px-6 py-5 font-semibold text-white">
                        {String(demande.nom || "")}
                        <br />
                        {String(demande.prenom || "")}
                      </td>

                      <td className="px-6 py-5 text-slate-300">
                        {String(demande.typeDemande || "-")}
                      </td>

                      <td className="px-6 py-5 text-slate-300">
                        {formatDate(demande.dateDebut)}
                      </td>

                      <td className="px-6 py-5 text-slate-300">
                        {formatDate(demande.dateFin)}
                      </td>

                      <td className="px-6 py-5 text-slate-300">
                        {String(demande.motif || "-")}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatutBadgeClasses(
                            demande.statut
                          )}`}
                        >
                          {String(demande.statut || "-")}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-slate-300">
                        {formatDate(demande.dateTraitement)}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAccepter(demande.idDemande)}
                                disabled={isCurrentActionLoading}
                                className="px-4 py-2 text-xs font-semibold text-blue-400 transition border rounded-xl border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {isCurrentActionLoading
                                  ? "Traitement..."
                                  : "Accepter"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRefuser(demande.idDemande)}
                                disabled={isCurrentActionLoading}
                                className="px-4 py-2 text-xs font-semibold text-red-400 transition border rounded-xl border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {isCurrentActionLoading
                                  ? "Traitement..."
                                  : "Refuser"}
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Demande déjà traitée
                            </span>
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

export default DemandesAbsencePage;
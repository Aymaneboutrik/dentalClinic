import { useState, useEffect } from "react";
import secureApi from "@apis/instances/secure-api";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import PageTitle from "@components/commons/page-title";

const BASE_URL = "/factures";

interface Facture {
  id: number;
  montantBrut: number;
  montantNet: number;
  date: string;
  statut: string;
  totalRemises: number;
  resteAPayer: number;
}

interface FicheFacture {
  id: number;
  date: string;
  statut: string;
  montantBrut: number;
  totalRemises: number;
  montantNet: number;
  totalPaye: number;
  resteAPayer: number;
  lignesFacture: any[];
  remises: any[];
  paiements: any[];
}

export default function DoctorFacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);
  const [ficheFacture, setFicheFacture] = useState<FicheFacture | null>(null);

  const fetchFactures = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      setFactures(res.data);
      setFetched(true);
    } catch {
      alert("Erreur lors du chargement des factures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const fetchFicheFacture = async (id: number) => {
    try {
      const res = await secureApi.get(`${BASE_URL}/${id}/fiche`);
      setFicheFacture(res.data);
    } catch {
      alert("Erreur lors du chargement de la fiche de facture");
    }
  };

  const filtered = factures.filter(
    (f) =>
      f.id.toString().includes(search) ||
      f.statut.toLowerCase().includes(search.toLowerCase()) ||
      f.date.includes(search)
  );

  const columns: ColumnDef<Facture>[] = [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => row.original.date?.split("T")[0] ?? "-",
    },
    { accessorKey: "montantBrut", header: "Montant Brut (MAD)" },
    { accessorKey: "totalRemises", header: "Total Remises (MAD)" },
    { accessorKey: "montantNet", header: "Montant Net (MAD)" },
    { accessorKey: "resteAPayer", header: "Reste à Payer (MAD)" },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded text-xs font-bold ${
            row.original.statut === "PAYEE"
              ? "bg-green-100 text-green-700"
              : row.original.statut === "PARTIEL"
              ? "bg-orange-100 text-orange-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.original.statut}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => fetchFicheFacture(row.original.id)}>
          Voir Fiche
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-primary text-sm font-medium">Consultation</p>
          <PageTitle title="Factures" desc="Consultez les factures des patients" />
        </div>
      </div>

      {ficheFacture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Fiche Facture N°{ficheFacture.id}</h2>
              <Button variant="outline" onClick={() => setFicheFacture(null)}>Fermer</Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Date :</p>
                <p className="font-medium">{ficheFacture.date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut :</p>
                <p className="font-medium">{ficheFacture.statut}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 bg-muted p-4 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Montant Brut</p>
                <p className="font-bold">{ficheFacture.montantBrut} MAD</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Remises</p>
                <p className="font-bold text-red-500">-{ficheFacture.totalRemises} MAD</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Montant Net</p>
                <p className="font-bold">{ficheFacture.montantNet} MAD</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Payé</p>
                <p className="font-bold text-green-600">{ficheFacture.totalPaye} MAD</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reste à Payer</p>
                <p className="font-bold text-orange-600">{ficheFacture.resteAPayer} MAD</p>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-2">Lignes de Facture</h3>
            <table className="w-full text-sm text-left mb-6 border">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 border">Acte Médical</th>
                  <th className="p-2 border">Quantité</th>
                  <th className="p-2 border">Prix Unitaire</th>
                  <th className="p-2 border">Sous-Total</th>
                </tr>
              </thead>
              <tbody>
                {ficheFacture.lignesFacture.length > 0 ? (
                  ficheFacture.lignesFacture.map((l, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 border">{l.libelleActe} (ID: {l.acteMedicalId})</td>
                      <td className="p-2 border">{l.quantite}</td>
                      <td className="p-2 border">{l.prixUnitaire} MAD</td>
                      <td className="p-2 border font-medium">{l.sousTotal} MAD</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="p-2 text-center text-muted-foreground">Aucune ligne</td></tr>
                )}
              </tbody>
            </table>

            <h3 className="font-bold text-lg mb-2">Remises</h3>
            <table className="w-full text-sm text-left mb-6 border">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Valeur</th>
                  <th className="p-2 border">Montant Calculé</th>
                  <th className="p-2 border">Autorisée</th>
                </tr>
              </thead>
              <tbody>
                {ficheFacture.remises.length > 0 ? (
                  ficheFacture.remises.map((r, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 border">{r.dateRemise}</td>
                      <td className="p-2 border">{r.typeRemise}</td>
                      <td className="p-2 border">{r.valeur} {r.typeRemise === 'POURCENTAGE' ? '%' : 'MAD'}</td>
                      <td className="p-2 border font-medium text-red-500">-{r.montantCalcule} MAD</td>
                      <td className="p-2 border">{r.estAutorisee ? "Oui" : "Non"}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="p-2 text-center text-muted-foreground">Aucune remise</td></tr>
                )}
              </tbody>
            </table>

            <h3 className="font-bold text-lg mb-2">Paiements</h3>
            <table className="w-full text-sm text-left mb-2 border">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Mode</th>
                  <th className="p-2 border">Montant</th>
                </tr>
              </thead>
              <tbody>
                {ficheFacture.paiements.length > 0 ? (
                  ficheFacture.paiements.map((p, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 border">{p.datePaiement}</td>
                      <td className="p-2 border">{p.modePaiement}</td>
                      <td className="p-2 border font-medium text-green-600">+{p.montant} MAD</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="p-2 text-center text-muted-foreground">Aucun paiement</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="border rounded-xl p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Liste des factures</h3>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-1 text-sm bg-background"
              placeholder="Rechercher par ID, Statut..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchFactures} disabled={loading}>
              {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

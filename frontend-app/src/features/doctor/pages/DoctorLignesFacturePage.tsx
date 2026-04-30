import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import PageTitle from "@components/commons/page-title";

const BASE_URL = "/api/lignes-facture";

interface LigneFacture {
  id: number;
  factureId: number;
  acteMedicalId: number;
  libelleActe: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export default function DoctorLignesFacturePage() {
  const [lignes, setLignes] = useState<LigneFacture[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const fetchLignes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLignes(data);
      setFetched(true);
    } catch {
      alert("Erreur lors du chargement des lignes de facture");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLignes();
  }, []);

  const filtered = lignes.filter(
    (l) =>
      l.libelleActe?.toLowerCase().includes(search.toLowerCase()) ||
      l.factureId.toString().includes(search)
  );

  const columns: ColumnDef<LigneFacture>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "factureId", header: "ID Facture" },
    {
      accessorKey: "acteMedicalId",
      header: "Acte Médical",
      cell: ({ row }) => (
        <span>{row.original.libelleActe} (ID: {row.original.acteMedicalId})</span>
      ),
    },
    { accessorKey: "quantite", header: "Quantité" },
    { accessorKey: "prixUnitaire", header: "Prix Unitaire (MAD)" },
    { accessorKey: "sousTotal", header: "Sous-Total (MAD)" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-primary text-sm font-medium">Consultation</p>
          <PageTitle title="Lignes de Facture" desc="Consultez les actes ajoutés aux factures" />
        </div>
      </div>

      <div className="border rounded-xl p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Liste des lignes</h3>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-1 text-sm bg-background"
              placeholder="Rechercher par libellé ou ID Facture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchLignes} disabled={loading}>
              {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import secureApi from "@apis/instances/secure-api";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import PageTitle from "@components/commons/page-title";

const BASE_URL = "/paiements";

interface Paiement {
  id: number;
  factureId: number;
  montant: number;
  datePaiement: string;
  modePaiement: string;
}

export default function DoctorPaiementsPage() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const fetchPaiements = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      setPaiements(res.data);
      setFetched(true);
    } catch {
      alert("Erreur lors du chargement des paiements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaiements();
  }, []);

  const filtered = paiements.filter(
    (p) =>
      p.modePaiement.toLowerCase().includes(search.toLowerCase()) ||
      p.factureId.toString().includes(search)
  );

  const columns: ColumnDef<Paiement>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "factureId", header: "ID Facture" },
    { accessorKey: "montant", header: "Montant (MAD)" },
    { accessorKey: "modePaiement", header: "Mode de Paiement" },
    {
      accessorKey: "datePaiement",
      header: "Date",
      cell: ({ row }) => row.original.datePaiement?.split("T")[0] ?? "-",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-primary text-sm font-medium">Consultation</p>
          <PageTitle title="Paiements" desc="Consultez les encaissements" />
        </div>
      </div>

      <div className="border rounded-xl p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Liste des paiements</h3>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-1 text-sm bg-background"
              placeholder="Rechercher par mode, ID Facture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchPaiements} disabled={loading}>
              {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

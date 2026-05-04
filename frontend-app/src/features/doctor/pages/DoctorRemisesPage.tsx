import { useState, useEffect } from "react";
import secureApi from "@apis/instances/secure-api";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import PageTitle from "@components/commons/page-title";

const BASE_URL = "/remises";

interface Remise {
  id: number;
  valeur: number;
  dateRemise: string;
  description: string;
  typeRemise: string;
  factureId: number;
  montantCalcule?: number;
  estAutorisee: boolean;
}

export default function DoctorRemisesPage() {
  const [remises, setRemises] = useState<Remise[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const fetchRemises = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      setRemises(res.data);
      setFetched(true);
    } catch {
      alert("Erreur lors du chargement des remises");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemises();
  }, []);

  const filtered = remises.filter(
    (r) =>
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.factureId.toString().includes(search)
  );

  const columns: ColumnDef<Remise>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "factureId", header: "ID Facture" },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "typeRemise", header: "Type" },
    {
      accessorKey: "valeur",
      header: "Valeur",
      cell: ({ row }) => (
        <span>
          {row.original.valeur} {row.original.typeRemise === "VARIABLE" ? "%" : "MAD"}
        </span>
      ),
    },
    {
      accessorKey: "montantCalcule",
      header: "Impact Estimé (MAD)",
      cell: ({ row }) => row.original.montantCalcule ? `-${row.original.montantCalcule}` : "-",
    },
    {
      accessorKey: "estAutorisee",
      header: "Statut",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded text-xs font-bold ${
            row.original.estAutorisee ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          {row.original.estAutorisee ? "Autorisée" : "En attente"}
        </span>
      ),
    },
    {
      accessorKey: "dateRemise",
      header: "Date",
      cell: ({ row }) => row.original.dateRemise?.split("T")[0] ?? "-",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-primary text-sm font-medium">Consultation</p>
          <PageTitle title="Remises" desc="Consultez les remises sur factures" />
        </div>
      </div>

      <div className="border rounded-xl p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Liste des remises</h3>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-1 text-sm bg-background"
              placeholder="Rechercher par description, ID Facture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchRemises} disabled={loading}>
              {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

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
          className={`inline-flex items-center organic-pill border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
            row.original.estAutorisee ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-slate-500/30 bg-slate-500/10 text-slate-400"
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
      <div className="p-8 border shadow-2xl organic-card bg-card/40 backdrop-blur-md border-white/5 mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary uppercase tracking-widest">Consultation</p>
            <h1 className="text-3xl font-black tracking-tight">Remises</h1>
            <p className="text-slate-400 text-sm">Consultez et gérez les remises appliquées sur les factures.</p>
          </div>
        </div>
      </div>

      <div className="border shadow-2xl organic-card bg-card/40 backdrop-blur-md border-white/5 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h3 className="font-black text-xl text-white tracking-tight">Liste des remises</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              className="organic-pill border border-white/10 px-6 py-2.5 text-sm bg-white/5 text-white outline-none focus:border-blue-500/50 transition-all min-w-[300px]"
              placeholder="Rechercher par description, ID Facture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchRemises} disabled={loading} className="organic-button px-8 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg">
              {loading ? "..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

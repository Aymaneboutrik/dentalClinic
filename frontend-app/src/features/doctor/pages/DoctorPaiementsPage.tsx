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
      <div className="p-8 border shadow-2xl organic-card bg-card/40 backdrop-blur-md border-white/5 mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary uppercase tracking-widest">Consultation</p>
            <h1 className="text-3xl font-black tracking-tight">Paiements</h1>
            <p className="text-slate-400 text-sm">Consultez les encaissements effectués par la clinique.</p>
          </div>
        </div>
      </div>

      <div className="border shadow-2xl organic-card bg-card/40 backdrop-blur-md border-white/5 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h3 className="font-black text-xl text-white tracking-tight">Liste des paiements</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              className="organic-pill border border-white/10 px-6 py-2.5 text-sm bg-white/5 text-white outline-none focus:border-blue-500/50 transition-all min-w-[300px]"
              placeholder="Rechercher par mode, ID Facture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchPaiements} disabled={loading} className="organic-button px-8 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg">
              {loading ? "..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

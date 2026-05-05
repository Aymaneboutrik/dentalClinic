import { useState, useEffect } from "react";
import secureApi from "@apis/instances/secure-api";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { DashboardHeader } from "@components/commons/dashboard/DashboardHeader";
import { History, Search, Trash2, Calendar, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "/transactions";

interface Transaction {
  id: number;
  remiseId: number;
  factureId: number;
  montantAvant: number;
  montantRemise: number;
  montantApres: number;
  date: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      setTransactions(res.data);
      setFetched(true);
    } catch {
      toast.error("Erreur lors du chargement des transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette transaction d'audit ?")) return;
    setLoading(true);
    try {
      await secureApi.delete(`${BASE_URL}/${id}`);
      toast.success("Transaction supprimée");
      fetchTransactions();
    } catch {
      toast.error("Erreur lors de la suppression");
      setLoading(false);
    }
  };

  const filtered = transactions.filter(
    (t) => t.remiseId.toString().includes(search)
  );

  const columns: ColumnDef<Transaction>[] = [
    { 
      accessorKey: "id", 
      header: "ID Audit",
      cell: ({ row }) => <span className="font-mono text-xs font-bold text-muted-foreground">#TR-{row.original.id}</span>
    },
    { 
      accessorKey: "remiseId", 
      header: "Source",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-sm">Remise #{row.original.remiseId}</span>
          <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest">Sur Facture #{row.original.factureId}</span>
        </div>
      )
    },
    { 
      accessorKey: "montantAvant", 
      header: "Initial",
      cell: ({ row }) => <span className="font-medium text-sm">{row.original.montantAvant} MAD</span>
    },
    { 
      accessorKey: "montantRemise", 
      header: "Réduction",
      cell: ({ row }) => <span className="font-black text-sm text-rose-500">-{row.original.montantRemise} MAD</span>
    },
    { 
      accessorKey: "montantApres", 
      header: "Final",
      cell: ({ row }) => (
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg w-fit">
          <span className="font-black text-sm text-emerald-500">{row.original.montantApres} MAD</span>
        </div>
      )
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{row.original.date?.split("T")[0] ?? "-"}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button onClick={() => handleDelete(row.original.id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors" title="Supprimer">
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <DashboardHeader
          title="Audit des Transactions"
          subtitle="Historique détaillé des impacts financiers des remises"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <div className="glass border-white/5 px-6 py-3 rounded-2xl flex items-center space-x-3 shadow-lg">
             <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck className="w-4 h-4" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sécurité</p>
                <p className="text-sm font-bold text-foreground">Registre d'Audit</p>
             </div>
          </div>
        </div>
      </div>

      <div className="glass border-white/5 shadow-2xl organic-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-white">Journal des Opérations</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">{transactions.length} LOGS</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                className="bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all w-64"
                placeholder="ID Remise..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchTransactions} 
              disabled={loading} 
              className="p-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-muted-foreground transition-all"
              title="Actualiser"
            >
              <Clock className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
           <DataTable columns={columns} data={filtered} loading={loading} />
        </div>
      </div>
    </div>
  );
}

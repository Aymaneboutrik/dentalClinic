import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import { Form } from "@components/ui/form";
import TextInput from "@components/inputs/text-input";
import { DashboardHeader } from "@components/commons/dashboard/DashboardHeader";
import secureApi from "@apis/instances/secure-api";
import { Package, Plus, History, ArrowRight, X, Clock } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "/stock/MouvementStock";

const typeMouvementLabels: Record<string, string> = {
  Entree: "Entrée",
  Sortie: "Sortie",
};

const typeMouvementColors: Record<string, string> = {
  Entree: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Sortie: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

interface MouvementStock {
  id: number;
  typeMouvement: string;
  quantite: number;
  dateMouvement: string;
  produitId: number | null;
  ligneCommandeId: number | null;
  produitActif: boolean;
}

const sortieSchema = z.object({
  produitId: z.coerce.number().min(1, "L'ID produit est obligatoire"),
  quantite: z.coerce.number().min(1, "La quantité doit être strictement positive"),
});
type SortieForm = z.infer<typeof sortieSchema>;

export default function MouvementsStockPage() {
  const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<SortieForm>({
    resolver: zodResolver(sortieSchema),
    defaultValues: { produitId: 0, quantite: 1 },
  });

  const fetchMouvements = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(BASE_URL);
      const data = res.data;
      const mappedData = data.map((m: any) => ({
        ...m,
        typeMouvement: m.typeMouvement === 0 || m.typeMouvement === "Entree" ? "Entree" : "Sortie"
      }));
      setMouvements(mappedData);
      setFetched(true);
    } catch (e) {
      console.error("Erreur lors du chargement des mouvements", e);
      toast.error("Impossible de charger les mouvements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMouvements();
  }, []);

  const handleSortie = async (values: SortieForm) => {
    setLoading(true);
    try {
      await secureApi.post(`${BASE_URL}/sortie`, values, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Sortie effectuée avec succès");
      setShowForm(false);
      form.reset();
      await fetchMouvements();
    } catch {
      toast.error("Erreur lors de l'enregistrement de la sortie");
      setLoading(false);
    }
  };

  const columns: ColumnDef<MouvementStock>[] = [
    { 
        accessorKey: "id", 
        header: "ID",
        cell: ({ row }) => <span className={`text-xs font-mono font-bold ${!row.original.produitActif ? "text-rose-500" : "text-muted-foreground"}`}>#{row.original.id}</span>
    },
    {
      accessorKey: "typeMouvement",
      header: "Flux",
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${typeMouvementColors[row.original.typeMouvement] ?? "bg-white/5 border-white/5 text-muted-foreground"}`}>
          {typeMouvementLabels[row.original.typeMouvement] ?? row.original.typeMouvement}
        </span>
      ),
    },
    { 
      accessorKey: "quantite", 
      header: "Quantité",
      cell: ({ row }) => <span className="font-black text-sm">{row.original.quantite} u.</span>
    },
    {
      accessorKey: "dateMouvement",
      header: "Date & Heure",
      cell: ({ row }) =>
        row.original.dateMouvement ? (
          <div className="flex items-center space-x-2 text-xs font-medium">
             <Clock className="w-3 h-3 text-muted-foreground" />
             <span className={`${!row.original.produitActif ? "text-rose-500" : "text-foreground"}`}>
               {new Date(row.original.dateMouvement).toLocaleString('fr-FR')}
             </span>
          </div>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "produitId",
      header: "Produit",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
           <Package className={`w-3 h-3 ${!row.original.produitActif ? "text-rose-500" : "text-primary"}`} />
           <span className={`text-xs font-bold ${!row.original.produitActif ? "text-rose-500" : "text-foreground"}`}>ID: {row.original.produitId ?? "-"}</span>
        </div>
      ),
    },
    {
      accessorKey: "ligneCommandeId",
      header: "Réf. Commande",
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.original.ligneCommandeId ? `#${row.original.ligneCommandeId}` : "---"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <DashboardHeader
          title="Gestion du Stock"
          subtitle="Mouvements d'entrée et sortie des produits cliniques"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center space-x-2 px-8 py-3 organic-pill font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg ${showForm ? 'bg-white/5 text-muted-foreground border border-white/5' : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'}`}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? "Annuler" : "Enregistrer une Sortie"}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass border-white/5 p-8 organic-card shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-500 shadow-inner">
              <ArrowRight className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Sortie de Stock Manuelle</h2>
              <p className="text-sm text-muted-foreground">Enregistrez le retrait d'un produit du stock</p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSortie)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">ID du Produit</label>
                  <TextInput
                    name="produitId"
                    form={form}
                    placeholder="Saisissez l'ID"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Quantité</label>
                  <TextInput
                    name="quantite"
                    form={form}
                    placeholder="Ex: 5"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-white/5">
                <button 
                  type="submit" 
                  className="bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 organic-pill text-[11px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 transition-all active:scale-95 disabled:opacity-50" 
                  disabled={loading}
                >
                  {loading ? "Traitement..." : "Confirmer la Sortie"}
                </button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="glass border-white/5 shadow-2xl organic-card">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-white">Journal des Mouvements</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">{mouvements.length} FLUX</span>
          </div>
          <button 
            onClick={fetchMouvements} 
            disabled={loading} 
            className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            <Clock className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? "Actualisation..." : "Actualiser"}</span>
          </button>
        </div>
        <div className="p-4">
           <DataTable columns={columns} data={mouvements} loading={loading} />
        </div>
      </div>
    </div>
  );
}
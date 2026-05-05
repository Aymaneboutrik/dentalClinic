import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Form } from "@components/ui/form";
import TextInput from "@components/inputs/text-input";
import { DashboardHeader } from "@components/commons/dashboard/DashboardHeader";
import secureApi from "@apis/instances/secure-api";
import { Package, Plus, Search, X, Edit3, Trash2, ShoppingCart, List, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "/stock/LigneCommande";

const ligneSchema = z.object({
  produitId: z.coerce.number().min(1, "L'ID produit est obligatoire"),
  quantite: z.coerce.number().min(1, "La quantité doit être strictement positive"),
  prixUnitaire: z.coerce.number().min(0.01, "Le prix unitaire doit être strictement positif"),
  commandeId: z.coerce.number().min(1, "L'ID de commande est obligatoire"),
});

type LigneForm = z.infer<typeof ligneSchema>;

interface LigneCommande {
  id: number;
  produitId: number;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  commandeId: number;
}

export default function LignesCommandePage() {
  const [lignes, setLignes] = useState<LigneCommande[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [editing, setEditing] = useState<LigneCommande | null>(null);
  const [search, setSearch] = useState("");

  const form = useForm<LigneForm>({
    resolver: zodResolver(ligneSchema),
    defaultValues: { produitId: 0, quantite: 1, prixUnitaire: 0, commandeId: 0 },
  });

  const fetchLignes = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      setLignes(res.data);
      setFetched(true);
    } catch {
      toast.error("Erreur lors du chargement des lignes de commande");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLignes();
  }, []);

  const handleSubmit = async (values: LigneForm) => {
    setLoading(true);
    try {
      const payload = { ...values, id: editing?.id || 0, sousTotal: values.quantite * values.prixUnitaire };
      if (editing) {
        await secureApi.put(`${BASE_URL}/${editing.id}`, payload);
        toast.success("Ligne de commande mise à jour");
      } else {
        await secureApi.post(`${BASE_URL}`, payload);
        toast.success("Produit ajouté à la commande");
      }

      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchLignes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Sauvegarde échouée');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (l: LigneCommande) => {
    setEditing(l);
    form.setValue("produitId", l.produitId);
    form.setValue("quantite", l.quantite);
    form.setValue("prixUnitaire", l.prixUnitaire);
    form.setValue("commandeId", l.commandeId);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette ligne de commande ?")) return;
    setLoading(true);
    try {
      await secureApi.delete(`${BASE_URL}/${id}`);
      toast.success("Ligne supprimée");
      fetchLignes();
    } catch {
      toast.error("Action impossible.");
      setLoading(false);
    }
  };

  const filtered = lignes.filter(
    (l) =>
      l.produitId.toString().includes(search) ||
      l.commandeId.toString().includes(search)
  );

  const columns: ColumnDef<LigneCommande>[] = [
    { 
      accessorKey: "commandeId", 
      header: "Commande",
      cell: ({ row }) => <span className="font-mono text-xs font-bold text-muted-foreground">#ORD-{row.original.commandeId}</span>
    },
    { 
      accessorKey: "produitId", 
      header: "Produit",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Package className="w-3 h-3 text-primary/40" />
          <span className="font-bold text-sm">ID: {row.original.produitId}</span>
        </div>
      )
    },
    { 
      accessorKey: "quantite", 
      header: "Quantité",
      cell: ({ row }) => <span className="font-black text-sm">{row.original.quantite} u.</span>
    },
    { 
      accessorKey: "prixUnitaire", 
      header: "P.U",
      cell: ({ row }) => <span className="font-bold text-sm text-emerald-500">{row.original.prixUnitaire.toFixed(2)} MAD</span>
    },
    { 
      accessorKey: "sousTotal", 
      header: "Sous-total",
      cell: ({ row }) => (
        <div className="bg-primary/5 border border-primary/10 px-3 py-1 rounded-lg w-fit">
          <span className="font-black text-sm text-primary">{row.original.sousTotal.toFixed(2)} MAD</span>
        </div>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row.original)} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row.original.id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <DashboardHeader
          title="Lignes de Commande"
          subtitle="Détail des produits associés aux ordres d'achat"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setEditing(null);
              form.reset();
            }}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 organic-pill font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? "Annuler" : "Ajouter un Produit"}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass border-white/5 p-8 organic-card shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-inner">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {editing ? "Modifier la ligne" : "Associer un Produit"}
              </h2>
              <p className="text-sm text-muted-foreground">Définissez les détails de l'article pour la commande</p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">ID de la Commande</label>
                  <TextInput
                    name="commandeId"
                    form={form}
                    placeholder="Ex: 10"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">ID du Produit</label>
                  <TextInput
                    name="produitId"
                    form={form}
                    placeholder="Ex: 501"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Quantité</label>
                  <TextInput
                    name="quantite"
                    form={form}
                    placeholder="Ex: 100"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Prix Unitaire (MAD)</label>
                  <TextInput
                    name="prixUnitaire"
                    form={form}
                    placeholder="0.00"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-white/5">
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 organic-pill text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50" 
                  disabled={loading}
                >
                  {loading ? "Traitement..." : editing ? "Mettre à jour" : "Ajouter à la commande"}
                </button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="glass border-white/5 shadow-2xl organic-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-white">Contenu des Commandes</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">{lignes.length} RÉFÉRENCES</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                className="bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all w-64"
                placeholder="Rechercher par ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchLignes} 
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
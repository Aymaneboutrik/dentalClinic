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
import { Package, Plus, Search, X, Edit3, Trash2, AlertTriangle, ShieldAlert, Calendar, Info, Clock, Layers, Power } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "/stock/Produit";

const produitSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  description: z.string().min(1, "La description est obligatoire"),
  quantite: z.coerce.number().min(1, "La quantité doit être strictement positive"),
  seuilAlerte: z.coerce.number().min(1, "Le seuil d'alerte doit être strictement positif"),
  datePeremption: z.string().min(1, "La date de péremption est obligatoire"),
});

type ProduitForm = z.infer<typeof produitSchema>;

interface Produit {
  id: number;
  nom: string;
  description: string;
  quantite: number;
  seuilAlerte: number;
  datePeremption: string;
  actif: boolean;
}

export default function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Produit | null>(null);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);
  const [produitsEnAlerte, setProduitsEnAlerte] = useState<Produit[]>([]);
  const [produitsEnPeremption, setProduitsEnPeremption] = useState<Produit[]>([]);

  const form = useForm<ProduitForm>({
    resolver: zodResolver(produitSchema),
    defaultValues: { nom: "", description: "", quantite: 1, seuilAlerte: 1, datePeremption: "" },
  });

  const fetchProduits = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      const data = res.data;
      setProduits(data);
      setFetched(true);

      const today = new Date();
      const enAlerte = data.filter((p: Produit) => p.quantite <= p.seuilAlerte);
      setProduitsEnAlerte(enAlerte);

      const enPeremption = data.filter((p: Produit) => new Date(p.datePeremption) <= today);
      setProduitsEnPeremption(enPeremption);

    } catch {
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  const handleSubmit = async (values: ProduitForm) => {
    setLoading(true);
    try {
      if (editing) {
        await secureApi.put(`${BASE_URL}/${editing.id}`, { id: editing.id, ...values });
        toast.success("Produit mis à jour");
      } else {
        await secureApi.post(`${BASE_URL}`, { id: 0, ...values, actif: false });
        toast.success("Nouveau produit ajouté (Inactif par défaut)");
      }

      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchProduits();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action impossible');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: Produit) => {
    if (!p.actif) {
      toast.error("Veuillez activer le produit avant de le modifier.");
      return;
    }
    setEditing(p);
    form.setValue("nom", p.nom);
    form.setValue("description", p.description);
    form.setValue("quantite", p.quantite);
    form.setValue("seuilAlerte", p.seuilAlerte);
    form.setValue("datePeremption", p.datePeremption?.split("T")[0] ?? "");
    setShowForm(true);
  };

  const handleToggleActif = async (id: number) => {
    setLoading(true);
    try {
      await secureApi.put(`${BASE_URL}/${id}/toggle-actif`);
      toast.success("État du produit modifié");
      fetchProduits();
    } catch {
      toast.error("Erreur lors de la modification de l'état");
      setLoading(false);
    }
  };

  const filtered = produits.filter(
    (p) =>
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<Produit>[] = [
    { 
      accessorKey: "nom", 
      header: "Produit",
      cell: ({ row }) => {
        const isPerime = new Date(row.original.datePeremption) <= new Date();
        return (
          <div className="flex flex-col">
            <span className={`font-bold text-sm ${isPerime ? "text-rose-500" : "text-foreground"}`}>{row.original.nom}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">ID: #{row.original.id}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{row.original.description}</span>,
    },
    {
      accessorKey: "quantite",
      header: "Stock",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className={`font-black text-sm ${row.original.quantite <= row.original.seuilAlerte ? "text-rose-500" : "text-foreground"}`}>
            {row.original.quantite} Unités
          </span>
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Seuil: {row.original.seuilAlerte}</span>
        </div>
      ),
    },
    {
      accessorKey: "datePeremption",
      header: "Péremption",
      cell: ({ row }) => {
        const date = new Date(row.original.datePeremption);
        const isPerime = date <= new Date();
        return (
          <div className="flex items-center space-x-2 text-xs font-medium">
             <Calendar className={`w-3 h-3 ${isPerime ? "text-rose-500" : "text-muted-foreground"}`} />
             <span className={isPerime ? "text-rose-500 font-bold" : "text-muted-foreground"}>{date.toLocaleDateString()}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "actif",
      header: "État",
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          row.original.actif ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-muted-foreground border-white/5"
        }`}>
          {row.original.actif ? "Actif" : "Inactif"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEdit(row.original)} 
            disabled={!row.original.actif}
            className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors disabled:opacity-20"
            title="Modifier"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleToggleActif(row.original.id)}
            className={`p-2 rounded-lg transition-colors ${row.original.actif ? "hover:bg-rose-500/10 text-rose-500" : "hover:bg-emerald-500/10 text-emerald-500"}`}
            title={row.original.actif ? "Désactiver" : "Activer"}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <DashboardHeader
          title="Gestion du Stock"
          subtitle="Suivez vos produits, gérez les alertes et les péremptions"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setEditing(null);
              form.reset({ nom: "", description: "", quantite: 1, seuilAlerte: 1, datePeremption: "" });
            }}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 organic-pill font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? "Annuler" : "Ajouter un Produit"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {produitsEnAlerte.length > 0 && (
          <div className="glass border-rose-500/20 bg-rose-500/5 p-6 rounded-[32px] flex items-center space-x-6 animate-in slide-in-from-left-4 duration-500">
             <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500">
                <AlertTriangle className="w-8 h-8" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-rose-500 uppercase tracking-tighter">Stock Critique</h3>
                <p className="text-sm text-rose-500/70 font-medium">{produitsEnAlerte.length} produits sous le seuil d'alerte.</p>
             </div>
          </div>
        )}

        {produitsEnPeremption.length > 0 && (
          <div className="glass border-rose-600/30 bg-rose-600/10 p-6 rounded-[32px] flex items-center space-x-6 animate-in slide-in-from-right-4 duration-500">
             <div className="w-14 h-14 rounded-2xl bg-rose-600/20 flex items-center justify-center text-rose-600">
                <ShieldAlert className="w-8 h-8" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-rose-600 uppercase tracking-tighter">Dates Dépassées</h3>
                <p className="text-sm text-rose-600/70 font-medium">{produitsEnPeremption.length} produits périmés à retirer du stock.</p>
             </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="glass border-white/5 p-8 organic-card shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-inner">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {editing ? "Modifier le produit" : "Enregistrement Produit"}
              </h2>
              <p className="text-sm text-muted-foreground">Définissez les caractéristiques techniques et les seuils</p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Nom commercial</label>
                  <TextInput
                    name="nom"
                    form={form}
                    placeholder="Ex: Composite A3 Seringue"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Description technique</label>
                  <TextInput
                    name="description"
                    form={form}
                    placeholder="Détails, volume, marque..."
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Stock Initial</label>
                  <TextInput
                    name="quantite"
                    form={form}
                    placeholder="Quantité"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Seuil d'alerte</label>
                  <TextInput
                    name="seuilAlerte"
                    form={form}
                    placeholder="Seuil"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Péremption</label>
                  <input
                    type="date"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 px-6 text-sm outline-none focus:border-primary/50 transition-all text-foreground"
                    {...form.register("datePeremption")}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-white/5">
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 organic-pill text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50" 
                  disabled={loading}
                >
                  {loading ? "Traitement..." : editing ? "Mettre à jour" : "Inscrire au catalogue"}
                </button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="glass border-white/5 shadow-2xl organic-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-white">Inventaire Central</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">{produits.length} RÉFÉRENCES</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                className="bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all w-64"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchProduits} 
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

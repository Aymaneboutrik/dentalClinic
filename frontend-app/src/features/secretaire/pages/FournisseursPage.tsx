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
import { Truck, Plus, Phone, MapPin, Edit3, Trash2, Search, X, Users } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "/stock/Fournisseur";

const fournisseurSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  adresse: z.string().min(1, "L'adresse est obligatoire"),
  telephone: z.string().min(1, "Le téléphone est obligatoire"),
});

type FournisseurForm = z.infer<typeof fournisseurSchema>;

interface Fournisseur {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
}

export default function FournisseursPage() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Fournisseur | null>(null);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const form = useForm<FournisseurForm>({
    resolver: zodResolver(fournisseurSchema),
    defaultValues: { nom: "", adresse: "", telephone: "" },
  });

  const fetchFournisseurs = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      setFournisseurs(res.data);
      setFetched(true);
    } catch {
      toast.error("Erreur lors du chargement des fournisseurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const handleSubmit = async (values: FournisseurForm) => {
    setLoading(true);
    try {
      if (editing) {
        await secureApi.put(`${BASE_URL}/${editing.id}`, { id: editing.id, ...values });
        toast.success("Fournisseur mis à jour");
      } else {
        await secureApi.post(`${BASE_URL}`, { id: 0, ...values });
        toast.success("Fournisseur créé");
      }
      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchFournisseurs();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (f: Fournisseur) => {
    setEditing(f);
    form.setValue("nom", f.nom);
    form.setValue("adresse", f.adresse);
    form.setValue("telephone", f.telephone);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce fournisseur ?")) return;
    setLoading(true);
    try {
      await secureApi.delete(`${BASE_URL}/${id}`);
      toast.success("Fournisseur supprimé");
      fetchFournisseurs();
    } catch {
      toast.error("Erreur lors de la suppression");
      setLoading(false);
    }
  };

  const filtered = fournisseurs.filter(
    (f) =>
      f.nom.toLowerCase().includes(search.toLowerCase()) ||
      f.adresse.toLowerCase().includes(search.toLowerCase()) ||
      f.telephone.includes(search)
  );

  const columns: ColumnDef<Fournisseur>[] = [
    { 
      accessorKey: "nom", 
      header: "Fournisseur",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {row.original.nom?.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-foreground">{row.original.nom}</span>
        </div>
      )
    },
    { 
      accessorKey: "telephone", 
      header: "Téléphone",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground font-medium">
          <Phone className="w-3 h-3 text-primary/40" />
          <span>{row.original.telephone}</span>
        </div>
      )
    },
    { 
      accessorKey: "adresse", 
      header: "Adresse",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="w-3 h-3 text-primary/40 flex-shrink-0" />
          <span className="truncate max-w-[200px]">{row.original.adresse}</span>
        </div>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEdit(row.original)} 
            className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row.original.id)} 
            className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
            title="Supprimer"
          >
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
          title="Fournisseurs"
          subtitle="Gérez vos partenaires et sources d'approvisionnement"
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
            <span>{showForm ? "Annuler" : "Nouveau Fournisseur"}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass border-white/5 p-8 organic-card shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-inner">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {editing ? "Modifier le fournisseur" : "Inscrire un Nouveau Fournisseur"}
              </h2>
              <p className="text-sm text-muted-foreground">Renseignez les coordonnées de votre partenaire</p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Nom de l'entreprise</label>
                  <TextInput
                    name="nom"
                    form={form}
                    placeholder="Ex: Medical Supply Co."
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Contact Téléphonique</label>
                  <TextInput
                    name="telephone"
                    form={form}
                    placeholder="Ex: 0522..."
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Adresse complète</label>
                <TextInput
                  name="adresse"
                  form={form}
                  placeholder="Ex: 123 Rue de la Santé, Casablanca"
                  className="bg-white/5 border-white/5 rounded-2xl h-14"
                />
              </div>
              <div className="flex justify-end pt-6 border-t border-white/5">
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 organic-pill text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50" 
                  disabled={loading}
                >
                  {loading ? "Traitement..." : editing ? "Mettre à jour" : "Inscrire le fournisseur"}
                </button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="glass border-white/5 shadow-2xl organic-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-white">Répertoire des Partenaires</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">{fournisseurs.length} INSCRITS</span>
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
              onClick={fetchFournisseurs} 
              disabled={loading} 
              className="p-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-muted-foreground transition-all"
              title="Actualiser"
            >
              <Users className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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

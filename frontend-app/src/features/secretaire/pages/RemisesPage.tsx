import { useState, useEffect } from "react";
import secureApi from "@apis/instances/secure-api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Form } from "@components/ui/form";
import TextInput from "@components/inputs/text-input";
import { DashboardHeader } from "@components/commons/dashboard/DashboardHeader";
import { Tag, Plus, Search, X, Edit3, Trash2, CheckCircle2, Clock, Info, Percent, DollarSign } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "/remises";

const remiseSchema = z.object({
  valeur: z.coerce.number().min(0, "La valeur est obligatoire"),
  description: z.string().min(1, "La description est obligatoire"),
  typeRemise: z.enum(["FIXE", "VARIABLE"]),
  factureId: z.coerce.number().min(1, "L'ID de la facture est obligatoire"),
});

type RemiseForm = z.infer<typeof remiseSchema>;

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

export default function RemisesPage() {
  const [remises, setRemises] = useState<Remise[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Remise | null>(null);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const form = useForm<RemiseForm>({
    resolver: zodResolver(remiseSchema),
    defaultValues: {
      valeur: 0,
      description: "",
      typeRemise: "FIXE",
      factureId: 0,
    },
  });

  const fetchRemises = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      setRemises(res.data);
      setFetched(true);
    } catch {
      toast.error("Erreur lors du chargement des remises");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemises();
  }, []);

  const handleSubmit = async (values: RemiseForm) => {
    setLoading(true);
    try {
      if (editing) {
        await secureApi.put(`${BASE_URL}/${editing.id}`, { id: editing.id, ...values, estAutorisee: editing.estAutorisee });
        toast.success("Remise mise à jour");
      } else {
        await secureApi.post(`${BASE_URL}`, { ...values, estAutorisee: false });
        toast.success("Nouvelle remise enregistrée");
      }
      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchRemises();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur de sauvegarde (La facture doit être impayée).");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (r: Remise) => {
    setEditing(r);
    form.setValue("valeur", r.valeur);
    form.setValue("description", r.description);
    form.setValue("typeRemise", r.typeRemise as "FIXE" | "VARIABLE");
    form.setValue("factureId", r.factureId);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette remise ?")) return;
    setLoading(true);
    try {
      await secureApi.delete(`${BASE_URL}/${id}`);
      toast.success("Remise supprimée");
      fetchRemises();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoriser = async (r: Remise) => {
    if (!confirm("Autoriser cette remise à s'appliquer sur la facture ?")) return;
    setLoading(true);
    try {
      await secureApi.put(`${BASE_URL}/${r.id}`, {
        valeur: r.valeur,
        dateRemise: r.dateRemise,
        description: r.description,
        typeRemise: r.typeRemise,
        factureId: r.factureId,
        estAutorisee: true,
      });
      toast.success("Remise autorisée");
      fetchRemises();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'autorisation.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = remises.filter(
    (r) =>
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.factureId.toString().includes(search)
  );

  const columns: ColumnDef<Remise>[] = [
    { 
      accessorKey: "factureId", 
      header: "Facture",
      cell: ({ row }) => <span className="font-mono text-xs font-bold text-muted-foreground">#FAC-{row.original.factureId}</span>
    },
    { 
      accessorKey: "description", 
      header: "Motif",
      cell: ({ row }) => <span className="font-bold text-foreground text-sm">{row.original.description}</span>
    },
    { 
      accessorKey: "valeur", 
      header: "Remise",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg">
            <span className="font-black text-sm text-primary">
              {row.original.valeur} {row.original.typeRemise === "VARIABLE" ? "%" : "MAD"}
            </span>
          </div>
          {row.original.montantCalcule && (
             <span className="text-[10px] font-bold text-rose-500">(-{row.original.montantCalcule} MAD)</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "estAutorisee",
      header: "Statut",
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          row.original.estAutorisee ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
        }`}>
          {row.original.estAutorisee ? "Appliquée" : "En attente"}
        </span>
      ),
    },
    {
      accessorKey: "dateRemise",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-muted-foreground">{row.original.dateRemise?.split("T")[0] ?? "-"}</span>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {!row.original.estAutorisee && (
            <button onClick={() => handleAutoriser(row.original)} className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-colors" title="Autoriser">
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => handleEdit(row.original)} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors" title="Modifier">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row.original.id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors" title="Supprimer">
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
          title="Gestions des Remises"
          subtitle="Appliquez et gérez les réductions sur les factures patients"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setEditing(null);
              form.reset({ valeur: 0, description: "", typeRemise: "FIXE", factureId: 0 });
            }}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 organic-pill font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? "Annuler" : "Créer une Remise"}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass border-white/5 p-8 organic-card shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-inner">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {editing ? "Modifier la remise" : "Nouvelle Offre Commerciale"}
              </h2>
              <p className="text-sm text-muted-foreground">Définissez les paramètres de la réduction</p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">ID Facture Cible</label>
                  <TextInput
                    name="factureId"
                    form={form}
                    placeholder="Ex: 105"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Motif / Description</label>
                  <TextInput
                    name="description"
                    form={form}
                    placeholder="Ex: Geste commercial"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Type de réduction</label>
                  <select
                    className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 px-6 text-sm outline-none focus:border-primary/50 transition-all text-foreground"
                    {...form.register("typeRemise")}
                  >
                    <option value="FIXE" className="bg-[#081028]">Montant Fixe (MAD)</option>
                    <option value="VARIABLE" className="bg-[#081028]">Pourcentage (%)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Valeur de la remise</label>
                  <TextInput
                    name="valeur"
                    form={form}
                    placeholder="0"
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
                  {loading ? "Traitement..." : editing ? "Mettre à jour" : "Générer la remise"}
                </button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="glass border-white/5 shadow-2xl organic-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-white">Journal des Remises</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">{remises.length} CRÉÉES</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                className="bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all w-64"
                placeholder="Filtrer par motif ou facture..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchRemises} 
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

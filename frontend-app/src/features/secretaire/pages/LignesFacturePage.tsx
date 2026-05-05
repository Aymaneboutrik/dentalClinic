import { useState, useEffect } from "react";
import secureApi from "@apis/instances/secure-api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import { Form } from "@components/ui/form";
import TextInput from "@components/inputs/text-input";
import { DashboardHeader } from "@components/commons/dashboard/DashboardHeader";
import { FileText, Plus, Search, X, Edit3, Trash2, Hash, Activity, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "/lignes-facture";

const ligneFactureSchema = z.object({
  factureId: z.coerce.number().min(1, "L'ID de la facture est obligatoire"),
  acteMedicalId: z.coerce.number().min(1, "L'ID de l'acte médical est obligatoire"),
  quantite: z.coerce.number().min(1, "La quantité doit être au moins 1"),
});

type LigneFactureForm = z.infer<typeof ligneFactureSchema>;

interface LigneFacture {
  id: number;
  factureId: number;
  acteMedicalId: number;
  libelleActe: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export default function LignesFacturePage() {
  const [lignes, setLignes] = useState<LigneFacture[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);
  const [editing, setEditing] = useState<LigneFacture | null>(null);
  const [factureIdFilter, setFactureIdFilter] = useState<string>(() => {
    return localStorage.getItem("factureIdFilter") || "";
  });

  useEffect(() => {
    localStorage.setItem("factureIdFilter", factureIdFilter);
  }, [factureIdFilter]);

  const form = useForm<LigneFactureForm>({
    resolver: zodResolver(ligneFactureSchema),
    defaultValues: { factureId: 0, acteMedicalId: 0, quantite: 1 },
  });

  const fetchLignes = async (overrideId?: number) => {
    setLoading(true);
    try {
      const factureId = overrideId !== undefined ? overrideId : Number(factureIdFilter);
      if (!Number.isFinite(factureId) || factureId <= 0) {
        setLignes([]);
        setFetched(true);
        return;
      }

      const res = await secureApi.get(`${BASE_URL}/facture/${factureId}`);
      setLignes(res.data);
      setFetched(true);
    } catch {
      toast.error("Erreur lors du chargement des lignes de facture");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (factureIdFilter) {
      fetchLignes();
    }
  }, []);

  const handleSubmit = async (values: LigneFactureForm) => {
    setLoading(true);
    try {
      if (editing) {
        await secureApi.put(`${BASE_URL}/${editing.id}`, { id: editing.id, ...values });
        toast.success("Ligne mise à jour");
      } else {
        await secureApi.post(`${BASE_URL}`, values);
        toast.success("Ligne ajoutée avec succès");
      }
      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchLignes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur de sauvegarde (La facture est probablement déjà payée).");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (l: LigneFacture) => {
    setEditing(l);
    form.setValue("factureId", l.factureId);
    form.setValue("acteMedicalId", l.acteMedicalId);
    form.setValue("quantite", l.quantite);
    setShowForm(true);
  };


  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette ligne ?")) return;
    setLoading(true);
    try {
      await secureApi.delete(`${BASE_URL}/${id}`);
      toast.success("Ligne supprimée");
      fetchLignes();
    } catch {
      toast.error("Erreur lors de la suppression");
      setLoading(false);
    }
  };

  const filtered = lignes.filter(
    (l) =>
      l.libelleActe?.toLowerCase().includes(search.toLowerCase()) ||
      l.factureId.toString().includes(search)
  );

  const columns: ColumnDef<LigneFacture>[] = [
    { 
      accessorKey: "factureId", 
      header: "Facture",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-muted-foreground">#FAC-{row.original.factureId}</span>
      )
    },
    {
      accessorKey: "acteMedicalId",
      header: "Désignation",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{row.original.libelleActe}</span>
          <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest">ID ACTE: {row.original.acteMedicalId}</span>
        </div>
      ),
    },
    { 
      accessorKey: "quantite", 
      header: "Qté",
      cell: ({ row }) => <span className="font-black text-sm">{row.original.quantite}</span>
    },
    { 
      accessorKey: "prixUnitaire", 
      header: "Prix Unit.",
      cell: ({ row }) => <span className="font-bold text-sm text-emerald-500">{row.original.prixUnitaire} MAD</span>
    },
    { 
      accessorKey: "sousTotal", 
      header: "Total HT",
      cell: ({ row }) => (
        <div className="bg-primary/5 border border-primary/10 px-3 py-1 rounded-lg w-fit">
          <span className="font-black text-sm text-primary">{row.original.sousTotal} MAD</span>
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
          title="Détails de Facturation"
          subtitle="Gérez les actes et les montants associés aux factures"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setEditing(null);
              form.reset({ factureId: Number(factureIdFilter) || 0, acteMedicalId: 0, quantite: 1 });
            }}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 organic-pill font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? "Annuler" : "Ajouter un Acte"}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass border-white/5 p-8 organic-card shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-inner">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {editing ? "Modifier la ligne" : "Ajouter un Acte Médical"}
              </h2>
              <p className="text-sm text-muted-foreground">Associez un acte et sa quantité à la facture</p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">ID Facture</label>
                  <TextInput
                    name="factureId"
                    form={form}
                    placeholder="Ex: 42"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">ID Acte Médical</label>
                  <TextInput
                    name="acteMedicalId"
                    form={form}
                    placeholder="Ex: 101"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Quantité</label>
                  <TextInput
                    name="quantite"
                    form={form}
                    placeholder="1"
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
                  {loading ? "Traitement..." : editing ? "Mettre à jour" : "Ajouter à la facture"}
                </button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="glass border-white/5 shadow-2xl organic-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-white">Actes de la Facture</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">{lignes.length} LIGNES</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                className="bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all w-48"
                placeholder="ID Facture..."
                value={factureIdFilter}
                onChange={(e) => setFactureIdFilter(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                className="bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all w-64"
                placeholder="Filtrer par libellé..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => fetchLignes()} 
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

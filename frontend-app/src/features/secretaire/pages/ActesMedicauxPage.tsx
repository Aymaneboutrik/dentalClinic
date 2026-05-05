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
import { Activity, Plus, Search, X, Edit3, Trash2, Tag, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "/actes-medicaux";

const acteMedicalSchema = z.object({
  libelle: z.string().min(1, "Le libellé est obligatoire"),
  prix: z.coerce.number().min(0, "Le prix est obligatoire"),
  typeActe: z.string().min(1, "La catégorie est obligatoire"),
});

type ActeMedicalForm = z.infer<typeof acteMedicalSchema>;

interface ActeMedical {
  id: number;
  libelle: string;
  prix: number;
  typeActe: string;
}

export default function ActesMedicauxPage() {
  const [actes, setActes] = useState<ActeMedical[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ActeMedical | null>(null);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const form = useForm<ActeMedicalForm>({
    resolver: zodResolver(acteMedicalSchema),
    defaultValues: { libelle: "", prix: 0, typeActe: "" },
  });

  const fetchActes = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      setActes(res.data);
      setFetched(true);
    } catch {
      toast.error("Erreur lors du chargement des actes médicaux");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActes();
  }, []);

  const handleSubmit = async (values: ActeMedicalForm) => {
    setLoading(true);
    try {
      if (editing) {
        await secureApi.put(`${BASE_URL}/${editing.id}`, { id: editing.id, ...values });
        toast.success("Acte médical mis à jour");
      } else {
        await secureApi.post(`${BASE_URL}`, values);
        toast.success("Nouvel acte médical ajouté");
      }
      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchActes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (a: ActeMedical) => {
    setEditing(a);
    form.setValue("libelle", a.libelle);
    form.setValue("prix", a.prix);
    form.setValue("typeActe", a.typeActe);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet acte médical ?")) return;
    setLoading(true);
    try {
      await secureApi.delete(`${BASE_URL}/${id}`);
      toast.success("Acte médical supprimé");
      fetchActes();
    } catch {
      toast.error("Erreur lors de la suppression");
      setLoading(false);
    }
  };

  const filtered = actes.filter(
    (a) =>
      a.libelle.toLowerCase().includes(search.toLowerCase()) ||
      a.typeActe.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<ActeMedical>[] = [
    { 
      accessorKey: "libelle", 
      header: "Acte Médical",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-sm">{row.original.libelle}</span>
          <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest">ID: #{row.original.id}</span>
        </div>
      )
    },
    { 
      accessorKey: "typeActe", 
      header: "Catégorie",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Tag className="w-3 h-3 text-primary/40" />
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{row.original.typeActe}</span>
        </div>
      )
    },
    { 
      accessorKey: "prix", 
      header: "Tarif",
      cell: ({ row }) => (
        <div className="bg-primary/5 border border-primary/10 px-3 py-1 rounded-lg w-fit">
          <span className="font-black text-sm text-primary">{row.original.prix} MAD</span>
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
          title="Catalogue des Actes"
          subtitle="Gérez la nomenclature et les tarifs des actes médicaux"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setEditing(null);
              form.reset({ libelle: "", prix: 0, typeActe: "" });
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
                {editing ? "Modifier l'acte médical" : "Définir un Nouvel Acte"}
              </h2>
              <p className="text-sm text-muted-foreground">Spécifiez le libellé, la catégorie et le tarif appliqué</p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Libellé de l'acte</label>
                  <TextInput
                    name="libelle"
                    form={form}
                    placeholder="Ex: Détartrage complet"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Catégorie / Type</label>
                  <TextInput
                    name="typeActe"
                    form={form}
                    placeholder="Ex: Soins"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Tarif (MAD)</label>
                  <TextInput
                    name="prix"
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
                  {loading ? "Traitement..." : editing ? "Mettre à jour" : "Inscrire l'acte"}
                </button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="glass border-white/5 shadow-2xl organic-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-white">Nomenclature Médicale</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">{actes.length} ACTES RÉFÉRENCÉS</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                className="bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all w-64"
                placeholder="Rechercher un acte..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchActes} 
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

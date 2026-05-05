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
import { DollarSign, Plus, Search, X, Edit3, Trash2, Calendar, CreditCard, Banknote, Landmark, Clock } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "/paiements";

const paiementSchema = z.object({
  factureId: z.coerce.number().min(1, "L'ID de la facture est obligatoire"),
  montant: z.coerce.number().min(0.01, "Le montant doit être supérieur à 0"),
  modePaiement: z.enum(["ESPECES", "CARTE_BANCAIRE", "CHEQUE", "VIREMENT"]),
});

type PaiementForm = z.infer<typeof paiementSchema>;

interface Paiement {
  id: number;
  factureId: number;
  montant: number;
  datePaiement: string;
  modePaiement: string;
}

export default function PaiementsPage() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Paiement | null>(null);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const form = useForm<PaiementForm>({
    resolver: zodResolver(paiementSchema),
    defaultValues: {
      factureId: 0,
      montant: 0,
      modePaiement: "ESPECES",
    },
  });

  const fetchPaiements = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      setPaiements(res.data);
      setFetched(true);
    } catch {
      toast.error("Erreur lors du chargement des paiements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaiements();
  }, []);

  const handleSubmit = async (values: PaiementForm) => {
    setLoading(true);
    try {
      if (editing) {
        await secureApi.put(`${BASE_URL}/${editing.id}`, { id: editing.id, ...values });
        toast.success("Paiement mis à jour");
      } else {
        await secureApi.post(`${BASE_URL}`, values);
        toast.success("Paiement enregistré avec succès");
      }
      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchPaiements();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur de sauvegarde (Vérifiez le solde de la facture).");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: Paiement) => {
    setEditing(p);
    form.setValue("factureId", p.factureId);
    form.setValue("montant", p.montant);
    form.setValue("modePaiement", p.modePaiement as "ESPECES" | "CARTE_BANCAIRE" | "CHEQUE" | "VIREMENT");
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce paiement ?")) return;
    setLoading(true);
    try {
      await secureApi.delete(`${BASE_URL}/${id}`);
      toast.success("Paiement supprimé");
      fetchPaiements();
    } catch {
      toast.error("Erreur lors de la suppression");
      setLoading(false);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "ESPECES": return <Banknote className="w-4 h-4" />;
      case "CARTE_BANCAIRE": return <CreditCard className="w-4 h-4" />;
      case "CHEQUE": return <FileText className="w-4 h-4" />;
      case "VIREMENT": return <Landmark className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const filtered = paiements.filter(
    (p) =>
      p.modePaiement.toLowerCase().includes(search.toLowerCase()) ||
      p.factureId.toString().includes(search)
  );

  const columns: ColumnDef<Paiement>[] = [
    { 
      accessorKey: "factureId", 
      header: "Facture",
      cell: ({ row }) => <span className="font-mono text-xs font-bold text-muted-foreground">#FAC-{row.original.factureId}</span>
    },
    { 
      accessorKey: "montant", 
      header: "Montant",
      cell: ({ row }) => (
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg w-fit">
          <span className="font-black text-sm text-emerald-500">{row.original.montant} MAD</span>
        </div>
      )
    },
    { 
      accessorKey: "modePaiement", 
      header: "Mode",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-primary">
          {getModeIcon(row.original.modePaiement)}
          <span>{row.original.modePaiement.replace("_", " ")}</span>
        </div>
      )
    },
    {
      accessorKey: "datePaiement",
      header: "Date",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{row.original.datePaiement?.split("T")[0] ?? "-"}</span>
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
          title="Gestion des Paiements"
          subtitle="Suivi des encaissements et règlements des factures"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setEditing(null);
              form.reset({ factureId: 0, montant: 0, modePaiement: "ESPECES" });
            }}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 organic-pill font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? "Annuler" : "Ajouter un Paiement"}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass border-white/5 p-8 organic-card shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-inner">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {editing ? "Modifier le paiement" : "Nouvel Encaissement"}
              </h2>
              <p className="text-sm text-muted-foreground">Enregistrez un règlement pour une facture spécifique</p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Montant (MAD)</label>
                  <TextInput
                    name="montant"
                    form={form}
                    placeholder="0.00"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Mode de règlement</label>
                <select
                  className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 px-6 text-sm outline-none focus:border-primary/50 transition-all text-foreground"
                  {...form.register("modePaiement")}
                >
                  <option value="ESPECES" className="bg-[#081028]">Espèces</option>
                  <option value="CARTE_BANCAIRE" className="bg-[#081028]">Carte Bancaire</option>
                  <option value="CHEQUE" className="bg-[#081028]">Chèque</option>
                  <option value="VIREMENT" className="bg-[#081028]">Virement</option>
                </select>
              </div>
              <div className="flex justify-end pt-6 border-t border-white/5">
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 organic-pill text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50" 
                  disabled={loading}
                >
                  {loading ? "Traitement..." : editing ? "Mettre à jour" : "Confirmer le règlement"}
                </button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="glass border-white/5 shadow-2xl organic-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-white">Historique des Flux</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/10">{paiements.length} RÉGLÉS</span>
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
              onClick={fetchPaiements} 
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

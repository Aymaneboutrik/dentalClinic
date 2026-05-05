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
import { FileText, Plus, Search, X, Edit3, Trash2, Eye, Calendar, DollarSign, Clock, Receipt, CreditCard, Banknote, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "/factures";

const factureSchema = z.object({
  date: z.string().min(1, "La date est obligatoire"),
});

type FactureForm = z.infer<typeof factureSchema>;

interface Facture {
  id: number;
  montantBrut: number;
  montantNet: number;
  date: string;
  statut: string;
  totalRemises: number;
  resteAPayer: number;
  totalPaye?: number;
}

interface FicheFacture {
  id: number;
  date: string;
  statut: string;
  montantBrut: number;
  totalRemises: number;
  montantNet: number;
  totalPaye: number;
  resteAPayer: number;
  lignesFacture: any[];
  remises: any[];
  paiements: any[];
}

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Facture | null>(null);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);
  const [ficheFacture, setFicheFacture] = useState<FicheFacture | null>(null);

  const form = useForm<FactureForm>({
    resolver: zodResolver(factureSchema),
    defaultValues: { date: new Date().toISOString().split("T")[0] },
  });

  const fetchFactures = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      setFactures(res.data);
      setFetched(true);
    } catch {
      toast.error("Erreur lors du chargement des factures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const handleSubmit = async (values: FactureForm) => {
    setLoading(true);
    try {
      if (editing) {
        await secureApi.put(`${BASE_URL}/${editing.id}`, { id: editing.id, ...values });
        toast.success("Facture mise à jour");
      } else {
        await secureApi.post(`${BASE_URL}`, values);
        toast.success("Facture créée");
      }
      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchFactures();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (f: Facture) => {
    setEditing(f);
    form.setValue("date", f.date?.split("T")[0] ?? "");
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette facture ?")) return;
    setLoading(true);
    try {
      await secureApi.delete(`${BASE_URL}/${id}`);
      toast.success("Facture supprimée");
      fetchFactures();
    } catch {
      toast.error("Erreur lors de la suppression");
      setLoading(false);
    }
  };

  const fetchFicheFacture = async (id: number) => {
    try {
      const res = await secureApi.get(`${BASE_URL}/${id}/fiche`);
      setFicheFacture(res.data);
    } catch {
      toast.error("Erreur lors du chargement de la fiche de facture");
    }
  };

  const filtered = factures.filter(
    (f) =>
      f.id.toString().includes(search) ||
      f.statut.toLowerCase().includes(search.toLowerCase()) ||
      f.date.includes(search)
  );

  const getStatutClass = (statut: string) => {
    switch (statut) {
      case "PAYEE": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "PARTIEL": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    }
  };

  const columns: ColumnDef<Facture>[] = [
    { 
      accessorKey: "id", 
      header: "N° Facture",
      cell: ({ row }) => <span className="font-mono text-xs font-bold text-muted-foreground">#FAC-{row.original.id}</span>
    },
    {
      accessorKey: "date",
      header: "Date d'émission",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{row.original.date?.split("T")[0] ?? "-"}</span>
        </div>
      ),
    },
    { 
      accessorKey: "montantNet", 
      header: "Montant Net",
      cell: ({ row }) => <span className="font-bold text-sm">{row.original.montantNet} MAD</span>
    },
    { 
      accessorKey: "resteAPayer", 
      header: "Reste à régler",
      cell: ({ row }) => (
        <span className={`font-black text-sm ${row.original.resteAPayer > 0 ? "text-rose-500" : "text-emerald-500"}`}>
          {row.original.resteAPayer} MAD
        </span>
      )
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatutClass(row.original.statut)}`}>
          {row.original.statut}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => fetchFicheFacture(row.original.id)} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors" title="Détails">
            <Eye className="w-4 h-4" />
          </button>
          {row.original.statut !== "PAYEE" && (
            <>
              <button onClick={() => handleEdit(row.original)} className="p-2 hover:bg-white/10 text-muted-foreground rounded-lg transition-colors" title="Modifier">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(row.original.id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors" title="Supprimer">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <DashboardHeader
          title="Facturation Patients"
          subtitle="Gérez l'ensemble des factures, paiements et restes à régler"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <button 
            onClick={async () => {
              try {
                setLoading(true);
                await secureApi.post(BASE_URL, { date: new Date().toISOString().split("T")[0] });
                toast.success("Facture générée avec succès");
                fetchFactures();
              } catch {
                toast.error("Erreur lors de la création de la facture");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 organic-pill font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>Créer une Facture</span>
          </button>
        </div>
      </div>

      {showForm && editing && (
        <div className="glass border-white/5 p-8 organic-card shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-inner">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Mise à jour de la date</h2>
              <p className="text-sm text-muted-foreground">Modifiez la date d'émission de la facture #FAC-{editing.id}</p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Date d'émission</label>
                <input
                  type="date"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 px-6 text-sm outline-none focus:border-primary/50 transition-all text-foreground"
                  {...form.register("date")}
                />
              </div>
              <div className="flex justify-end pt-6 border-t border-white/5 gap-3">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-6 py-3 rounded-xl border border-white/5 hover:bg-white/5 transition-all text-sm font-bold">Annuler</button>
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-3 organic-pill text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50" 
                  disabled={loading}
                >
                  {loading ? "Sauvegarde..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {ficheFacture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="glass border-white/10 organic-card p-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative">
            <button onClick={() => setFicheFacture(null)} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-xl transition-colors">
               <X className="w-6 h-6 text-muted-foreground" />
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                   <Receipt className="w-8 h-8 text-primary" />
                   <h2 className="text-3xl font-black tracking-tighter uppercase">Facture #FAC-{ficheFacture.id}</h2>
                </div>
                <div className="flex items-center space-x-4">
                   <span className="text-sm font-medium text-muted-foreground">Émise le {ficheFacture.date}</span>
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatutClass(ficheFacture.statut)}`}>
                      {ficheFacture.statut}
                   </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-8 bg-white/5 p-6 rounded-3xl border border-white/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Montant Net</p>
                  <p className="text-xl font-bold">{ficheFacture.montantNet} MAD</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-1">Déjà Payé</p>
                  <p className="text-xl font-bold text-emerald-500">{ficheFacture.totalPaye} MAD</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-500/60 mb-1">Reste à payer</p>
                  <p className="text-xl font-bold text-rose-500">{ficheFacture.resteAPayer} MAD</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-10">
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-1.5 h-6 bg-primary rounded-full" />
                  <h3 className="text-lg font-bold">Actes & Prestations</h3>
                </div>
                <div className="glass border-white/5 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acte Médical</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Qté</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">P.U (MAD)</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Sous-Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {ficheFacture.lignesFacture.length > 0 ? (
                        ficheFacture.lignesFacture.map((l) => (
                          <tr key={l.id || l.acteMedicalId} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-bold block">{l.libelleActe}</span>
                              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">ID: {l.acteMedicalId}</span>
                            </td>
                            <td className="px-6 py-4 font-bold text-sm">{l.quantite}</td>
                            <td className="px-6 py-4 text-sm font-medium">{l.prixUnitaire}</td>
                            <td className="px-6 py-4 text-sm font-black text-primary text-right">{l.sousTotal} MAD</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground text-sm">Aucun acte enregistré</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <section>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                    <h3 className="text-lg font-bold">Remises Appliquées</h3>
                  </div>
                  <div className="glass border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Valeur</th>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Impact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {ficheFacture.remises.length > 0 ? (
                          ficheFacture.remises.map((r) => (
                            <tr key={r.id || r.dateRemise} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">{r.typeRemise}</td>
                              <td className="px-6 py-3 font-bold text-sm">{r.valeur} {r.typeRemise === 'POURCENTAGE' ? '%' : 'MAD'}</td>
                              <td className="px-6 py-3 font-black text-rose-500 text-right">-{r.montantCalcule} MAD</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground text-xs">Aucune remise</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    <h3 className="text-lg font-bold">Règlements Reçus</h3>
                  </div>
                  <div className="glass border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mode</th>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Montant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {ficheFacture.paiements.length > 0 ? (
                          ficheFacture.paiements.map((p) => (
                            <tr key={p.id || p.datePaiement} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-3">
                                 <div className="flex items-center space-x-2">
                                    {p.modePaiement === "ESPECES" ? <Banknote className="w-3 h-3 text-emerald-500" /> : <CreditCard className="w-3 h-3 text-primary" />}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{p.modePaiement}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-3 text-xs font-medium text-muted-foreground">{p.datePaiement?.split("T")[0]}</td>
                              <td className="px-6 py-3 font-black text-emerald-500 text-right">+{p.montant} MAD</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground text-xs">En attente de paiement</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass border-white/5 shadow-2xl organic-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-white">Registre des Factures</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">{factures.length} ÉMISES</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                className="bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all w-64"
                placeholder="N°, Statut, Date..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchFactures} 
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

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import TextInput from "@components/inputs/text-input";
import { DashboardHeader } from "@components/commons/dashboard/DashboardHeader";
import SelectInput from "@components/inputs/select-input";
import secureApi from "@apis/instances/secure-api";
import { Input } from "@components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { ShoppingCart, Plus, Search, X, Edit3, Trash2, FileText, Calendar, Truck, Clock, Package, DollarSign, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "/stock/Commande";
const FOURNISSEUR_URL = "/stock/Fournisseur";

const commandeSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  fournisseurId: z.coerce.number().min(1, "Le fournisseur est obligatoire"),
  date: z.string().optional(),
});

type CommandeForm = z.infer<typeof commandeSchema>;

interface Commande {
  id: number;
  nom: string;
  date: string;
  statut: string;
  fournisseurId: number;
}

const statutLabels: Record<string, string> = {
  EnAttente: "En attente",
  Validee: "Validée",
  Refusee: "Refusée",
};

const statutColors: Record<string, string> = {
  EnAttente: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Validee: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Refusee: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const getStatutKey = (s: any): string => {
  if (s === 0 || s === "EnAttente" || s === "0") return "EnAttente";
  if (s === 1 || s === "Validee" || s === "1") return "Validee";
  if (s === 2 || s === "Refusee" || s === "2") return "Refusee";
  return "EnAttente";
};

interface Fournisseur {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
}

interface LigneCommande {
  id: number;
  produitId: number;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  commandeId: number;
}

interface BonCommande {
  id: number;
  nom: string;
  date: string;
  statut: number;
  fournisseurId: number;
  fournisseur: Fournisseur | null;
  lignes: LigneCommande[];
}

export default function CommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Commande | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);
  const [bonCommande, setBonCommande] = useState<BonCommande | null>(null);
  const [showBon, setShowBon] = useState(false);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loadingFournisseurs, setLoadingFournisseurs] = useState(false);

  const form = useForm<CommandeForm>({
    resolver: zodResolver(commandeSchema),
    defaultValues: { nom: "", fournisseurId: "0" as unknown as number, date: "" },
  });

  const toDateInputValue = (isoOrDate?: string) => {
    if (!isoOrDate) return "";
    const s = String(isoOrDate);
    return s.includes("T") ? s.split("T")[0] : s;
  };

  const normalizeDateForApi = (yyyyMmDd?: string) => {
    if (!yyyyMmDd) return undefined;
    const s = String(yyyyMmDd);
    if (s.includes("T")) return s;
    return `${s}T00:00:00`;
  };

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      const mappedData = res.data.map((c: any) => ({
        ...c,
        statut: (!c.statut || c.statut === 0 || c.statut === "EnAttente") ? "EnAttente" : (c.statut === 1 || c.statut === "Validee") ? "Validee" : "Refusee",
      }));
      setCommandes(mappedData);
      setFetched(true);
    } catch {
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const fetchFournisseurs = async () => {
    setLoadingFournisseurs(true);
    try {
      const res = await secureApi.get(`${FOURNISSEUR_URL}`);
      setFournisseurs(res.data);
    } catch {
      console.warn("Impossible de charger les fournisseurs.");
    } finally {
      setLoadingFournisseurs(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
    fetchFournisseurs();
  }, []);

  const handleSubmit = async (values: CommandeForm) => {
    setLoading(true);
    try {
      if (editing) {
        const statutInt = editing.statut === "EnAttente" ? 0 : editing.statut === "Validee" ? 1 : 2;
        const normalizedDate = normalizeDateForApi(values.date) ?? normalizeDateForApi(editing.date);
        await secureApi.put(`${BASE_URL}/${editing.id}`, {
          id: editing.id,
          nom: values.nom,
          fournisseurId: values.fournisseurId,
          ...(normalizedDate ? { date: normalizedDate } : {}),
          statut: statutInt,
        });
        toast.success("Commande mise à jour");
      } else {
        await secureApi.post(`${BASE_URL}`, { id: 0, nom: values.nom, fournisseurId: values.fournisseurId, statut: 0 });
        toast.success("Commande créée avec succès");
      }
      
      form.reset();
      setShowForm(false);
      setEditing(null);
      setEditOpen(false);
      fetchCommandes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Sauvegarde échouée');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (c: Commande) => {
    if (c.statut !== "EnAttente") {
      toast.error("Impossible de modifier une commande déjà traitée.");
      return;
    }
    setEditing(c);
    form.setValue("nom", c.nom);
    form.setValue("fournisseurId", String(c.fournisseurId) as unknown as number);
    form.setValue("date", toDateInputValue(c.date));
    setEditOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette commande ?")) return;
    setLoading(true);
    try {
      await secureApi.delete(`${BASE_URL}/${id}`);
      toast.success("Commande supprimée");
      fetchCommandes();
    } catch {
      toast.error("Action impossible.");
      setLoading(false);
    }
  };

  const handleGenererBon = async (id: number) => {
    try {
      const res = await secureApi.get(`${BASE_URL}/${id}/bon`);
      setBonCommande(res.data);
      setShowBon(true);
    } catch {
      toast.error("Erreur lors de la génération du bon de commande.");
    }
  };

  const filtered = commandes.filter(
    (c) =>
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      statutLabels[c.statut]?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<Commande>[] = [
    { 
      accessorKey: "id", 
      header: "Référence",
      cell: ({ row }) => <span className="font-mono text-xs font-bold text-muted-foreground">#ORD-{row.original.id}</span>
    },
    { 
      accessorKey: "nom", 
      header: "Désignation",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-sm">{row.original.nom}</span>
          <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest">FNS: #{row.original.fournisseurId}</span>
        </div>
      )
    },
    {
      accessorKey: "date",
      header: "Créée le",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{row.original.date ? new Date(row.original.date).toLocaleDateString() : "-"}</span>
        </div>
      ),
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statutColors[row.original.statut]}`}>
          {statutLabels[row.original.statut] || row.original.statut}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.statut === "EnAttente" && (
            <>
              <button onClick={() => handleEdit(row.original)} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(row.original.id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button onClick={() => handleGenererBon(row.original.id)} className="p-2 hover:bg-white/10 text-muted-foreground rounded-lg transition-colors" title="Bon de Commande">
            <FileText className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <DashboardHeader
          title="Commandes Fournisseurs"
          subtitle="Suivez l'approvisionnement et les ordres d'achat du cabinet"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setEditing(null);
              form.reset({ nom: "", fournisseurId: 0 as any, date: "" });
            }}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 organic-pill font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? "Annuler" : "Nouvelle Commande"}</span>
          </button>
        </div>
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setEditing(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[720px] glass border-white/5 shadow-2xl organic-card">
          <DialogHeader className="mb-6">
            <div className="flex items-center space-x-3">
               <div className="p-2 bg-primary/20 rounded-xl text-primary">
                  <Edit3 className="w-5 h-5" />
               </div>
               <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Édition Commande</DialogTitle>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Libellé</label>
                  <TextInput
                    name="nom"
                    form={form}
                    placeholder="Ex: Achat Gants Latex"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Date d'édition</FormLabel>
                      <Input type="date" className="bg-white/5 border-white/5 rounded-2xl h-14 px-6" {...field} value={field.value || ""} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Fournisseur Partenaire</label>
                <SelectInput
                  name="fournisseurId"
                  form={form}
                  placeholder={loadingFournisseurs ? "Chargement..." : "Sélectionner un fournisseur"}
                  isLoading={loadingFournisseurs}
                  data={fournisseurs.map((f) => ({ label: `${f.nom} (ID: ${f.id})`, value: String(f.id) }))}
                  className="bg-white/5 border-white/5 rounded-2xl h-14"
                />
              </div>

              <DialogFooter className="mt-8 border-t border-white/5 pt-6">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-8 py-3 rounded-xl border border-white/5 hover:bg-white/5 transition-all text-sm font-bold"
                >
                  Annuler
                </button>
                <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-3 organic-pill text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95" disabled={loading}>
                  {loading ? "Enregistrement..." : "Sauvegarder"}
                </button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {showForm && (
        <div className="glass border-white/5 p-8 organic-card shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-inner">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Initialisation Commande</h2>
              <p className="text-sm text-muted-foreground">La date sera définie automatiquement à la validation</p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">Nom du projet d'achat</label>
                  <TextInput
                    name="nom"
                    form={form}
                    placeholder="Ex: Réapprovisionnement Juin"
                    className="bg-white/5 border-white/5 rounded-2xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 px-1">ID Fournisseur</label>
                  <TextInput
                    name="fournisseurId"
                    form={form}
                    placeholder="Saisissez l'ID"
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
                  {loading ? "Traitement..." : "Lancer la commande"}
                </button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {showBon && bonCommande && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <div className="glass border-white/10 organic-card p-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative">
              <button onClick={() => setShowBon(false)} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-xl transition-colors">
                 <X className="w-6 h-6 text-muted-foreground" />
              </button>

              <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                     <Package className="w-10 h-10 text-primary" />
                     <h2 className="text-4xl font-black tracking-tighter uppercase">Bon de Commande</h2>
                  </div>
                  <div className="flex items-center space-x-4">
                     <span className="font-mono text-sm text-muted-foreground">REF: #CMD-{bonCommande.id}</span>
                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statutColors[getStatutKey(bonCommande.statut)]}`}>
                        {statutLabels[getStatutKey(bonCommande.statut)]}
                     </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Date d'émission</p>
                   <p className="text-lg font-bold">{new Date(bonCommande.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-6 bg-primary rounded-full" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary/60">Informations Projet</h3>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-2xl font-bold mb-1">{bonCommande.nom}</p>
                    <p className="text-sm text-muted-foreground">Ordre d'achat interne</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-6 bg-primary rounded-full" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary/60">Destinataire (Fournisseur)</h3>
                  </div>
                  {bonCommande.fournisseur ? (
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-3">
                      <p className="text-2xl font-bold">{bonCommande.fournisseur.nom}</p>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                           <Truck className="w-3 h-3" />
                           <span>{bonCommande.fournisseur.adresse || "---"}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                           <Clock className="w-3 h-3" />
                           <span>Tél: {bonCommande.fournisseur.telephone || "---"}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-500/10 p-6 rounded-3xl border border-rose-500/20 flex items-center space-x-3">
                       <ShieldAlert className="w-5 h-5 text-rose-500" />
                       <p className="text-sm font-bold text-rose-500">Données fournisseur absentes</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6 mb-12">
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary/60">Détails des articles</h3>
                </div>
                <div className="glass border-white/5 rounded-[32px] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/5">
                      <tr>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Produit</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Quantité</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">P.U (MAD)</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Total HT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bonCommande.lignes.map((l) => (
                        <tr key={l.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-4">
                            <span className="font-bold text-sm block">Article #{l.produitId}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">ID STOCK: {l.produitId}</span>
                          </td>
                          <td className="px-8 py-4 text-center font-black text-sm">{l.quantite}</td>
                          <td className="px-8 py-4 text-right text-sm font-medium">{l.prixUnitaire.toFixed(2)}</td>
                          <td className="px-8 py-4 text-right font-black text-primary text-sm">{l.sousTotal.toFixed(2)} MAD</td>
                        </tr>
                      ))}
                      {bonCommande.lignes.length === 0 && (
                        <tr><td colSpan={4} className="px-8 py-12 text-center text-muted-foreground text-sm italic">Aucune ligne de commande enregistrée</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-primary/5 border border-primary/10 p-10 rounded-[40px] flex items-center space-x-12 min-w-[400px]">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Total de la commande</p>
                    <p className="text-4xl font-black text-foreground">
                      {bonCommande.lignes.reduce((acc, l) => acc + l.sousTotal, 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                      <span className="text-lg font-normal text-muted-foreground ml-3 uppercase tracking-widest">MAD</span>
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                     <CheckCircle2 className="w-8 h-8" />
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}

      <div className="glass border-white/5 shadow-2xl organic-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-white">Registre des Approvisionnements</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">{commandes.length} ORDRES</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                className="bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all w-64"
                placeholder="Nom ou Statut..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchCommandes} 
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

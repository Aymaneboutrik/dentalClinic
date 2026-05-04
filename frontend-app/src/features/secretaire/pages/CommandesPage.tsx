import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import TextInput from "@components/inputs/text-input";
import PageTitle from "@components/commons/page-title";
import Cookie from "js-cookie";
import { TOKEN } from "@configs/vars";
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

const BASE_URL = "/stock/Commande";
const FOURNISSEUR_URL = "/stock/Fournisseur";


const commandeSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  fournisseurId: z.coerce.number().min(1, "Le fournisseur est obligatoire"),
  // Optional: backend can set it automatically on create; edit can override it.
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
  EnAttente: "bg-amber-100 text-amber-800 border-amber-200",
  Validee: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Refusee: "bg-rose-100 text-rose-800 border-rose-200",
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
    // Keep fournisseurId as string in the form state (Select expects string),
    // zodResolver will coerce it to number on submit.
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
    // Keep backend-friendly ISO-ish format without timezone surprises.
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
      console.error("Erreur lors du chargement des commandes");
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
      } else {
        await secureApi.post(`${BASE_URL}`, { id: 0, nom: values.nom, fournisseurId: values.fournisseurId, statut: 0 });
      }
      
      form.reset();
      setShowForm(false);
      setEditing(null);
      setEditOpen(false);
      fetchCommandes();
    } catch (error: any) {
      alert(`Erreur : ${error.response?.data?.message || 'Sauvegarde échouée'}`);
    }
  };

  const handleEdit = (c: Commande) => {
    if (c.statut !== "EnAttente") {
      alert("Impossible de modifier une commande déjà traitée.");
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
    try {
      await secureApi.delete(`${BASE_URL}/${id}`);
      fetchCommandes();
    } catch {
      alert("Action impossible.");
    }
  };

  const handleGenererBon = async (id: number) => {
    try {
      const res = await secureApi.get(`${BASE_URL}/${id}/bon`);
      setBonCommande(res.data);
      setShowBon(true);
    } catch {
      alert("Erreur lors de la génération du bon de commande.");
    }
  };

  const filtered = commandes.filter(
    (c) =>
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      statutLabels[c.statut]?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<Commande>[] = [
    { accessorKey: "id", header: "ID" },
    { 
      accessorKey: "nom", 
      header: "Nom de la commande",
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.nom}</span>
    },
    {
      accessorKey: "date",
      header: "Date de création",
      cell: ({ row }) => row.original.date ? new Date(row.original.date).toLocaleDateString() : "-",
    },
    { 
      accessorKey: "fournisseurId", 
      header: "ID Fournisseur",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.fournisseurId}</span>
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statutColors[row.original.statut] ?? "bg-gray-100 text-gray-700"}`}>
          {statutLabels[row.original.statut] ?? row.original.statut}
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
              <Button size="sm" variant="outline" onClick={() => handleEdit(row.original)} className="border-blue-200 text-blue-600 hover:bg-blue-50" disabled={loading}>
                Modifier
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(row.original.id)} className="border-rose-200 text-rose-600 hover:bg-rose-50" disabled={loading}>
                Supprimer
              </Button>
            </>
          )}
          <Button size="sm" variant="secondary" onClick={() => handleGenererBon(row.original.id)} className="bg-gray-100 text-gray-700 border shadow-sm" disabled={loading}>
            Bon de commande
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-primary text-sm font-medium">Gestion Stock</p>
          <PageTitle title="Gestion des Commandes" desc="Créez et gérez les bons de commande pour vos fournisseurs." />
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            form.reset();
          }}
          className=""
        >
          {showForm ? "Fermer" : "Nouvelle Commande"}
        </Button>
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
        <DialogContent className="sm:max-w-[720px] border-white/10 shadow-2xl rounded-[1.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Modifier la commande</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput
                  label="Nom de la commande"
                  name="nom"
                  form={form}
                  placeholder="Ex: Achat Gants Latex"
                  withAsterisk
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">Date</FormLabel>
                      <Input type="date" className="bg-background" {...field} value={field.value || ""} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <SelectInput
                label="Fournisseur"
                name="fournisseurId"
                form={form}
                withAsterisk
                placeholder={loadingFournisseurs ? "Chargement..." : "Sélectionner un fournisseur"}
                isLoading={loadingFournisseurs}
                data={fournisseurs.map((f) => ({ label: `${f.nom} (ID: ${f.id})`, value: String(f.id) }))}
                className="bg-background"
              />

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button type="submit" className="px-10 shadow-md" disabled={loading}>
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {showForm && (
        <div className="border rounded-xl p-6 mb-6 bg-card">
          <h2 className="text-xl font-bold mb-2">
            {editing ? "Modifier la commande" : "Nouvelle commande"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            La date de création sera définie automatiquement sur aujourd'hui.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput label="Libellé de la commande" name="nom" form={form} placeholder="Ex: Achat Gants Latex" withAsterisk />
                <TextInput label="ID du Fournisseur" name="fournisseurId" form={form} placeholder="Ex: 5" withAsterisk />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditing(null); form.reset(); }}
                >
                  Annuler
                </Button>
                <Button type="submit" className="px-8" disabled={loading}>{editing ? "Enregistrer les modifications" : "Créer la commande"}</Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {showBon && bonCommande && (
        <div className="border rounded-xl p-6 mb-6 bg-card relative overflow-hidden">
          <div className="absolute top-6 right-6">
             <Button variant="outline" onClick={() => setShowBon(false)} className="shadow-sm">
                Fermer
             </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center mb-8 gap-6 border-b pb-6 mt-2">
            <div className="text-left">
              <h2 className="text-3xl font-black text-primary tracking-tighter mb-1">BON DE COMMANDE</h2>
              <p className="text-muted-foreground font-mono">REF: CMD-{bonCommande.id.toString().padStart(5, '0')}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Date de Commande</p>
              <p className="text-lg font-bold">{new Date(bonCommande.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="text-right hidden md:block">
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Détails Commande</h3>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-foreground">{bonCommande.nom}</p>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statutColors[getStatutKey(bonCommande.statut)]}`}>
                    {statutLabels[getStatutKey(bonCommande.statut)]}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Fournisseur</h3>
              {bonCommande.fournisseur ? (
                <div className="space-y-1">
                  <p className="text-xl font-bold text-foreground">{bonCommande.fournisseur.nom}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {bonCommande.fournisseur.telephone || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    {bonCommande.fournisseur.adresse || "N/A"}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-rose-500 font-medium bg-rose-50 p-2 rounded">Données fournisseur indisponibles</p>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border shadow-sm mb-8">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">ID Produit</th>
                  <th className="px-6 py-4 text-center">Quantité</th>
                  <th className="px-6 py-4 text-right">P.U (MAD)</th>
                  <th className="px-6 py-4 text-right">Total (MAD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bonCommande.lignes.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{l.produitId}</td>
                    <td className="px-6 py-4 text-center font-bold text-foreground">{l.quantite}</td>
                    <td className="px-6 py-4 text-right text-muted-foreground">{l.prixUnitaire.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-black text-foreground">{l.sousTotal.toFixed(2)}</td>
                  </tr>
                ))}
                {bonCommande.lignes.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-muted-foreground italic">Aucun produit associé à cette commande.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary border border-primary/20 px-10 py-6 rounded-2xl shadow-xl flex items-center gap-8 min-w-[300px]">
              <div>
                <p className="text-primary/80 text-xs uppercase font-black tracking-widest mb-1">Montant Total</p>
                <p className="text-3xl font-black">{bonCommande.lignes.reduce((acc, l) => acc + l.sousTotal, 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-primary/60">MAD</span></p>
              </div>
              </div>
            </div>  
          </div>
        </div>
      )}

      <div className="border rounded-xl p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-800">Historique des Commandes</h3>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{commandes.length}</span>
          </div>
          <div className="flex gap-3">
            <input
              className="border rounded px-3 py-1 text-sm bg-background"
              placeholder="Rechercher par nom ou statut..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchCommandes} disabled={loading}>
              {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

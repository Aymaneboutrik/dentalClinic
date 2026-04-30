import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import { Form } from "@components/ui/form";
import TextInput from "@components/inputs/text-input";
import PageTitle from "@components/commons/page-title";

const BASE_URL = "/api/Commande";

const commandeSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  fournisseurId: z.coerce.number().min(1, "Le fournisseur est obligatoire"),
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
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);
  const [bonCommande, setBonCommande] = useState<BonCommande | null>(null);
  const [showBon, setShowBon] = useState(false);

  const form = useForm<CommandeForm>({
    resolver: zodResolver(commandeSchema),
    defaultValues: { nom: "", fournisseurId: 0 },
  });

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const mappedData = data.map((c: any) => ({
        ...c,
        statut: c.statut === 0 ? "EnAttente" : c.statut === 1 ? "Validee" : "Refusee"
      }));
      setCommandes(mappedData);
      setFetched(true);
    } catch {
      console.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  const handleSubmit = async (values: CommandeForm) => {
    try {
      let res;
      if (editing) {
        const statutInt = editing.statut === "EnAttente" ? 0 : editing.statut === "Validee" ? 1 : 2;
        res = await fetch(`${BASE_URL}/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...values, statut: statutInt }),
        });
      } else {
        res = await fetch(`${BASE_URL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: 0, ...values, statut: 0 }),
        });
      }
      
      const data = await res.json();

      if (res.ok) {
        form.reset();
        setShowForm(false);
        setEditing(null);
        fetchCommandes();
      } else {
        alert(`Erreur : ${data.message || 'Sauvegarde échouée'}`);
      }
    } catch {
      alert("Erreur réseau lors de la sauvegarde.");
    }
  };

  const handleEdit = (c: Commande) => {
    if (c.statut !== "EnAttente") {
      alert("Impossible de modifier une commande déjà traitée.");
      return;
    }
    setEditing(c);
    form.setValue("nom", c.nom);
    form.setValue("fournisseurId", c.fournisseurId);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette commande ?")) return;
    try {
      const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCommandes();
      } else {
        alert("Action impossible.");
      }
    } catch {
      alert("Erreur réseau.");
    }
  };

  const handleGenererBon = async (id: number) => {
    try {
      const res = await fetch(`${BASE_URL}/${id}/bon`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBonCommande(data);
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
      cell: ({ row }) => <span className="text-xs bg-gray-50 border px-2 py-0.5 rounded">{row.original.fournisseurId}</span>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">Approvisionnement</p>
          <PageTitle title="Gestion des Commandes" desc="Créez et gérez les bons de commande pour vos fournisseurs." />
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            form.reset();
          }}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all"
        >
          {showForm ? "Fermer" : "Nouvelle Commande"}
        </Button>
      </div>

      {showForm && (
        <div className="border border-primary/10 rounded-2xl p-8 mb-6 bg-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{editing ? "Modifier la Commande" : "Nouvelle Commande"}</h2>
              <p className="text-sm text-muted-foreground">La date de création sera définie automatiquement sur aujourd'hui.</p>
            </div>
          </div>
          
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
        <div className="border border-primary/20 rounded-2xl p-8 mb-6 bg-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <Button variant="ghost" size="icon" onClick={() => setShowBon(false)} className="rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
             </Button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6 border-b pb-6">
            <div>
              <h2 className="text-3xl font-black text-primary tracking-tighter mb-1">BON DE COMMANDE</h2>
              <p className="text-muted-foreground font-mono">REF: CMD-{bonCommande.id.toString().padStart(5, '0')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Date de Commande</p>
              <p className="text-lg font-bold">{new Date(bonCommande.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Détails Commande</h3>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">{bonCommande.nom}</p>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statutColors[bonCommande.statut === 0 ? "EnAttente" : bonCommande.statut === 1 ? "Validee" : "Refusee"]}`}>
                    {statutLabels[bonCommande.statut === 0 ? "EnAttente" : bonCommande.statut === 1 ? "Validee" : "Refusee"]}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Fournisseur</h3>
              {bonCommande.fournisseur ? (
                <div className="space-y-1">
                  <p className="text-xl font-bold text-gray-900">{bonCommande.fournisseur.nom}</p>
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

          <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm mb-8">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">ID Produit</th>
                  <th className="px-6 py-4 text-center">Quantité</th>
                  <th className="px-6 py-4 text-right">P.U (MAD)</th>
                  <th className="px-6 py-4 text-right">Total (MAD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bonCommande.lignes.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{l.produitId}</td>
                    <td className="px-6 py-4 text-center font-bold text-gray-700">{l.quantite}</td>
                    <td className="px-6 py-4 text-right text-muted-foreground">{l.prixUnitaire.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-black text-gray-900">{l.sousTotal.toFixed(2)}</td>
                  </tr>
                ))}
                {bonCommande.lignes.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-muted-foreground italic">Aucun produit associé à cette commande.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4">
            <div className="bg-gray-900 text-white px-10 py-6 rounded-2xl shadow-xl flex items-center gap-8 min-w-[300px]">
              <div>
                <p className="text-gray-400 text-xs uppercase font-black tracking-widest mb-1">Montant Total</p>
                <p className="text-3xl font-black">{bonCommande.lignes.reduce((acc, l) => acc + l.sousTotal, 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-gray-400">MAD</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-2xl p-6 bg-white shadow-sm border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-800">Historique des Commandes</h3>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{commandes.length}</span>
          </div>
          <div className="flex gap-3">
            <div className="relative">
               <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
               <input
                 className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none min-w-[250px]"
                 placeholder="Rechercher par nom ou statut..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <Button variant="outline" onClick={fetchCommandes} disabled={loading} className="rounded-xl border-gray-200 hover:bg-gray-50">
              {loading ? "..." : "Actualiser"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

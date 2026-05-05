import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import { Form } from "@components/ui/form";
import TextareaInput from "@components/inputs/textarea-input";
import TextInput from "@components/inputs/text-input";
import PageTitle from "@components/commons/page-title";
import secureApi from "@apis/instances/secure-api";

const BASE_URL = "/stock/CommandeDentiste";
const COMMANDES_URL = "/stock/Commande";

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

interface Commande {
  id: number;
  nom: string;
  date: string;
  statut: string;
  fournisseurId: number;
}

interface LigneCommande {
  id: number;
  produitId: number;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  commandeId: number;
}

const refusSchema = z.object({
  note: z.string().min(1, "La note est obligatoire"),
});
type RefusForm = z.infer<typeof refusSchema>;

const editSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  fournisseurId: z.coerce.number().min(1, "Le fournisseur est obligatoire"),
});
type EditForm = z.infer<typeof editSchema>;

export default function CommandesDoctorPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [showRefusForm, setShowRefusForm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCommande, setEditingCommande] = useState<Commande | null>(null);

  const refusForm = useForm<RefusForm>({
    resolver: zodResolver(refusSchema),
    defaultValues: { note: "" },
  });

  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { nom: "", fournisseurId: 0 },
  });

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(COMMANDES_URL);
      const data = res.data;
      const mappedData = data.map((c: any) => ({
        ...c,
        statut: (!c.statut || c.statut === 0 || c.statut === "EnAttente") ? "EnAttente" : (c.statut === 1 || c.statut === "Validee") ? "Validee" : "Refusee"
      }));
      setCommandes(mappedData);
      setFetched(true);
    } catch (e) {
      console.error("Erreur lors du chargement des commandes", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  const handleValider = async (id: number) => {
    if (!confirm(`Valider la commande #${id} ? Cela mettra à jour le stock automatiquement.`)) return;
    setLoading(true);
    try {
      // Guard: if the order has no lines, the backend cannot create any stock entry movements.
      const lignesRes = await secureApi.get<LigneCommande[]>("/stock/LigneCommande");
      const lignes = (lignesRes.data ?? []).filter((l) => l.commandeId === id);
      if (lignes.length === 0) {
        alert("Impossible de valider: aucune ligne de commande associée. Ajoutez d'abord des lignes à cette commande.");
        setLoading(false);
        return;
      }

      await secureApi.post(`${BASE_URL}/${id}/valider`);
        alert("Commande validée avec succès.");
        await fetchCommandes();
    } catch {
      alert("Erreur réseau.");
      setLoading(false);
    }
  };

  const openRefusForm = (id: number) => {
    setSelectedId(id);
    refusForm.reset();
    setShowRefusForm(true);
  };



  const handleRefuser = async (values: RefusForm) => {
    if (!selectedId) return;
    setLoading(true);
    try {
      await secureApi.post(`${BASE_URL}/${selectedId}/refuser`, values.note, {
        headers: { "Content-Type": "application/json" },
      });
        alert("Commande refusée.");
        setShowRefusForm(false);
        setSelectedId(null);
        refusForm.reset();
        await fetchCommandes();
    } catch {
      alert("Erreur réseau.");
      setLoading(false);
    }
  };

  const columns: ColumnDef<Commande>[] = [
    { accessorKey: "id", header: "ID" },
    { 
      accessorKey: "nom", 
      header: "Libellé",
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
        <span className={`inline-flex items-center organic-pill border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${statutColors[row.original.statut] ?? "bg-gray-100 text-gray-700"}`}>
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

              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 organic-pill px-6 h-9 text-[10px] font-black uppercase tracking-widest"
                onClick={() => handleValider(row.original.id)}
                disabled={loading}
              >
                Valider
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-rose-600 border-rose-500/30 bg-rose-500/10 hover:bg-rose-600 hover:text-white transition-all shadow-lg shadow-rose-500/10 organic-pill px-6 h-9 text-[10px] font-black uppercase tracking-widest"
                onClick={() => openRefusForm(row.original.id)}
                disabled={loading}
              >
                Refuser
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 p-8 border shadow-2xl organic-card bg-card/40 backdrop-blur-md border-white/5">
        <div>
          <p className="text-primary text-[11px] font-black uppercase tracking-widest mb-1">Gestion Stock</p>
          <PageTitle title="Approbation des Commandes" desc="Revoyez les commandes en attente et validez-les pour approvisionner le stock." />
        </div>
        <Button variant="outline" onClick={fetchCommandes} disabled={loading} className="organic-button px-8 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg">
          {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
        </Button>
      </div>



      {showRefusForm && (
        <div className="border border-white/5 organic-card p-8 mb-8 bg-[#081028]/80 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-500 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Motif du Refus</h2>
              <p className="text-sm text-slate-400">Veuillez indiquer pourquoi la commande <span className="text-rose-400 font-bold">#{selectedId}</span> est refusée.</p>
            </div>
          </div>
          
          <Form {...refusForm}>
            <form onSubmit={refusForm.handleSubmit(handleRefuser)} className="space-y-8">
              <div className="organic-card border border-white/5 bg-white/5 p-2 focus-within:border-blue-500/30 transition-all">
                <TextareaInput
                  label="Commentaire de refus"
                  name="note"
                  form={refusForm}
                  placeholder="Ex: Prix trop élevé, produit non conforme..."
                  withAsterisk
                />
              </div>
              <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowRefusForm(false); setSelectedId(null); refusForm.reset(); }}
                  disabled={loading}
                  className="organic-pill px-8 h-12 text-[11px] font-black uppercase tracking-widest border-white/10 hover:bg-white/5 transition-all"
                >
                  Annuler
                </Button>
                <Button type="submit" variant="destructive" className="organic-button bg-rose-600 hover:bg-rose-700 px-10 h-12 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20" disabled={loading}>
                  {loading ? "Traitement..." : "Confirmer le Refus"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="border shadow-2xl organic-card bg-card/40 backdrop-blur-md border-white/5 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h3 className="font-black text-xl text-white tracking-tight">Commandes à traiter</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 text-primary px-3 py-1 organic-pill border border-white/10">{commandes.length} AU TOTAL</span>
          </div>
        </div>
        <DataTable columns={columns} data={commandes} loading={loading} />
      </div>
    </div>
  );
}
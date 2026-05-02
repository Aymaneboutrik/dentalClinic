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
        statut: c.statut === 0 ? "EnAttente" : c.statut === 1 ? "Validee" : "Refusee"
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

  const openEditForm = (commande: Commande) => {
    if (commande.statut !== "EnAttente") {
      alert("Impossible de modifier une commande déjà traitée.");
      return;
    }
    setEditingCommande(commande);
    editForm.setValue("nom", commande.nom);
    editForm.setValue("fournisseurId", commande.fournisseurId);
    setShowEditForm(true);
  };

  const handleEdit = async (values: EditForm) => {
    if (!editingCommande) return;
    setLoading(true);
    try {
      await secureApi.put(`/stock/Commande/${editingCommande.id}`, {
        id: editingCommande.id,
        ...values,
        statut: 0,
      });
      alert("Commande modifiée.");
      setShowEditForm(false);
      setEditingCommande(null);
      editForm.reset();
      await fetchCommandes();
    } catch {
      alert("Modification indisponible côté API (endpoint PUT manquant).");
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette commande ?")) return;
    setLoading(true);
    try {
      await secureApi.delete(`/stock/Commande/${id}`);
      alert("Commande supprimée.");
      await fetchCommandes();
    } catch {
      alert("Erreur lors de la suppression.");
      setLoading(false);
    }
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
              <Button
                size="sm"
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => openEditForm(row.original)}
                disabled={loading}
              >
                Modifier
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
                onClick={() => handleDelete(row.original.id)}
                disabled={loading}
              >
                Supprimer
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                onClick={() => handleValider(row.original.id)}
                disabled={loading}
              >
                Valider
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-primary text-sm font-medium">Gestion Stock</p>
          <PageTitle title="Approbation des Commandes" desc="Revoyez les commandes en attente et validez-les pour approvisionner le stock." />
        </div>
        <Button variant="outline" onClick={fetchCommandes} disabled={loading}>
          {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
        </Button>
      </div>

      {showEditForm && (
        <div className="border rounded-xl p-6 mb-6 bg-card">
          <h2 className="text-xl font-bold mb-2">Modifier la commande</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Modifiez le libellé et l’ID fournisseur (commande en attente uniquement).
          </p>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput label="Libellé" name="nom" form={editForm} placeholder="Ex: Achat Gants Latex" withAsterisk />
                <TextInput label="ID Fournisseur" name="fournisseurId" form={editForm} placeholder="Ex: 5" withAsterisk />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowEditForm(false); setEditingCommande(null); editForm.reset(); }}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button type="submit" className="px-8" disabled={loading}>
                  {loading ? "Traitement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {showRefusForm && (
        <div className="border border-rose-200 rounded-xl p-6 mb-6 bg-card shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Motif du Refus</h2>
              <p className="text-sm text-muted-foreground">Veuillez indiquer pourquoi la commande #{selectedId} est refusée.</p>
            </div>
          </div>
          
          <Form {...refusForm}>
            <form onSubmit={refusForm.handleSubmit(handleRefuser)} className="space-y-6">
              <TextareaInput
                label="Commentaire de refus"
                name="note"
                form={refusForm}
                placeholder="Ex: Prix trop élevé, produit non conforme..."
                withAsterisk
              />
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowRefusForm(false); setSelectedId(null); refusForm.reset(); }}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="destructive" className="px-8 shadow-md" disabled={loading}>
                  {loading ? "Traitement..." : "Confirmer le Refus"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="border rounded-xl p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-800">Commandes à traiter</h3>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{commandes.length} au total</span>
          </div>
        </div>
        <DataTable columns={columns} data={commandes} loading={loading} />
      </div>
    </div>
  );
}
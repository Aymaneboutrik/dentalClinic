import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import { Form } from "@components/ui/form";
import TextInput from "@components/inputs/text-input";
import TextareaInput from "@components/inputs/textarea-input";
import PageTitle from "@components/commons/page-title";

const BASE_URL = "http://localhost:8080/api";

const statutLabels: Record<string, string> = {
  EnAttente: "En attente",
  Validee: "Validée",
  Refusee: "Refusée",
  ModificationExigee: "Modification exigée",
};

const statutColors: Record<string, string> = {
  EnAttente: "bg-yellow-100 text-yellow-800",
  Validee: "bg-green-100 text-green-800",
  Refusee: "bg-red-100 text-red-800",
  ModificationExigee: "bg-orange-100 text-orange-800",
};

interface Commande {
  id: number;
  nom: string;
  date: string;
  statut: string;
  fournisseurId: number;
}

const refusSchema = z.object({
  note: z.string().min(1, "La note est obligatoire"),
});
type RefusForm = z.infer<typeof refusSchema>;

const sortieSchema = z.object({
  produitId: z.coerce.number().min(1, "L'ID produit est obligatoire"),
  quantite: z.coerce.number().min(1, "La quantité est obligatoire"),
  dateSortie: z.string().min(1, "La date de sortie est obligatoire"),
});
type SortieForm = z.infer<typeof sortieSchema>;

export default function CommandesDoctorPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [showRefusForm, setShowRefusForm] = useState(false);
  const [showSortieForm, setShowSortieForm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const refusForm = useForm<RefusForm>({
    resolver: zodResolver(refusSchema),
    defaultValues: { note: "" },
  });

  const sortieForm = useForm<SortieForm>({
    resolver: zodResolver(sortieSchema),
    defaultValues: { produitId: 0, quantite: 1, dateSortie: "" },
  });

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/Commande`);
      const data = await res.json();
      setCommandes(data);
      setFetched(true);
    } catch {
      alert("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (id: number) => {
    if (!confirm(`Valider la commande #${id} ?`)) return;
    const res = await fetch(`${BASE_URL}/CommandeDentiste/${id}/valider`, { method: "POST" });
    if (res.ok) {
      alert("Commande validée");
      fetchCommandes();
    } else {
      alert("Erreur lors de la validation");
    }
  };

  const openRefusForm = (id: number) => {
    setSelectedId(id);
    refusForm.reset();
    setShowRefusForm(true);
  };

  const handleRefuser = async (values: RefusForm) => {
    if (!selectedId) return;
    const res = await fetch(`${BASE_URL}/CommandeDentiste/${selectedId}/refuser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values.note),
    });
    if (res.ok) {
      alert("Commande refusée avec note");
      setShowRefusForm(false);
      setSelectedId(null);
      refusForm.reset();
      fetchCommandes();
    } else {
      alert("Erreur lors du refus");
    }
  };

  const handleExigerModif = async (id: number) => {
    if (!confirm(`Exiger une modification pour la commande #${id} ?`)) return;
    const res = await fetch(`${BASE_URL}/CommandeDentiste/${id}/exiger-modif`, { method: "POST" });
    if (res.ok) {
      alert("Modification exigée");
      fetchCommandes();
    } else {
      alert("Erreur lors de l'opération");
    }
  };

  const handleSortie = async (values: SortieForm) => {
    const res = await fetch(`${BASE_URL}/Sortie`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: 0, ...values }),
    });
    if (res.ok) {
      alert("Sortie enregistrée avec succès");
      setShowSortieForm(false);
      sortieForm.reset();
    } else {
      const msg = await res.text();
      alert(`Erreur : ${msg}`);
    }
  };

  const columns: ColumnDef<Commande>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "nom", header: "Nom" },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => row.original.date?.split("T")[0] ?? "-",
    },
    { accessorKey: "fournisseurId", header: "Fournisseur ID" },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutColors[row.original.statut] ?? "bg-gray-100 text-gray-700"}`}>
          {statutLabels[row.original.statut] ?? row.original.statut}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleValider(row.original.id)}
          >
            Valider
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => openRefusForm(row.original.id)}
          >
            Refuser
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExigerModif(row.original.id)}
          >
            Exiger modification
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-primary text-sm font-medium">Stock</p>
          <PageTitle title="Gestion des commandes" desc="Validez, refusez ou demandez une modification des commandes" />
        </div>
        <Button
          onClick={() => {
            setShowSortieForm(true);
            sortieForm.reset();
          }}
        >
          Enregistrer une sortie
        </Button>
      </div>

      {showRefusForm && (
        <div className="border rounded-xl p-6 mb-6 border-destructive">
          <h2 className="text-xl font-bold mb-2">Refuser la commande #{selectedId}</h2>
          <p className="text-muted-foreground mb-4">
            Ajoutez une note expliquant la raison du refus.
          </p>
          <Form {...refusForm}>
            <form onSubmit={refusForm.handleSubmit(handleRefuser)} className="space-y-4">
              <TextareaInput
                label="Note de refus"
                name="note"
                form={refusForm}
                placeholder="Expliquez la raison du refus..."
                withAsterisk
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowRefusForm(false); setSelectedId(null); refusForm.reset(); }}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="destructive">Confirmer le refus</Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {showSortieForm && (
        <div className="border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Enregistrer une sortie</h2>
          <p className="text-muted-foreground mb-4">
            Enregistrez une sortie de stock pour un produit donné.
          </p>
          <Form {...sortieForm}>
            <form onSubmit={sortieForm.handleSubmit(handleSortie)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput label="ID Produit" name="produitId" form={sortieForm} placeholder="ID du produit" withAsterisk />
                <TextInput label="Quantité" name="quantite" form={sortieForm} placeholder="Quantité sortante" withAsterisk />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  Date de sortie <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  className="border rounded px-3 py-2 bg-background text-sm"
                  {...sortieForm.register("dateSortie")}
                />
                {sortieForm.formState.errors.dateSortie && (
                  <p className="text-destructive text-xs">{sortieForm.formState.errors.dateSortie.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowSortieForm(false); sortieForm.reset(); }}
                >
                  Annuler
                </Button>
                <Button type="submit">Enregistrer la sortie</Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Liste des commandes</h3>
          <Button variant="outline" onClick={fetchCommandes} disabled={loading}>
            {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
          </Button>
        </div>
        <DataTable columns={columns} data={commandes} loading={loading} />
      </div>
    </div>
  );
}
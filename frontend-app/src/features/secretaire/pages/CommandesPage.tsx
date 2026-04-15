import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import { Form } from "@components/ui/form";
import TextInput from "@components/inputs/text-input";
import PageTitle from "@components/commons/page-title";

const BASE_URL = "http://localhost:8080/api";

const commandeSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  date: z.string().min(1, "La date est obligatoire"),
  fournisseurId: z.coerce.number().min(1, "Le fournisseur est obligatoire"),
});

type CommandeForm = z.infer<typeof commandeSchema>;

interface Commande {
  id: number;
  nom: string;
  date: string;
  statut: number;
  fournisseurId: number;
}

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

interface BonCommande {
  id: number;
  nom: string;
  date: string;
  statut: number;
  fournisseurId: number;
  lignes: LigneCommande[];
}

interface LigneCommande {
  id: number;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  commandeId: number;
  etat: number;
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
    defaultValues: { nom: "", date: "", fournisseurId: 0 },
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

  const handleSubmit = async (values: CommandeForm) => {
    try {
      if (editing) {
        await fetch(`${BASE_URL}/Commande/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...values, statut: editing.statut }),
        });
      } else {
        await fetch(`${BASE_URL}/Commande`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: 0, ...values, statut: 0 }),
        });
      }
      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchCommandes();
    } catch {
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (c: Commande) => {
    setEditing(c);
    form.setValue("nom", c.nom);
    form.setValue("date", c.date?.split("T")[0] ?? "");
    form.setValue("fournisseurId", c.fournisseurId);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette commande ?")) return;
    await fetch(`${BASE_URL}/Commande/${id}`, { method: "DELETE" });
    fetchCommandes();
  };

  const handleGenererBon = async (id: number) => {
    try {
      const res = await fetch(`${BASE_URL}/Commande/${id}/bon`);
      const data = await res.json();
      setBonCommande(data);
      setShowBon(true);
    } catch {
      alert("Erreur lors de la génération du bon");
    }
  };

  const filtered = commandes.filter(
    (c) =>
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      statutLabels[c.statut]?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<Commande>[] = [
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutColors[row.original.statut] ?? ""}`}>
          {statutLabels[row.original.statut] ?? row.original.statut}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => handleEdit(row.original)}>
            Modifier
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDelete(row.original.id)}>
            Supprimer
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleGenererBon(row.original.id)}>
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
          <p className="text-primary text-sm font-medium">Gestion du stock</p>
          <PageTitle title="Commandes" desc="Gérez les commandes de la clinique" />
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            form.reset();
          }}
        >
          Ajouter une commande
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">
            {editing ? "Modifier la commande" : "Ajouter une commande"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {editing ? "Modifiez les informations de la commande." : "Créez une nouvelle commande."}
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput label="Nom de la commande" name="nom" form={form} placeholder="Nom" withAsterisk />
                <TextInput label="ID Fournisseur" name="fournisseurId" form={form} placeholder="ID du fournisseur" withAsterisk />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  Date <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  className="border rounded px-3 py-2 bg-background text-sm"
                  {...form.register("date")}
                />
                {form.formState.errors.date && (
                  <p className="text-destructive text-xs">{form.formState.errors.date.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditing(null); form.reset(); }}
                >
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {showBon && bonCommande && (
        <div className="border rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Bon de commande #{bonCommande.id}</h2>
            <Button variant="outline" onClick={() => setShowBon(false)}>Fermer</Button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div><span className="font-medium">Nom :</span> {bonCommande.nom}</div>
            <div><span className="font-medium">Date :</span> {bonCommande.date?.split("T")[0]}</div>
            <div><span className="font-medium">Fournisseur ID :</span> {bonCommande.fournisseurId}</div>
            <div>
              <span className="font-medium">Statut :</span>{" "}
              <span className={`px-2 py-1 rounded-full text-xs ${statutColors[bonCommande.statut]}`}>
                {statutLabels[bonCommande.statut]}
              </span>
            </div>
          </div>
          <h3 className="font-semibold mb-2">Lignes de commande</h3>
          <table className="w-full text-sm border rounded">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left">Nom</th>
                <th className="px-3 py-2 text-left">Quantité</th>
                <th className="px-3 py-2 text-left">Prix unitaire</th>
                <th className="px-3 py-2 text-left">Sous-total</th>
                <th className="px-3 py-2 text-left">État</th>
              </tr>
            </thead>
            <tbody>
              {bonCommande.lignes.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-3 py-2">{l.nom}</td>
                  <td className="px-3 py-2">{l.quantite}</td>
                  <td className="px-3 py-2">{l.prixUnitaire}</td>
                  <td className="px-3 py-2">{l.sousTotal}</td>
                  <td className="px-3 py-2">{l.etat === 0 ? "Non ajoutée" : "Ajoutée"}</td>
                </tr>
              ))}
              {bonCommande.lignes.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">Aucune ligne</td></tr>
              )}
            </tbody>
          </table>
          <div className="mt-3 text-right font-medium">
            Total : {bonCommande.lignes.reduce((acc, l) => acc + l.sousTotal, 0).toFixed(2)}
          </div>
        </div>
      )}

      <div className="border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Liste des commandes</h3>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-1 text-sm bg-background"
              placeholder="Rechercher..."
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

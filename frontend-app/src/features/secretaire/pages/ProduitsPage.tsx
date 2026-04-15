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

const produitSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  description: z.string().min(1, "La description est obligatoire"),
  quantite: z.coerce.number().min(0, "La quantité est obligatoire"),
  seuilAlerte: z.coerce.number().min(0, "Le seuil d'alerte est obligatoire"),
  datePeremption: z.string().min(1, "La date de péremption est obligatoire"),
});

type ProduitForm = z.infer<typeof produitSchema>;

interface Produit {
  id: number;
  nom: string;
  description: string;
  quantite: number;
  seuilAlerte: number;
  datePeremption: string;
}

export default function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Produit | null>(null);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);
  const [produitsEnAlerte, setProduitsEnAlerte] = useState<Produit[]>([]);

  const form = useForm<ProduitForm>({
    resolver: zodResolver(produitSchema),
    defaultValues: { nom: "", description: "", quantite: 0, seuilAlerte: 0, datePeremption: "" },
  });

  const fetchProduits = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/Produit`);
      const data = await res.json();
      setProduits(data);
      setFetched(true);

      // 🚨 Vérification seuil d'alerte
      const enAlerte = data.filter((p: Produit) => p.quantite <= p.seuilAlerte);
      setProduitsEnAlerte(enAlerte);

    } catch {
      alert("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: ProduitForm) => {
    try {
      if (editing) {
        await fetch(`${BASE_URL}/Produit/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...values }),
        });
      } else {
        await fetch(`${BASE_URL}/Produit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: 0, ...values }),
        });
      }
      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchProduits();
    } catch {
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (p: Produit) => {
    setEditing(p);
    form.setValue("nom", p.nom);
    form.setValue("description", p.description);
    form.setValue("quantite", p.quantite);
    form.setValue("seuilAlerte", p.seuilAlerte);
    form.setValue("datePeremption", p.datePeremption?.split("T")[0] ?? "");
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await fetch(`${BASE_URL}/Produit/${id}`, { method: "DELETE" });
    fetchProduits();
  };

  const filtered = produits.filter(
    (p) =>
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<Produit>[] = [
    { accessorKey: "nom", header: "Nom" },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "quantite",
      header: "Quantité",
      cell: ({ row }) => (
        <span className={row.original.quantite <= row.original.seuilAlerte ? "text-red-600 font-bold" : ""}>
          {row.original.quantite}
        </span>
      ),
    },
    { accessorKey: "seuilAlerte", header: "Seuil alerte" },
    {
      accessorKey: "datePeremption",
      header: "Date péremption",
      cell: ({ row }) => row.original.datePeremption?.split("T")[0] ?? "-",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(row.original)}>
            Modifier
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDelete(row.original.id)}>
            Supprimer
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
          <PageTitle title="Produits" desc="Gérez les produits de la clinique" />
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            form.reset();
          }}
        >
          Ajouter un produit
        </Button>
      </div>

      {/* 🚨 Bannière d'alerte stock critique */}
      {produitsEnAlerte.length > 0 && (
        <div className="mb-6 border border-red-400 bg-red-50 dark:bg-red-950 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600 text-lg">⚠️</span>
            <h3 className="text-red-600 font-bold text-sm">
              Stock critique — {produitsEnAlerte.length} produit(s) sous le seuil d'alerte !
            </h3>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {produitsEnAlerte.map((p) => (
              <li key={p.id} className="text-red-600 text-sm">
                <span className="font-medium">{p.nom}</span> — Quantité : {p.quantite} / Seuil : {p.seuilAlerte}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showForm && (
        <div className="border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">
            {editing ? "Modifier le produit" : "Ajouter un produit"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {editing ? "Modifiez les informations du produit." : "Définissez un nouveau produit."}
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput label="Nom" name="nom" form={form} placeholder="Nom du produit" withAsterisk />
                <TextInput label="Description" name="description" form={form} placeholder="Description" withAsterisk />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextInput label="Quantité" name="quantite" form={form} placeholder="0" withAsterisk />
                <TextInput label="Seuil d'alerte" name="seuilAlerte" form={form} placeholder="0" withAsterisk />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    Date de péremption <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    className="border rounded px-3 py-2 bg-background text-sm"
                    {...form.register("datePeremption")}
                  />
                  {form.formState.errors.datePeremption && (
                    <p className="text-destructive text-xs">{form.formState.errors.datePeremption.message}</p>
                  )}
                </div>
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

      <div className="border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Liste des produits</h3>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-1 text-sm bg-background"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchProduits} disabled={loading}>
              {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

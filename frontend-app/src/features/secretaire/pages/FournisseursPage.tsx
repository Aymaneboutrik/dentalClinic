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

const fournisseurSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  adresse: z.string().min(1, "L'adresse est obligatoire"),
  telephone: z.string().min(1, "Le téléphone est obligatoire"),
});

type FournisseurForm = z.infer<typeof fournisseurSchema>;

interface Fournisseur {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
}

export default function FournisseursPage() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Fournisseur | null>(null);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const form = useForm<FournisseurForm>({
    resolver: zodResolver(fournisseurSchema),
    defaultValues: { nom: "", adresse: "", telephone: "" },
  });

  const fetchFournisseurs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/Fournisseur`);
      const data = await res.json();
      setFournisseurs(data);
      setFetched(true);
    } catch {
      alert("Erreur lors du chargement des fournisseurs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: FournisseurForm) => {
    try {
      if (editing) {
        await fetch(`${BASE_URL}/Fournisseur/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...values }),
        });
      } else {
        await fetch(`${BASE_URL}/Fournisseur`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: 0, ...values }),
        });
      }
      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchFournisseurs();
    } catch {
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (f: Fournisseur) => {
    setEditing(f);
    form.setValue("nom", f.nom);
    form.setValue("adresse", f.adresse);
    form.setValue("telephone", f.telephone);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce fournisseur ?")) return;
    await fetch(`${BASE_URL}/Fournisseur/${id}`, { method: "DELETE" });
    fetchFournisseurs();
  };

  const filtered = fournisseurs.filter(
    (f) =>
      f.nom.toLowerCase().includes(search.toLowerCase()) ||
      f.adresse.toLowerCase().includes(search.toLowerCase()) ||
      f.telephone.includes(search)
  );

  const columns: ColumnDef<Fournisseur>[] = [
    { accessorKey: "nom", header: "Nom" },
    { accessorKey: "adresse", header: "Adresse" },
    { accessorKey: "telephone", header: "Téléphone" },
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
          <PageTitle title="Fournisseurs" desc="Gérez les fournisseurs de la clinique" />
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            form.reset();
          }}
        >
          Ajouter un fournisseur
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">
            {editing ? "Modifier le fournisseur" : "Ajouter un fournisseur"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {editing ? "Modifiez les informations du fournisseur." : "Définissez un nouveau fournisseur."}
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput label="Nom" name="nom" form={form} placeholder="Nom du fournisseur" withAsterisk />
                <TextInput label="Téléphone" name="telephone" form={form} placeholder="Numéro de téléphone" withAsterisk />
              </div>
              <TextInput label="Adresse" name="adresse" form={form} placeholder="Adresse complète" withAsterisk />
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
          <h3 className="font-semibold text-lg">Liste des fournisseurs</h3>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-1 text-sm bg-background"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchFournisseurs} disabled={loading}>
              {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

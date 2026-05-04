import { useState, useEffect } from "react";
import secureApi from "@apis/instances/secure-api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import { Form } from "@components/ui/form";
import TextInput from "@components/inputs/text-input";
import PageTitle from "@components/commons/page-title";

const BASE_URL = "/actes-medicaux";

const acteMedicalSchema = z.object({
  libelle: z.string().min(1, "Le libellé est obligatoire"),
  prix: z.coerce.number().min(0, "Le prix est obligatoire"),
  typeActe: z.string().min(1, "La catégorie est obligatoire"),
});

type ActeMedicalForm = z.infer<typeof acteMedicalSchema>;

interface ActeMedical {
  id: number;
  libelle: string;
  prix: number;
  typeActe: string;
}

export default function ActesMedicauxPage() {
  const [actes, setActes] = useState<ActeMedical[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ActeMedical | null>(null);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const form = useForm<ActeMedicalForm>({
    resolver: zodResolver(acteMedicalSchema),
    defaultValues: { libelle: "", prix: 0, typeActe: "" },
  });

  const fetchActes = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      setActes(res.data);
      setFetched(true);
    } catch {
      alert("Erreur lors du chargement des actes médicaux");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActes();
  }, []);

  const handleSubmit = async (values: ActeMedicalForm) => {
    try {
      if (editing) {
        await secureApi.put(`${BASE_URL}/${editing.id}`, { id: editing.id, ...values });
      } else {
        await secureApi.post(`${BASE_URL}`, values);
      }
      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchActes();
    } catch (error: any) {
      alert(error.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (a: ActeMedical) => {
    setEditing(a);
    form.setValue("libelle", a.libelle);
    form.setValue("prix", a.prix);
    form.setValue("typeActe", a.typeActe);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet acte médical ?")) return;
    try {
      await secureApi.delete(`${BASE_URL}/${id}`);
      fetchActes();
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const filtered = actes.filter(
    (a) =>
      a.libelle.toLowerCase().includes(search.toLowerCase()) ||
      a.typeActe.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<ActeMedical>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "libelle", header: "Libellé" },
    { accessorKey: "typeActe", header: "Catégorie" },
    { accessorKey: "prix", header: "Prix Appliqué (MAD)" },
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
          <p className="text-primary text-sm font-medium">Gestion Facturation</p>
          <PageTitle title="Actes Médicaux" desc="Gérez le catalogue des actes médicaux" />
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            form.reset({ libelle: "", prix: 0, typeActe: "" });
          }}
        >
          Ajouter un acte
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-xl p-6 mb-6 bg-card">
          <h2 className="text-xl font-bold mb-2">
            {editing ? "Modifier l'acte médical" : "Ajouter un acte médical"}
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextInput label="Libellé" name="libelle" form={form} placeholder="Ex: Consultation" withAsterisk />
                <TextInput label="Catégorie" name="typeActe" form={form} placeholder="Ex: Soins" withAsterisk />
                <TextInput label="Prix Appliqué" name="prix" form={form} placeholder="0" withAsterisk />
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

      <div className="border rounded-xl p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Liste des actes médicaux</h3>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-1 text-sm bg-background"
              placeholder="Rechercher par libellé, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchActes} disabled={loading}>
              {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

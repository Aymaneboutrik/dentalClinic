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

const BASE_URL = "/api/remises";

const remiseSchema = z.object({
  valeur: z.coerce.number().min(0, "La valeur est obligatoire"),
  dateRemise: z.string().min(1, "La date est obligatoire"),
  description: z.string().min(1, "La description est obligatoire"),
  typeRemise: z.enum(["FIXE", "VARIABLE"]),
  factureId: z.coerce.number().min(1, "L'ID de la facture est obligatoire"),
});

type RemiseForm = z.infer<typeof remiseSchema>;

interface Remise {
  id: number;
  valeur: number;
  dateRemise: string;
  description: string;
  typeRemise: string;
  factureId: number;
  montantCalcule?: number;
  estAutorisee: boolean;
}

export default function RemisesPage() {
  const [remises, setRemises] = useState<Remise[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Remise | null>(null);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const form = useForm<RemiseForm>({
    resolver: zodResolver(remiseSchema),
    defaultValues: {
      valeur: 0,
      dateRemise: new Date().toISOString().split("T")[0],
      description: "",
      typeRemise: "FIXE",
      factureId: 0,
    },
  });

  const fetchRemises = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRemises(data);
      setFetched(true);
    } catch {
      alert("Erreur lors du chargement des remises");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemises();
  }, []);

  const handleSubmit = async (values: RemiseForm) => {
    try {
      if (editing) {
        const res = await fetch(`${BASE_URL}/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...values, estAutorisee: editing.estAutorisee }),
        });
        if (!res.ok) throw res;
      } else {
        const res = await fetch(`${BASE_URL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, estAutorisee: false }),
        });
        if (!res.ok) throw res;
      }
      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchRemises();
    } catch (error) {
      const data = await (error as any).json?.().catch(() => null);
      alert(data?.message || "Erreur lors de la sauvegarde. Vérifiez le statut de la facture (doit être IMPAYEE).");
    }
  };

  const handleEdit = (r: Remise) => {
    setEditing(r);
    form.setValue("valeur", r.valeur);
    form.setValue("dateRemise", r.dateRemise?.split("T")[0] ?? "");
    form.setValue("description", r.description);
    form.setValue("typeRemise", r.typeRemise as "FIXE" | "VARIABLE");
    form.setValue("factureId", r.factureId);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette remise ?")) return;
    try {
      const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      fetchRemises();
    } catch (error) {
      const data = await (error as any).json?.().catch(() => null);
      alert(data?.message || "Erreur lors de la suppression. La facture est peut-être déjà payée.");
    }
  };

  const handleAutoriser = async (r: Remise) => {
    if (!confirm("Autoriser cette remise à s'appliquer sur la facture ?")) return;
    try {
      const res = await fetch(`${BASE_URL}/${r.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valeur: r.valeur,
          dateRemise: r.dateRemise,
          description: r.description,
          typeRemise: r.typeRemise,
          factureId: r.factureId,
          estAutorisee: true,
        }),
      });
      if (!res.ok) throw res;
      fetchRemises();
    } catch (error) {
      const data = await (error as any).json?.().catch(() => null);
      alert(data?.message || "Erreur lors de l'autorisation.");
    }
  };

  const filtered = remises.filter(
    (r) =>
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.factureId.toString().includes(search)
  );

  const columns: ColumnDef<Remise>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "factureId", header: "ID Facture" },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "typeRemise", header: "Type" },
    {
      accessorKey: "valeur",
      header: "Valeur",
      cell: ({ row }) => (
        <span>
          {row.original.valeur} {row.original.typeRemise === "VARIABLE" ? "%" : "MAD"}
        </span>
      ),
    },
    {
      accessorKey: "montantCalcule",
      header: "Impact Estimé (MAD)",
      cell: ({ row }) => row.original.montantCalcule ? `-${row.original.montantCalcule}` : "-",
    },
    {
      accessorKey: "estAutorisee",
      header: "Statut",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded text-xs font-bold ${
            row.original.estAutorisee ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          {row.original.estAutorisee ? "Autorisée" : "En attente"}
        </span>
      ),
    },
    {
      accessorKey: "dateRemise",
      header: "Date",
      cell: ({ row }) => row.original.dateRemise?.split("T")[0] ?? "-",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {!row.original.estAutorisee && (
            <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAutoriser(row.original)}>
              Autoriser
            </Button>
          )}
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
          <PageTitle title="Remises" desc="Gérez les remises sur factures" />
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            form.reset({
              dateRemise: new Date().toISOString().split("T")[0],
              typeRemise: "FIXE",
            });
          }}
        >
          Ajouter une remise
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-xl p-6 mb-6 bg-card">
          <h2 className="text-xl font-bold mb-2">
            {editing ? "Modifier la remise" : "Ajouter une remise"}
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput label="ID Facture" name="factureId" form={form} placeholder="Ex: 1" withAsterisk />
                <TextInput label="Description" name="description" form={form} placeholder="Motif de la remise" withAsterisk />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Type de remise <span className="text-destructive">*</span></label>
                  <select
                    className="border rounded px-3 py-2 bg-background text-sm"
                    {...form.register("typeRemise")}
                  >
                    <option value="FIXE">Fixe (MAD)</option>
                    <option value="VARIABLE">Variable (%)</option>
                  </select>
                </div>
                <TextInput label="Valeur" name="valeur" form={form} placeholder="0" withAsterisk />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Date <span className="text-destructive">*</span></label>
                  <input
                    type="date"
                    className="border rounded px-3 py-2 bg-background text-sm"
                    {...form.register("dateRemise")}
                  />
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

      <div className="border rounded-xl p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Liste des remises</h3>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-1 text-sm bg-background"
              placeholder="Rechercher par description, ID Facture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchRemises} disabled={loading}>
              {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

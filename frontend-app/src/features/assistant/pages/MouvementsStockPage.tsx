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

const typeMouvementLabels: Record<string, string> = {
  Entree: "Entrée",
  Sortie: "Sortie",
  Modifiee: "Modifiée",
};

const typeMouvementColors: Record<string, string> = {
  Entree: "bg-green-100 text-green-800",
  Sortie: "bg-red-100 text-red-800",
  Modifiee: "bg-orange-100 text-orange-800",
};

interface MouvementStock {
  id: number;
  typeMouvement: string;
  quantite: number;
  dateMouvement: string | null;
  produitId: number | null;
  commandeId: number | null;
}

const modifierSchema = z.object({
  quantite: z.coerce.number().min(1, "La quantité est obligatoire"),
  dateMouvement: z.string().min(1, "La date est obligatoire"),
});
type ModifierForm = z.infer<typeof modifierSchema>;

export default function MouvementsStockPage() {
  const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedMouvement, setSelectedMouvement] = useState<MouvementStock | null>(null);

  const form = useForm<ModifierForm>({
    resolver: zodResolver(modifierSchema),
    defaultValues: { quantite: 1, dateMouvement: "" },
  });

  const fetchMouvements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/MouvementStock`);
      const data = await res.json();
      setMouvements(data);
      setFetched(true);
    } catch {
      alert("Erreur lors du chargement des mouvements");
    } finally {
      setLoading(false);
    }
  };

  const openModifierForm = (m: MouvementStock) => {
    setSelectedId(m.id);
    setSelectedMouvement(m);
    form.setValue("quantite", m.quantite);
    form.setValue("dateMouvement", m.dateMouvement ? m.dateMouvement.split("T")[0] : "");
    setShowForm(true);
  };

  const handleModifier = async (values: ModifierForm) => {
    if (!selectedId || !selectedMouvement) return;
    const res = await fetch(`${BASE_URL}/MouvementStock/${selectedId}/modifier`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedId,
        quantite: values.quantite,
        dateMouvement: new Date(values.dateMouvement).toISOString(),
        typeMouvement: selectedMouvement.typeMouvement,
      }),
    });
    if (res.ok) {
      alert("Mouvement modifié avec succès");
      setShowForm(false);
      setSelectedId(null);
      setSelectedMouvement(null);
      form.reset();
      fetchMouvements();
    } else {
      const msg = await res.text();
      alert(`Erreur : ${msg}`);
    }
  };

  const columns: ColumnDef<MouvementStock>[] = [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "typeMouvement",
      header: "Type",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeMouvementColors[row.original.typeMouvement] ?? "bg-gray-100 text-gray-700"}`}>
          {typeMouvementLabels[row.original.typeMouvement] ?? row.original.typeMouvement}
        </span>
      ),
    },
    { accessorKey: "quantite", header: "Quantité" },
    {
      accessorKey: "dateMouvement",
      header: "Date",
      cell: ({ row }) =>
        row.original.dateMouvement ? (
          <span>{row.original.dateMouvement.split("T")[0]}</span>
        ) : (
          <span className="text-muted-foreground italic">À saisir</span>
        ),
    },
    {
      accessorKey: "produitId",
      header: "Produit ID",
      cell: ({ row }) => row.original.produitId ?? "-",
    },
    {
      accessorKey: "commandeId",
      header: "Commande ID",
      cell: ({ row }) => row.original.commandeId ?? "-",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => openModifierForm(row.original)}
        >
          Modifier
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <p className="text-primary text-sm font-medium">Stock</p>
        <PageTitle
          title="Historique des mouvements"
          desc="Consultez et modifiez les informations des mouvements de stock"
        />
      </div>

      {showForm && (
        <div className="border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Modifier le mouvement #{selectedId}</h2>
          <p className="text-muted-foreground mb-4">
            Modifiez la quantité et la date du mouvement.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleModifier)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  label="Quantité"
                  name="quantite"
                  form={form}
                  placeholder="Quantité"
                  withAsterisk
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    Date du mouvement <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    className="border rounded px-3 py-2 bg-background text-sm"
                    {...form.register("dateMouvement")}
                  />
                  {form.formState.errors.dateMouvement && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.dateMouvement.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setSelectedId(null); setSelectedMouvement(null); form.reset(); }}
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
          <h3 className="font-semibold text-lg">Liste des mouvements de stock</h3>
          <Button variant="outline" onClick={fetchMouvements} disabled={loading}>
            {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
          </Button>
        </div>
        <DataTable columns={columns} data={mouvements} loading={loading} />
      </div>
    </div>
  );
}
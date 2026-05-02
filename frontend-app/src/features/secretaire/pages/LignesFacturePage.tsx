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

const BASE_URL = "/api/lignes-facture";

const ligneFactureSchema = z.object({
  factureId: z.coerce.number().min(1, "L'ID de la facture est obligatoire"),
  acteMedicalId: z.coerce.number().min(1, "L'ID de l'acte médical est obligatoire"),
  quantite: z.coerce.number().min(1, "La quantité doit être au moins 1"),
});

type LigneFactureForm = z.infer<typeof ligneFactureSchema>;

interface LigneFacture {
  id: number;
  factureId: number;
  acteMedicalId: number;
  libelleActe: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export default function LignesFacturePage() {
  const [lignes, setLignes] = useState<LigneFacture[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LigneFacture | null>(null);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);
  const [factureIdFilter, setFactureIdFilter] = useState<string>("");

  const form = useForm<LigneFactureForm>({
    resolver: zodResolver(ligneFactureSchema),
    defaultValues: { factureId: 0, acteMedicalId: 0, quantite: 1 },
  });

  const fetchLignes = async () => {
    setLoading(true);
    try {
      const factureId = Number(factureIdFilter);
      if (!Number.isFinite(factureId) || factureId <= 0) {
        setLignes([]);
        setFetched(true);
        return;
      }

      // Backend exposes GET /api/lignes-facture/facture/{factureId} (no global "GET /api/lignes-facture").
      const res = await fetch(`${BASE_URL}/facture/${factureId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLignes(data);
      setFetched(true);
    } catch {
      alert("Erreur lors du chargement des lignes de facture");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Do not auto-fetch without a factureId (backend doesn't support listing all).
  }, []);

  const handleSubmit = async (values: LigneFactureForm) => {
    try {
      if (editing) {
        const res = await fetch(`${BASE_URL}/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...values }),
        });
        if (!res.ok) throw res;
      } else {
        const res = await fetch(`${BASE_URL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw res;
      }
      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchLignes();
    } catch (error) {
      const data = await (error as any).json?.().catch(() => null);
      alert(data?.message || "Erreur lors de la sauvegarde (vérifiez que la facture est IMPAYÉE).");
    }
  };

  const handleEdit = (l: LigneFacture) => {
    setEditing(l);
    form.setValue("factureId", l.factureId);
    form.setValue("acteMedicalId", l.acteMedicalId);
    form.setValue("quantite", l.quantite);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette ligne ?")) return;
    try {
      await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      fetchLignes();
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const filtered = lignes.filter(
    (l) =>
      l.libelleActe?.toLowerCase().includes(search.toLowerCase()) ||
      l.factureId.toString().includes(search)
  );

  const columns: ColumnDef<LigneFacture>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "factureId", header: "ID Facture" },
    {
      accessorKey: "acteMedicalId",
      header: "Acte Médical",
      cell: ({ row }) => (
        <span>{row.original.libelleActe} (ID: {row.original.acteMedicalId})</span>
      ),
    },
    { accessorKey: "quantite", header: "Quantité" },
    { accessorKey: "prixUnitaire", header: "Prix Unitaire (MAD)" },
    { accessorKey: "sousTotal", header: "Sous-Total (MAD)" },
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
          <PageTitle title="Lignes de Facture" desc="Gérez les actes ajoutés aux factures" />
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            form.reset({ factureId: 0, acteMedicalId: 0, quantite: 1 });
          }}
        >
          Ajouter une ligne
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-xl p-6 mb-6 bg-card">
          <h2 className="text-xl font-bold mb-2">
            {editing ? "Modifier la ligne" : "Ajouter une ligne à une facture"}
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextInput label="ID Facture" name="factureId" form={form} placeholder="ID Facture" withAsterisk />
                <TextInput label="ID Acte Médical" name="acteMedicalId" form={form} placeholder="ID Acte" withAsterisk />
                <TextInput label="Quantité" name="quantite" form={form} placeholder="1" withAsterisk />
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
          <h3 className="font-semibold text-lg">Liste des lignes</h3>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-1 text-sm bg-background w-[160px]"
              placeholder="ID Facture..."
              value={factureIdFilter}
              onChange={(e) => setFactureIdFilter(e.target.value)}
            />
            <input
              className="border rounded px-3 py-1 text-sm bg-background"
              placeholder="Rechercher par libellé ou ID Facture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchLignes} disabled={loading}>
              {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

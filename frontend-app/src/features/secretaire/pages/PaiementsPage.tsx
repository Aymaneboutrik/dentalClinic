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

const BASE_URL = "/paiements";

const paiementSchema = z.object({
  factureId: z.coerce.number().min(1, "L'ID de la facture est obligatoire"),
  montant: z.coerce.number().min(0.01, "Le montant doit être supérieur à 0"),
  datePaiement: z.string().min(1, "La date de paiement est obligatoire"),
  modePaiement: z.enum(["ESPECES", "CARTE_BANCAIRE", "CHEQUE", "VIREMENT"]),
});

type PaiementForm = z.infer<typeof paiementSchema>;

interface Paiement {
  id: number;
  factureId: number;
  montant: number;
  datePaiement: string;
  modePaiement: string;
}

export default function PaiementsPage() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Paiement | null>(null);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const form = useForm<PaiementForm>({
    resolver: zodResolver(paiementSchema),
    defaultValues: {
      factureId: 0,
      montant: 0,
      datePaiement: new Date().toISOString().split("T")[0],
      modePaiement: "ESPECES",
    },
  });

  const fetchPaiements = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      setPaiements(res.data);
      setFetched(true);
    } catch {
      alert("Erreur lors du chargement des paiements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaiements();
  }, []);

  const handleSubmit = async (values: PaiementForm) => {
    try {
      if (editing) {
        await secureApi.put(`${BASE_URL}/${editing.id}`, { id: editing.id, ...values });
      } else {
        await secureApi.post(`${BASE_URL}`, values);
      }
      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchPaiements();
    } catch (error: any) {
      alert(error.response?.data?.message || "Erreur lors de la sauvegarde (Vérifiez que le montant ne dépasse pas le reste à payer).");
    }
  };

  const handleEdit = (p: Paiement) => {
    setEditing(p);
    form.setValue("factureId", p.factureId);
    form.setValue("montant", p.montant);
    form.setValue("datePaiement", p.datePaiement?.split("T")[0] ?? "");
    form.setValue("modePaiement", p.modePaiement as "ESPECES" | "CARTE_BANCAIRE" | "CHEQUE" | "VIREMENT");
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce paiement ?")) return;
    try {
      await secureApi.delete(`${BASE_URL}/${id}`);
      fetchPaiements();
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const filtered = paiements.filter(
    (p) =>
      p.modePaiement.toLowerCase().includes(search.toLowerCase()) ||
      p.factureId.toString().includes(search)
  );

  const columns: ColumnDef<Paiement>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "factureId", header: "ID Facture" },
    { accessorKey: "montant", header: "Montant (MAD)" },
    { accessorKey: "modePaiement", header: "Mode de Paiement" },
    {
      accessorKey: "datePaiement",
      header: "Date",
      cell: ({ row }) => row.original.datePaiement?.split("T")[0] ?? "-",
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
          <p className="text-primary text-sm font-medium">Gestion Facturation</p>
          <PageTitle title="Paiements" desc="Gérez les encaissements" />
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            form.reset({
              factureId: 0,
              montant: 0,
              datePaiement: new Date().toISOString().split("T")[0],
              modePaiement: "ESPECES",
            });
          }}
        >
          Ajouter un paiement
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-xl p-6 mb-6 bg-card">
          <h2 className="text-xl font-bold mb-2">
            {editing ? "Modifier le paiement" : "Ajouter un paiement"}
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput label="ID Facture" name="factureId" form={form} placeholder="Ex: 1" withAsterisk />
                <TextInput label="Montant (MAD)" name="montant" form={form} placeholder="0.00" withAsterisk />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Date de paiement <span className="text-destructive">*</span></label>
                  <input
                    type="date"
                    className="border rounded px-3 py-2 bg-background text-sm"
                    {...form.register("datePaiement")}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Mode de paiement <span className="text-destructive">*</span></label>
                  <select
                    className="border rounded px-3 py-2 bg-background text-sm"
                    {...form.register("modePaiement")}
                  >
                    <option value="ESPECES">Espèces</option>
                    <option value="CARTE_BANCAIRE">Carte Bancaire</option>
                    <option value="CHEQUE">Chèque</option>
                    <option value="VIREMENT">Virement</option>
                  </select>
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
          <h3 className="font-semibold text-lg">Liste des paiements</h3>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-1 text-sm bg-background"
              placeholder="Rechercher par mode, ID Facture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchPaiements} disabled={loading}>
              {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

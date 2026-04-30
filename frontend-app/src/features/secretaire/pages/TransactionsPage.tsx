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

const BASE_URL = "/api/transactions";

const transactionSchema = z.object({
  remiseId: z.coerce.number().min(1, "L'ID de la remise est obligatoire"),
  montantAvant: z.coerce.number().min(0, "Montant avant obligatoire"),
  montantRemise: z.coerce.number().min(0, "Montant remise obligatoire"),
  montantApres: z.coerce.number().min(0, "Montant après obligatoire"),
  date: z.string().min(1, "La date est obligatoire"),
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface Transaction {
  id: number;
  remiseId: number;
  montantAvant: number;
  montantRemise: number;
  montantApres: number;
  date: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      remiseId: 0,
      montantAvant: 0,
      montantRemise: 0,
      montantApres: 0,
      date: new Date().toISOString().split("T")[0],
    },
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTransactions(data);
      setFetched(true);
    } catch {
      alert("Erreur lors du chargement des transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (values: TransactionForm) => {
    try {
      if (editing) {
        await fetch(`${BASE_URL}/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...values }),
        });
      } else {
        await fetch(`${BASE_URL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      }
      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchTransactions();
    } catch {
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditing(t);
    form.setValue("remiseId", t.remiseId);
    form.setValue("montantAvant", t.montantAvant);
    form.setValue("montantRemise", t.montantRemise);
    form.setValue("montantApres", t.montantApres);
    form.setValue("date", t.date?.split("T")[0] ?? "");
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette transaction d'audit ?")) return;
    try {
      await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      fetchTransactions();
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const filtered = transactions.filter(
    (t) => t.remiseId.toString().includes(search)
  );

  const columns: ColumnDef<Transaction>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "remiseId", header: "ID Remise" },
    { accessorKey: "montantAvant", header: "Montant Avant (MAD)" },
    { accessorKey: "montantRemise", header: "Montant Remise (MAD)" },
    { accessorKey: "montantApres", header: "Montant Après (MAD)" },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => row.original.date?.split("T")[0] ?? "-",
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
          <PageTitle title="Transactions (Audit)" desc="Gérez l'historique des impacts des remises" />
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            form.reset({
              remiseId: 0,
              montantAvant: 0,
              montantRemise: 0,
              montantApres: 0,
              date: new Date().toISOString().split("T")[0],
            });
          }}
        >
          Ajouter une transaction
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-xl p-6 mb-6 bg-card">
          <h2 className="text-xl font-bold mb-2">
            {editing ? "Modifier la transaction" : "Ajouter une transaction"}
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput label="ID Remise" name="remiseId" form={form} placeholder="ID de la remise" withAsterisk />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Date <span className="text-destructive">*</span></label>
                  <input
                    type="date"
                    className="border rounded px-3 py-2 bg-background text-sm"
                    {...form.register("date")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextInput label="Montant Avant" name="montantAvant" form={form} placeholder="0" withAsterisk />
                <TextInput label="Montant Remise" name="montantRemise" form={form} placeholder="0" withAsterisk />
                <TextInput label="Montant Après" name="montantApres" form={form} placeholder="0" withAsterisk />
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
          <h3 className="font-semibold text-lg">Historique des transactions</h3>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-1 text-sm bg-background"
              placeholder="Rechercher par ID Remise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchTransactions} disabled={loading}>
              {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

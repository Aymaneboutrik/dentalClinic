import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import PageTitle from "@components/commons/page-title";

const BASE_URL = "/api/transactions";

interface Transaction {
  id: number;
  remiseId: number;
  montantAvant: number;
  montantRemise: number;
  montantApres: number;
  date: string;
}

export default function DoctorTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

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
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-primary text-sm font-medium">Consultation</p>
          <PageTitle title="Transactions (Audit)" desc="Consultez l'historique des impacts des remises" />
        </div>
      </div>

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

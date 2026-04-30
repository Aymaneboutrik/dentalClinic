import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import PageTitle from "@components/commons/page-title";

const BASE_URL = "/api/actes-medicaux";

interface ActeMedical {
  id: number;
  libelle: string;
  prix: number;
  typeActe: string;
}

export default function DoctorActesMedicauxPage() {
  const [actes, setActes] = useState<ActeMedical[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const fetchActes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setActes(data);
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
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-primary text-sm font-medium">Consultation</p>
          <PageTitle title="Actes Médicaux" desc="Consultez le catalogue des actes médicaux" />
        </div>
      </div>

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

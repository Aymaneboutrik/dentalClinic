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

const BASE_URL = "/api/MouvementStock";

const typeMouvementLabels: Record<string, string> = {
  Entree: "Entrée",
  Sortie: "Sortie",
};

const typeMouvementColors: Record<string, string> = {
  Entree: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Sortie: "bg-rose-100 text-rose-800 border-rose-200",
};

interface MouvementStock {
  id: number;
  typeMouvement: string;
  quantite: number;
  dateMouvement: string;
  produitId: number | null;
  ligneCommandeId: number | null;
  produitActif: boolean;
}

const sortieSchema = z.object({
  produitId: z.coerce.number().min(1, "L'ID produit est obligatoire"),
  quantite: z.coerce.number().min(1, "La quantité doit être strictement positive"),
});
type SortieForm = z.infer<typeof sortieSchema>;

export default function MouvementsStockPage() {
  const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<SortieForm>({
    resolver: zodResolver(sortieSchema),
    defaultValues: { produitId: 0, quantite: 1 },
  });

  const fetchMouvements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const mappedData = data.map((m: any) => ({
        ...m,
        typeMouvement: m.typeMouvement === 0 || m.typeMouvement === "Entree" ? "Entree" : "Sortie"
      }));
      setMouvements(mappedData);
      setFetched(true);
    } catch {
      console.error("Erreur lors du chargement des mouvements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMouvements();
  }, []);

  const handleSortie = async (values: SortieForm) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/sortie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      
      const data = await res.json();

      if (res.ok) {
        alert("Sortie effectuée avec succès");
        setShowForm(false);
        form.reset();
        await fetchMouvements();
      } else {
        alert(`Erreur : ${data.message || 'Validation échouée'}`);
        setLoading(false);
      }
    } catch {
      alert("Erreur réseau lors de la sortie.");
      setLoading(false);
    }
  };

  const columns: ColumnDef<MouvementStock>[] = [
    { 
        accessorKey: "id", 
        header: "ID Mouvement",
        cell: ({ row }) => <span className={`font-mono font-bold ${!row.original.produitActif ? "text-rose-600" : "text-gray-900"}`}>{row.original.id}</span>
    },
    {
      accessorKey: "typeMouvement",
      header: "Type",
      cell: ({ row }) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeMouvementColors[row.original.typeMouvement] ?? "bg-gray-100 text-gray-700"}`}>
          {typeMouvementLabels[row.original.typeMouvement] ?? row.original.typeMouvement}
        </span>
      ),
    },
    { 
      accessorKey: "quantite", 
      header: "Quantité",
      cell: ({ row }) => <span className="font-medium">{row.original.quantite}</span>
    },
    {
      accessorKey: "dateMouvement",
      header: "Date & Heure",
      cell: ({ row }) =>
        row.original.dateMouvement ? (
          <span className={`text-sm ${!row.original.produitActif ? "text-rose-600 font-bold" : "text-muted-foreground"}`}>
            {new Date(row.original.dateMouvement).toLocaleString()}
          </span>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "produitId",
      header: "ID Produit",
      cell: ({ row }) => (
        <span className={`px-2 py-0.5 rounded text-xs border ${!row.original.produitActif ? "bg-rose-50 text-rose-700 border-rose-200 font-black animate-pulse" : "bg-blue-50 text-blue-700 border-blue-100"}`}>
          {row.original.produitId ?? "-"}
        </span>
      ),
    },
    {
      accessorKey: "ligneCommandeId",
      header: "Ligne Commande ID",
      cell: ({ row }) => (
        row.original.ligneCommandeId ? (
          <span className={`px-2 py-0.5 rounded text-xs border ${!row.original.produitActif ? "bg-rose-50 text-rose-700 border-rose-200 font-bold" : "bg-purple-50 text-purple-700 border-purple-100"}`}>
            {row.original.ligneCommandeId}
          </span>
        ) : (
          <span className={`text-sm ${!row.original.produitActif ? "text-rose-600" : "text-muted-foreground"}`}>/</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">Gestion des Stocks</p>
          <PageTitle
            title="Historique des Mouvements"
            desc="Suivi automatique des entrées et enregistrement manuel des sorties."
          />
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)} 
          className={showForm ? "bg-gray-500" : "bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-all"}
        >
          {showForm ? "Fermer le formulaire" : "Effectuer une Sortie"}
        </Button>
      </div>

      {showForm && (
        <div className="border border-rose-200 rounded-2xl p-8 mb-6 bg-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Sortie de Stock</h2>
              <p className="text-sm text-muted-foreground">Saisissez les détails du produit à retirer du stock.</p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSortie)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput
                  label="ID du Produit"
                  name="produitId"
                  form={form}
                  placeholder="Ex: 101"
                  withAsterisk
                />
                <TextInput
                  label="Quantité à sortir"
                  name="quantite"
                  form={form}
                  placeholder="Ex: 5"
                  withAsterisk
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); form.reset(); }}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button type="submit" className="bg-rose-600 hover:bg-rose-700 px-8" disabled={loading}>
                  {loading ? "Traitement..." : "Confirmer la Sortie"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="border rounded-2xl p-6 bg-white shadow-sm border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-800">Flux de Stock</h3>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{mouvements.length} entrées</span>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchMouvements} disabled={loading} className="text-primary hover:bg-primary/5">
            {loading ? "Chargement..." : "Actualiser la liste"}
          </Button>
        </div>
        <DataTable columns={columns} data={mouvements} loading={loading} />
      </div>
    </div>
  );
}
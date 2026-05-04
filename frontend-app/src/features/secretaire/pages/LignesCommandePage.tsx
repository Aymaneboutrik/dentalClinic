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
import Cookie from "js-cookie";
import { TOKEN } from "@configs/vars";

const BASE_URL = "/api/stock/LigneCommande";

function withAuthHeaders(extra?: Record<string, string>) {
  const token = Cookie.get(TOKEN);
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra ?? {}),
  };
}

const ligneSchema = z.object({
  produitId: z.coerce.number().min(1, "L'ID produit est obligatoire"),
  quantite: z.coerce.number().min(1, "La quantité doit être strictement positive"),
  prixUnitaire: z.coerce.number().min(0.01, "Le prix unitaire doit être strictement positif"),
  commandeId: z.coerce.number().min(1, "L'ID de commande est obligatoire"),
});

type LigneForm = z.infer<typeof ligneSchema>;

interface LigneCommande {
  id: number;
  produitId: number;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  commandeId: number;
}

export default function LignesCommandePage() {
  const [lignes, setLignes] = useState<LigneCommande[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [fetched, setFetched] = useState(false);

  const form = useForm<LigneForm>({
    resolver: zodResolver(ligneSchema),
    defaultValues: { produitId: 0, quantite: 1, prixUnitaire: 0, commandeId: 0 },
  });

  const fetchLignes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}`, { headers: withAuthHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLignes(data);
      setFetched(true);
    } catch {
      console.error("Erreur lors du chargement des lignes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLignes();
  }, []);

  const handleSubmit = async (values: LigneForm) => {
    try {
      let res = await fetch(`${BASE_URL}`, {
        method: "POST",
        headers: withAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: 0, ...values, sousTotal: values.quantite * values.prixUnitaire }),
      });

      const data = await res.json();

      if (res.ok) {
        form.reset();
        setShowForm(false);
        fetchLignes();
      } else {
        alert(`Erreur : ${data.message || 'Validation échouée'}`);
      }
    } catch (err: any) {
      alert("Erreur réseau lors de la sauvegarde.");
    }
  };


  const columns: ColumnDef<LigneCommande>[] = [
    { accessorKey: "id", header: "ID" },
    { 
      accessorKey: "produitId", 
      header: "ID Produit",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.produitId}</span>
    },
    { 
      accessorKey: "commandeId", 
      header: "ID Commande",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.commandeId}</span>
    },
    { 
      accessorKey: "quantite", 
      header: "Quantité",
      cell: ({ row }) => <span className="text-gray-800">{row.original.quantite}</span>
    },
    { 
      accessorKey: "prixUnitaire", 
      header: "P.U (MAD)",
      cell: ({ row }) => <span>{row.original.prixUnitaire.toFixed(2)}</span>
    },
    { 
      accessorKey: "sousTotal", 
      header: "Sous-total (MAD)",
      cell: ({ row }) => <span className="font-black text-primary">{row.original.sousTotal.toFixed(2)}</span>
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-primary text-sm font-medium">Gestion Stock</p>
          <PageTitle title="Lignes de Commande" desc="Associez des produits aux commandes créées pour préparer l'approvisionnement." />
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            form.reset();
          }}
          className=""
        >
          {showForm ? "Masquer le formulaire" : "Ajouter un Produit"}
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-xl p-6 mb-6 bg-card">
          <h2 className="text-xl font-bold mb-2">
            Nouvelle ligne de commande
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Spécifiez le produit, la quantité et le prix unitaire convenu.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput label="ID du Produit" name="produitId" form={form} placeholder="ID" withAsterisk />
                <TextInput label="ID de la Commande" name="commandeId" form={form} placeholder="ID" withAsterisk />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput label="Quantité" name="quantite" form={form} placeholder="Nombre d'unités" withAsterisk />
                <TextInput label="Prix Unitaire (MAD)" name="prixUnitaire" form={form} placeholder="Prix par unité" withAsterisk />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); form.reset(); }}
                >
                  Annuler
                </Button>
                <Button type="submit" className="px-8 shadow-md" disabled={loading}>
                   Ajouter à la commande
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="border rounded-xl p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-800">Contenu des commandes</h3>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{lignes.length} lignes</span>
          </div>
          <Button variant="outline" onClick={fetchLignes} disabled={loading}>
            {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
          </Button>
        </div>
        <DataTable columns={columns} data={lignes} loading={loading} />
      </div>
    </div>
  );
}
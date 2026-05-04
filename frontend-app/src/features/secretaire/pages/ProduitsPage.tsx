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
import { TOKEN } from "@configs/vars";
import secureApi from "@apis/instances/secure-api";

const BASE_URL = "/stock/Produit";


const produitSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  description: z.string().min(1, "La description est obligatoire"),
  quantite: z.coerce.number().min(1, "La quantité doit être strictement positive"),
  seuilAlerte: z.coerce.number().min(1, "Le seuil d'alerte doit être strictement positif"),
  datePeremption: z.string().min(1, "La date de péremption est obligatoire"),
});

type ProduitForm = z.infer<typeof produitSchema>;

interface Produit {
  id: number;
  nom: string;
  description: string;
  quantite: number;
  seuilAlerte: number;
  datePeremption: string;
  actif: boolean;
}

export default function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Produit | null>(null);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);
  const [produitsEnAlerte, setProduitsEnAlerte] = useState<Produit[]>([]);
  const [produitsEnPeremption, setProduitsEnPeremption] = useState<Produit[]>([]);

  const form = useForm<ProduitForm>({
    resolver: zodResolver(produitSchema),
    defaultValues: { nom: "", description: "", quantite: 1, seuilAlerte: 1, datePeremption: "" },
  });

  const fetchProduits = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      const data = res.data;
      setProduits(data);
      setFetched(true);

      const today = new Date();
      const enAlerte = data.filter((p: Produit) => p.quantite <= p.seuilAlerte);
      setProduitsEnAlerte(enAlerte);

      const enPeremption = data.filter((p: Produit) => new Date(p.datePeremption) <= today);
      setProduitsEnPeremption(enPeremption);

    } catch {
      console.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  const handleSubmit = async (values: ProduitForm) => {
    try {
      if (editing) {
        await secureApi.put(`${BASE_URL}/${editing.id}`, { id: editing.id, ...values });
      } else {
        await secureApi.post(`${BASE_URL}`, { id: 0, ...values, actif: false });
      }

      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchProduits();
    } catch (err: any) {
      alert(`Erreur : ${err.response?.data?.message || 'Action impossible'}`);
    }
  };

  const handleEdit = (p: Produit) => {
    if (!p.actif) {
      alert("Impossible de modifier un produit inactif. Veuillez l'activer d'abord.");
      return;
    }
    setEditing(p);
    form.setValue("nom", p.nom);
    form.setValue("description", p.description);
    form.setValue("quantite", p.quantite);
    form.setValue("seuilAlerte", p.seuilAlerte);
    form.setValue("datePeremption", p.datePeremption?.split("T")[0] ?? "");
    setShowForm(true);
  };

  const handleToggleActif = async (id: number) => {
    try {
      await secureApi.put(`${BASE_URL}/${id}/toggle-actif`);
      fetchProduits();
    } catch {
      alert("Erreur réseau.");
    }
  };

  const filtered = produits.filter(
    (p) =>
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<Produit>[] = [
    { accessorKey: "id", header: "ID" },
    { 
      accessorKey: "nom", 
      header: "Produit",
      cell: ({ row }) => {
        const isPerime = new Date(row.original.datePeremption) <= new Date();
        return (
          <span className={`font-bold ${isPerime ? "text-rose-600 animate-pulse" : "text-gray-900"}`}>
            {row.original.nom}
          </span>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs truncate max-w-[240px] block">
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: "quantite",
      header: "Quantité",
      cell: ({ row }) => (
        <span className={`font-semibold ${row.original.quantite <= row.original.seuilAlerte ? "text-rose-600" : "text-gray-700"}`}>
          {row.original.quantite}
        </span>
      ),
    },
    { 
      accessorKey: "seuilAlerte", 
      header: "Seuil",
      cell: ({ row }) => <span className="text-gray-400 text-xs italic">Alerte à {row.original.seuilAlerte}</span>
    },
    {
      accessorKey: "datePeremption",
      header: "Péremption",
      cell: ({ row }) => {
        const date = new Date(row.original.datePeremption);
        const isPerime = date <= new Date();
        return (
          <span className={`text-xs font-medium ${isPerime ? "text-rose-600" : "text-gray-600"}`}>
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      accessorKey: "actif",
      header: "État",
      cell: ({ row }) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${row.original.actif ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-gray-50 text-gray-400 border-gray-100"}`}>
          {row.original.actif ? "Actif" : "Inactif"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => handleEdit(row.original)} 
            disabled={!row.original.actif}
            className="text-blue-600 disabled:opacity-30"
          >
            Modifier
          </Button>
            <Button 
            size="sm" 
            className={`font-bold transition-all ${row.original.actif ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"}`}
            onClick={() => handleToggleActif(row.original.id)}
            disabled={loading}
          >
            {row.original.actif ? "Désactiver" : "Activer"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-primary text-sm font-medium">Gestion Stock</p>
          <PageTitle title="Catalogue Produits" desc="Gestion centralisée du catalogue, des stocks et des dates de péremption." />
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            form.reset();
          }}
          className=""
        >
          {showForm ? "Fermer" : "Ajouter un Produit"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {produitsEnAlerte.length > 0 && (
          <div className="border-l-4 border-rose-500 bg-rose-50/50 rounded-r-xl p-4 shadow-sm animate-in fade-in slide-in-from-left-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-rose-800 font-bold text-sm">Stock critique détecté !</h3>
                <p className="text-rose-600 text-[11px] font-medium">{produitsEnAlerte.length} produit(s) nécessitent un réapprovisionnement immédiat.</p>
              </div>
            </div>
          </div>
        )}

        {produitsEnPeremption.length > 0 && (
          <div className="border-l-4 border-rose-600 bg-rose-100/50 rounded-r-xl p-4 shadow-sm animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <h3 className="text-rose-900 font-bold text-sm">Alerte de Péremption !</h3>
                <p className="text-rose-700 text-[11px] font-medium">{produitsEnPeremption.length} produit(s) ont atteint leur date limite.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="border rounded-xl p-6 mb-6 bg-card">
          <h2 className="text-xl font-bold mb-2">
            {editing ? "Mise à jour du Produit" : "Nouveau Produit"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {editing ? "Modifiez les caractéristiques techniques." : "Le produit sera créé en mode 'Inactif' par défaut."}
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput label="Nom commercial" name="nom" form={form} placeholder="Ex: Composite A3" withAsterisk />
                <TextInput label="Description technique" name="description" form={form} placeholder="Ex: Seringue 4g" withAsterisk />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TextInput label="Stock initial" name="quantite" form={form} placeholder="Ex: 50" withAsterisk />
                <TextInput label="Seuil d'alerte" name="seuilAlerte" form={form} placeholder="Ex: 5" withAsterisk />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Date de péremption <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    className="border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                    {...form.register("datePeremption")}
                  />
                  {form.formState.errors.datePeremption && (
                    <p className="text-rose-500 text-[10px] font-bold mt-1">{form.formState.errors.datePeremption.message}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditing(null); form.reset(); }}
                >
                  Annuler
                </Button>
                <Button type="submit" className="px-10 shadow-lg active:scale-95 transition-transform" disabled={loading}>{editing ? "Appliquer" : "Créer le produit"}</Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="border rounded-xl p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-800">Catalogue</h3>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{produits.length} items</span>
          </div>
          <div className="flex gap-3">
            <input
              className="border rounded px-3 py-1 text-sm bg-background"
              placeholder="Chercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchProduits} disabled={loading}>
              {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

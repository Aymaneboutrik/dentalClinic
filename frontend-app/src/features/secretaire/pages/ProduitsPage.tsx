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

const BASE_URL = "/api/stock/Produit";

function withAuthHeaders(extra?: Record<string, string>) {
  const token = Cookie.get(TOKEN);
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra ?? {}),
  };
}

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
      const res = await fetch(`${BASE_URL}`, { headers: withAuthHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.json();
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
      let res;
      if (editing) {
        res = await fetch(`${BASE_URL}/${editing.id}`, {
          method: "PUT",
          headers: withAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ id: editing.id, ...values }),
        });
      } else {
        res = await fetch(`${BASE_URL}`, {
          method: "POST",
          headers: withAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ id: 0, ...values, actif: false }),
        });
      }

      const data = await res.json();

      if (res.ok) {
        form.reset();
        setShowForm(false);
        setEditing(null);
        fetchProduits();
      } else {
        alert(`Erreur : ${data.message || 'Action impossible'}`);
      }
    } catch (err: any) {
      alert("Erreur réseau lors de la sauvegarde.");
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
      const res = await fetch(`${BASE_URL}/${id}/toggle-actif`, { method: "PUT", headers: withAuthHeaders() });
      if (res.ok) {
        fetchProduits();
      } else {
        alert("Erreur lors du changement d'état.");
      }
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
          <div className="flex flex-col">
            <span className={`font-bold ${isPerime ? "text-rose-600 animate-pulse" : "text-gray-900"}`}>
              {row.original.nom}
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{row.original.description}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "quantite",
      header: "Quantité",
      cell: ({ row }) => (
        <span className={`font-black ${row.original.quantite <= row.original.seuilAlerte ? "text-rose-600 bg-rose-50 px-2 py-0.5 rounded" : "text-gray-700"}`}>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-primary text-sm font-semibold tracking-widest uppercase">Inventaire</p>
          <PageTitle title="Catalogue Produits" desc="Gestion centralisée du catalogue, des stocks et des dates de péremption." />
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            form.reset();
          }}
          className="shadow-xl"
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
        <div className="border border-primary/10 rounded-2xl p-8 mb-6 bg-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{editing ? "Mise à jour du Produit" : "Nouveau Produit"}</h2>
              <p className="text-sm text-muted-foreground">{editing ? "Modifiez les caractéristiques techniques." : "Le produit sera créé en mode 'Inactif' par défaut."}</p>
            </div>
          </div>
          
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

      <div className="border rounded-2xl p-6 bg-white shadow-sm border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-800">Catalogue</h3>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{produits.length} items</span>
          </div>
          <div className="flex gap-3">
             <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                  className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none min-w-[250px]"
                  placeholder="Chercher un produit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <Button variant="outline" size="sm" onClick={fetchProduits} disabled={loading} className="rounded-xl border-gray-200">
                {loading ? "..." : "Actualiser"}
             </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

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

const BASE_URL = "/api/Fournisseur";

const fournisseurSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  adresse: z.string().min(1, "L'adresse est obligatoire"),
  telephone: z.string().min(1, "Le téléphone est obligatoire"),
});

type FournisseurForm = z.infer<typeof fournisseurSchema>;

interface Fournisseur {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
}

export default function FournisseursPage() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Fournisseur | null>(null);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const form = useForm<FournisseurForm>({
    resolver: zodResolver(fournisseurSchema),
    defaultValues: { nom: "", adresse: "", telephone: "" },
  });

  const fetchFournisseurs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFournisseurs(data);
      setFetched(true);
    } catch {
      console.error("Erreur lors du chargement des fournisseurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const handleSubmit = async (values: FournisseurForm) => {
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
          body: JSON.stringify({ id: 0, ...values }),
        });
      }
      form.reset();
      setShowForm(false);
      setEditing(null);
      fetchFournisseurs();
    } catch {
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (f: Fournisseur) => {
    setEditing(f);
    form.setValue("nom", f.nom);
    form.setValue("adresse", f.adresse);
    form.setValue("telephone", f.telephone);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce fournisseur ?")) return;
    try {
      const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchFournisseurs();
      } else {
        alert("Action impossible.");
      }
    } catch {
      alert("Erreur réseau.");
    }
  };

  const filtered = fournisseurs.filter(
    (f) =>
      f.nom.toLowerCase().includes(search.toLowerCase()) ||
      f.adresse.toLowerCase().includes(search.toLowerCase()) ||
      f.telephone.includes(search)
  );

  const columns: ColumnDef<Fournisseur>[] = [
    { accessorKey: "id", header: "ID" },
    { 
      accessorKey: "nom", 
      header: "Fournisseur",
      cell: ({ row }) => <span className="font-bold text-gray-900">{row.original.nom}</span>
    },
    { accessorKey: "telephone", header: "Téléphone" },
    { 
      accessorKey: "adresse", 
      header: "Adresse",
      cell: ({ row }) => <span className="text-muted-foreground text-xs truncate max-w-[200px] block">{row.original.adresse}</span>
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row.original)} className="text-primary" disabled={loading}>
            Modifier
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row.original.id)} className="text-rose-600 hover:text-rose-700" disabled={loading}>
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-primary text-sm font-semibold tracking-widest uppercase">Partenaires</p>
          <PageTitle title="Gestion des Fournisseurs" desc="Gérez vos contacts et sources d'approvisionnement." />
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            form.reset();
          }}
          className="shadow-lg transition-transform active:scale-95"
        >
          {showForm ? "Masquer" : "Nouveau Fournisseur"}
        </Button>
      </div>

      {showForm && (
        <div className="border border-primary/10 rounded-2xl p-8 mb-6 bg-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{editing ? "Modifier le profil" : "Nouveau Partenaire"}</h2>
              <p className="text-sm text-muted-foreground">Renseignez les coordonnées pour faciliter les commandes futures.</p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput label="Nom du fournisseur" name="nom" form={form} placeholder="Ex: Medical Supply Co." withAsterisk />
                <TextInput label="Contact Téléphonique" name="telephone" form={form} placeholder="Ex: 0522..." withAsterisk />
              </div>
              <TextInput label="Adresse du siège / Dépôt" name="adresse" form={form} placeholder="Ex: 123 Rue de la Santé, Casablanca" withAsterisk />
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditing(null); form.reset(); }}
                >
                  Annuler
                </Button>
                <Button type="submit" className="px-10 shadow-md" disabled={loading}>{editing ? "Sauvegarder" : "Inscrire le fournisseur"}</Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="border rounded-2xl p-6 bg-white shadow-sm border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-800">Liste des Partenaires</h3>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{fournisseurs.length} enregistrés</span>
          </div>
          <div className="flex gap-3">
             <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                  className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none min-w-[250px]"
                  placeholder="Rechercher par nom..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <Button variant="outline" size="sm" onClick={fetchFournisseurs} disabled={loading} className="rounded-xl border-gray-200">
                {loading ? "..." : "Actualiser"}
             </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

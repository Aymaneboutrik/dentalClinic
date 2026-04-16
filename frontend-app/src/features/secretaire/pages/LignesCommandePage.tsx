import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import { Form } from "@components/ui/form";
import TextInput from "@components/inputs/text-input";
import PageTitle from "@components/commons/page-title";

const BASE_URL = "/api/stock";

const ligneSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  quantite: z.coerce.number().min(1, "La quantité est obligatoire"),
  prixUnitaire: z.coerce.number().min(0, "Le prix unitaire est obligatoire"),
  commandeId: z.coerce.number().min(1, "L'ID de commande est obligatoire"),
});

type LigneForm = z.infer<typeof ligneSchema>;

interface LigneCommande {
  id: number;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  commandeId: number;
  etat: string;
}

const ajouterProduitSchema = z.object({
  nom: z.string().min(1, "Le nom du produit est obligatoire"),
  description: z.string().min(1, "La description est obligatoire"),
  quantite: z.coerce.number().min(0),
  seuilAlerte: z.coerce.number().min(0),
  datePeremption: z.string().min(1, "La date de péremption est obligatoire"),
});
type AjouterProduitForm = z.infer<typeof ajouterProduitSchema>;

export default function LignesCommandePage() {
  const [lignes, setLignes] = useState<LigneCommande[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAjouterForm, setShowAjouterForm] = useState(false);
  const [selectedLigneId, setSelectedLigneId] = useState<number | null>(null);
  const [fetched, setFetched] = useState(false);

  const form = useForm<LigneForm>({
    resolver: zodResolver(ligneSchema),
    defaultValues: { nom: "", quantite: 1, prixUnitaire: 0, commandeId: 0 },
  });

  const ajouterForm = useForm<AjouterProduitForm>({
    resolver: zodResolver(ajouterProduitSchema),
    defaultValues: { nom: "", description: "", quantite: 0, seuilAlerte: 0, datePeremption: "" },
  });

  const fetchLignes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/LigneCommande`);
      const data = await res.json();
      setLignes(data);
      setFetched(true);
    } catch {
      alert("Erreur lors du chargement des lignes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: LigneForm) => {
    try {
      await fetch(`${BASE_URL}/LigneCommande`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: 0, ...values, sousTotal: values.quantite * values.prixUnitaire, etat: 0 }),
      });
      form.reset();
      setShowForm(false);
      fetchLignes();
    } catch {
      alert("Erreur lors de la création de la ligne");
    }
  };

  const handleAjouter = async (values: AjouterProduitForm) => {
    if (!selectedLigneId) return;
    try {
      const res = await fetch(`${BASE_URL}/LigneCommande/${selectedLigneId}/ajouter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: 0, ...values }),
      });
      if (res.ok) {
        alert("Produit ajouté avec succès au stock");
        setShowAjouterForm(false);
        setSelectedLigneId(null);
        ajouterForm.reset();
        fetchLignes();
      } else {
        const msg = await res.text();
        alert(msg);
      }
    } catch {
      alert("Erreur lors de l'ajout du produit");
    }
  };

  const openAjouterForm = async (ligneId: number, ligneNom: string, commandeId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/Commande`);
      const commandes = await res.json();
      const commande = commandes.find((c: any) => c.id === commandeId);

      if (!commande) {
        alert("Commande introuvable");
        return;
      }
      if (commande.statut === "Refusee") {
        alert("Impossible : la commande associée a été refusée.");
        return;
      }
      if (commande.statut === "ModificationExigee") {
        alert("Impossible : une modification a été exigée pour cette commande.");
        return;
      }
      if (commande.statut !== "Validee") {
        alert("Impossible : la commande doit être validée avant d'ajouter les produits.");
        return;
      }

      setSelectedLigneId(ligneId);
      ajouterForm.setValue("nom", ligneNom);
      setShowAjouterForm(true);
    } catch {
      alert("Erreur lors de la vérification de la commande");
    }
  };

  const columns: ColumnDef<LigneCommande>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "nom", header: "Produit" },
    { accessorKey: "quantite", header: "Quantité" },
    { accessorKey: "prixUnitaire", header: "Prix unitaire" },
    { accessorKey: "sousTotal", header: "Sous-total" },
    { accessorKey: "commandeId", header: "ID Commande" },
    {
      accessorKey: "etat",
      header: "État",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.etat === "Ajoutee" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
          {row.original.etat === "Ajoutee" ? "Ajoutée" : "Non ajoutée"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.etat === "NonAjoutee" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAjouterForm(row.original.id, row.original.nom, row.original.commandeId)}
            >
              Ajouter comme produit
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-primary text-sm font-medium">Gestion du stock</p>
          <PageTitle title="Lignes de commande" desc="Ajoutez des lignes de commande (produits) à une commande" />
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            form.reset();
          }}
        >
          Ajouter une ligne
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Ajouter une ligne de commande</h2>
          <p className="text-muted-foreground mb-4">
            Ajoutez un produit à une commande existante.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput label="Nom du produit" name="nom" form={form} placeholder="Nom" withAsterisk />
                <TextInput label="ID Commande" name="commandeId" form={form} placeholder="ID de la commande" withAsterisk />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput label="Quantité" name="quantite" form={form} placeholder="1" withAsterisk />
                <TextInput label="Prix unitaire" name="prixUnitaire" form={form} placeholder="0.00" withAsterisk />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); form.reset(); }}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {showAjouterForm && (
        <div className="border rounded-xl p-6 mb-6 border-primary">
          <h2 className="text-xl font-bold mb-2">Ajouter comme produit au stock</h2>
          <p className="text-muted-foreground mb-4">
            Complétez les informations du produit. S'il existe déjà, la quantité sera mise à jour.
          </p>
          <Form {...ajouterForm}>
            <form onSubmit={ajouterForm.handleSubmit(handleAjouter)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput label="Nom du produit" name="nom" form={ajouterForm} placeholder="Nom" withAsterisk />
                <TextInput label="Description" name="description" form={ajouterForm} placeholder="Description" withAsterisk />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextInput label="Quantité initiale" name="quantite" form={ajouterForm} placeholder="0" withAsterisk />
                <TextInput label="Seuil d'alerte" name="seuilAlerte" form={ajouterForm} placeholder="0" withAsterisk />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    Date de péremption <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    className="border rounded px-3 py-2 bg-background text-sm"
                    {...ajouterForm.register("datePeremption")}
                  />
                  {ajouterForm.formState.errors.datePeremption && (
                    <p className="text-destructive text-xs">{ajouterForm.formState.errors.datePeremption.message}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowAjouterForm(false); setSelectedLigneId(null); ajouterForm.reset(); }}
                >
                  Annuler
                </Button>
                <Button type="submit">Ajouter au stock</Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Liste des lignes de commande</h3>
          <Button variant="outline" onClick={fetchLignes} disabled={loading}>
            {loading ? "Chargement..." : fetched ? "Actualiser" : "Charger"}
          </Button>
        </div>
        <DataTable columns={columns} data={lignes} loading={loading} />
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import { Form } from "@components/ui/form";
import TextareaInput from "@components/inputs/textarea-input";
import PageTitle from "@components/commons/page-title";

const BASE_URL = "/api/CommandeDentiste";

const statutLabels: Record<string, string> = {
  EnAttente: "En attente",
  Validee: "Validée",
  Refusee: "Refusée",
};

const statutColors: Record<string, string> = {
  EnAttente: "bg-amber-100 text-amber-800 border-amber-200",
  Validee: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Refusee: "bg-rose-100 text-rose-800 border-rose-200",
};

interface Commande {
  id: number;
  nom: string;
  date: string;
  statut: string;
  fournisseurId: number;
}

const refusSchema = z.object({
  note: z.string().min(1, "La note est obligatoire"),
});
type RefusForm = z.infer<typeof refusSchema>;

export default function CommandesDoctorPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [showRefusForm, setShowRefusForm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const refusForm = useForm<RefusForm>({
    resolver: zodResolver(refusSchema),
    defaultValues: { note: "" },
  });

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/Commande");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const mappedData = data.map((c: any) => ({
        ...c,
        statut: c.statut === 0 ? "EnAttente" : c.statut === 1 ? "Validee" : "Refusee"
      }));
      setCommandes(mappedData);
      setFetched(true);
    } catch {
      console.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  const handleValider = async (id: number) => {
    if (!confirm(`Valider la commande #${id} ? Cela mettra à jour le stock automatiquement.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/${id}/valider`, { method: "POST" });
      if (res.ok) {
        alert("Commande validée avec succès.");
        await fetchCommandes();
      } else {
        const errorData = await res.json();
        alert(`Erreur : ${errorData.message || 'Action impossible'}`);
        setLoading(false);
      }
    } catch {
      alert("Erreur réseau.");
      setLoading(false);
    }
  };

  const openRefusForm = (id: number) => {
    setSelectedId(id);
    refusForm.reset();
    setShowRefusForm(true);
  };

  const handleRefuser = async (values: RefusForm) => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/${selectedId}/refuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values.note),
      });
      if (res.ok) {
        alert("Commande refusée.");
        setShowRefusForm(false);
        setSelectedId(null);
        refusForm.reset();
        await fetchCommandes();
      } else {
        const errorData = await res.json();
        alert(`Erreur : ${errorData.message || 'Action impossible'}`);
        setLoading(false);
      }
    } catch {
      alert("Erreur réseau.");
      setLoading(false);
    }
  };

  const columns: ColumnDef<Commande>[] = [
    { accessorKey: "id", header: "ID" },
    { 
      accessorKey: "nom", 
      header: "Libellé",
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.nom}</span>
    },
    {
      accessorKey: "date",
      header: "Date de création",
      cell: ({ row }) => row.original.date ? new Date(row.original.date).toLocaleDateString() : "-",
    },
    { 
      accessorKey: "fournisseurId", 
      header: "ID Fournisseur",
      cell: ({ row }) => <span className="text-xs bg-gray-100 px-2 py-0.5 rounded border">{row.original.fournisseurId}</span>
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statutColors[row.original.statut] ?? "bg-gray-100 text-gray-700"}`}>
          {statutLabels[row.original.statut] ?? row.original.statut}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.statut === "EnAttente" && (
            <>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                onClick={() => handleValider(row.original.id)}
                disabled={loading}
              >
                Valider
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
                onClick={() => openRefusForm(row.original.id)}
                disabled={loading}
              >
                Refuser
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-primary text-sm font-semibold uppercase tracking-wider">Interface Doctor</p>
          <PageTitle title="Approbation des Commandes" desc="Revoyez les commandes en attente et validez-les pour approvisionner le stock." />
        </div>
      </div>

      {showRefusForm && (
        <div className="border border-rose-200 rounded-2xl p-8 bg-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Motif du Refus</h2>
              <p className="text-sm text-muted-foreground">Veuillez indiquer pourquoi la commande #{selectedId} est refusée.</p>
            </div>
          </div>
          
          <Form {...refusForm}>
            <form onSubmit={refusForm.handleSubmit(handleRefuser)} className="space-y-6">
              <TextareaInput
                label="Commentaire de refus"
                name="note"
                form={refusForm}
                placeholder="Ex: Prix trop élevé, produit non conforme..."
                withAsterisk
              />
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowRefusForm(false); setSelectedId(null); refusForm.reset(); }}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="destructive" className="px-8 shadow-md" disabled={loading}>
                  {loading ? "Traitement..." : "Confirmer le Refus"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      <div className="border rounded-2xl p-6 bg-white shadow-sm border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-800">Commandes à traiter</h3>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{commandes.length} au total</span>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchCommandes} disabled={loading} className="text-primary">
            {loading ? "Chargement..." : "Actualiser"}
          </Button>
        </div>
        <DataTable columns={columns} data={commandes} loading={loading} />
      </div>
    </div>
  );
}
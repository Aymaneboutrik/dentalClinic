import { useState, useEffect } from "react";
import secureApi from "@apis/instances/secure-api";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@components/data-table/data-table";
import { Button } from "@components/ui/button";
import PageTitle from "@components/commons/page-title";

const BASE_URL = "/factures";

interface Facture {
  id: number;
  montantBrut: number;
  montantNet: number;
  date: string;
  statut: string;
  totalRemises: number;
  resteAPayer: number;
}

interface FicheFacture {
  id: number;
  date: string;
  statut: string;
  montantBrut: number;
  totalRemises: number;
  montantNet: number;
  totalPaye: number;
  resteAPayer: number;
  lignesFacture: any[];
  remises: any[];
  paiements: any[];
}

export default function DoctorFacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);
  const [ficheFacture, setFicheFacture] = useState<FicheFacture | null>(null);

  const fetchFactures = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`${BASE_URL}`);
      setFactures(res.data);
      setFetched(true);
    } catch {
      alert("Erreur lors du chargement des factures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const fetchFicheFacture = async (id: number) => {
    try {
      const res = await secureApi.get(`${BASE_URL}/${id}/fiche`);
      setFicheFacture(res.data);
    } catch {
      alert("Erreur lors du chargement de la fiche de facture");
    }
  };

  const filtered = factures.filter(
    (f) =>
      f.id.toString().includes(search) ||
      f.statut.toLowerCase().includes(search.toLowerCase()) ||
      f.date.includes(search)
  );

  const columns: ColumnDef<Facture>[] = [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => row.original.date?.split("T")[0] ?? "-",
    },
    { accessorKey: "montantBrut", header: "Montant Brut (MAD)" },
    { accessorKey: "totalRemises", header: "Total Remises (MAD)" },
    { accessorKey: "montantNet", header: "Montant Net (MAD)" },
    { accessorKey: "resteAPayer", header: "Reste à Payer (MAD)" },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center organic-pill border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
            row.original.statut === "PAYEE"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : row.original.statut === "PARTIEL"
              ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {row.original.statut}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => fetchFicheFacture(row.original.id)} className="organic-pill px-6 text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-white/5 shadow-lg">
          Voir Fiche
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="p-8 border shadow-2xl organic-card bg-card/40 backdrop-blur-md border-white/5 mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary uppercase tracking-widest">Consultation</p>
            <h1 className="text-3xl font-black tracking-tight">Factures</h1>
            <p className="text-slate-400 text-sm">Gérez et consultez l'historique complet des facturations patients.</p>
          </div>
        </div>
      </div>

      {ficheFacture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#081028]/80 backdrop-blur-xl p-4">
          <div className="bg-[#0f172a] border border-white/5 organic-card p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Fiche Facture <span className="text-primary">N°{ficheFacture.id}</span></h2>
                <p className="text-slate-400 text-sm mt-1">Détail complet des actes, remises et règlements.</p>
              </div>
              <Button variant="outline" onClick={() => setFicheFacture(null)} className="organic-pill px-8 h-12 text-[11px] font-black uppercase tracking-widest border-white/10 hover:bg-white/5">Fermer</Button>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="organic-card bg-white/5 p-6 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Date d'émission</p>
                <p className="font-bold text-white text-lg">{ficheFacture.date}</p>
              </div>
              <div className="organic-card bg-white/5 p-6 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Statut Règlement</p>
                <p className="font-bold text-white text-lg">{ficheFacture.statut}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12 bg-white/5 p-6 organic-card border border-white/5 shadow-inner">
              <div className="text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Montant Brut</p>
                <p className="font-black text-xl text-white">{ficheFacture.montantBrut} <span className="text-xs">MAD</span></p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Remises</p>
                <p className="font-black text-xl text-rose-500">-{ficheFacture.totalRemises} <span className="text-xs">MAD</span></p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Montant Net</p>
                <p className="font-black text-xl text-blue-400">{ficheFacture.montantNet} <span className="text-xs">MAD</span></p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Payé</p>
                <p className="font-black text-xl text-emerald-400">{ficheFacture.totalPaye} <span className="text-xs">MAD</span></p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Reste à Payer</p>
                <p className="font-black text-xl text-orange-500">{ficheFacture.resteAPayer} <span className="text-xs">MAD</span></p>
              </div>
            </div>

            <div className="space-y-10">
              <section>
                <h3 className="font-black text-lg text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-2 h-6 bg-blue-500 organic-pill"></span>
                  Lignes de Facture
                </h3>
                <div className="overflow-hidden organic-card border border-white/5">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="p-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Acte Médical</th>
                        <th className="p-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Quantité</th>
                        <th className="p-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Prix Unitaire</th>
                        <th className="p-4 font-black uppercase tracking-widest text-[10px] text-slate-400 text-right">Sous-Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {ficheFacture.lignesFacture.length > 0 ? (
                        ficheFacture.lignesFacture.map((l, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-white font-medium">{l.libelleActe} <span className="text-slate-500 text-xs ml-2">#{l.acteMedicalId}</span></td>
                            <td className="p-4 text-slate-300">{l.quantite}</td>
                            <td className="p-4 text-slate-300">{l.prixUnitaire} MAD</td>
                            <td className="p-4 text-white font-black text-right">{l.sousTotal} MAD</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-500">Aucune ligne enregistrée</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-black text-lg text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-2 h-6 bg-rose-500 organic-pill"></span>
                  Remises Appliquées
                </h3>
                <div className="overflow-hidden organic-card border border-white/5">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="p-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Date</th>
                        <th className="p-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Type</th>
                        <th className="p-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Valeur</th>
                        <th className="p-4 font-black uppercase tracking-widest text-[10px] text-slate-400 text-right">Impact</th>
                        <th className="p-4 font-black uppercase tracking-widest text-[10px] text-slate-400 text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {ficheFacture.remises.length > 0 ? (
                        ficheFacture.remises.map((r, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-slate-300">{r.dateRemise}</td>
                            <td className="p-4 text-slate-300">{r.typeRemise}</td>
                            <td className="p-4 text-white font-bold">{r.valeur} {r.typeRemise === 'POURCENTAGE' ? '%' : 'MAD'}</td>
                            <td className="p-4 text-rose-500 font-black text-right">-{r.montantCalcule} MAD</td>
                            <td className="p-4 text-center">
                              <span className={`px-3 py-1 organic-pill text-[9px] font-black uppercase tracking-widest ${r.estAutorisee ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                                {r.estAutorisee ? "Validée" : "En attente"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">Aucune remise appliquée</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-black text-lg text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-2 h-6 bg-emerald-500 organic-pill"></span>
                  Historique des Règlements
                </h3>
                <div className="overflow-hidden organic-card border border-white/5">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="p-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Date de paiement</th>
                        <th className="p-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Mode de règlement</th>
                        <th className="p-4 font-black uppercase tracking-widest text-[10px] text-slate-400 text-right">Montant versé</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {ficheFacture.paiements.length > 0 ? (
                        ficheFacture.paiements.map((p, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-slate-300">{p.datePaiement}</td>
                            <td className="p-4 text-slate-300">
                              <span className="bg-white/5 px-3 py-1 organic-pill text-[10px] font-bold text-blue-400 border border-white/10">
                                {p.modePaiement}
                              </span>
                            </td>
                            <td className="p-4 text-emerald-400 font-black text-right">+{p.montant} MAD</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={3} className="p-8 text-center text-slate-500">Aucun paiement enregistré</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      <div className="border shadow-2xl organic-card bg-card/40 backdrop-blur-md border-white/5 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h3 className="font-black text-xl text-white tracking-tight">Liste des factures</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              className="organic-pill border border-white/10 px-6 py-2.5 text-sm bg-white/5 text-white outline-none focus:border-blue-500/50 transition-all min-w-[300px]"
              placeholder="Rechercher par ID, Statut..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={fetchFactures} disabled={loading} className="organic-button px-8 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg">
              {loading ? "..." : fetched ? "Actualiser" : "Charger"}
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
}

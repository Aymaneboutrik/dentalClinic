import { useState, useEffect } from "react";
import { DashboardHeader } from "../../../components/commons/dashboard/DashboardHeader";
import { patientService, Patient } from "@apis/services/patient";
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  FileText, 
  History, 
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function PatientListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.secretaryListPatients();
      setPatients(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des patients");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <DashboardHeader
          title="Annuaire des Patients"
          subtitle="Consultez et gérez les dossiers administratifs"
        />
        
        <div className="flex items-center space-x-3 md:mb-10">
          <button className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-primary/20">
            <UserPlus className="w-4 h-4" />
            <span>Nouveau Patient</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Rechercher par Nom, Prénom ou CIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
          />
        </div>
        <button className="flex items-center space-x-2 bg-white/5 border border-white/10 hover:bg-white/10 px-6 py-3 rounded-2xl font-semibold transition-all">
          <Filter className="w-4 h-4" />
          <span>Filtres</span>
        </button>
      </div>

      {/* Patients Table */}
      <div className="glass border-white/5 shadow-2xl rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-muted-foreground">Patient</th>
                <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-muted-foreground">CIN</th>
                <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-muted-foreground">Contact</th>
                <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 bg-white/5" />
                  </tr>
                ))
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => navigate(`history?cin=${patient.cin}`)}>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {patient.nom.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{patient.prenom} {patient.nom}</p>
                          <p className="text-xs text-muted-foreground font-medium">Créé le 12/03/2024</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono text-sm font-medium">{patient.cin}</td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{patient.telephone || "---"}</p>
                        <p className="text-xs text-muted-foreground">{patient.email || "---"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-500 uppercase tracking-wider">
                        Actif
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`history?cin=${patient.cin}`);
                          }}
                          className="p-2 hover:bg-primary/20 rounded-lg text-muted-foreground hover:text-primary transition-all"
                          title="Historique Médical"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground transition-all"
                          title="Documents"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground transition-all"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/30">
                        <Search className="w-8 h-8" />
                      </div>
                      <p className="text-muted-foreground font-medium">Aucun patient trouvé</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

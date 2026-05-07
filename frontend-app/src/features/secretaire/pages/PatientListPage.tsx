import { useState, useEffect } from "react";
import { DashboardHeader } from "../../../components/commons/dashboard/DashboardHeader";
import { patientService, Patient } from "@apis/services/patient";
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  FileText, 
  History, 
  Filter,
  Edit,
  Archive,
  ArchiveRestore,
  Eye
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@components/ui/dropdown-menu";
import { PatientActionModal } from "../components/PatientActionModal";
import useAuthStore from "@stores/auth-store";
import { useSearchStore } from "@stores/use-search-store";

export default function PatientListPage() {
  const { user } = useAuthStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { searchTerm, resetSearch } = useSearchStore();

  useEffect(() => {
    fetchPatients();
    // Clear global search when leaving or entering this page? 
    // Actually, it's better to keep it if the user wants to jump between views.
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data =
    user?.role === "Assistant" || user?.role === "Assistante"
    ? await patientService.assistantListPatients()
    : await patientService.secretaryListPatients();
      setPatients(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des patients");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await patientService.secretaryArchivePatient(id);
      toast.success("Dossier archivé");
      fetchPatients();
    } catch (error) {
      toast.error("Erreur lors de l'archivage");
    }
  };

  const handleUnarchive = async (id: number) => {
    try {
      await patientService.secretaryUnarchivePatient(id);
      toast.success("Dossier désarchivé");
      fetchPatients();
    } catch (error) {
      toast.error("Erreur lors du désarchivage");
    }
  };

  const openModal = (mode: "create" | "edit" | "view", patient: Patient | null = null) => {
    setModalMode(mode);
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const filteredPatients = patients
    .filter(p => 
      (p.nom?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
      (p.prenom?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p.cin?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const nameA = `${a.nom} ${a.prenom}`.toLowerCase();
      const nameB = `${b.nom} ${b.prenom}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <DashboardHeader
          title="Annuaire des Patients"
          subtitle="Consultez et gérez les dossiers administratifs"
        />
        
        {user?.role !== "Assistant" && user?.role !== "Assistante" && (
          <div className="flex items-center space-x-3 md:mb-10">
            <button 
              onClick={() => openModal("create")}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 organic-pill font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nouveau Patient</span>
            </button>
          </div>
        )}
      </div>

      {/* Patients Table */}
      <div className="glass border-white/5 shadow-2xl organic-card">
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
                  <tr 
                    key={patient.id} 
                    className="hover:bg-white/5 transition-colors group cursor-pointer" 
                    onClick={() => navigate(`history?cin=${patient.cin}`)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {patient.nom ? patient.nom.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors capitalize">{patient.prenom} {patient.nom}</p>
                          <p className="text-xs text-muted-foreground font-medium">Dossier #{patient.id}</p>
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
                      {patient.archived ? (
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/5 text-muted-foreground uppercase tracking-wider">
                          Archivé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-500 uppercase tracking-wider">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">

                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground transition-all">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 glass border-white/10">
                            <DropdownMenuItem onClick={() => openModal(user?.role === "Assistant" || user?.role === "Assistante" ? "view" : "edit", patient)}>
                              {user?.role === "Assistant" || user?.role === "Assistante" ? <Eye className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                              <span>{user?.role === "Assistant" || user?.role === "Assistante" ? "Consulter" : "Consulter ou modifier"}</span>
                            </DropdownMenuItem>
                            {user?.role !== "Assistant" && user?.role !== "Assistante" && (
                              <>
                                <DropdownMenuSeparator className="bg-white/5" />
                                {patient.archived ? (
                                  <DropdownMenuItem onClick={() => patient.id && handleUnarchive(patient.id)}>
                                    <ArchiveRestore className="w-4 h-4 mr-2 text-green-500" />
                                    <span className="text-green-500">Désarchiver</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => patient.id && handleArchive(patient.id)}>
                                    <Archive className="w-4 h-4 mr-2 text-red-500" />
                                    <span className="text-red-500">Archiver</span>
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Patient Action Modal */}
      <PatientActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPatients}
        mode={modalMode}
        patient={selectedPatient}
      />
    </div>
  );
}

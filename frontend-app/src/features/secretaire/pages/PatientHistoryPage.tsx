import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardHeader } from "../../../components/commons/dashboard/DashboardHeader";
import { patientService, Patient, Consultation } from "@apis/services/patient";
import { 
  Search, 
  FileText, 
  Clock, 
  User, 
  Calendar,
  Download,
  Upload,
  ShieldCheck,
  AlertCircle,
  Edit,
  Pencil,
  Trash2,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { PatientActionModal } from "../components/PatientActionModal";
import { ConsultationModal } from "../components/ConsultationModal";
import { PrescriptionModal } from "../components/PrescriptionModal";
import { DocumentUploadModal } from "../components/DocumentUploadModal";
import { ConsultationDocsModal } from "../components/ConsultationDocsModal";
import { AddObservationModal } from "../components/AddObservationModal";
import useAuthStore from "@stores/auth-store";

import { useSearchStore } from "@stores/use-search-store";

export default function PatientHistoryPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams()[0];
  const cinFromUrl = searchParams.get("cin");
  
  const { searchTerm, setSearchTerm } = useSearchStore();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<Consultation[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isConsultDocsModalOpen, setIsConsultDocsModalOpen] = useState(false);
  const [isAddObservationModalOpen, setIsAddObservationModalOpen] = useState(false);
  const [selectedConsultId, setSelectedConsultId] = useState<number | null>(null);
  const [selectedConsultDate, setSelectedConsultDate] = useState("");
  const [uploading, setUploading] = useState(false);
  // Remove direct file ref usage as we now use DocumentUploadModal
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cinFromUrl) {
      handleSearch(cinFromUrl);
    }
  }, [cinFromUrl]);

  const handleSearch = async (cinValue: string = searchTerm) => {
    if (!cinValue.trim()) return;
    
    setLoading(true);
    setSearched(true);
    try {
      const patientData = await patientService.secretaryGetPatientByCin(cinValue);
      setPatient(patientData);
      
      const historyData = await patientService.secretaryGetHistoryByCin(cinValue);
      setHistory(historyData);

      if (patientData?.dossierId) {
        const docs = user?.role === "Secretaire" 
          ? await patientService.secretaryGetDossierDocuments(patientData.dossierId)
          : await patientService.getDossierDocuments(patientData.dossierId);
        setDocuments(docs);
      }
    } catch {
      setPatient(null);
      setHistory([]);
      setDocuments([]);
      toast.error("Patient non trouvé ou erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleRenameDocument = async (id: number, currentName: string) => {
    const newName = window.prompt("Entrez le nouveau nom du document :", currentName);
    if (newName && newName !== currentName) {
      try {
        await patientService.renameDocument(id, newName);
        toast.success("Document renommé");
        if (cinFromUrl) handleSearch(cinFromUrl);
        else if (patient?.cin) handleSearch(patient.cin);
      } catch (error) {
        toast.error("Erreur lors du changement de nom");
        console.error(error);
      }
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.")) {
      try {
        await patientService.deleteDocument(id);
        toast.success("Document supprimé");
        if (cinFromUrl) handleSearch(cinFromUrl);
        else if (patient?.cin) handleSearch(patient.cin);
      } catch (error) {
        toast.error("Erreur lors de la suppression");
        console.error(error);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !patient?.dossierId) return;

    setUploading(true);
    try {
      await patientService.uploadDossierDocument(patient.dossierId, file);
      toast.success("Document ajouté avec succès");
      // Refresh the page data if needed, or at least the document list if it was dynamic
      if (cinFromUrl) handleSearch(cinFromUrl);
    } catch (error) {
      toast.error("Erreur lors de l'envoi du document");
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getBackPath = () => {
    const role = user?.role || "";
    if (["Dentiste", "Doctor", "Medecin"].includes(role)) return "/doctor/patients";
    if (["Assistant", "Assistante"].includes(role)) return "/assistant/patients";
    return "/secretaire/patients";
  };

  return (
    <div className="space-y-8 pb-10">
      <DashboardHeader
        title="Dossier Médical"
        subtitle="Historique des consultations et gestion du profil"
        backPath={getBackPath()}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Récupération des données sécurisées...</p>
        </div>
      ) : patient ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Patient Profile */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass border-white/5 p-8 organic-card shadow-xl sticky top-24">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/40 relative group">
                  <User className="w-12 h-12" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-background rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center space-x-2">
                    <h2 className="text-2xl font-black tracking-tight capitalize">{patient.prenom} {patient.nom}</h2>
                    {user?.role !== "Assistant" && user?.role !== "Assistante" && (
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="p-2 hover:bg-primary/20 rounded-xl text-primary transition-all active:scale-90"
                        title="Modifier les coordonnées personnelles (Nom, CIN, etc.)"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-primary font-bold tracking-widest uppercase text-xs mt-1">CIN: {patient.cin}</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter mb-1">Contact</p>
                  <p className="font-semibold text-sm">{patient.telephone || "Non renseigné"}</p>
                  <p className="text-xs text-muted-foreground truncate">{patient.email || "Pas d'email"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter mb-1">Informations</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Sexe</p>
                      <p className="text-sm font-bold uppercase">{patient.sexe || "M"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Naissance</p>
                      <p className="text-sm font-bold">{patient.dateNaissance || "---"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {user?.role !== "Assistant" && user?.role !== "Assistante" && (
                <button 
                  onClick={() => setIsDocModalOpen(true)}
                  className="w-full mt-6 flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 p-4 organic-button font-bold transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Ajouter un document administratif</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: History & Timeline */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* History Section */}
            <div className="glass border-white/5 p-8 organic-card shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Historique des consultations</span>
                </h3>
                {["Dentiste", "Doctor", "Medecin"].includes(user?.role || "") && (
                  <button 
                    className="flex items-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary px-6 py-2 organic-pill font-black uppercase tracking-widest text-[10px] transition-all active:scale-95"
                    onClick={() => setIsConsultModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouvelle Consultation</span>
                  </button>
                )}
              </div>

              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {history.length > 0 ? history.map((consult, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-8 organic-card-reverse glass border-white/5 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                      <div className="flex items-center justify-between mb-2">
                        <time className="font-mono text-xs font-bold text-primary">{consult.dateConsultation || "Date inconnue"}</time>
                      </div>
                      <div className="text-foreground font-bold mb-1">{consult.motif}</div>
                      {["Dentiste", "Doctor", "Medecin", "Assistant", "Assistante"].includes(user?.role || "") ? (
                        <div className="space-y-2 mt-2">
                          {consult.observations && consult.observations.length > 0 ? (
                            consult.observations.map((obs: any, i: number) => (
                              <div key={i} className="space-y-1">
                                <p className="text-sm text-muted-foreground bg-white/5 p-2 rounded-lg border border-white/5 italic">
                                  "{obs.contenu}"
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 px-2 flex items-center">
                                  {obs.typeAuteur === "ASSISTANTE" ? "Note Assistant" : "Note Dentiste"}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground italic">Aucune observation consignée</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm line-clamp-2">Observations médicales confidentielles</div>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {["Dentiste", "Doctor", "Medecin"].includes(user?.role || "") && (
                           <button 
                            className="text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-500 px-3 py-1 rounded-full hover:bg-green-500/20 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (consult.id) {
                                setSelectedConsultId(consult.id);
                                setIsPrescriptionModalOpen(true);
                              }
                            }}
                           >
                            Ordonnance
                           </button>
                        )}
                        {user?.role !== "Secretaire" && (
                          <button 
                            className="text-[10px] font-bold uppercase tracking-widest bg-white/5 text-muted-foreground px-3 py-1 rounded-full hover:bg-white/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (consult.id) {
                                setSelectedConsultId(consult.id);
                                setSelectedConsultDate(consult.dateConsultation || "");
                                setIsConsultDocsModalOpen(true);
                              }
                            }}
                          >
                            Documents
                          </button>
                        )}
                        {["Assistant", "Assistante", "Dentiste", "Doctor", "Medecin"].includes(user?.role || "") && (
                          <button 
                            className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full hover:bg-blue-500/20 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (consult.id) {
                                setSelectedConsultId(consult.id);
                                setIsAddObservationModalOpen(true);
                              }
                            }}
                          >
                            {user?.role === "Assistant" || user?.role === "Assistante" ? "+ Note Assistant" : "+ Note"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-10 text-center">
                    <p className="text-muted-foreground font-medium italic">Aucune consultation enregistrée pour ce patient.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Administrative Documents Section */}
            <div className="glass border-white/5 p-8 rounded-[2rem] shadow-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Documents Administratifs</span>
              </h3>
              {documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all group gap-4"
                    >
                      {/* Left: Icon & Info */}
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${doc.type === 'MEDICAL' ? 'bg-primary/20 text-primary' : 'bg-blue-500/20 text-blue-500'}`}>
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors" title={doc.nom}>
                            {doc.nom}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {doc.dateAjout || "Date inconnue"}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center space-x-1 shrink-0">
                        {user?.role !== "Assistant" && user?.role !== "Assistante" && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); doc.id && handleRenameDocument(doc.id, doc.nom); }}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-white/10 rounded-xl transition-all"
                            title="Renommer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (doc.id) {
                              const downloadFn = user?.role === "Secretaire" 
                                ? patientService.secretaryDownloadDocument(doc.id)
                                : patientService.downloadDocument(doc.id);
                                
                              downloadFn.then(blob => {
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.style.display = 'none';
                                a.href = url;
                                a.download = doc.nom || "document";
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                              }).catch(error => {
                                console.error("Download error:", error);
                                toast.error("Erreur lors du téléchargement du document.");
                              });
                            }
                          }}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-white/10 rounded-xl transition-all"
                          title="Télécharger"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {user?.role !== "Assistant" && user?.role !== "Assistante" && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); doc.id && handleDeleteDocument(doc.id); }}
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-muted-foreground text-sm italic">Aucun document dans le dossier.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      ) : searched ? (
        <div className="glass border-white/5 p-20 organic-card shadow-xl text-center">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 animate-bounce">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Patient introuvable</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">Le CIN saisi ne correspond à aucun dossier dans notre base de données. Veuillez vérifier le code ou créer un nouveau patient.</p>
            </div>
            <button className="text-primary font-bold hover:underline">Vérifier l'orthographe du CIN</button>
          </div>
        </div>
      ) : (
        <div className="glass border-white/5 p-20 organic-card shadow-xl text-center">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Search className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Prêt à rechercher ?</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">Saisissez un numéro de CIN ci-dessus pour accéder instantanément au dossier complet du patient.</p>
            </div>
          </div>
        </div>
      )}

      {/* Patient Action Modal */}
      <PatientActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          if (cinFromUrl) handleSearch(cinFromUrl);
          else if (patient?.cin) handleSearch(patient.cin);
        }}
        mode="edit"
        patient={patient}
      />

      <ConsultationModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        onSuccess={() => {
          if (cinFromUrl) handleSearch(cinFromUrl);
          else if (patient?.cin) handleSearch(patient.cin);
        }}
        patientId={patient?.id || 0}
      />

      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        onSuccess={() => {
          if (cinFromUrl) handleSearch(cinFromUrl);
          else if (patient?.cin) handleSearch(patient.cin);
        }}
        consultationId={selectedConsultId}
      />

      <DocumentUploadModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSuccess={() => {
          if (cinFromUrl) handleSearch(cinFromUrl);
          else if (patient?.cin) handleSearch(patient.cin);
        }}
        targetId={patient?.dossierId || 0}
        targetType="dossier"
        defaultDocType="ADMIN"
      />

      <ConsultationDocsModal
        isOpen={isConsultDocsModalOpen}
        onClose={() => setIsConsultDocsModalOpen(false)}
        consultationId={selectedConsultId}
        consultationDate={selectedConsultDate}
      />

      <AddObservationModal
        isOpen={isAddObservationModalOpen}
        onClose={() => setIsAddObservationModalOpen(false)}
        onSuccess={() => {
          if (cinFromUrl) handleSearch(cinFromUrl);
          else if (patient?.cin) handleSearch(patient.cin);
        }}
        consultationId={selectedConsultId}
      />
    </div>
  );
}

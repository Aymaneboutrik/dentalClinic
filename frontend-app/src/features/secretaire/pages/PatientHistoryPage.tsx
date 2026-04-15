import { useState, useEffect } from "react";
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
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function PatientHistoryPage() {
  const [searchParams] = useSearchParams();
  const cinFromUrl = searchParams.get("cin");
  
  const [searchTerm, setSearchTerm] = useState(cinFromUrl || "");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (cinFromUrl) {
      handleSearch(cinFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch {
      setPatient(null);
      setHistory([]);
      toast.error("Patient non trouvé ou erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <DashboardHeader
        title="Dossier Médical"
        subtitle="Consultation de l'historique et des documents par CIN"
      />

      {/* Search Section */}
      <div className="glass border-white/5 p-6 rounded-[2rem] shadow-xl">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Saisissez le CIN du patient (ex: AB12345)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? "Recherche..." : "Charger le dossier"}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Récupération des données sécurisées...</p>
        </div>
      ) : patient ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Patient Profile */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass border-white/5 p-8 rounded-[2rem] shadow-xl sticky top-24">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/40 relative group">
                  <User className="w-12 h-12" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-background rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{patient.prenom} {patient.nom}</h2>
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

              <button className="w-full mt-6 flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl font-bold transition-all">
                <Upload className="w-4 h-4" />
                <span>Ajouter un document</span>
              </button>
            </div>
          </div>

          {/* Right Column: History & Timeline */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* History Section */}
            <div className="glass border-white/5 p-8 rounded-[2rem] shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Historique des consultations</span>
                </h3>
              </div>

              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {history.length > 0 ? history.map((consult, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl glass border-white/5 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                      <div className="flex items-center justify-between mb-2">
                        <time className="font-mono text-xs font-bold text-primary">{consult.dateConsultation || "Date inconnue"}</time>
                      </div>
                      <div className="text-foreground font-bold mb-1">{consult.motif}</div>
                      <div className="text-muted-foreground text-sm line-clamp-2">Observations médicales confidentielles</div>
                      <div className="mt-4 flex space-x-2">
                        <button className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors">Détails</button>
                        <button className="text-[10px] font-bold uppercase tracking-widest bg-white/5 text-muted-foreground px-3 py-1 rounded-full hover:bg-white/10 transition-colors">Documents</button>
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

            {/* Documents Section */}
            <div className="glass border-white/5 p-8 rounded-[2rem] shadow-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Documents administratifs</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[150px]">Carte d'identité.pdf</p>
                      <p className="text-[10px] text-muted-foreground">Scanné le 10/01/2024</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : searched ? (
        <div className="glass border-white/5 p-20 rounded-[2rem] shadow-xl text-center">
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
        <div className="glass border-white/5 p-20 rounded-[2rem] shadow-xl text-center">
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
    </div>
  );
}

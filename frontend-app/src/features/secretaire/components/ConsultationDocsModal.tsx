import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { FileText, Download, Pencil, Trash2, Plus, Upload } from "lucide-react";
import { patientService } from "@apis/services/patient";
import { toast } from "sonner";
import { DocumentUploadModal } from "./DocumentUploadModal";
import useAuthStore from "@stores/auth-store";

interface ConsultationDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationId: number | null;
  consultationDate: string;
}

export function ConsultationDocsModal({
  isOpen,
  onClose,
  consultationId,
  consultationDate,
}: ConsultationDocsModalProps) {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchDocuments = async () => {
    if (!consultationId) return;
    setLoading(true);
    try {
      const data = await patientService.getConsultationDocuments(consultationId);
      setDocuments(data);
    } catch (error) {
      toast.error("Erreur lors de la récupération des documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && consultationId) {
      fetchDocuments();
    }
  }, [isOpen, consultationId]);

  const handleDownload = async (doc: any) => {
    try {
      const blob = await patientService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = doc.nom || "document";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleRename = async (doc: any) => {
    const newName = window.prompt("Entrez le nouveau nom du document :", doc.nom);
    if (newName && newName !== doc.nom) {
      try {
        await patientService.renameDocument(doc.id, newName);
        toast.success("Document renommé");
        fetchDocuments();
      } catch (error) {
        toast.error("Erreur lors du changement de nom");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Supprimer ce document ? Cette action est irréversible.")) {
      try {
        await patientService.deleteDocument(id);
        toast.success("Document supprimé");
        fetchDocuments();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] glass border-white/5 shadow-2xl organic-card-reverse max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur-xl">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <DialogTitle className="text-2xl font-black">Documents Consultation</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Visite du {consultationDate}</p>
            </div>
            {user?.role !== "Assistant" && user?.role !== "Assistante" && (
              <Button 
                size="sm" 
                className="organic-button px-6 font-black uppercase tracking-widest text-[10px] shadow-lg bg-primary text-primary-foreground"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            )}
          </DialogHeader>

          <div className="space-y-4 py-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : documents.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className="p-5 organic-card bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all group shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="max-w-[250px]">
                        <p className="text-sm font-bold truncate">{doc.nom}</p>
                        <p className="text-[10px] text-muted-foreground">{doc.dateAjout || "Date inconnue"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {user?.role !== "Assistant" && user?.role !== "Assistante" && (
                        <>
                          <button 
                            onClick={() => handleRename(doc)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Renommer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(doc.id)}
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleDownload(doc)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        title="Télécharger"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-white/5 organic-card bg-white/5 shadow-inner">
                <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium italic">Aucun document pour cette séance.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {consultationId && (
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={fetchDocuments}
          targetId={consultationId}
          targetType="consultation"
          defaultDocType="MEDICAL"
        />
      )}
    </>
  );
}

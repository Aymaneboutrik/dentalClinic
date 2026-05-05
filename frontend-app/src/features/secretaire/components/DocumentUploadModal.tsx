import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import { Input } from "@components/ui/input";
import { Upload, File } from "lucide-react";
import { patientService } from "@apis/services/patient";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetId: number;
  targetType: 'dossier' | 'consultation';
  defaultDocType?: string;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onSuccess,
  targetId,
  targetType,
  defaultDocType = "MEDICAL"
}: DocumentUploadModalProps) {
  const { t } = useTranslation();
  const [nom, setNom] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!nom) {
        const baseName = selectedFile.name.split('.').slice(0, -1).join('.');
        setNom(baseName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error(t("documents.selectFileError"));
      return;
    }

    setLoading(true);
    try {
      if (targetType === 'dossier') {
        await patientService.uploadDossierDocument(targetId, file, nom, defaultDocType);
      } else {
        await patientService.uploadConsultationDocument(targetId, file, nom, defaultDocType);
      }
      toast.success(t("documents.uploadSuccess"));
      onSuccess();
      onClose();
      setNom("");
      setFile(null);
    } catch (error) {
      toast.error(t("documents.uploadError"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { if (!loading) onClose(); }}>
      <DialogContent className="sm:max-w-[450px] glass border-white/5 shadow-2xl organic-card bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">{t("documents.addTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="nom" className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{t("documents.nameLabel")}</Label>
            <Input
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder={t("documents.namePlaceholder")}
              className="bg-white/5 border-white/10 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{t("documents.fileLabel")}</Label>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`p-10 border-2 border-dashed organic-card flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all ${file ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/5' : 'border-white/10 hover:border-primary/30 hover:bg-white/5'}`}
            >
              {file ? (
                <>
                  <File className="w-10 h-10 text-primary" />
                  <div className="text-center">
                    <p className="text-sm font-bold truncate max-w-[300px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground font-medium">{t("documents.clickToChoose")}</p>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="rounded-xl font-bold">
              {t("common.cancel")}
            </Button>
            <Button type="submit" loading={loading} disabled={!file} className="organic-button px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 bg-primary text-primary-foreground">
              {t("common.upload")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

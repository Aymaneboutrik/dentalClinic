import Text from "@components/commons/text";
import { Button } from "@components/ui/button";
import { useModal } from "@saimin/react-modal-manager";

interface Props {
  onConfirm: () => void;
}

function LogoutConfirmation({ onConfirm }: Props) {
  const { close } = useModal();

  const handleCancel = () => {
    close("logout-confirmation");
  };

  const handleLogout = () => {
    onConfirm();
    close("logout-confirmation");
  };

  return (
    <div className="w-[400px] bg-background p-8 organic-card shadow-2xl border border-white/5">
      <Text size="xl" className="font-black text-foreground mb-6 block text-center uppercase tracking-tighter">
        Confirmer la déconnexion
      </Text>

      <div className="flex gap-4 justify-center mt-6">
        <Button onClick={handleCancel} variant="outline" className="flex-1 rounded-xl font-bold">
          Annuler
        </Button>

        <Button onClick={handleLogout} className="flex-1 organic-button font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
          Déconnexion
        </Button>
      </div>
    </div>
  );
}

export default LogoutConfirmation;

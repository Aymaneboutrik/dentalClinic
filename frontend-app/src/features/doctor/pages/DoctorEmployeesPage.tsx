import { useEffect, useState } from "react";
import { userService } from "../../../apis/services/user";
import Text from "../../../components/commons/text";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Plus, RefreshCw, KeyRound, ShieldAlert } from "lucide-react";

export default function DoctorEmployeesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"equipe" | "securite">("equipe");

  // Etat pour la modale de création simple
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    nom: "", prenom: "", email: "", password: "", role: "Assistante"
  });

  // Etat pour la réinitialisation directe
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, requestsData] = await Promise.all([
        userService.getUsers(),
        userService.getPendingPasswordRequests()
      ]);
      setUsers(usersData);
      setRequests(requestsData);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await userService.toggleUserStatus(id, !currentStatus);
      toast.success(currentStatus ? "Compte désactivé" : "Compte activé");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la modification du statut");
    }
  };

  const handleApproveRequest = async (id: number) => {
    try {
      await userService.approvePasswordRequest(id);
      toast.success("Demande approuvée avec succès");
      fetchData();
    } catch (error) {
      toast.error("Erreur d'approbation");
    }
  };

  const handleRejectRequest = async (id: number) => {
    try {
      await userService.rejectPasswordRequest(id);
      toast.success("Demande refusée");
      fetchData();
    } catch (error) {
      toast.error("Erreur de refus");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation front-end plus explicite
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast.error("Format d'e-mail invalide. Exemple : employé@clinic.com");
      return;
    }

    if (newUser.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    try {
      await userService.createUser(newUser);
      toast.success(`Nouveau compte ${newUser.role} créé avec succès !`);
      setShowCreateModal(false);
      setNewUser({ nom: "", prenom: "", email: "", password: "", role: "Assistante" });
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur de création du compte");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await userService.resetPasswordDirectly(selectedUser.idUtilisateur, newPassword);
      toast.success("Mot de passe réinitialisé avec succès !");
      setShowResetModal(false);
      setNewPassword("");
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de la réinitialisation");
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-8 bg-background">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Text size="xxxl" className="font-bold text-foreground">Gestion du Cabinet</Text>
          <Text className="text-muted-foreground mt-1">Administration de l'équipe et sécurité centralisée.</Text>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="font-bold" variant="default">
          <Plus className="mr-2 h-4 w-4" /> Créer un employé
        </Button>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("equipe")}
          className={`px-4 py-2 font-bold transition-all rounded-lg ${activeTab === "equipe" ? "bg-primary text-primary-foreground shadow-lg" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
        >
          L'Équipe ({users.filter(u => u.role !== "Dentiste").length})
        </button>
        <button
          onClick={() => setActiveTab("securite")}
          className={`flex items-center px-4 py-2 font-bold transition-all rounded-lg ${activeTab === "securite" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-card text-card-foreground border hover:bg-secondary/80"}`}
        >
          <KeyRound className="mr-2 h-4 w-4" />
          Sécurité & Mots de passe
          {requests.length > 0 && <span className="ml-2 bg-white text-red-600 rounded-full text-xs px-2 py-0.5">{requests.length}</span>}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20 text-muted-foreground">
          <RefreshCw className="mr-2 h-6 w-6 animate-spin" /> Chargement...
        </div>
      ) : activeTab === "equipe" ? (
        <div className="grid gap-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground font-bold">
                <tr>
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4">Rôle</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.idUtilisateur} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">{u.prenom} {u.nom}</p>
                      <p className="text-muted-foreground text-xs">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === "Dentiste" ? "bg-blue-500/10 text-blue-500" : u.role === "Secretaire" ? "bg-purple-500/10 text-purple-500" : "bg-amber-500/10 text-amber-500"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex w-max items-center px-3 py-1 rounded-full text-xs font-bold ${u.actif ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${u.actif ? "bg-emerald-500" : "bg-red-500"}`}></span>
                        {u.actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== "Dentiste" && (
                        <div className="flex justify-end space-x-2">
                           <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u);
                              setShowResetModal(true);
                            }}
                            className="font-semibold text-xs border-amber-200 text-amber-600 hover:bg-amber-50"
                            title="Réinitialiser le mot de passe"
                          >
                            <KeyRound className="h-3 w-3" />
                          </Button>
                          <Button
                            variant={u.actif ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleToggleStatus(u.idUtilisateur, u.actif)}
                            className={`font-semibold text-xs ${u.actif ? "bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border-transparent" : ""}`}
                          >
                            {u.actif ? "Désactiver" : "Activer"}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-xl border border-dashed flex flex-col items-center">
              <ShieldAlert className="h-12 w-12 text-emerald-500/50 mb-3" />
              <Text className="text-emerald-600 font-bold">Aucune demande en attente</Text>
              <Text className="text-muted-foreground text-sm mt-1">L'ensemble de votre équipe utilise des codes sécurisés.</Text>
            </div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="flex justify-between items-center p-6 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex flex-col items-center justify-center text-red-500">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <Text className="font-bold text-foreground">Demande de Réinitialisation (# {req.id})</Text>
                    <Text className="text-sm text-muted-foreground">Demandé par : <strong className="text-foreground">{req.prenom} {req.nom}</strong> ({req.email})</Text>
                    <Text className="text-xs text-muted-foreground mt-1">Date : {new Date(req.createdAt).toLocaleString()}</Text>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 font-bold" onClick={() => handleRejectRequest(req.id)}>
                    <XCircle className="w-4 h-4 mr-2" /> Refuser
                  </Button>
                  <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={() => handleApproveRequest(req.id)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approuver
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Basic Inline Modal for Creation */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-border">
            <div className="p-6">
              <Text size="xl" className="font-bold text-foreground mb-4">Nouvel Employé</Text>
              <form onSubmit={handleCreateUser} className="space-y-4" autoComplete="off">
                {/* Decoy inputs to trick browser autofill */}
                <div style={{ position: 'absolute', top: '-1000px', left: '-1000px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
                  <input type="text" name="decoy_new_user" tabIndex={-1} />
                  <input type="password" name="decoy_new_pass" tabIndex={-1} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1 block">Prénom</label>
                    <Input 
                      name="employee_firstname"
                      required 
                      autoComplete="off"
                      value={newUser.prenom} 
                      onChange={e => setNewUser({...newUser, prenom: e.target.value})} 
                      placeholder="Ex: Rima" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1 block">Nom</label>
                    <Input 
                      name="employee_lastname"
                      required 
                      autoComplete="off"
                      value={newUser.nom} 
                      onChange={e => setNewUser({...newUser, nom: e.target.value})} 
                      placeholder="Ex: Alami" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">
                    <span>E&nbsp;m&nbsp;a&nbsp;i&nbsp;l</span>
                  </label>
                  <Input 
                    name="u_field_id"
                    type="search" 
                    required 
                    autoComplete="off"
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})} 
                    placeholder=" " 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">
                    <span>M&nbsp;o&nbsp;t&nbsp;d&nbsp;e&nbsp;p&nbsp;a&nbsp;s&nbsp;s&nbsp;e</span>
                  </label>
                  <Input 
                    name="p_field_id"
                    type="password" 
                    required 
                    autoComplete="new-password"
                    readOnly
                    onFocus={(e) => (e.target as HTMLInputElement).removeAttribute('readonly')}
                    onMouseEnter={(e) => (e.target as HTMLInputElement).removeAttribute('readonly')}
                    value={newUser.password} 
                    onChange={e => setNewUser({...newUser, password: e.target.value})} 
                    placeholder=" " 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">Rôle</label>
                  <select 
                    value={newUser.role} 
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                    className="w-full flex h-10 w-full border-border bg-background px-3 py-2 text-sm rounded-md border"
                  >
                    <option value="Assistante">Assistante</option>
                    <option value="Secretaire">Secretaire</option>
                  </select>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 font-bold" onClick={() => setShowCreateModal(false)}>Annuler</Button>
                  <Button type="submit" className="flex-1 font-bold">Créer le compte</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modale de réinitialisation directe de mot de passe */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-border">
            <div className="p-6">
              <Text size="xl" className="font-bold text-foreground mb-2">Réinitialiser le mot de passe</Text>
              <Text className="text-sm text-muted-foreground mb-4">
                Vous allez définir un nouveau mot de passe pour <strong>{selectedUser.prenom} {selectedUser.nom}</strong>.
              </Text>
              <form onSubmit={handleResetPassword} className="space-y-4" autoComplete="off">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">Nouveau mot de passe</label>
                  <Input 
                    name="reset_id_pass"
                    type="password" 
                    required 
                    autoFocus
                    autoComplete="new-password"
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    placeholder="Minimum 8 caractères" 
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 font-bold" onClick={() => {
                    setShowResetModal(false);
                    setSelectedUser(null);
                    setNewPassword("");
                  }}>Annuler</Button>
                  <Button type="submit" className="flex-1 font-bold bg-amber-600 hover:bg-amber-700 text-white">Changer le mot de passe</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

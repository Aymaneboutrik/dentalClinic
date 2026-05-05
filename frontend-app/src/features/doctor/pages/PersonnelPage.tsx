import { useEffect, useState } from "react";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  type CreateEmployeeRequest,
  type ApiError,
} from "../services/personnel.service";
import type { Employee } from "../../../types/employee/employee";

type FormDataType = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  idRole: number;
  statut: string;
};

type FormFieldErrors = {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  idRole?: string;
  statut?: string;
};

const PersonnelPage = () => {
  const initialFormData: FormDataType = {
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    idRole: 0,
    statut: "Actif",
  };

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(
    null
  );
  const [formData, setFormData] = useState<FormDataType>(initialFormData);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      setError(apiError.message || "Impossible de charger les employés.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const resetFormState = () => {
    setFormData(initialFormData);
    setFormError(null);
    setFieldErrors({});
    setIsEditMode(false);
    setEditingEmployeeId(null);
  };

  const getRoleIdFromName = (roleName?: string): number => {
    if (!roleName) return 0;

    const normalizedRole = roleName.trim().toLowerCase();

    if (normalizedRole === "docteur") return 1;
    if (normalizedRole === "secrétaire" || normalizedRole === "secretaire")
      return 2;
    if (normalizedRole === "assistant") return 3;

    return 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "idRole" ? Number(value) : value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validateForm = (): FormFieldErrors => {
    const errors: FormFieldErrors = {};

    if (!formData.nom.trim()) {
      errors.nom = "Le nom est obligatoire.";
    } else if (!/^[A-Za-zÀ-ÿ\s-]+$/.test(formData.nom)) {
      errors.nom = "Le nom doit contenir uniquement des lettres.";
    }

    if (!formData.prenom.trim()) {
      errors.prenom = "Le prénom est obligatoire.";
    } else if (!/^[A-Za-zÀ-ÿ\s-]+$/.test(formData.prenom)) {
      errors.prenom = "Le prénom doit contenir uniquement des lettres.";
    }

    if (!formData.email.trim()) {
      errors.email = "L'email est obligatoire.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Le format de l'email est invalide.";
    }

    if (!formData.telephone.trim()) {
      errors.telephone = "Le téléphone est obligatoire.";
    } else if (!/^(05|06|07)[0-9]{8}$/.test(formData.telephone)) {
      errors.telephone =
        "Le téléphone doit contenir 10 chiffres et commencer par 05, 06 ou 07.";
    }

    if (formData.idRole === 0) {
      errors.idRole = "L'identifiant du rôle doit être valide.";
    }

    if (isEditMode && !formData.statut.trim()) {
      errors.statut = "Le statut est obligatoire.";
    }

    return errors;
  };

  const mapBackendErrorsToFields = (
    errors?: Record<string, string[]>
  ): FormFieldErrors => {
    if (!errors) return {};

    return {
      nom: errors.Nom?.[0] || errors.nom?.[0],
      prenom: errors.Prenom?.[0] || errors.prenom?.[0],
      email: errors.Email?.[0] || errors.email?.[0],
      telephone: errors.Telephone?.[0] || errors.telephone?.[0],
      idRole: errors.IdRole?.[0] || errors.idRole?.[0],
      statut: errors.Statut?.[0] || errors.statut?.[0],
    };
  };

  const handleOpenAddForm = () => {
  resetFormState();
  setSuccessMessage(null);
  setShowAddForm(true);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

  const handleEdit = async (id: number) => {
    try {
      setActionLoading(true);
      setFormError(null);
      setSuccessMessage(null);
      setFieldErrors({});

      const employee = await getEmployeeById(id);

      setFormData({
        nom: employee.nom || "",
        prenom: employee.prenom || "",
        email: employee.email || "",
        telephone: employee.telephone || "",
        idRole:
          typeof employee.idRole === "number"
            ? employee.idRole
            : getRoleIdFromName(employee.nomRole),
        statut: employee.statut || "Actif",
      });

      setEditingEmployeeId(id);
      setIsEditMode(true);
      setShowAddForm(true);
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      setSuccessMessage(null);
      setFormError(
        apiError.message || "Impossible de charger les données de l'employé."
      );
      setShowAddForm(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cet employé ?"
    );

    if (!confirmed) return;

    try {
      setSuccessMessage(null);
      setError(null);

      await deleteEmployee(id);
      await fetchEmployees();

      if (editingEmployeeId === id) {
        setShowAddForm(false);
        resetFormState();
      }

      setSuccessMessage("Employé supprimé avec succès.");
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      setError(apiError.message || "Impossible de supprimer l'employé.");
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    resetFormState();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setFormError(null);
      setSuccessMessage(null);
      setFieldErrors({});

      const frontendErrors = validateForm();

      if (Object.keys(frontendErrors).length > 0) {
        setFieldErrors(frontendErrors);
        setFormError("Veuillez corriger les champs du formulaire.");
        return;
      }

      if (isEditMode && editingEmployeeId !== null) {
        await updateEmployee(editingEmployeeId, {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone,
          idRole: formData.idRole,
          statut: formData.statut,
        });

        await fetchEmployees();

        setSuccessMessage("Employé mis à jour avec succès.");
      } else {
        const createPayload: CreateEmployeeRequest = {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone,
          idRole: formData.idRole,
        };

        await createEmployee(createPayload);
        await fetchEmployees();

        setSuccessMessage("Employé ajouté avec succès.");
      }

      setShowAddForm(false);
      resetFormState();
    } catch (error) {
      console.error(error);

      const apiError = error as ApiError;
      const mappedErrors = mapBackendErrorsToFields(apiError.errors);

      setFieldErrors(mappedErrors);

      const hasFieldErrors = Object.values(mappedErrors).some(Boolean);

      if (hasFieldErrors) {
        setFormError("Veuillez corriger les champs du formulaire.");
      } else {
        setFormError(
          apiError.message ||
            (isEditMode
              ? "Impossible de modifier l'employé."
              : "Impossible d'ajouter l'employé.")
        );
      }
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="p-8 border shadow-2xl organic-card bg-card/40 backdrop-blur-md border-white/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">
              Gestion du personnel
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Employés de la clinique
            </h1>
          </div>

          <button
            type="button"
            onClick={handleOpenAddForm}
            className="organic-button bg-blue-600 px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-blue-500 shadow-lg shadow-blue-500/20"
          >
            Ajouter un employé
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="px-4 py-3 text-sm border rounded-2xl border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          {successMessage}
        </div>
      )}

      {showAddForm && (
        <div className="organic-card border border-white/10 bg-[#081028]/80 backdrop-blur-xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              {isEditMode ? "Modifier un employé" : "Ajouter un employé"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {isEditMode
                ? "Modifiez les informations de l’employé."
                : "Remplissez les informations du nouvel employé."}
            </p>
          </div>

          {formError && (
            <p className="mb-4 text-sm text-red-500">{formError}</p>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Entrez le nom"
                className={`w-full organic-pill h-12 px-5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:bg-blue-500/5 ${
                  fieldErrors.nom
                    ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                }`}
              />
              {fieldErrors.nom && (
                <p className="text-sm text-red-500">{fieldErrors.nom}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Prénom
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Entrez le prénom"
                className={`w-full organic-pill h-12 px-5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:bg-blue-500/5 ${
                  fieldErrors.prenom
                    ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                }`}
              />
              {fieldErrors.prenom && (
                <p className="text-sm text-red-500">{fieldErrors.prenom}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Email</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Entrez l’email"
                className={`w-full organic-pill h-12 px-5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:bg-blue-500/5 ${
                  fieldErrors.email
                    ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                }`}
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Téléphone
              </label>
              <input
                type="text"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="Entrez le téléphone"
                className={`w-full organic-pill h-12 px-5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:bg-blue-500/5 ${
                  fieldErrors.telephone
                    ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                }`}
              />
              {fieldErrors.telephone && (
                <p className="text-sm text-red-500">{fieldErrors.telephone}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Rôle</label>
              <select
                name="idRole"
                value={formData.idRole}
                onChange={handleChange}
                className={`w-full organic-pill h-12 px-5 text-sm text-white outline-none transition focus:bg-blue-500/5 ${
                  fieldErrors.idRole
                    ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                }`}
              >
                <option value={0} className="bg-[#0B1739] text-white">
                  Sélectionner un rôle
                </option>
                <option value={1} className="bg-[#0B1739] text-white">
                  Docteur
                </option>
                <option value={2} className="bg-[#0B1739] text-white">
                  Secrétaire
                </option>
                <option value={3} className="bg-[#0B1739] text-white">
                  Assistant
                </option>
              </select>
              {fieldErrors.idRole && (
                <p className="text-sm text-red-500">{fieldErrors.idRole}</p>
              )}
            </div>

            {isEditMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Statut
                </label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  className={`w-full organic-pill h-12 px-5 text-sm text-white outline-none transition focus:bg-blue-500/5 ${
                    fieldErrors.statut
                      ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                      : "border-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                  }`}
                >
                  <option value="Actif" className="bg-[#0B1739] text-white">
                    Actif
                  </option>
                  <option value="Inactif" className="bg-[#0B1739] text-white">
                    Inactif
                  </option>
                </select>
                {fieldErrors.statut && (
                  <p className="text-sm text-red-500">{fieldErrors.statut}</p>
                )}
              </div>
            )}

            <div
              className={`flex justify-end gap-3 pt-2 ${
                isEditMode ? "md:col-span-2" : "md:col-span-2"
              }`}
            >
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/10"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={actionLoading}
                className="organic-button bg-blue-600 px-10 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70 shadow-lg shadow-blue-500/20"
              >
                {isEditMode ? "Mettre à jour" : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="border shadow-2xl organic-card bg-card/40 backdrop-blur-md border-white/5">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-lg font-semibold">Liste des employés</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left border-b">
                <th className="px-6 py-4 font-semibold">Nom complet</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Téléphone</th>
                <th className="px-6 py-4 font-semibold">Statut</th>
                <th className="px-6 py-4 font-semibold">Rôle</th>
                <th className="px-6 py-4 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-sm text-center text-muted-foreground"
                  >
                    Chargement des employés...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-sm text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-sm text-center text-muted-foreground"
                  >
                    Aucun employé à afficher pour le moment.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr
                    key={employee.idEmploye}
                    className="transition duration-200 border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="px-6 py-5 font-semibold text-white">
                      {employee.nom} {employee.prenom}
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {employee.email}
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {employee.telephone}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center organic-pill border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                          employee.statut === "Actif"
                            ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                            : "border-red-500/30 bg-red-500/15 text-red-400"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${employee.statut === "Actif" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                        {employee.statut}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {employee.nomRole}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(employee.idEmploye)}
                          className="px-4 py-2 text-xs font-semibold text-blue-400 transition border organic-pill h-9 px-6 uppercase tracking-widest text-[9px] font-black"
                        >
                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(employee.idEmploye)}
                          className="px-4 py-2 text-xs font-semibold text-red-400 transition border organic-pill h-9 px-6 uppercase tracking-widest text-[9px] font-black"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PersonnelPage;
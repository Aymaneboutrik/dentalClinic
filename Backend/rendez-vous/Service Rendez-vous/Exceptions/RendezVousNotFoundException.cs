using System;

namespace Service_Rendez_vous.Exceptions
{
    public class RendezVousNotFoundException : Exception
    {
        public RendezVousNotFoundException(int id) 
            : base($"Le rendez-vous avec l'ID {id} est introuvable.")
        {
        }
    }
}

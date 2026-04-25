using Service_Rendez_vous.DTOs;
using Service_Rendez_vous.Models;

namespace Service_Rendez_vous.Mappers
{
    public static class HistoriqueRDVMapper
    {
        public static HistoriqueRDVDto ToDto(HistoriqueRDV model)
        {
            if (model == null) return null;

            return new HistoriqueRDVDto
            {
                Id = model.Id,
                RendezVousId = model.RendezVousId,
                AncienStatut = model.AncienStatut,
                NouveauStatut = model.NouveauStatut,
                DateModification = model.DateModification,
                ModifiePar = model.ModifiePar,
                TypeModification = model.TypeModification
            };
        }
    }
}

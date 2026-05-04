using Service_Personnel.DTOS.Horaires;

namespace Service_Personnel.Services.Horaires
{
    public interface IHoraireService
    {
        Task<object> CreateAsync(CreateHoraireRequestDto dto, CancellationToken ct = default);

         Task<object> UpdateAsync(int id, UpdateHoraireRequestDto dto , CancellationToken ct = default);

        Task<List<HoraireResponseDto>> GetAllAsync(CancellationToken ct = default);

        //Delete Horaire 

        Task<object> DeleteAsync(int id, CancellationToken ct = default);
    }

}
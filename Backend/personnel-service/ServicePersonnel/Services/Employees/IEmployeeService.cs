using Service_Personnel.DTOS.Employes;


namespace Service_Personnel.Services.Employees
{
    public interface IEmployeeService
    {
        Task<object>       // Méthode asynchrone (Task)
                           // Retourne un int → probablement "l’Id" de l’employé créé


            CreateAsync(

                CreateEmployeeRequestDto dto,// Paramètre d’entrée : données envoyées par le client (DTO)
                CancellationToken ct = default

            //CancellationToken : / Permet d’annuler l’opération si la requête HTTP est annulée



            );

        //update 
        Task<object> UpdateAsync(int id, UpdateEmployeeRequestDto dto, CancellationToken ct = default);


        //Get employe 

        Task<List<EmployeeResponseDto>> GetAllAsync(CancellationToken ct = default);


        //getById

        Task<EmployeeResponseDto> GetByIdAsync(int id, CancellationToken ct = default);

        //Delete Employee
        Task DeleteAsync(int id, CancellationToken ct = default);

    }

}

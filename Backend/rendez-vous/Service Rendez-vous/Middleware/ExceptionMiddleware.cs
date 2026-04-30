using System.Net;
using System.Text.Json;
using Service_Rendez_vous.Exceptions;

namespace Service_Rendez_vous.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Une erreur non gérée est survenue.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            var response = new 
            {
                message = exception.Message,
                status = (int)HttpStatusCode.InternalServerError
            };

            switch (exception)
            {
                case BusinessRuleException:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response = new { message = exception.Message, status = (int)HttpStatusCode.BadRequest };
                    break;
                case RendezVousNotFoundException:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    response = new { message = exception.Message, status = (int)HttpStatusCode.NotFound };
                    break;
                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    break;
            }

            return context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}

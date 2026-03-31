using System;

namespace StockApi.Services
{
    public class NotificationService
    {
        public virtual void EnvoyerNotification(string role, string message)
        {
            // Pour le moment on logge dans la console, peut être remplacé par un vrai push
            Console.WriteLine($"Notification pour {role}: {message}");
        }
    }
}
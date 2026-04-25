using System;

namespace Service_Rendez_vous.Extensions
{
    public static class DateTimeExtensions
    {
        /// <summary>
        /// Rend un DateTime compatible avec les colonnes PostgreSQL 'timestamp without time zone'
        /// en forçant le Kind à Unspecified.
        /// </summary>
        public static DateTime ToPostgresTimestamp(this DateTime dateTime)
        {
            return DateTime.SpecifyKind(dateTime, DateTimeKind.Unspecified);
        }
    }
}

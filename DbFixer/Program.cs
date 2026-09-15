using System;
using Npgsql;

class Program
{
    static void Main()
    {
        string connStr = "Host=127.0.0.1;Port=5432;Database=finox;Username=postgres;Password=postgres";
        using var conn = new NpgsqlConnection(connStr);
        conn.Open();

        var dropCmdText = @"
            DROP SCHEMA public CASCADE;
            CREATE SCHEMA public;
            GRANT ALL ON SCHEMA public TO postgres;
            GRANT ALL ON SCHEMA public TO public;
        ";
        using var dropCmd = new NpgsqlCommand(dropCmdText, conn);
        dropCmd.ExecuteNonQuery();

        Console.WriteLine("Successfully dropped and recreated public schema.");
    }
}

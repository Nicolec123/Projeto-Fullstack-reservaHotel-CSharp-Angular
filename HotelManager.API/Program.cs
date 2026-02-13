using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using HotelManager.API.Data;
using HotelManager.API.Auth;
using HotelManager.API.Middleware;
using HotelManager.API.Models;
using HotelManager.API.Repositories;
using HotelManager.API.Services;

// Serilog: logs estruturados (console + arquivo)
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithEnvironmentName()
    .Enrich.WithMachineName()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .WriteTo.File(
        path: "logs/hotelmanager-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (connectionString.Contains("Data Source=") && !connectionString.Contains("Server="))
        options.UseSqlite(connectionString);
    else
        options.UseSqlServer(connectionString);
});

var jwtKey = builder.Configuration["Jwt:Key"] ?? "ChaveSecretaMinimo32CaracteresParaHS256!!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? new[] { "http://localhost:4200" })
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ISessionRepository, SessionRepository>();
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IEmailService, EmailService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("UserId", httpContext.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "(anon)");
    };
});
app.UseMiddleware<AuditMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.EnsureCreatedAsync();
    await EnsureJwtSchemaAsync(db, connectionString);
    await EnsureReservationSchemaAsync(db, connectionString);
    await SeedAdminIfNeeded(db);
    await SeedTestUserIfNeeded(db);
    await SeedRoomsIfNeeded(db);
    var sessionRepo = scope.ServiceProvider.GetRequiredService<ISessionRepository>();
    await sessionRepo.DeleteExpiredAsync();
}

app.Run();

static async Task SeedAdminIfNeeded(ApplicationDbContext db)
{
    if (await db.Users.AnyAsync()) return;
    var admin = new User
    {
        Nome = "Administrador",
        Email = "admin@hotel.com",
        SenhaHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
        Role = "Admin"
    };
    db.Users.Add(admin);
    await db.SaveChangesAsync();
}

static async Task SeedTestUserIfNeeded(ApplicationDbContext db)
{
    if (await db.Users.AnyAsync(u => u.Email == "hospede@hotel.com")) return;
    var user = new User
    {
        Nome = "Hóspede Teste",
        Email = "hospede@hotel.com",
        SenhaHash = BCrypt.Net.BCrypt.HashPassword("Hospede@123"),
        Role = "User"
    };
    db.Users.Add(user);
    await db.SaveChangesAsync();
}

static async Task SeedRoomsIfNeeded(ApplicationDbContext db)
{
    if (await db.Rooms.AnyAsync()) return;
    var rooms = new[]
    {
        new Room { Numero = "1", Tipo = "Standard", PrecoDiaria = 150, Bloqueado = false },
        new Room { Numero = "2", Tipo = "Standard", PrecoDiaria = 150, Bloqueado = false },
        new Room { Numero = "3", Tipo = "Luxo", PrecoDiaria = 250, Bloqueado = false },
        new Room { Numero = "4", Tipo = "Luxo", PrecoDiaria = 250, Bloqueado = false },
        new Room { Numero = "5", Tipo = "Suíte", PrecoDiaria = 400, Bloqueado = false }
    };
    db.Rooms.AddRange(rooms);
    await db.SaveChangesAsync();
}

static async Task EnsureJwtSchemaAsync(ApplicationDbContext db, string connectionString)
{
    if (!connectionString.Contains("Data Source=") || connectionString.Contains("Server="))
        return;
    try
    {
        await db.Database.ExecuteSqlRawAsync(
            "CREATE TABLE IF NOT EXISTS \"Sessions\" (\"Id\" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \"SessionId\" TEXT NOT NULL, \"UserId\" INTEGER NOT NULL, \"RefreshTokenHash\" TEXT NOT NULL, \"Ip\" TEXT, \"Device\" TEXT, \"ExpiresAt\" TEXT NOT NULL, \"CreatedAt\" TEXT NOT NULL, FOREIGN KEY (\"UserId\") REFERENCES \"Users\" (\"Id\") ON DELETE CASCADE);");
        await db.Database.ExecuteSqlRawAsync("CREATE UNIQUE INDEX IF NOT EXISTS \"IX_Sessions_SessionId\" ON \"Sessions\" (\"SessionId\");");
    }
    catch { /* tabela já existe ou outro motivo */ }

    // Verificar quais colunas já existem na tabela Users usando pragma_table_info
    var existingColumns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
    try
    {
        var connection = db.Database.GetDbConnection();
        var wasOpen = connection.State == System.Data.ConnectionState.Open;
        if (!wasOpen)
        {
            await db.Database.OpenConnectionAsync();
        }
        
        try
        {
            using var command = connection.CreateCommand();
            command.CommandText = "SELECT name FROM pragma_table_info('Users')";
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var columnName = reader.GetString(0);
                existingColumns.Add(columnName);
            }
        }
        finally
        {
            if (!wasOpen)
            {
                await db.Database.CloseConnectionAsync();
            }
        }
    }
    catch { /* erro ao verificar colunas - continuar tentando adicionar */ }

    // Adicionar apenas as colunas que não existem
    var columnsToAdd = new[] {
        ("Ativo", "ALTER TABLE \"Users\" ADD COLUMN \"Ativo\" INTEGER NOT NULL DEFAULT 1"),
        ("UltimoLogin", "ALTER TABLE \"Users\" ADD COLUMN \"UltimoLogin\" TEXT"),
        ("TwoFactorEnabled", "ALTER TABLE \"Users\" ADD COLUMN \"TwoFactorEnabled\" INTEGER NOT NULL DEFAULT 0"),
        ("HotelId", "ALTER TABLE \"Users\" ADD COLUMN \"HotelId\" INTEGER")
    };

    foreach (var (columnName, sql) in columnsToAdd)
    {
        if (!existingColumns.Contains(columnName))
        {
            try 
            { 
                await db.Database.ExecuteSqlRawAsync(sql); 
            }
            catch 
            { 
                /* coluna pode ter sido criada por outro processo ou erro inesperado */ 
            }
        }
    }
}

static async Task EnsureReservationSchemaAsync(ApplicationDbContext db, string connectionString)
{
    if (!connectionString.Contains("Data Source=") || connectionString.Contains("Server="))
        return;
    
    // Verificar quais colunas já existem na tabela Reservations
    var existingColumns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
    try
    {
        var connection = db.Database.GetDbConnection();
        var wasOpen = connection.State == System.Data.ConnectionState.Open;
        if (!wasOpen)
        {
            await db.Database.OpenConnectionAsync();
        }
        
        try
        {
            using var command = connection.CreateCommand();
            command.CommandText = "SELECT name FROM pragma_table_info('Reservations')";
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var columnName = reader.GetString(0);
                existingColumns.Add(columnName);
            }
        }
        finally
        {
            if (!wasOpen)
            {
                await db.Database.CloseConnectionAsync();
            }
        }
    }
    catch { /* erro ao verificar colunas - continuar tentando adicionar */ }

    // Adicionar apenas as colunas que não existem
    var columnsToAdd = new[] {
        ("ReagendadaDeReservationId", "ALTER TABLE \"Reservations\" ADD COLUMN \"ReagendadaDeReservationId\" INTEGER")
    };

    foreach (var (columnName, sql) in columnsToAdd)
    {
        if (!existingColumns.Contains(columnName))
        {
            try 
            { 
                await db.Database.ExecuteSqlRawAsync(sql); 
            }
            catch 
            { 
                /* coluna pode ter sido criada por outro processo ou erro inesperado */ 
            }
        }
    }
}

// Expor para testes de integração (WebApplicationFactory<Program>)
public partial class Program { }

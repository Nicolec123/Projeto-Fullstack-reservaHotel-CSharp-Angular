using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using HotelManager.API.Data;
using HotelManager.API.Auth;
using HotelManager.API.Models;
using HotelManager.API.Repositories;
using HotelManager.API.Services;

var builder = WebApplication.CreateBuilder(args);

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
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.EnsureCreatedAsync();
    await SeedAdminIfNeeded(db);
    await SeedTestUserIfNeeded(db);
    await SeedRoomsIfNeeded(db);
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

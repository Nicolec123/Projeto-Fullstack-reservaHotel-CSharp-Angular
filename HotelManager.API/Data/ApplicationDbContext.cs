using Microsoft.EntityFrameworkCore;
using HotelManager.API.Models;

namespace HotelManager.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Guest> Guests => Set<Guest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Room>(e =>
        {
            e.HasIndex(r => r.Numero).IsUnique();
            e.Property(r => r.PrecoDiaria).HasPrecision(18, 2);
        });
    }
}

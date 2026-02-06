using Microsoft.EntityFrameworkCore;
using HotelManager.API.Models;

namespace HotelManager.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Guest> Guests => Set<Guest>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<EmergencyContact> EmergencyContacts => Set<EmergencyContact>();
    public DbSet<Dependent> Dependents => Set<Dependent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Session>(e =>
        {
            e.HasIndex(s => s.SessionId).IsUnique();
            e.HasIndex(s => new { s.UserId, s.ExpiresAt });
            e.HasOne(s => s.User).WithMany().HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Room>(e =>
        {
            e.HasIndex(r => r.Numero).IsUnique();
            e.Property(r => r.PrecoDiaria).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Address>(e =>
        {
            e.HasOne(a => a.User)
                .WithMany(u => u.Addresses)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EmergencyContact>(e =>
        {
            e.HasOne(ec => ec.User)
                .WithMany(u => u.EmergencyContacts)
                .HasForeignKey(ec => ec.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Dependent>(e =>
        {
            e.HasOne(d => d.User)
                .WithMany(u => u.Dependents)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

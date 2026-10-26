using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaxManager.Core.Models;
namespace TaxManager.Data
{
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using TaxManagerServer.Core.Models;

    public class DataContext : DbContext
    {
        private readonly IConfiguration _configuration;
        public DbSet<User> Users { get; set; }
        public DbSet<Folder> Folders { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<Invite> Invites { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<PasswordReset> PasswordResets { get; set; }
        public DbSet<DocumentText> DocumentTexts { get; set; }

        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Group>()
                .HasOne(g => g.CreatedByUser)
                .WithMany() 
                .HasForeignKey(g => g.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Group)
                .WithMany(g => g.Users)
                .HasForeignKey(u => u.GroupId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PasswordReset>()
                .HasIndex(r => r.TokenHash)
                .IsUnique();

            // One account per email. MySQL's default collation compares case-insensitively, so
            // "Dana@x.com" and "dana@x.com" count as the same address. SchemaUpgrader applies the same change.
            modelBuilder.Entity<User>()
                .Property(u => u.Email)
                .HasMaxLength(255);
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Foreign keys for the tables that only stored the id
            modelBuilder.Entity<ChatMessage>()
                .HasOne<Folder>()
                .WithMany()
                .HasForeignKey(m => m.FolderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Invite>()
                .HasOne<Group>()
                .WithMany()
                .HasForeignKey(i => i.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Client>()
                .HasOne<Group>()
                .WithMany()
                .HasForeignKey(c => c.GroupId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PasswordReset>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DocumentText>()
                .HasOne<Document>()
                .WithOne()
                .HasForeignKey<DocumentText>(t => t.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
        }


    }


}


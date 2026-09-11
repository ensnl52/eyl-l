using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CanliSoruBackend.Migrations
{
    /// <inheritdoc />
    public partial class EmailDogrulamaKoduEklendi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EmailDogrulamaKodlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    KullaniciId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Kod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OlusturmaZamani = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SonKullanmaZamani = table.Column<DateTime>(type: "datetime2", nullable: false),
                    KullanildiMi = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailDogrulamaKodlari", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmailDogrulamaKodlari");
        }
    }
}

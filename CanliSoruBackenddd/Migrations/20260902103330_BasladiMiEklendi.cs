using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CanliSoruBackend.Migrations
{
    /// <inheritdoc />
    public partial class BasladiMiEklendi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KullaniciId",
                table: "Oyunlar");

            migrationBuilder.AddColumn<bool>(
                name: "BasladiMi",
                table: "Oyunlar",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BasladiMi",
                table: "Oyunlar");

            migrationBuilder.AddColumn<string>(
                name: "KullaniciId",
                table: "Oyunlar",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CanliSoruBackend.Migrations
{
    /// <inheritdoc />
    public partial class OyunOyuncuKullaniciAdi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "KullaniciAdi",
                table: "OyunOyunculari",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KullaniciAdi",
                table: "OyunOyunculari");
        }
    }
}

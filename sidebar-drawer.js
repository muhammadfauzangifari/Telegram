document.addEventListener("DOMContentLoaded", () => {
    // Mengambil elemen-elemen DOM yang dibutuhkan
    const menuButton = document.getElementById("menu-button");
    const sidebarDrawer = document.getElementById("sidebar-drawer");
    const drawerOverlay = document.getElementById("drawer-overlay");

    // Fungsi untuk membuka sidebar drawer
    const openDrawer = () => {
        sidebarDrawer.classList.add("open");
        drawerOverlay.classList.add("active");
    };

    // Fungsi untuk menutup sidebar drawer
    const closeDrawer = () => {
        sidebarDrawer.classList.remove("open");
        drawerOverlay.classList.remove("active");
    };

    // Event Listener saat tombol 3 garis (hamburger menu) diklik
    if (menuButton) {
        menuButton.addEventListener("click", openDrawer);
    }

    // Event Listener saat area transparan di luar menu diklik (untuk menutup menu)
    if (drawerOverlay) {
        drawerOverlay.addEventListener("click", closeDrawer);
    }

    // Opsional: Menutup drawer jika tombol Log Out diklik
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault(); // Mencegah reload halaman/efek link default
            alert("Log Out berhasil!"); // Ganti dengan logika logout kamu
            closeDrawer();
        });
    }
});
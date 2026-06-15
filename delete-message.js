document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.querySelector(".chat-messages");

    // 1. Deteksi Klik Kanan (Context Menu) pada pesan untuk memunculkan menu hapus
    chatMessages.addEventListener("contextmenu", (e) => {
        // Pastikan yang diklik adalah gelembung pesan atau elemen di dalamnya
        const bubble = e.target.closest(".message-bubble");
        
        if (bubble) {
            e.preventDefault(); // Mencegah menu klik kanan bawaan browser muncul

            // Konfirmasi hapus menggunakan dialog bawaan yang simpel
            const konfirmasi = confirm("Apakah Anda yakin ingin menghapus pesan ini?");
            if (konfirmasi) {
                hapusElemenPesan(bubble);
            }
        }
    });

    // 2. Opsi Alternatif: Deteksi Klik Dua Kali (Double Click) jika pengguna memakai HP/Touchscreen
    chatMessages.addEventListener("dblclick", (e) => {
        const bubble = e.target.closest(".message-bubble");
        
        if (bubble) {
            const konfirmasi = confirm("Hapus pesan ini?");
            if (konfirmasi) {
                hapusElemenPesan(bubble);
            }
        }
    });

    // Fungsi untuk menghapus elemen pesan dari layar secara halus
    function hapusElemenPesan(elemenBubble) {
        // Berikan efek transisi memudar sebelum dihapus
        elemenBubble.style.transition = "all 0.3s ease";
        elemenBubble.style.opacity = "0";
        elemenBubble.style.transform = "scale(0.8)";

        setTimeout(() => {
            elemenBubble.remove();
            
            // Opsional: Cek jika di baris chat-list (kolom kiri) teks preview-nya perlu diperbarui,
            // kamu bisa menambahkan logika pembaruan teks preview di sini jika diperlukan.
        }, 300);
    }
});
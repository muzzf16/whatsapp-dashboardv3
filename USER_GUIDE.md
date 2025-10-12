# Panduan Pengguna - WhatsApp Dashboard

## 1. Pendahuluan

Selamat datang di WhatsApp Dashboard!

Aplikasi ini adalah pusat kendali untuk akun-akun WhatsApp Anda. Dengan dashboard ini, Anda dapat menghubungkan beberapa akun WhatsApp, mengirim dan menerima pesan, mengelola grup, dan mengotomatiskan balasan langsung dari satu antarmuka web yang mudah digunakan.

## 2. Memulai

Penggunaan dashboard berpusat pada "Sesi". Setiap sesi mewakili satu akun WhatsApp yang terhubung.

### Menambahkan Sesi Baru

1.  Klik tombol **"+ Tambah Sesi"** di sidebar kiri.
2.  Sebuah jendela modal akan muncul menampilkan Kode QR (QR Code).
3.  Buka aplikasi WhatsApp di ponsel Anda.
4.  Masuk ke **Setelan** > **Perangkat Tertaut** > **Tautkan Perangkat**.
5.  Pindai (scan) Kode QR yang muncul di dashboard.
6.  Setelah berhasil, sesi baru akan muncul di daftar "Sesi Aktif" di sidebar.

### Status Sesi

Setiap sesi memiliki indikator status:
*   **Hijau:** Sesi terhubung dan siap digunakan.
*   **Merah:** Sesi terputus. Anda dapat mencoba menghubungkan kembali dengan mengklik tombol "Reconnect" yang muncul di sebelah sesi tersebut.

### Logout dari Sesi

1.  Klik kanan pada sesi yang ingin Anda keluarkan di sidebar.
2.  Pilih menu **"Logout"**.
3.  Sesi akan dihapus dari dashboard dan perangkat Anda akan terputus.

## 3. Antarmuka Utama

### Sidebar (Bilah Sisi)

Sidebar di sebelah kiri adalah pusat navigasi Anda.

*   **Tombol Aksi:** Di bagian atas terdapat tombol untuk "Tambah Sesi" dan "Create Group".
*   **Menu:** Daftar tautan ke halaman lain seperti Templates, Pesan Terjadwal, dan Pengaturan API.
*   **Sesi Aktif:** Menampilkan semua akun WhatsApp yang telah Anda hubungkan. Klik pada salah satu sesi untuk menjadikannya aktif.
*   **Chats:** Setelah memilih sesi, daftar obrolan (chat) untuk sesi tersebut akan muncul di sini. Klik pada salah satu chat untuk membuka jendela percakapan.

### Jendela Chat (Chat Window)

Setelah memilih sebuah chat, jendela percakapan akan terbuka.

*   **Mengirim Pesan:** Ketik pesan Anda di kotak input di bagian bawah dan tekan tombol "Kirim" atau tekan `Enter`.
*   **Menggunakan Template:** Klik ikon **File Teks** untuk membuka daftar template pesan yang sudah Anda simpan. Memilih template akan mengisi kotak input secara otomatis.
*   **Menjadwalkan Pesan:** Klik ikon **Jam** untuk menjadwalkan pesan yang sedang Anda ketik agar terkirim di waktu yang akan datang.
*   **Mengirim File:** Klik ikon **Paperclip** untuk memilih dan mengirim file gambar atau dokumen.

## 4. Fitur Rinci

### Manajemen Grup

*   **Membuat Grup:** Klik tombol **"Create Group"**, lalu masukkan nama grup dan daftar nomor peserta untuk membuat grup baru.
*   **Melihat Info Grup:** Klik kanan pada sebuah chat grup di sidebar dan pilih **"Group Info"** untuk melihat detail dan mengelola anggota grup.

### Template Pesan

Kunjungi halaman **"Templates"** dari menu sidebar untuk membuat, mengedit, atau menghapus template pesan. Template ini dapat digunakan kembali dengan cepat dari dalam jendela chat.

### Pesan Terjadwal (Scheduled Messages)

Kunjungi halaman **"Scheduled Messages"** untuk melihat daftar semua pesan yang telah Anda jadwalkan. Anda dapat membatalkan pengiriman pesan dari halaman ini.

### Konfigurasi API & Auto-Reply

Di halaman **"API Configuration"**, Anda dapat mengaktifkan dan mengatur aturan balasan otomatis (auto-reply).

1.  Aktifkan fitur auto-reply.
2.  Tambahkan aturan baru dengan menentukan **kata kunci** dan **teks balasan**.
3.  Jika ada pesan masuk yang mengandung kata kunci tersebut, sistem akan otomatis membalasnya dengan teks yang sudah Anda tentukan.

## 5. Troubleshooting

*   **Sesi terus-menerus terputus (`connectionReplaced`):** Pastikan Anda tidak membuka WhatsApp Web atau Desktop di perangkat lain untuk akun yang sama. WhatsApp hanya mengizinkan satu sesi aktif pada satu waktu.
*   **Pesan tidak terkirim:** Periksa status sesi Anda. Jika berwarna merah (terputus), coba klik "Reconnect". Jika koneksi tetap gagal, coba logout dan pindai ulang Kode QR.

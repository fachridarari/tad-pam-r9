// Service Worker - Sistem TAD PAM Regional 9 Jember
// Fungsi: cache shell aplikasi (HTML/ikon) agar bisa dibuka cepat & terlihat seperti app asli.
// CATATAN: Fitur GPS, kirim laporan, dan ambil daftar lokasi TETAP butuh koneksi internet
// karena berkomunikasi langsung dengan Google Apps Script (tidak di-cache).

const CACHE_NAME = "tad-pam-r9-shell-v1";
const APP_SHELL = [
  "./",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Jangan cache request ke Google Apps Script (data harus selalu live/terbaru)
  if (url.hostname.includes("script.google.com")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          // fallback offline sederhana untuk navigasi halaman
          if (event.request.mode === "navigate") {
            return caches.match("./");
          }
        })
      );
    })
  );
});

// Toggle menu navigasi di layar mobile
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Tutup menu otomatis saat link diklik di mobile
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// Simulasi pengiriman formulir kontak
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nama = document.getElementById('nama').value.trim();

  formStatus.textContent = `Terima kasih, ${nama}! Pesan Anda telah tercatat.`;
  contactForm.reset();

  setTimeout(() => {
    formStatus.textContent = '';
  }, 4000);
});
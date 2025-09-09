// ==========================================
//         SCRIPT INLINE PARA FUNCIONALIDADES BÁSICAS
//         ========================================== -->

// Código JavaScript inline para funcionalidades básicas
document.addEventListener("DOMContentLoaded", function () {
  console.log("Página cargada correctamente");

  // Smooth scrolling para enlaces internos
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro");
  const skipIntro = document.getElementById("skipIntro");

  const menuButton = document.getElementById("menuButton");
  const mobileMenu = document.getElementById("mobileMenu");

  let introFinished = false;

  // INTRO
  function finishIntro() {
    if (!intro || introFinished) return;

    introFinished = true;
    intro.classList.add("is-done");
    document.body.classList.remove("intro-running");

    window.setTimeout(() => {
      intro.remove();
    }, 950);
  }

  if (intro) {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      finishIntro();
    } else {
      window.setTimeout(finishIntro, 5300);
    }
  }

  skipIntro?.addEventListener("click", finishIntro);

  // MENU MOBILE
  function closeMenu() {
    menuButton?.setAttribute("aria-expanded", "false");
    mobileMenu?.classList.remove("open");
  }

  menuButton?.addEventListener("click", () => {
    const opened =
      menuButton.getAttribute("aria-expanded") === "true";

    menuButton.setAttribute("aria-expanded", String(!opened));
    mobileMenu?.classList.toggle("open", !opened);
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      finishIntro();
    }
  });

  // REVELAÇÃO DAS SEÇÕES
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  // ANO AUTOMÁTICO
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // VERIFICAÇÃO DAS LOGOS
  ["isotipo.png", "logo-stude.png"].forEach((file) => {
    const image = new Image();

    image.onerror = () => {
      console.warn(
        `Stude: não foi possível carregar ${file}. Confira o nome e a localização do arquivo.`
      );
    };

    image.src = file;
  });
});

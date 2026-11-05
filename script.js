
document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro");
  const skipIntro = document.getElementById("skipIntro");
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  const cursorGlow = document.getElementById("cursorGlow");

  // INTRO CINEMATOGRÁFICA
  let introClosed = false;

  function closeIntro() {
    if (introClosed || !intro) return;

    introClosed = true;
    intro.classList.add("finished");
    document.body.classList.remove("intro-running");

    window.setTimeout(() => {
      intro.remove();
    }, 900);
  }

  if (intro) {
    document.body.classList.add("intro-running");

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      closeIntro();
    } else {
      window.setTimeout(closeIntro, 4650);
    }
  }

  skipIntro?.addEventListener("click", closeIntro);

  // MENU MOBILE
  function closeMobileMenu() {
    menuToggle?.setAttribute("aria-expanded", "false");
    mobileNav?.classList.remove("open");
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    mobileNav?.classList.toggle("open", !isOpen);
  });

  mobileNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
      closeIntro();
    }
  });

  // REVELAÇÃO DAS SEÇÕES DURANTE O SCROLL
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
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  // BRILHO DISCRETO QUE ACOMPANHA O CURSOR
  const canUsePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  if (canUsePointer && cursorGlow) {
    document.addEventListener("pointermove", (event) => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
      cursorGlow.style.opacity = "1";
    });

    document.addEventListener("pointerleave", () => {
      cursorGlow.style.opacity = "0";
    });
  }

  // ANO AUTOMÁTICO NO RODAPÉ
  const footerCopy = document.querySelector(".footer-copy");

  if (footerCopy) {
    footerCopy.textContent =
      `© ${new Date().getFullYear()} STUDE.ME`;
  }
});

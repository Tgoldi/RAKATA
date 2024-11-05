// Simplified menu button handling
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

function toggleMenu(isOpen) {
  navLinks.classList.toggle("open", isOpen);
  menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
}

menuBtn.addEventListener("click", () => toggleMenu(!navLinks.classList.contains("open")));
navLinks.addEventListener("click", () => toggleMenu(false));

// Consolidated ScrollReveal configurations
const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

const revealConfigs = [
  { selector: ".header__image img", options: { origin: "right" } },
  { selector: ".header__content h1", options: { delay: 500 } },
  { selector: ".header__content .section__description", options: { delay: 1000 } },
  { selector: ".header__content .header__btn", options: { delay: 1500 } },
  { selector: ".special__card", options: { delay: 1500 } },
  { selector: ".bridge .bridge__content", options: { delay: 1000 } },
  { selector: ".explore__image img", options: { origin: "left" } },
  { selector: ".explore__content .section__header", options: { delay: 500 } },
  { selector: ".explore__content .section__description", options: { delay: 1000 } },
  { selector: ".explore__content .explore__btn", options: { delay: 1500 } },
  { selector: ".banner__card", options: { interval: 500 } },
  { selector: ".chef__image img", options: { origin: "right" } },
  { selector: ".chef__content .section__header", options: { delay: 500 } },
  { selector: ".chef__content .section__description", options: { delay: 1000 } },
  { selector: ".chef__list li", options: { delay: 1500, interval: 500 } },
];

revealConfigs.forEach(({ selector, options }) => {
  ScrollReveal().reveal(selector, { ...scrollRevealOption, ...options });
});

// Single Swiper configuration
const swiperConfig = {
  loop: true,
  autoplay: {
    delay: 3500,
    disableOnInteraction: false,
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  preloadImages: false,
  lazy: {
    loadPrevNext: true,
  },
  spaceBetween: 20,
  breakpoints: {
    320: {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    640: {
      slidesPerView: 1,
      spaceBetween: 20,
    },
    1024: {
      slidesPerView: 1,
      spaceBetween: 30,
    },
  },
};

// Initialize Swiper
new Swiper('.swiper', swiperConfig);
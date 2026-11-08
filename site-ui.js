// Self-hosted replacements for the small parts of ScrollReveal and Swiper this
// site uses (scroll-in animations and the two media sliders). They used to be
// loaded from unpkg / jsdelivr with no integrity check; serving them from this
// site means no third-party script runs on visitors' browsers.
(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // Scroll reveal: fade/slide elements in when they enter the viewport.
  // Options: distance, origin ("bottom" | "top" | "left" | "right"),
  // duration (ms), delay (ms), interval (ms between elements of one selector).
  // ---------------------------------------------------------------------------
  var REVEAL_EASING = "cubic-bezier(0.5, 0, 0, 1)";

  function revealOffset(origin, distance) {
    var d = String(distance || "0");
    var neg = d.charAt(0) === "-" ? d.slice(1) : "-" + d;
    switch (origin) {
      case "top":
        return "translate3d(0, " + neg + ", 0)";
      case "left":
        return "translate3d(" + neg + ", 0, 0)";
      case "right":
        return "translate3d(" + d + ", 0, 0)";
      default:
        return "translate3d(0, " + d + ", 0)";
    }
  }

  function reveal(selector, options) {
    var opts = Object.assign(
      { distance: "0", origin: "bottom", duration: 600, delay: 0, interval: 0 },
      options || {}
    );
    var elements = Array.prototype.slice.call(document.querySelectorAll(selector));
    if (!elements.length || !("IntersectionObserver" in window)) return;

    var originalStyles = new Map();
    var lastStart = 0;

    elements.forEach(function (el) {
      originalStyles.set(el, el.getAttribute("style"));
      el.style.opacity = "0";
      el.style.transform = revealOffset(opts.origin, opts.distance);
    });

    function show(el, wait) {
      var timing = opts.duration + "ms " + REVEAL_EASING + " " + wait + "ms";
      el.style.transition = "opacity " + timing + ", transform " + timing;
      void el.offsetWidth; // make sure the hidden state is applied first
      el.style.opacity = "";
      el.style.transform = "";
      setTimeout(function () {
        var original = originalStyles.get(el);
        if (original === null || original === undefined) {
          el.removeAttribute("style");
        } else {
          el.setAttribute("style", original);
        }
      }, wait + opts.duration + 50);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        var now = Date.now();
        var start = now + opts.delay;
        if (opts.interval) {
          start = Math.max(start, lastStart + opts.interval);
          lastStart = start;
        }
        show(entry.target, start - now);
      });
    });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ---------------------------------------------------------------------------
  // Slider: one slide per view, optional loop, autoplay, clickable bullet
  // pagination, swipe/drag, and spaceBetween with window-width breakpoints.
  // Uses the same class names as Swiper so the existing styles still apply.
  // ---------------------------------------------------------------------------
  var SLIDE_SPEED = 300;

  function createSlider(root, config) {
    var wrapper = root.querySelector(".swiper-wrapper");
    if (!wrapper) return;
    var slides = Array.prototype.filter.call(wrapper.children, function (el) {
      return el.classList.contains("swiper-slide");
    });
    var count = slides.length;
    if (!count) return;

    var loop = !!config.loop;
    var autoplay = config.autoplay || null;
    var autoplayDelay = autoplay ? autoplay.delay || 3000 : 0;
    var stopOnInteraction = autoplay ? autoplay.disableOnInteraction !== false : false;
    var paginationConfig = config.pagination || null;
    var pagination = paginationConfig && paginationConfig.el
      ? root.querySelector(paginationConfig.el)
      : null;
    var clickable = !!(paginationConfig && paginationConfig.clickable);

    var index = 0;
    var timer = null;
    var bullets = [];

    root.classList.add("swiper-initialized", "swiper-horizontal");
    root.style.touchAction = "pan-y";
    wrapper.style.transitionProperty = "transform";
    wrapper.style.transitionTimingFunction = "ease";

    function spaceBetween() {
      var gap = config.spaceBetween || 0;
      var breakpoints = config.breakpoints || {};
      Object.keys(breakpoints)
        .map(Number)
        .sort(function (a, b) { return a - b; })
        .forEach(function (bp) {
          if (window.innerWidth >= bp && breakpoints[bp].spaceBetween !== undefined) {
            gap = breakpoints[bp].spaceBetween;
          }
        });
      return gap;
    }

    function step() {
      return slides[0].offsetWidth + spaceBetween();
    }

    function setPosition(offset, animate) {
      wrapper.style.transitionDuration = animate ? SLIDE_SPEED + "ms" : "0ms";
      wrapper.style.transform = "translate3d(" + offset + "px, 0, 0)";
    }

    function layout() {
      var gap = spaceBetween();
      slides.forEach(function (slide) {
        slide.style.flexShrink = "0";
        slide.style.marginRight = gap + "px";
      });
      setPosition(-index * step(), false);
    }

    function stopAutoplay() {
      clearTimeout(timer);
      timer = null;
    }

    function startAutoplay() {
      stopAutoplay();
      if (!autoplayDelay || document.hidden) return;
      timer = setTimeout(function () {
        if (!loop && index === count - 1) {
          goTo(0, true);
        } else {
          goTo(index + 1, true);
        }
      }, autoplayDelay);
    }

    function userInteracted() {
      if (stopOnInteraction) autoplayDelay = 0;
    }

    function goTo(target, animate) {
      if (loop) {
        index = ((target % count) + count) % count;
      } else {
        index = Math.max(0, Math.min(count - 1, target));
      }
      setPosition(-index * step(), animate);
      bullets.forEach(function (bullet, i) {
        bullet.classList.toggle("swiper-pagination-bullet-active", i === index);
      });
      startAutoplay();
    }

    if (pagination) {
      pagination.classList.add("swiper-pagination-bullets", "swiper-pagination-horizontal");
      if (clickable) pagination.classList.add("swiper-pagination-clickable");
      pagination.textContent = "";
      slides.forEach(function (_, i) {
        var bullet = document.createElement("span");
        bullet.className = "swiper-pagination-bullet";
        if (clickable) {
          bullet.setAttribute("role", "button");
          bullet.setAttribute("tabindex", "0");
          bullet.setAttribute("aria-label", "Go to slide " + (i + 1));
          bullet.addEventListener("click", function () {
            userInteracted();
            goTo(i, true);
          });
          bullet.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              userInteracted();
              goTo(i, true);
            }
          });
        }
        pagination.appendChild(bullet);
        bullets.push(bullet);
      });
    }

    // Swipe / drag
    var drag = null;
    var suppressClick = false;

    wrapper.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });

    wrapper.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
        dx: 0,
        active: false,
        base: -index * step(),
      };
    });

    wrapper.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x;
      var dy = e.clientY - drag.y;
      if (!drag.active) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          drag = null; // vertical scroll, not a swipe
          return;
        }
        drag.active = true;
        stopAutoplay();
        try {
          wrapper.setPointerCapture(e.pointerId);
        } catch (err) {
          /* ignore */
        }
      }
      drag.dx = dx;
      setPosition(drag.base + dx, false);
    });

    function endDrag(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      if (!d.active) return;
      suppressClick = true;
      setTimeout(function () {
        suppressClick = false;
      }, 0);
      var fast = Date.now() - d.time < 300 && Math.abs(d.dx) > 10;
      var far = Math.abs(d.dx) > step() * 0.5;
      if (e.type !== "pointercancel" && (fast || far)) {
        userInteracted();
        goTo(d.dx < 0 ? index + 1 : index - 1, true);
      } else {
        goTo(index, true);
      }
    }

    wrapper.addEventListener("pointerup", endDrag);
    wrapper.addEventListener("pointercancel", endDrag);

    root.addEventListener(
      "click",
      function (e) {
        if (suppressClick) {
          e.preventDefault();
          e.stopPropagation();
          suppressClick = false;
        }
      },
      true
    );

    window.addEventListener("resize", layout);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    layout();
    goTo(0, false);
  }

  function slider(selector, config) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (root) {
      createSlider(root, config || {});
    });
  }

  window.SiteUI = { reveal: reveal, slider: slider };
})();

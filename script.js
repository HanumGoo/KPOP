const members = {
  yona: {
    rank: "Vice President",
    name: "Yona",
    image: "assets/members/RobloxAva/Yona.png",
    description:
      "Yona is the Vice President of the clan. She is known for her leadership skills, strategic thinking, and dedication to the clan's success. Yona plays a crucial role in guiding the clan towards achieving its goals and fostering a positive and inclusive community.",
  },
  ghermykenz: {
    rank: "President",
    name: "GhermyKenz",
    image: "assets/members/RobloxAva/GhermyKenz.png",
    description:
      "GhermyKenz is the President of the clan. He is known for his vision, decision-making abilities, and commitment to the clan's growth and development.",
  },
  kaifiya: {
    rank: "Vice President",
    name: "Kaifiya-H",
    image: "assets/members/RobloxAva/Kaifiya.png",
    description:
      "Kaifiya Hyouka is the Vice President of the clan. She is known for her leadership skills, strategic thinking, and dedication to the clan's success. Kaifiya plays a crucial role in guiding the clan towards achieving its goals and fostering a positive and inclusive community.",
  },
  hanum: {
    rank: "Members",
    name: "Hanum",
    image: "assets/members/RobloxAva/Hanum.png",
    description:
      "Hanum is a dedicated member of the clan. And also a great friend to everyone.",
  },
  sisi: {
    rank: "Members",
    name: "Sisi",
    image: "assets/members/RobloxAva/sisi.png",
    description:
      "Sisi is a loyal and supportive member of the clan. she is always there to lend a helping hand and bring positivity to the group.",
  },
  mister: {
    rank: "Members",
    name: "Mister x",
    image: "assets/members/RobloxAva/Mister.png",
    description:
      "Mister x is a valued member of the clan. He is known for his dedication, teamwork, and positive attitude, making him an essential part of the clan's success.",
  },
};

const loader = document.querySelector("#loader");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const heroVideo = document.querySelector(".hero__video");
const soundToggle = document.querySelector("#soundToggle");
const modal = document.querySelector("#memberModal");
const modalRank = document.querySelector("#modalRank");
const modalName = document.querySelector("#modalName");
const modalDescription = document.querySelector("#modalDescription");
const modalImage = document.querySelector("#modalImage");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const memberCards = [...document.querySelectorAll(".member-card")];
const filterCount = document.querySelector(".filter-count");
const memberSearch = document.querySelector(".member-search");
const searchClear = document.querySelector(".search-clear");
const orgEmpty = document.querySelector(".org-empty");
const activeFilters = {
  role: "all",
  gender: "all",
  search: "",
};

const toWebp = (src) => (src ? src.replace(/\.(png|jpe?g)$/i, ".webp") : "");

const applyBestImageFormat = (img, originalSrc) => {
  if (!img || !originalSrc || img.dataset.formatResolved) return;

  const webpSrc = toWebp(originalSrc);
  if (webpSrc === originalSrc) {
    img.src = originalSrc;
    img.dataset.formatResolved = "1";
    return;
  }

  const probe = new Image();
  probe.onload = () => {
    img.src = webpSrc;
    img.dataset.formatResolved = "1";
  };
  probe.onerror = () => {
    img.src = originalSrc;
    img.dataset.formatResolved = "1";
  };
  probe.src = webpSrc;
};

const deferImageSrc = (img) => {
  const src = img?.getAttribute("src");
  if (!img || !src || img.dataset.deferred) return;

  img.dataset.src = src;
  img.removeAttribute("src");
  img.dataset.deferred = "1";
};

const loadDeferredImage = (img) => {
  if (!img || img.src) return;
  const src = img.dataset.src;
  if (!src) return;
  applyBestImageFormat(img, src);
};

const connectHomeMediaFallbacks = () => {
  if (!heroVideo) return;

  const posterCandidates = [
    "assets/homepage.webp",
    "assets/homepage.jpg",
    "assets/clips/homepage.webp",
    "assets/clips/homepage.png",
    "homepage.jpg",
  ];
  let posterIndex = 0;

  const tryNextPoster = () => {
    if (posterIndex >= posterCandidates.length) return;
    const candidate = posterCandidates[posterIndex++];
    const probe = new Image();
    probe.onload = () => {
      heroVideo.setAttribute("poster", candidate);
    };
    probe.onerror = tryNextPoster;
    probe.src = candidate;
  };

  tryNextPoster();
};

const initDeferredHeroVideo = () => {
  if (!heroVideo || heroVideo.dataset.loaded) return;

  const load = () => {
    if (heroVideo.dataset.loaded) return;
    heroVideo.dataset.loaded = "1";

    const src = heroVideo.dataset.src || "assets/0601(1).mp4";
    if (!heroVideo.querySelector("source")) {
      const source = document.createElement("source");
      source.src = src;
      source.type = "video/mp4";
      heroVideo.appendChild(source);
    }

    heroVideo.load();
    heroVideo.play().catch(() => {});
  };

  if ("requestIdleCallback" in window) {
    requestIdleCallback(load, { timeout: 1800 });
  } else {
    window.setTimeout(load, 500);
  }
};

const initLazyVideos = () => {
  const videos = [...document.querySelectorAll("video[data-src]")].filter(
    (video) => !video.classList.contains("hero__video")
  );

  if (!videos.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const video = entry.target;
        if (video.dataset.loaded) return;
        video.dataset.loaded = "1";

        const src = video.dataset.src;
        if (src && !video.querySelector("source")) {
          const source = document.createElement("source");
          source.src = src;
          source.type = "video/mp4";
          video.appendChild(source);
        }

        video.load();
        observer.unobserve(video);
      });
    },
    { rootMargin: "240px 0px" }
  );

  videos.forEach((video) => observer.observe(video));
};

const initLazyMemberImages = () => {
  const baseImages = [...document.querySelectorAll(".member-card__image--base")];
  const focusImages = [...document.querySelectorAll(".member-card__image--focus")];

  focusImages.forEach((img) => deferImageSrc(img));

  baseImages.forEach((img, index) => {
    img.loading = index < 6 ? "eager" : "lazy";
    img.decoding = "async";
    if ("fetchPriority" in img) {
      img.fetchPriority = index < 6 ? "auto" : "low";
    }

    const src = img.getAttribute("src");
    if (src) applyBestImageFormat(img, src);
  });

  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadDeferredImage(entry.target.querySelector(".member-card__image--focus"));
        cardObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "160px 0px" }
  );

  memberCards.forEach((card) => {
    cardObserver.observe(card);
    const preloadFocus = () => loadDeferredImage(card.querySelector(".member-card__image--focus"));
    card.addEventListener("mouseenter", preloadFocus, { once: true });
    card.addEventListener("focusin", preloadFocus, { once: true });
  });
};

const initCriticalImages = () => {
  document.querySelectorAll(".loader__image img, .clan-logo__frame img").forEach((img) => {
    if ("fetchPriority" in img) img.fetchPriority = "high";
    img.decoding = "async";
    const src = img.getAttribute("src");
    if (src) applyBestImageFormat(img, src);
  });
};

const initMediaPerformance = () => {
  initCriticalImages();
  initLazyMemberImages();
  initDeferredHeroVideo();
  initLazyVideos();
};

initMediaPerformance();

window.addEventListener("load", () => {
  connectHomeMediaFallbacks();
  window.setTimeout(() => {
    loader.classList.add("is-hidden");
  }, 1300);
});

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => nav.classList.remove("is-open"));
});

soundToggle.addEventListener("click", () => {
  heroVideo.muted = !heroVideo.muted;
  soundToggle.setAttribute("aria-pressed", String(!heroVideo.muted));
  soundToggle.querySelector(".sound-toggle__text").textContent = heroVideo.muted
    ? "Muted"
    : "Sound On";
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

document.querySelectorAll("img").forEach((image) => {
  if (image.complete && image.naturalWidth > 0) {
    image.classList.add("image-loaded");
  }

  image.addEventListener("load", () => {
    image.classList.add("image-loaded");
  });

  image.addEventListener("error", () => {
    image.classList.remove("image-loaded");
  });
});

modalImage.addEventListener("error", () => {
  const fallback = modalImage.dataset.fallbackSrc;

  if (fallback && modalImage.src !== new URL(fallback, window.location.href).href) {
    modalImage.src = fallback;
    return;
  }

  modalImage.classList.remove("image-loaded");
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -48% 0px" }
);

document.querySelectorAll("main > section").forEach((section) => {
  sectionObserver.observe(section);
});

const updateMemberFilters = () => {
  let visibleCount = 0;

  memberCards.forEach((card) => {
    const memberName = card.querySelector(".member-card__name")?.textContent.toLowerCase() || "";
    const roleMatches = activeFilters.role === "all" || card.dataset.role === activeFilters.role;
    const genderMatches = activeFilters.gender === "all" || card.dataset.gender === activeFilters.gender;
    const searchMatches = !activeFilters.search || memberName.includes(activeFilters.search);
    const isVisible = roleMatches && genderMatches && searchMatches;

    card.classList.toggle("is-hidden-by-filter", !isVisible);
    card.toggleAttribute("hidden", !isVisible);

    if (isVisible) visibleCount += 1;
  });

  if (filterCount) {
    filterCount.textContent =
      visibleCount === memberCards.length
        ? "Showing all members"
        : `Showing ${visibleCount} member${visibleCount === 1 ? "" : "s"}`;
  }

  if (orgEmpty) {
    orgEmpty.hidden = visibleCount !== 0;
  }
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilters[button.dataset.filterType] = button.dataset.filterValue;

    filterButtons
      .filter((item) => item.dataset.filterType === button.dataset.filterType)
      .forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });

    updateMemberFilters();
  });
});

if (memberSearch) {
  memberSearch.addEventListener("input", () => {
    activeFilters.search = memberSearch.value.trim().toLowerCase();
    updateMemberFilters();
  });
}

if (searchClear && memberSearch) {
  searchClear.addEventListener("click", () => {
    memberSearch.value = "";
    activeFilters.search = "";
    memberSearch.focus();
    updateMemberFilters();
  });
}

updateMemberFilters();

document.querySelectorAll(".member-card").forEach((card) => {
  card.addEventListener("click", () => {
    const memberKey = card.dataset.member;
    const member = memberKey ? members[memberKey] || {} : {};
    const cardRank = card.querySelector(".member-card__rank")?.textContent.trim() || "Member";
    const cardName = card.querySelector(".member-card__name")?.textContent.trim() || "Clan Member";
    const focusImg = card.querySelector(".member-card__image--focus");
    const baseImg = card.querySelector(".member-card__image--base");
    loadDeferredImage(focusImg);

    const baseImage = baseImg?.src || baseImg?.dataset.src || baseImg?.getAttribute("src");
    const focusImage = focusImg?.src || focusImg?.dataset.src || focusImg?.getAttribute("src");
    const cardImage = focusImage || baseImage || member.image;

    modalRank.textContent = member.rank || cardRank;
    modalName.textContent = member.name || cardName;
    modalDescription.textContent =
      member.description || `${cardName} is one of the ${cardRank.toLowerCase()} of the clan.`;
    modalImage.classList.remove("image-loaded");
    modalImage.dataset.fallbackSrc = baseImage || member.image || "";
    modalImage.src = cardImage;
    modalImage.alt = `${member.name || cardName} profile image`;

    if (modalImage.complete && modalImage.naturalWidth > 0) {
      modalImage.classList.add("image-loaded");
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });
});

const closeModal = () => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeModal();
  }
});

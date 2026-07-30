const API_URL = "https://api.astroworldmc.com/api/v1/mobs";


const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const mobList = document.getElementById("mob-list");
const resultsCount = document.getElementById("results-count");
const categoryFilter = document.getElementById("category-filter");
const sortFilter = document.getElementById("sort-filter");
const modal = document.getElementById("mob-modal");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");
const modalOverlay = document.querySelector(".modal__overlay");



async function getMobs() {
 try {  const response = await fetch(API_URL);
  const data = await response.json();
console.log(data);
return data.data;
}
catch (error) {
  console.error("Failed to fetch mobs", error);
  return [];
}
}



searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const searchTerm = searchInput.value
  .trim()
  .toLowerCase();

  const mobs = await getMobs();

  const filteredMobs = mobs.filter((mob) => {
    return mob.name
    .toLowerCase()
    .includes(searchTerm);
  })

  console.log("Filtered mobs:", filteredMobs);

  renderMobCards(filteredMobs);

  console.log("Render function ran");
});

function renderMobCards(mobs) {
  mobList.innerHTML = "";
  if (mobs.length === 0) {
  resultsCount.textContent = "0 mobs found";

  mobList.innerHTML = `
    <div class="results__empty">
      <h3>No mobs found</h3>
      <p>Try a different search or category.</p>
    </div>
  `;

  return;
}

  resultsCount.textContent = `${mobs.length} mobs found`;

  for (const mob of mobs) {
    const card = createMobCard(mob);
    mobList.innerHTML += card;
  }
}

function createMobCard(mob) {

  return `
    <article class="mob-card">

    <div class="mob-card__header">
      <h3 class="mob-card__title">
        ${mob.name}
      </h3>

      <span class="mob-card__category">
        ${mob.category}
      </span>
    </div>

    <div class="mob-card__stats">

      <div class="mob-card__stat">
        <span class="mob-card__label">❤️ HP</span>
        <span class="mob-card__value">${mob.hp}</span>
      </div>

      <div class="mob-card__stat">
        <span class="mob-card__label">🗡️ Damage</span>
        <span class="mob-card__value">${mob.damage.normal}</span>
      </div>

      <div class="mob-card__stat">
        <span class="mob-card__label">🎁 Drops</span>
        <span class="mob-card__value">${mob.drops.length}</span>
      </div>

      <div class="mob-card__stat">
        <span class="mob-card__label">✨ XP</span>
        <span class="mob-card__value">
          ${mob.xpDrop.min}–${mob.xpDrop.max}
        </span>
      </div>

    </div>

    <button
      class="mob-card__button"
      type="button"
      data-mob-name="${mob.name}"
    >
      View Details
    </button>

  </article>
`;
}


function filterMobs(mobs) {
  const searchTerm = searchInput.value
    .trim()
    .toLowerCase();

  const selectedCategory = categoryFilter.value
    .toLowerCase();

  const filteredMobs = mobs.filter((mob) => {
    const matchesName = mob.name
      .toLowerCase()
      .includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" ||
      mob.category.toLowerCase() === selectedCategory;

    return matchesName && matchesCategory;
  });
  const sortBy = sortFilter.value;

if (sortBy === "name-asc") {
  filteredMobs.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
}

if (sortBy === "name-desc") {
  filteredMobs.sort((a, b) => {
    return b.name.localeCompare(a.name);
  });
}

if (sortBy === "hp-high") {
  filteredMobs.sort((a, b) => {
    return b.hp - a.hp;
  });
}

if (sortBy === "hp-low") {
  filteredMobs.sort((a, b) => {
    return a.hp - b.hp;
  });
}

renderMobCards(filteredMobs);
}

function openModal(mob) {
  if (!mob) {
  return;
}
  const categoryKey = String(mob.category)
    .trim()
    .toLowerCase();

  const categoryColors = {
    hostile: "modal__category--hostile",
    passive: "modal__category--passive",
    neutral: "modal__category--neutral",
  };

  const categoryClass = categoryColors[categoryKey] || "";

  console.log({
    originalCategory: mob.category,
    categoryKey,
    categoryClass,
  });
   const drops = mob.drops
    .map((drop) => {
      return `
        <li class="modal__drop">
          <h4 class="modal__drop-title">
            🎁 ${drop.item}
          </h4>
<p class="modal__drop-info">
  📦 Quantity: ${drop.count.min}–${drop.count.max}
</p>

<p class="modal__drop-info">
  🎲 Chance: ${drop.chance}%
</p>
          
        </li>
      `;
    })
    .join("");
  modalBody.innerHTML = `
    <h2
      id="modal-title"
      class="modal__title"
    >
      ${mob.name}
    </h2>

    <p
  class="modal__category ${categoryClass}"
>
  ${mob.category}
</p>

    <div class="modal__stats">

  <div class="modal__stat-card">
    <span class="modal__stat-label">
      ❤️ Health
    </span>

    <span class="modal__stat-value">
      ${mob.hp}
    </span>
  </div>

  <div class="modal__stat-card">
    <span class="modal__stat-label">
      🗡️ Damage
    </span>

    <span class="modal__stat-value">
      ${mob.damage.normal}
    </span>
  </div>

  <div class="modal__stat-card">
    <span class="modal__stat-label">
      ✨ XP
    </span>

    <span class="modal__stat-value">
      ${mob.xpDrop.min}–${mob.xpDrop.max}
    </span>
  </div>

</div>

    <section class="modal__section">
      <h3>Behavior</h3>

      <p>
        ${mob.behavior}
      </p>
    </section>

    <section class="modal__section">
      <h3>Possible Drops</h3>

      <ul class="modal__drops">
        ${drops}
      </ul>
    </section>
  `;

  modal.classList.add("modal--open");
  modal.setAttribute("aria-hidden", "false");
  modalClose.focus();
}

function closeModal() {
  modal.classList.remove("modal--open");
  modal.setAttribute("aria-hidden", "true");
}

async function initializeApp() {
  const mobs = await getMobs();

  filterMobs(mobs);

  searchInput.addEventListener("input", () => {
    filterMobs(mobs);
  });

  categoryFilter.addEventListener("change", () => {
    filterMobs(mobs);
  });
  sortFilter.addEventListener("change", () => {
  filterMobs(mobs);
});

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    filterMobs(mobs);
  });

  modalClose.addEventListener("click", () => {
  closeModal();
});

modalOverlay.addEventListener("click", () => {
    closeModal();
  });

mobList.addEventListener("click", (event) => {
  const button = event.target.closest(".mob-card__button");

  if (!button) {
    return;
  }

  const mobName = button.dataset.mobName;

  const selectedMob = mobs.find((mob) => {
    return mob.name === mobName;
  });

  openModal(selectedMob);
});
}

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    modal.classList.contains("modal--open")
  ) {
    closeModal();
  }
});

initializeApp();

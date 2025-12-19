const search = document.getElementById("search");
const filter = document.getElementById("categoryFilter");
const cards = [...document.querySelectorAll(".card")];
const randomBtn = document.getElementById("randomBtn");
const darkToggle = document.getElementById("darkToggle");

// Search + category filter
function updateGrid() {
  const text = search.value.toLowerCase();
  const category = filter.value;

  cards.forEach(card => {
    const title = card.dataset.title.toLowerCase();
    const cat = card.dataset.category;

    const matchesText = title.includes(text);
    const matchesCategory = category === "all" || cat === category;

    card.style.display = matchesText && matchesCategory ? "block" : "none";
  });
}

search.addEventListener("input", updateGrid);
filter.addEventListener("change", updateGrid);

// Random experiment
randomBtn.addEventListener("click", () => {
  const visible = cards.filter(c => c.style.display !== "none");
  const pick = visible[Math.floor(Math.random() * visible.length)];
  if (pick) window.location.href = pick.href;
});

// Dark mode
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Smooth page transition
document.querySelectorAll("a.card").forEach(card => {
  card.addEventListener("click", e => {
    e.preventDefault();
    document.body.style.opacity = "0";
    setTimeout(() => {
      window.location.href = card.href;
    }, 200);
  });
});

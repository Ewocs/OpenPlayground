// ===============================
// Theme Toggle
// ===============================
const toggleBtn = document.getElementById("toggle-mode-btn");
const themeIcon = document.getElementById("theme-icon");
const html = document.documentElement;

const savedTheme = localStorage.getItem("theme") || "light";
html.setAttribute("data-theme", savedTheme);
updateThemeIcon(savedTheme);

toggleBtn.addEventListener("click", () => {
    const newTheme = html.getAttribute("data-theme") === "light" ? "dark" : "light";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);

    toggleBtn.classList.add("shake");
    setTimeout(() => toggleBtn.classList.remove("shake"), 500);
});

function updateThemeIcon(theme) {
    themeIcon.className =
        theme === "dark" ? "ri-lightbulb-fill" : "ri-lightbulb-line";
}

// ===============================
// Scroll to Top
// ===============================
const scrollBtn = document.getElementById("scrollToTopBtn");

window.addEventListener("scroll", () => {
    scrollBtn.classList.toggle("show", window.scrollY > 300);
});

scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===============================
// Mobile Navbar
// ===============================
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

// ===============================
// Projects Logic (SEARCH + SORT + FILTER + PAGINATION)
// ===============================
const itemsPerPage = 10;
let currentPage = 1;
let currentCategory = "all";
let currentSort = "default";

const searchInput = document.getElementById("project-search");
const sortSelect = document.getElementById("project-sort");
const filterBtns = document.querySelectorAll(".filter-btn");

const projectsContainer = document.querySelector(".projects-container");
const paginationContainer = document.getElementById("pagination-controls");

const allCards = Array.from(document.querySelectorAll(".card"));

// ===============================
// Events
// ===============================
searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderProjects();
});

sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value;
    currentPage = 1;
    renderProjects();
});

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentCategory = btn.dataset.filter;
        currentPage = 1;
        renderProjects();
    });
});

// ===============================
// Core Render Function
// ===============================
function renderProjects() {
    let cards = [...allCards];

    // 🔍 Search
    const searchText = searchInput.value.toLowerCase();
    if (searchText) {
        cards = cards.filter(card =>
            card.querySelector(".card-heading").innerText
                .toLowerCase()
                .includes(searchText)
        );
    }

    // 🏷 Category
    if (currentCategory !== "all") {
        cards = cards.filter(
            card => card.dataset.category === currentCategory
        );
    }

    // 🔃 Sort
    switch (currentSort) {
        case "az":
            cards.sort((a, b) =>
                a.querySelector(".card-heading").innerText
                    .localeCompare(b.querySelector(".card-heading").innerText)
            );
            break;

        case "za":
            cards.sort((a, b) =>
                b.querySelector(".card-heading").innerText
                    .localeCompare(a.querySelector(".card-heading").innerText)
            );
            break;

        case "newest":
            cards.reverse();
            break;

        case "oldest":
        default:
            cards = [...cards];
    }

    // 📄 Pagination
    const totalItems = cards.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedCards = cards.slice(start, start + itemsPerPage);

    // Render Cards
    projectsContainer.innerHTML = "";
    paginatedCards.forEach(card => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        projectsContainer.appendChild(card);

        requestAnimationFrame(() => {
            card.style.transition = "0.4s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        });
    });

    renderPagination(totalPages);
}

// ===============================
// Pagination Controls
// ===============================
function renderPagination(totalPages) {
    paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    const createBtn = (label, disabled, onClick) => {
        const btn = document.createElement("button");
        btn.className = "pagination-btn";
        btn.innerHTML = label;
        btn.disabled = disabled;
        btn.onclick = onClick;
        return btn;
    };

    paginationContainer.appendChild(
        createBtn("‹", currentPage === 1, () => {
            currentPage--;
            renderProjects();
            scrollToProjects();
        })
    );

    for (let i = 1; i <= totalPages; i++) {
        const btn = createBtn(i, false, () => {
            currentPage = i;
            renderProjects();
            scrollToProjects();
        });
        if (i === currentPage) btn.classList.add("active");
        paginationContainer.appendChild(btn);
    }

    paginationContainer.appendChild(
        createBtn("›", currentPage === totalPages, () => {
            currentPage++;
            renderProjects();
            scrollToProjects();
        })
    );
}

function scrollToProjects() {
    document.getElementById("projects")
        .scrollIntoView({ behavior: "smooth" });
}

// ===============================
// Init
// ===============================
renderProjects();

console.log(
    "%cWant to contribute? https://github.com/YadavAkhileshh/OpenPlayground",
    "color:#8b5cf6;font-size:14px"
);

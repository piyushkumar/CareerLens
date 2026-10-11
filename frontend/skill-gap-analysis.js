
const careerTitle = document.querySelector("#career-title");
const careerDescription = document.querySelector("#career-description");
const matchedCount = document.querySelector("#matched-count");
const missingCount = document.querySelector("#missing-count");
const matchedContainer = document.querySelector("#matched-skills");
const missingContainer = document.querySelector("#missing-skills");
const notice = document.querySelector("#gap-notice");
const roadmapButton = document.querySelector("#roadmap-button");

const careerDescriptions = {
  "data-analyst": "Analyze datasets, find patterns and communicate insights.",
  "data-scientist": "Use statistics, programming and machine learning to investigate data.",
  "python-developer": "Build applications, automation scripts and backend services.",
  "ml-engineer": "Build, evaluate and integrate machine-learning systems."
};

function normalizeSkill(skill) {
  const aliases = {
    html: "html",
    "machine learning": "machine learning",
    ml: "machine learning",
    "data visualization": "data visualization"
  };

  const normalized = String(skill).trim().toLowerCase();
  return aliases[normalized] || normalized;
}

function displaySkillList(container, skills, isMissing = false) {
  container.replaceChildren();

  if (skills.length === 0) {
    const message = document.createElement("p");
    message.className = "gap-description";
    message.textContent = "None identified.";
    container.append(message);
    return;
  }

  skills.forEach(skill => {
    const chip = document.createElement("span");
    chip.className = isMissing
      ? "skill-chip missing"
      : "skill-chip";
    chip.textContent = skill;
    container.append(chip);
  });
}

let profile = null;
let selectedCareer = null;

try {
  profile = JSON.parse(
    sessionStorage.getItem("careerLensProfileInput") || "null"
  );
  selectedCareer = JSON.parse(
    sessionStorage.getItem("careerLensSelectedCareer") || "null"
  );
} catch {
  profile = null;
  selectedCareer = null;
}

if (!selectedCareer || !Array.isArray(selectedCareer.requiredSkills)) {
  careerTitle.textContent = "No career selected";
  careerDescription.textContent =
    "Return to Career Recommendations and select a career first.";
  matchedCount.textContent = "—";
  missingCount.textContent = "—";
  displaySkillList(matchedContainer, []);
  displaySkillList(missingContainer, []);
  notice.textContent = "A selected career is required to compare skills.";
  roadmapButton.disabled = true;
} else {
  careerTitle.textContent = selectedCareer.title;
  careerDescription.textContent =
    careerDescriptions[selectedCareer.id] ||
    "Explore the skills commonly used in this career.";

  if (!profile || profile.mode !== "manual" ||
      !Array.isArray(profile.skills)) {
    matchedCount.textContent = "—";
    missingCount.textContent = "—";
    displaySkillList(matchedContainer, []);
    displaySkillList(missingContainer, selectedCareer.requiredSkills, true);

    notice.textContent =
      "Your resume skills have not been extracted yet. These are typical skills for the selected career, not a verified assessment of your resume. Enter your skills manually to compare them.";
  } else {
    const currentSkills = profile.skills.map(normalizeSkill);
    const matched = selectedCareer.requiredSkills.filter(skill =>
      currentSkills.includes(normalizeSkill(skill))
    );
    const missing = selectedCareer.requiredSkills.filter(skill =>
      !currentSkills.includes(normalizeSkill(skill))
    );

    matchedCount.textContent = matched.length;
    missingCount.textContent = missing.length;

    displaySkillList(matchedContainer, matched);
    displaySkillList(missingContainer, missing, true);

    notice.textContent =
      "This comparison uses direct skill-name matching against starter career requirements. It is a basic prototype, not a validated measure of job readiness.";
  }
}

roadmapButton.addEventListener("click", () => {
  window.location.href = "learning-roadmap.html";
});

// Mobile navigation
const menuToggle = document.querySelector("#menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Open navigation" : "Close navigation"
    );
    mobileNav.hidden = isOpen;
  });

  mobileNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileNav.hidden = true;
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });
}

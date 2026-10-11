
const careerList = document.querySelector("#career-list");
const notice = document.querySelector("#career-notice");

const careers = [
  {
    id: "data-analyst",
    title: "Data Analyst",
    tag: "Data & Analytics",
    description:
      "Analyze data to find patterns and communicate useful insights.",
    skills: ["SQL", "Excel", "Python", "Statistics", "Data Visualization"]
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    tag: "Data Science",
    description:
      "Use statistics, programming and machine learning to investigate data.",
    skills: ["Python", "Statistics", "Pandas", "Machine Learning", "SQL"]
  },
  {
    id: "python-developer",
    title: "Python Developer",
    tag: "Software Development",
    description:
      "Build applications, automation scripts and backend services with Python.",
    skills: ["Python", "OOP", "Data Structures", "Git", "APIs"]
  },
  {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    tag: "AI & Machine Learning",
    description:
      "Build, evaluate and integrate machine-learning systems.",
    skills: [
      "Python",
      "Machine Learning",
      "Statistics",
      "Data Processing",
      "Model Evaluation"
    ]
  }
];

let profile = null;

try {
  profile = JSON.parse(
    sessionStorage.getItem("careerLensProfileInput") || "null"
  );
} catch {
  profile = null;
}

function normalizeSkill(skill) {
  return String(skill).trim().toLowerCase();
}

function createCareerCard(career, userSkills) {
  const card = document.createElement("article");
  card.className = "career-card";

  const tag = document.createElement("span");
  tag.className = "career-tag";
  tag.textContent = career.tag;

  const title = document.createElement("h2");
  title.textContent = career.title;

  const description = document.createElement("p");
  description.textContent = career.description;

  const heading = document.createElement("p");
  heading.textContent = "Typical required skills";

  const skillList = document.createElement("ul");

  career.skills.forEach(skill => {
    const item = document.createElement("li");
    item.textContent = skill;
    skillList.append(item);
  });

  card.append(tag, title, description, heading, skillList);

  if (userSkills !== null) {
    const normalizedUserSkills = userSkills.map(normalizeSkill);
    const matched = career.skills.filter(skill =>
      normalizedUserSkills.includes(normalizeSkill(skill))
    );

    const matchInfo = document.createElement("p");
    matchInfo.textContent =
      `Matched skills: ${matched.length ? matched.join(", ") : "None identified yet"}`;

    card.append(matchInfo);
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "button button-light";
  button.textContent = "Explore this career";

  button.addEventListener("click", () => {
    sessionStorage.setItem(
      "careerLensSelectedCareer",
      JSON.stringify({
        id: career.id,
        title: career.title,
        requiredSkills: career.skills
      })
    );

    notice.textContent =
      `${career.title} selected. The next step is to compare your skills with this career's requirements.`;

    window.location.href = "skill-gap-analysis.html";
  });

  card.append(button);
  return card;
}

if (!profile || !["resume", "manual"].includes(profile.mode)) {
  notice.textContent =
    "No reviewed profile was found. Please upload a resume or enter your skills first.";
} else if (profile.mode === "resume") {
  notice.textContent =
    "Your PDF is selected, but its skills have not been extracted. Explore the career options below; personalized matching will be available after resume parsing is implemented.";
  careers.forEach(career => {
    careerList.append(createCareerCard(career, null));
  });
} else {
  const skills = Array.isArray(profile.skills) ? profile.skills : [];

  if (skills.length === 0) {
    notice.textContent =
      "No manual skills were found. Return to the previous page and enter your skills to enable personalized comparisons.";
  } else {
    notice.textContent =
      `We found ${skills.length} manually entered skill(s). The cards show direct skill-name matches only, not validated career-fit scores.`;

    careers.forEach(career => {
      careerList.append(createCareerCard(career, skills));
    });
  }
}

// Mobile navigation
const menuToggle = document.querySelector("#menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen =
      menuToggle.getAttribute("aria-expanded") === "true";

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

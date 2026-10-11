
const targetCareer = document.querySelector("#target-career");
const totalSteps = document.querySelector("#total-steps");
const completedSteps = document.querySelector("#completed-steps");
const progressTrack = document.querySelector("#progress-track");
const progressFill = document.querySelector("#progress-fill");
const roadmapIntro = document.querySelector("#roadmap-intro");
const roadmapList = document.querySelector("#roadmap-list");
const roadmapNotice = document.querySelector("#roadmap-notice");
const resetButton = document.querySelector("#reset-progress");

const learningResources = {
  "Statistics": {
    description: "Learn the statistical ideas used to understand and summarize data.",
    topics: ["Mean, median and mode", "Variance and standard deviation", "Basic probability and distributions"],
    practice: "Summarize a small dataset and explain its average and spread.",
    resource: "Khan Academy Statistics",
    url: "https://www.khanacademy.org/math/statistics-probability"
  },
  "Data Visualization": {
    description: "Learn how to communicate patterns with clear charts and graphs.",
    topics: ["Choosing the right chart", "Labels, scales and legends", "Explaining insights from charts"],
    practice: "Create three charts from one dataset and write one insight for each.",
    resource: "Microsoft Learn: Power BI",
    url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi/"
  },
  "Python": {
    description: "Practice Python fundamentals for data and application development.",
    topics: ["Variables, conditions and loops", "Functions and collections", "Reading and writing files"],
    practice: "Write a Python program that cleans and summarizes a small dataset.",
    resource: "Official Python Tutorial",
    url: "https://docs.python.org/3/tutorial/"
  },
  "SQL": {
    description: "Learn to retrieve, filter, combine and summarize database records.",
    topics: ["SELECT, WHERE and ORDER BY", "GROUP BY and aggregate functions", "INNER JOIN and LEFT JOIN"],
    practice: "Write queries to summarize sales or student records from related tables.",
    resource: "SQLBolt interactive lessons",
    url: "https://sqlbolt.com/"
  },
  "Excel": {
    description: "Build spreadsheet skills for cleaning and summarizing data.",
    topics: ["Sorting and filtering", "Formulas and common functions", "PivotTables and charts"],
    practice: "Clean a spreadsheet and summarize it with a PivotTable.",
    resource: "Microsoft Excel Help & Learning",
    url: "https://support.microsoft.com/excel"
  },
  "Pandas": {
    description: "Use Python to clean, transform and explore tabular data.",
    topics: ["Series and DataFrames", "Filtering and missing values", "Grouping and merging datasets"],
    practice: "Load a CSV, clean missing values and produce a grouped summary.",
    resource: "Pandas Getting Started",
    url: "https://pandas.pydata.org/docs/getting_started/"
  },
  "Machine Learning": {
    description: "Understand the basic workflow for training and evaluating models.",
    topics: ["Features and labels", "Training and testing data", "Model evaluation and overfitting"],
    practice: "Train a simple classification model and evaluate it on test data.",
    resource: "scikit-learn Getting Started",
    url: "https://scikit-learn.org/stable/getting_started.html"
  },
  "OOP": {
    description: "Organize programs using classes and objects.",
    topics: ["Classes and objects", "Attributes and methods", "Inheritance and composition"],
    practice: "Create a small program that models students or products.",
    resource: "Python Classes Tutorial",
    url: "https://docs.python.org/3/tutorial/classes.html"
  },
  "Data Structures": {
    description: "Choose suitable structures for storing and working with data.",
    topics: ["Lists and dictionaries", "Stacks and queues", "Searching and sorting basics"],
    practice: "Implement a simple search feature over a list of records.",
    resource: "Python Data Structures",
    url: "https://docs.python.org/3/tutorial/datastructures.html"
  },
  "Git": {
    description: "Track code changes and collaborate on projects.",
    topics: ["Repositories and commits", "Branches and merging", "Remote repositories and GitHub"],
    practice: "Create a repository and commit a small Python project.",
    resource: "Git Book",
    url: "https://git-scm.com/book/en/v2"
  },
  "APIs": {
    description: "Learn how applications exchange information over HTTP.",
    topics: ["HTTP requests and responses", "JSON data", "Calling an API from Python"],
    practice: "Write a Python script that calls a public API and reads its JSON response.",
    resource: "MDN HTTP Overview",
    url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview"
  },
  "Data Processing": {
    description: "Prepare raw data for analysis and model training.",
    topics: ["Missing and duplicate values", "Data types and transformations", "Building repeatable preprocessing steps"],
    practice: "Create a reusable script that cleans a messy CSV file.",
    resource: "Pandas User Guide",
    url: "https://pandas.pydata.org/docs/user_guide/"
  },
  "Model Evaluation": {
    description: "Evaluate a model using appropriate metrics and test data.",
    topics: ["Train/test split", "Accuracy, precision and recall", "Confusion matrix and overfitting"],
    practice: "Compare two models and explain their evaluation results.",
    resource: "scikit-learn Model Evaluation",
    url: "https://scikit-learn.org/stable/modules/model_evaluation.html"
  }
};

const generalSteps = {
  "Data Analyst": ["Excel", "SQL", "Statistics", "Data Visualization", "Python"],
  "Data Scientist": ["Python", "Statistics", "Pandas", "Machine Learning", "Model Evaluation"],
  "Python Developer": ["Python", "OOP", "Data Structures", "Git", "APIs"],
  "Machine Learning Engineer": ["Python", "Statistics", "Data Processing", "Machine Learning", "Model Evaluation"]
};

function normalizeSkill(skill) {
  const aliases = {
    "ml": "machine learning",
    "html": "html",
    "powerbi": "data visualization",
    "power bi": "data visualization"
  };

  const value = String(skill).trim().toLowerCase();
  return aliases[value] || value;
}

function findResource(skill) {
  const key = Object.keys(learningResources).find(
    item => normalizeSkill(item) === normalizeSkill(skill)
  );

  if (key) return learningResources[key];

  return {
    description: `Build a practical foundation in ${skill} for your selected career.`,
    topics: [
      `Understand the core concepts of ${skill}`,
      `Practice common ${skill} tasks`,
      `Apply ${skill} to a small example`
    ],
    practice: `Complete a small exercise or project that demonstrates your understanding of ${skill}.`,
    resource: "Search for official documentation or a beginner course",
    url: "https://www.google.com/search?q=" + encodeURIComponent(skill + " official beginner tutorial")
  };
}

let profile = null;
let career = null;

try {
  profile = JSON.parse(sessionStorage.getItem("careerLensProfileInput") || "null");
  career = JSON.parse(sessionStorage.getItem("careerLensSelectedCareer") || "null");
} catch {
  profile = null;
  career = null;
}

const careerName = career?.title || "";
const profileHasManualSkills =
  profile?.mode === "manual" && Array.isArray(profile.skills);

const currentSkills = profileHasManualSkills
  ? profile.skills.map(normalizeSkill)
  : [];

let learningSkills = [];

if (career && Array.isArray(career.requiredSkills)) {
  const missingSkills = career.requiredSkills.filter(
    skill => !currentSkills.includes(normalizeSkill(skill))
  );

  if (profileHasManualSkills) {
    learningSkills = missingSkills;
  } else {
    learningSkills = generalSteps[careerName] || career.requiredSkills;
  }
}

if (!career || !Array.isArray(career.requiredSkills)) {
  targetCareer.textContent = "No career selected";
  totalSteps.textContent = "0";
  completedSteps.textContent = "0 of 0";
  roadmapIntro.textContent =
    "Select a career first to build a learning sequence.";
  roadmapNotice.textContent =
    "Return to Career Recommendations and choose a career before continuing.";
  resetButton.disabled = true;
} else {
  targetCareer.textContent = careerName;
  totalSteps.textContent = String(learningSkills.length);

  if (profileHasManualSkills) {
    roadmapIntro.textContent = learningSkills.length
      ? "Start with the skills not found in your manually entered profile. Each step includes topics, practice, and a learning resource."
      : "Your entered skills match the current starter requirements. Review the resources below to strengthen your knowledge.";
    roadmapNotice.textContent =
      "This roadmap is based on starter career requirements and direct skill-name matching. It is a learning suggestion, not a validated assessment.";
  } else {
    roadmapIntro.textContent =
      "This is a general starter sequence for your selected career because resume skills have not yet been extracted.";
    roadmapNotice.textContent =
      "Your PDF has not been analyzed yet. This sequence is general guidance, not a personalized skill-gap result.";
  }

  if (learningSkills.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-roadmap";
    empty.textContent =
      "There are no identified missing skills in the current starter requirements. You can still explore your career's learning resources once they are added.";
    roadmapList.append(empty);
  }

  const progressKey = "careerLensRoadmapProgress_" + career.id;
  let completed = new Set();

  try {
    completed = new Set(
      JSON.parse(sessionStorage.getItem(progressKey) || "[]")
    );
  } catch {
    completed = new Set();
  }

  function updateProgress() {
    completedSteps.textContent =
      `${completed.size} of ${learningSkills.length}`;

    const percent = learningSkills.length
      ? Math.round((completed.size / learningSkills.length) * 100)
      : 0;

    progressFill.style.width = percent + "%";
    progressTrack.setAttribute("aria-valuenow", String(percent));
    sessionStorage.setItem(progressKey, JSON.stringify([...completed]));
  }

  learningSkills.forEach((skill, index) => {
    const resource = findResource(skill);
    const card = document.createElement("article");
    card.className = "roadmap-step";

    const number = document.createElement("div");
    number.className = "step-number";
    number.textContent = String(index + 1);

    const content = document.createElement("div");

    const top = document.createElement("div");
    top.className = "step-top";

    const title = document.createElement("h3");
    title.textContent = skill;

    const tag = document.createElement("span");
    tag.className = "step-tag";
    tag.textContent = index === 0 ? "Start here" : "Next step";

    top.append(title, tag);

    const description = document.createElement("p");
    description.className = "step-description";
    description.textContent = resource.description;

    const details = document.createElement("div");
    details.className = "step-details";

    const topicsHeading = document.createElement("h4");
    topicsHeading.textContent = "Topics to cover";

    const topicList = document.createElement("ul");

    resource.topics.forEach(topic => {
      const item = document.createElement("li");
      item.textContent = topic;
      topicList.append(item);
    });

    const practiceHeading = document.createElement("h4");
    practiceHeading.textContent = "Practice task";

    const practice = document.createElement("p");
    practice.className = "step-description";
    practice.textContent = resource.practice;

    const resourceLink = document.createElement("a");
    resourceLink.href = resource.url;
    resourceLink.target = "_blank";
    resourceLink.rel = "noopener noreferrer";
    resourceLink.textContent = "Open learning resource ↗";

    const checkLabel = document.createElement("label");
    checkLabel.className = "step-check";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed.has(skill);

    const checkText = document.createElement("span");
    checkText.textContent = "Mark this step as completed";

    checkLabel.append(checkbox, checkText);
    details.append(
      topicsHeading, topicList,
      practiceHeading, practice,
      resourceLink, checkLabel
    );

    content.append(top, description, details);
    card.append(number, content);

    if (checkbox.checked) card.classList.add("completed");

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        completed.add(skill);
        card.classList.add("completed");
      } else {
        completed.delete(skill);
        card.classList.remove("completed");
      }
      updateProgress();
    });

    roadmapList.append(card);
  });

  updateProgress();

  resetButton.addEventListener("click", () => {
    completed.clear();
    sessionStorage.removeItem(progressKey);
    roadmapList.querySelectorAll('input[type="checkbox"]').forEach(box => {
      box.checked = false;
      box.closest(".roadmap-step")?.classList.remove("completed");
    });
    updateProgress();
    roadmapNotice.textContent =
      "Progress has been reset for this browser session.";
  });
}

// Mobile navigation
const menuToggle = document.querySelector("#menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    menuToggle.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
    mobileNav.hidden = open;
  });

  mobileNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileNav.hidden = true;
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });
}

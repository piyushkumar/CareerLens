const fileInput = document.querySelector('#resume-file');
const dropZone = document.querySelector('#drop-zone');
const fileError = document.querySelector('#file-error');
const selectedFile = document.querySelector('#selected-file');
const fileName = document.querySelector('#file-name');
const fileSize = document.querySelector('#file-size');
const dropTitle = document.querySelector('#drop-title');
const dropCopy = document.querySelector('#drop-copy');
const MAX_FILE_SIZE = 10 * 1024 * 1024;
let chosenFile = null;

function formatBytes(bytes) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
function clearFileError() { fileError.textContent = ''; }
function resetFile() {
  chosenFile = null;
  fileInput.value = '';
  selectedFile.hidden = true;
  dropTitle.textContent = 'Drop your resume here';
  dropCopy.innerHTML = 'or <span class="choose-link">browse files</span>';
  clearFileError();
}
function acceptFile(file) {
  clearFileError();
  if (!file) return;
  const looksLikePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!looksLikePdf) {
    resetFile();
    fileError.textContent = 'Please choose a PDF file. Other file types are not supported in this preview.';
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    resetFile();
    fileError.textContent = 'This file is larger than 10 MB. Please choose a smaller PDF.';
    return;
  }
  if (file.size === 0) {
    resetFile();
    fileError.textContent = 'This file is empty. Please choose another PDF.';
    return;
  }
  chosenFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = formatBytes(file.size);
  selectedFile.hidden = false;
  dropTitle.textContent = 'Resume selected';
  dropCopy.textContent = 'Choose another file by clicking here';
}
fileInput.addEventListener('change', () => acceptFile(fileInput.files[0]));
dropZone.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); fileInput.click(); }
});
['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, event => {
  event.preventDefault(); dropZone.classList.add('is-dragging');
}));
['dragleave', 'drop'].forEach(type => dropZone.addEventListener(type, event => {
  event.preventDefault(); dropZone.classList.remove('is-dragging');
}));
dropZone.addEventListener('drop', event => acceptFile(event.dataTransfer.files[0]));
document.querySelector('#remove-file').addEventListener('click', resetFile);
document.querySelector('#resume-form').addEventListener('submit', event => {
  event.preventDefault();
  clearFileError();
  if (!chosenFile) {
    fileError.textContent = 'Choose a PDF resume first, or use the manual skill-entry option.';
    fileInput.focus();
    return;
  }
  sessionStorage.setItem('careerLensProfileInput', JSON.stringify({ mode: 'resume', fileName: chosenFile.name, fileSize: chosenFile.size, skills: [] }));
  window.location.href = 'profile-review.html';
});

const skillInput = document.querySelector('#skill-input');
const skillChips = document.querySelector('#skill-chips');
const chipsEmpty = document.querySelector('#chips-empty');
const skillsError = document.querySelector('#skills-error');
const skills = [];
function addSkill(raw) {
  const value = String(raw || '').trim().replace(/\s+/g, ' ');
  skillsError.textContent = '';
  if (!value) { skillsError.textContent = 'Enter a skill name first.'; return; }
  if (value.length > 60) { skillsError.textContent = 'Keep each skill name under 60 characters.'; return; }
  if (skills.some(skill => skill.toLowerCase() === value.toLowerCase())) { skillsError.textContent = 'That skill is already in your list.'; return; }
  skills.push(value);
  skillInput.value = '';
  renderSkills();
  skillInput.focus();
}
function renderSkills() {
  skillChips.querySelectorAll('.skill-chip').forEach(chip => chip.remove());
  chipsEmpty.hidden = skills.length > 0;
  skills.forEach((skill, index) => {
    const chip = document.createElement('span');
    chip.className = 'skill-chip';
    const label = document.createElement('span'); label.textContent = skill;
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×';
    remove.setAttribute('aria-label', `Remove ${skill}`);
    remove.addEventListener('click', () => { skills.splice(index, 1); renderSkills(); });
    chip.append(label, remove); skillChips.append(chip);
  });
}
document.querySelector('#add-skill').addEventListener('click', () => addSkill(skillInput.value));
skillInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') { event.preventDefault(); addSkill(skillInput.value); }
});
document.querySelectorAll('[data-skill]').forEach(button => button.addEventListener('click', () => addSkill(button.dataset.skill)));
document.querySelector('#skills-form').addEventListener('submit', event => {
  event.preventDefault();
  skillsError.style.color = '#ff9f9f';
  if (!skills.length) { skillsError.textContent = 'Add at least one skill to continue.'; skillInput.focus(); return; }
  sessionStorage.setItem('careerLensProfileInput', JSON.stringify({ mode: 'manual', fileName: '', fileSize: 0, skills: [...skills] }));
  window.location.href = 'profile-review.html';
});

const menuToggle = document.querySelector('#menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  menuToggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  mobileNav.hidden = open;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Open navigation');
}));
document.querySelector('#top-link').addEventListener('click', event => { event.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); });

const sourceTitle = document.querySelector('#source-title');
const sourceDetail = document.querySelector('#source-detail');
const sourceSymbol = document.querySelector('#source-symbol');
const skillsContainer = document.querySelector('#review-skills');
const notice = document.querySelector('#review-notice');
let profile = null;
try { profile = JSON.parse(sessionStorage.getItem('careerLensProfileInput') || 'null'); } catch { profile = null; }
if (!profile || !['resume', 'manual'].includes(profile.mode)) {
  sourceTitle.textContent = 'No profile input found';
  sourceDetail.textContent = 'Start by uploading a PDF or entering your skills.';
  skillsContainer.innerHTML = '<p class="review-empty">No skills to review yet. Return to the previous page to add your information.</p>';
  document.querySelector('#continue-careers').disabled = true;
  notice.textContent = 'This page is a frontend preview. Your input is kept only for this browser session and is not saved to an account.';
} else if (profile.mode === 'resume') {
  sourceSymbol.textContent = 'PDF';
  sourceTitle.textContent = 'Resume selected';
  sourceDetail.textContent = `${profile.fileName} · ${formatBytes(profile.fileSize)}`;
  skillsContainer.innerHTML = '<p class="review-empty">Skills have not been extracted yet. The PDF is selected, but resume parsing will be available after backend integration. We will not invent skills from the file name.</p>';
  notice.textContent = 'Your PDF has not been uploaded to a server or analyzed yet. Resume extraction and secure saving will be connected to FastAPI later.';
} else {
  sourceSymbol.textContent = 'SK';
  sourceTitle.textContent = 'Manual skills';
  sourceDetail.textContent = `${profile.skills.length} skill${profile.skills.length === 1 ? '' : 's'} entered in this session`;
  if (profile.skills.length) {
    profile.skills.forEach(skill => { const chip = document.createElement('span'); chip.className = 'review-skill'; chip.textContent = skill; skillsContainer.append(chip); });
  } else {
    skillsContainer.innerHTML = '<p class="review-empty">No skills were entered.</p>';
  }
  notice.textContent = 'These are the skills you entered manually. They are kept only for this browser session; account saving and career analysis will be connected during backend integration.';
}
function formatBytes(bytes) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`; }
document.querySelector('#continue-careers').addEventListener('click', () => {
  notice.textContent = 'Your profile input is ready for the next frontend step. Career recommendations will appear once the career-analysis logic is implemented.';
  sessionStorage.setItem('careerLensNextStep', 'career-direction');
  window.location.href = 'career-recommendations.html';
});
const menuToggle = document.querySelector('#menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');

if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';

    menuToggle.setAttribute('aria-expanded', String(!open));
    menuToggle.setAttribute(
      'aria-label',
      open ? 'Open navigation' : 'Close navigation'
    );

    mobileNav.hidden = open;
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.hidden = true;
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    });
  });
}
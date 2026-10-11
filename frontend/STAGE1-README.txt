CareerLens frontend — Stage 1 update

Changes in this package:
- Landing CTA now opens home.html instead of explore.html.
- home.html is the shared public/guest dashboard with a top navbar and visible Log in option.
- Guided onboarding highlights Upload Resume and Enter Skills Manually.
- Career recommendations, skill gaps, and learning roadmap are preview cards.
- Protected links redirect to login.html and include a returnTo destination.
- Recent analyses use an honest empty state; no fake scores or recommendations are shown.
- Existing index.html animations and script.js are preserved.

Important limitation:
This is still a frontend prototype. No actual authentication or feature access is unlocked yet. home.js intentionally treats visitors as guests until a real FastAPI authentication/session check is integrated. The login form validates fields but does not sign users in. Frontend flags/localStorage are not secure authentication.

How to preview:
1. Extract the ZIP.
2. Open the frontend folder in VS Code.
3. Run index.html with Live Server.
4. Click Explore CareerLens to reach home.html.
5. Click Upload Resume or a locked feature to see the login redirect.

Stage 2 — Resume Analysis frontend preview
- Added resume-analysis.html, resume-analysis.css, and resume-analysis.js.
- Includes a responsive PDF selection/drop area with browser-side type and size checks.
- Includes manual skill entry, quick-add suggestions, duplicate prevention, and removable skill chips.
- Does not upload or store the file, extract resume text, authenticate users, or calculate career results. Those require backend integration.
- Open resume-analysis.html directly to preview this page, or connect it to the authenticated returnTo flow when backend authentication is implemented.

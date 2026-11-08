# START HERE — How to build this with Claude Code

## 1. Set up the folder
```bash
mkdir najeeb-portfolio && cd najeeb-portfolio
# unzip this pack here so you have:
#   CLAUDE.md
#   docs/01-PRD.md ... docs/07-QA-DEPLOYMENT.md
#   docs/reference/prototype.html
git init
```

## 2. Have these accounts ready (all free)
- MongoDB Atlas (connection string)
- Cloudinary (cloud name, API key, secret)
- Resend (API key)
- Vercel + GitHub (for deploy)

## 3. First prompt to Claude Code
```
Read CLAUDE.md and every file in docs/ (open docs/reference/prototype.html too).
Then start docs/05-IMPLEMENTATION-PLAN.md at Phase 0.
Work phase by phase, tick the checkboxes as you go, and stop at the end of
each phase to show me what was done before continuing.
```

## 4. Prompt for every later session
```
Read CLAUDE.md and docs/05-IMPLEMENTATION-PLAN.md.
Continue from the first unchecked task. Stop at the end of the phase.
```

## 5. Tips
- Use plan mode (Shift+Tab) at the start of each phase, so Claude shows its plan before writing code.
- After Phase 4, open the site and the prototype side by side and point out any visual differences.
- Fill in the open questions in `docs/01-PRD.md` §12 with Najeeb as early as possible (real email, game descriptions, screenshots, socials).
- Commit after every phase. If something goes wrong, you can roll back.

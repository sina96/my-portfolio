# docs/specs

Working specs and plans for upcoming work live in this folder.

Everything in here is **gitignored** except this README and `xp-hills/`, the published design spec
that `AGENTS.md` treats as the source of truth. Drafts, plans and handoffs for future work stay local
until they ship. When a spec becomes the reference for shipped behaviour, un-ignore its folder in
`.gitignore` (like `xp-hills/`) and link it from `README.md` / `AGENTS.md`.

Upcoming:

- `infra-cloudflare/`: moving DNS, email security and CMS access to Cloudflare (hosting stays on Vercel), managed as code. Start at `PLAN.md`, then specs `01`–`05`.

# Infrastructure (Cloudflare via OpenTofu)

Cloudflare for `sinabastani.dev` is described in [`infra/`](../../infra) and changed through pull
requests. Hosting stays on Vercel; the registrar is Squarespace. Neither is managed here.

| File | Manages |
|---|---|
| `dns.tf` | apex (Vercel, unproxied), `www` and `admin` (proxied), Google verification |
| `email.tf` | Email Routing (contact@, sina@ → private inbox, catch-all off), MX, SPF, DKIM, DMARC |
| `security.tf` | DNSSEC, SSL Full (strict) and TLS settings, CAA, `www` → apex 301 |
| `access.tf` | Zero Trust org, GitHub login, "Only me" + "Bypass" policies, CMS and ACME-bypass apps |
| `outputs.tf` | CMS Access AUD tag (Vercel `CF_ACCESS_AUD`), DNSSEC DS record |

Not managed: the `sveltia-cms-auth` Worker (deployed by Workers Builds from its own repo, so its
secrets never enter state) and the GitHub login method's client secret (dashboard only; ignored in code).

## How a change ships

1. Edit `infra/*.tf` on a branch, run `tofu fmt`, open a PR.
2. The **Infra** workflow posts the plan as a PR comment (updated on every push). Review it.
3. Merge. The **Apply** job waits for approval in the `production-infra` environment, then plans and
   applies on `main`.
4. Every Monday the **Drift check** runs `tofu plan`. Any change made in the dashboard fails the run and
   opens (or comments on) an "Infra drift" issue. Revert the dashboard edit, or put it in code via a PR.

## Running locally

Secrets live outside the repo in `~/.config/sinabastani/tofu.env`:

```bash
export CLOUDFLARE_API_TOKEN=...      # Cloudflare token for OpenTofu
export AWS_ACCESS_KEY_ID=...         # R2 token (bucket sinabastani-tofu-state only)
export AWS_SECRET_ACCESS_KEY=...
```

Copy `infra/terraform.tfvars.example` to `infra/terraform.tfvars` (gitignored) and fill it in, then:

```bash
source ~/.config/sinabastani/tofu.env
tofu -chdir=infra init
tofu -chdir=infra plan      # should say "No changes"
```

Apply from CI, not locally, except in an emergency.

## GitHub settings the workflow needs

- **Secrets** (Settings → Secrets and variables → Actions): `CLOUDFLARE_API_TOKEN`, `R2_ACCESS_KEY_ID`,
  `R2_SECRET_ACCESS_KEY`, `TF_VAR_FORWARD_TO_EMAIL`, `TF_VAR_ADMIN_EMAILS` (JSON list, e.g. `["a@x.dev"]`).
- **Variables**: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID`.
- **Environment** `production-infra`: required reviewer = repo owner, deployment branch `main` only.

Private values are `sensitive` variables, so plans print `(sensitive value)` instead of them.

## Adding a record

Add a `cloudflare_dns_record` to the matching file (`ttl = 1` means automatic). For a record that already
exists in the dashboard, add a temporary `import { to = ..., id = "<zone_id>/<record_id>" }` block,
check the plan shows only the import, merge, then delete the block.

## Rotating tokens

- Cloudflare token: create a new one with the same permissions, update the GitHub secret and the local
  env file, run the drift check manually, then delete the old token.
- R2 token: same flow (R2 → Manage API tokens).

## Break-glass

If CI is down and something must change now: edit in the dashboard, then make `infra/` match it in a PR
so the drift check goes quiet again. To stop managing a resource without deleting it, use a
`removed {}` block or `tofu state rm`. Never `tofu destroy`.

State is a single object in R2 (`cloudflare/terraform.tfstate`); deleting `infra/` changes nothing in
Cloudflare. A lost state can be rebuilt with import blocks (`cf-terraforming import` prints them).

## Background: OpenTofu in two minutes

[OpenTofu](https://opentofu.org/docs/intro/) is an open-source fork of Terraform (Linux Foundation).
You describe the infrastructure you want in `.tf` files (HCL); OpenTofu works out how to get there.

| Concept | What it means here |
|---|---|
| **Provider** | Plugin that talks to an API. We use `cloudflare/cloudflare` v5, pinned in `versions.tf` and `.terraform.lock.hcl`. |
| **Resource** | One thing in Cloudflare, e.g. `cloudflare_dns_record.www`. |
| **State** | OpenTofu's record of which real object each resource is (IDs, last known values). Ours is in R2. Never edit it by hand. |
| **Backend** | Where state lives. `backend.tf` uses the S3 backend pointed at R2, with a lock file so two runs can't write at once. |
| **Plan / apply** | `plan` compares code, state and the real API and shows the diff; `apply` makes it so. `-detailed-exitcode` returns 2 when there are changes (used by the drift check). |
| **Import** | Adopting something that already exists into state instead of recreating it (how specs 01–03 were brought in). |
| **Variables** | Inputs (`variables.tf`). `sensitive = true` hides values in plan output. |
| **`lifecycle`** | Per-resource rules, e.g. `ignore_changes` for the GitHub client secret that only lives in the dashboard. |
| **Drift** | The real world changed without a code change (e.g. a dashboard edit). |

Learn more:

- [Core workflow (write → plan → apply)](https://opentofu.org/docs/intro/core-workflow/)
- [State](https://opentofu.org/docs/language/state/) and [the S3 backend (used for R2)](https://opentofu.org/docs/language/settings/backends/s3/)
- [Import blocks](https://opentofu.org/docs/language/import/), [`lifecycle`](https://opentofu.org/docs/language/meta-arguments/lifecycle/), [input variables](https://opentofu.org/docs/language/values/variables/)
- [`tofu plan` options](https://opentofu.org/docs/cli/commands/plan/)
- [State encryption](https://opentofu.org/docs/language/state/encryption/), an OpenTofu-only feature worth adding later
- Cloudflare provider reference: [OpenTofu registry](https://search.opentofu.org/provider/cloudflare/cloudflare/latest) · [Terraform registry docs](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs) (same provider, fuller examples)
- [cf-terraforming](https://github.com/cloudflare/cf-terraforming): generates HCL and import blocks from an existing account
- [Cloudflare's Terraform guide](https://developers.cloudflare.com/terraform/)
- [GitHub Actions environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment) (the approval gate before apply)

## Background: the Cloudflare pieces we use

| Piece | What it does for this site | Learn more |
|---|---|---|
| **DNS + proxy** | Cloudflare answers DNS for the domain. Grey cloud = DNS only (apex → Vercel). Orange cloud = traffic goes through Cloudflare (`www`, `admin`), which adds its certificate, redirects and Access. | [DNS](https://developers.cloudflare.com/dns/) · [Proxy status](https://developers.cloudflare.com/dns/proxy-status/) |
| **DNSSEC** | Signs DNS answers so resolvers can detect forged ones. The DS record at Squarespace links the chain of trust. | [DNSSEC](https://developers.cloudflare.com/dns/dnssec/) · [DNSViz](https://dnsviz.net/) (visual check) |
| **SSL/TLS Full (strict)** | Cloudflare → Vercel is encrypted and Vercel's certificate is validated. | [Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/) |
| **CAA** | Lists which certificate authorities may issue for the domain (Let's Encrypt for Vercel, Google for Cloudflare). | [CAA records](https://developers.cloudflare.com/ssl/edge-certificates/caa-records/) |
| **Redirect rule** | `www` → apex with a 301, done at Cloudflare's edge. | [Single Redirects](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/) |
| **Email Routing** | Receives mail for contact@ and sina@ and forwards it. SPF, DKIM and DMARC records prove mail for the domain is legitimate. | [Email Routing](https://developers.cloudflare.com/email-routing/) · [DMARC Management](https://developers.cloudflare.com/dmarc-management/) |
| **Zero Trust Access** | Login wall in front of `admin.sinabastani.dev` (GitHub login, "Only me" policy). The site also verifies Access's signed JWT itself (`src/lib/cfAccess.ts`). | [Access policies](https://developers.cloudflare.com/cloudflare-one/policies/access/) · [Validating the JWT](https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/) · [GitHub login](https://developers.cloudflare.com/cloudflare-one/identity/idp-integration/github/) |
| **Workers** | Runs `sveltia-cms-auth`, the small OAuth helper behind the CMS's "Sign in with GitHub". | [Workers](https://developers.cloudflare.com/workers/) · [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) |
| **R2** | S3-compatible object storage; holds the OpenTofu state (free tier). | [R2](https://developers.cloudflare.com/r2/) |
| **API tokens** | Scoped credentials for OpenTofu and CI. | [Create a token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) |

General background: [Cloudflare Learning Center](https://www.cloudflare.com/learning/) (DNS, TLS, DDoS
and Zero Trust explained from scratch). To check the domain's setup:
[internet.nl](https://internet.nl/) (web + mail standards).

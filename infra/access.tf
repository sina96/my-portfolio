# Cloudflare Zero Trust Access in front of the CMS (admin.sinabastani.dev).

resource "cloudflare_zero_trust_organization" "this" {
  account_id                  = var.account_id
  name                        = "misty-truth-9d6d.cloudflareaccess.com"
  auth_domain                 = "sinabastani.cloudflareaccess.com"
  allow_authenticate_via_warp = false
  is_ui_read_only             = false
  strict_service_token_auth   = true

  deny_unmatched_requests                     = false
  deny_unmatched_requests_exempted_zone_names = []

  # The API reports this as disabled without the fields the schema requires when it is set.
  lifecycle {
    ignore_changes = [service_token_inactivity]
  }
}

# GitHub OAuth app. The client secret is set in the dashboard only and never stored here.
resource "cloudflare_zero_trust_access_identity_provider" "github" {
  account_id = var.account_id
  name       = "GitHub"
  type       = "github"
  config     = { client_id = "Ov23lidbfp2dAfc3JcER" }

  lifecycle {
    ignore_changes = [config.client_secret]
  }
}

resource "cloudflare_zero_trust_access_policy" "only_me" {
  account_id       = var.account_id
  name             = "Only me"
  decision         = "allow"
  connection_rules = { rdp = {} }
  include          = [for email in var.admin_emails : { email = { email = email } }]
}

resource "cloudflare_zero_trust_access_policy" "bypass" {
  account_id       = var.account_id
  name             = "Bypass"
  decision         = "bypass"
  connection_rules = { rdp = {} }
  include          = [{ everyone = {} }]
}

resource "cloudflare_zero_trust_access_application" "cms" {
  account_id                 = var.account_id
  name                       = "CMS"
  type                       = "self_hosted"
  domain                     = "admin.sinabastani.dev"
  destinations               = [{ type = "public", uri = "admin.sinabastani.dev" }]
  allowed_idps               = [cloudflare_zero_trust_access_identity_provider.github.id]
  auto_redirect_to_identity  = true
  session_duration           = "24h"
  policies                   = [{ id = cloudflare_zero_trust_access_policy.only_me.id, precedence = 1 }]
  enable_binding_cookie      = false
  http_only_cookie_attribute = true # Access cookie unreadable by page scripts
  options_preflight_bypass   = false
}

# Vercel's certificate renewal must reach the origin without a login.
resource "cloudflare_zero_trust_access_application" "acme_bypass" {
  account_id                 = var.account_id
  name                       = "CMS cert renewal"
  type                       = "self_hosted"
  domain                     = "admin.sinabastani.dev/.well-known/acme-challenge/"
  destinations               = [{ type = "public", uri = "admin.sinabastani.dev/.well-known/acme-challenge/" }]
  session_duration           = "24h"
  policies                   = [{ id = cloudflare_zero_trust_access_policy.bypass.id, precedence = 1 }]
  auto_redirect_to_identity  = false
  enable_binding_cookie      = false
  http_only_cookie_attribute = true # Access cookie unreadable by page scripts
  options_preflight_bypass   = false
}

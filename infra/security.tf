# TLS, DNSSEC, CAA and the www → apex redirect.

resource "cloudflare_zone_dnssec" "this" {
  zone_id = var.zone_id
  status  = "active"
}

locals {
  zone_settings = {
    ssl                      = "strict" # Full (strict): origin certificates are validated
    always_use_https         = "on"     # proxied hosts (www, admin) only; the apex is served by Vercel
    min_tls_version          = "1.2"
    tls_1_3                  = "on"
    automatic_https_rewrites = "on"
  }

  caa = {
    issue_letsencrypt = { tag = "issue", value = "letsencrypt.org" } # Vercel
    issue_google      = { tag = "issue", value = "pki.goog" }        # Cloudflare edge
    iodef             = { tag = "iodef", value = "mailto:sina@sinabastani.dev" }
  }
}

resource "cloudflare_zone_setting" "this" {
  for_each = local.zone_settings

  zone_id    = var.zone_id
  setting_id = each.key
  value      = each.value
}

resource "cloudflare_dns_record" "caa" {
  for_each = local.caa

  zone_id = var.zone_id
  name    = "sinabastani.dev"
  type    = "CAA"
  data    = { flags = 0, tag = each.value.tag, value = each.value.value }
  proxied = false
  ttl     = 1
}

resource "cloudflare_ruleset" "redirects" {
  zone_id = var.zone_id
  name    = "default"
  kind    = "zone"
  phase   = "http_request_dynamic_redirect"

  rules = [{
    ref         = "9dc13526647b4935b5f219d0afeaf7ad"
    description = "www to apex"
    enabled     = true
    expression  = "(http.host eq \"www.sinabastani.dev\")"
    action      = "redirect"
    action_parameters = {
      from_value = {
        status_code           = 301
        preserve_query_string = true
        target_url            = { expression = "concat(\"https://sinabastani.dev\", http.request.uri.path)" }
      }
    }
  }]
}

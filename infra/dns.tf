# Website records. The apex points at Vercel unproxied (Vercel serves TLS); www and admin are proxied.

resource "cloudflare_dns_record" "apex" {
  zone_id = var.zone_id
  name    = "sinabastani.dev"
  type    = "A"
  content = "216.198.79.1"
  proxied = false
  ttl     = 1
}

# Proxied so Cloudflare holds the certificate; the www → apex redirect rule (security.tf) answers it.
resource "cloudflare_dns_record" "www" {
  zone_id  = var.zone_id
  name     = "www.sinabastani.dev"
  type     = "CNAME"
  content  = "portfolio-v1-5.vercel.app"
  proxied  = true
  ttl      = 1
  settings = { flatten_cname = false }
}

# CMS host, behind Cloudflare Access (access.tf).
resource "cloudflare_dns_record" "admin" {
  zone_id  = var.zone_id
  name     = "admin.sinabastani.dev"
  type     = "CNAME"
  content  = "cbe5e8cf27fdc658.vercel-dns-017.com"
  proxied  = true
  ttl      = 1
  settings = { flatten_cname = false }
}

# Google Search Console domain verification.
resource "cloudflare_dns_record" "google_verification" {
  zone_id  = var.zone_id
  name     = "xhtfb5kktnwp.sinabastani.dev"
  type     = "CNAME"
  content  = "gv-bwfzfb45t63efh.dv.googlehosted.com"
  proxied  = false
  ttl      = 1
  settings = { flatten_cname = false }
}

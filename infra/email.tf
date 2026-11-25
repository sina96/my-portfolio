# Cloudflare Email Routing: contact@ and sina@ forward to a private inbox. No outbound mail.

resource "cloudflare_email_routing_settings" "this" {
  zone_id = var.zone_id
}

# Changing inboxes is staged so mail never goes to an unverified address:
#   1. add the new inbox under a new key → apply → click the verification email
#   2. set forward_to to the new key → apply (the precondition blocks it, at plan or at apply, until the
#      new inbox is verified, so the rules never point at an unverified address)
#   3. remove the old key → apply
# The inbox in use can't be removed or replaced by accident: the rules reference it (removing its key
# fails the plan), and a replacement is created first and stops at the verification check below
# before the old one is deleted.
resource "cloudflare_email_routing_address" "inbox" {
  for_each = toset(nonsensitive(keys(var.inboxes)))

  account_id = var.account_id
  email      = var.inboxes[each.key]

  lifecycle {
    create_before_destroy = true
  }
}

moved {
  from = cloudflare_email_routing_address.inbox
  to   = cloudflare_email_routing_address.inbox["primary"]
}

resource "cloudflare_email_routing_rule" "forward" {
  for_each = toset(["contact", "sina"])

  zone_id  = var.zone_id
  name     = "" # API returns "" for unnamed rules; null would show a diff on every plan
  enabled  = true
  priority = 0
  matchers = [{ field = "to", type = "literal", value = "${each.key}@sinabastani.dev" }]
  actions  = [{ type = "forward", value = [cloudflare_email_routing_address.inbox[var.forward_to].email] }]

  lifecycle {
    precondition {
      condition     = try(cloudflare_email_routing_address.inbox[var.forward_to].verified, null) != null
      error_message = "forward_to must name an inbox in var.inboxes that has been verified (click the link in Cloudflare's email first)."
    }
  }
}

# Everything else is dropped (catch-all disabled).
resource "cloudflare_email_routing_catch_all" "this" {
  zone_id  = var.zone_id
  name     = ""
  enabled  = false
  matchers = [{ type = "all" }]
  actions  = [{ type = "drop" }]
}

locals {
  mx_hosts = { route1 = 51, route2 = 92, route3 = 86 }
}

resource "cloudflare_dns_record" "mx" {
  for_each = local.mx_hosts

  zone_id  = var.zone_id
  name     = "sinabastani.dev"
  type     = "MX"
  content  = "${each.key}.mx.cloudflare.net"
  priority = each.value
  proxied  = false
  ttl      = 1
}

resource "cloudflare_dns_record" "spf" {
  zone_id = var.zone_id
  name    = "sinabastani.dev"
  type    = "TXT"
  content = "\"v=spf1 include:_spf.mx.cloudflare.net ~all\""
  proxied = false
  ttl     = 1
}

resource "cloudflare_dns_record" "dkim" {
  zone_id = var.zone_id
  name    = "cf2024-1._domainkey.sinabastani.dev"
  type    = "TXT"
  content = "\"v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiweykoi+o48IOGuP7GR3X0MOExCUDY/BCRHoWBnh3rChl7WhdyCxW3jgq1daEjPPqoi7sJvdg5hEQVsgVRQP4DcnQDVjGMbASQtrY4WmB1VebF+RPJB2ECPsEDTpeiI5ZyUAwJaVX7r6bznU67g7LvFq35yIo4sdlmtZGV+i0H4cpYH9+3JJ78k\" \"m4KXwaf9xUJCWF6nxeD+qG6Fyruw1Qlbds2r85U9dkNDVAS3gioCvELryh1TxKGiVTkg4wqHTyHfWsp7KD3WQHYJn0RyfJJu6YEmL77zonn7p2SRMvTMP3ZEXibnC9gz3nnhR6wcYL8Q7zXypKTMD58bTixDSJwIDAQAB\""
  proxied = false
  ttl     = 1
}

# Monitoring only for now; tighten to quarantine, then reject (spec 02).
resource "cloudflare_dns_record" "dmarc" {
  zone_id = var.zone_id
  name    = "_dmarc.sinabastani.dev"
  type    = "TXT"
  content = "\"v=DMARC1; p=none; rua=mailto:1ea9569adbed48f991a608e5e9724a10@dmarc-reports.cloudflare.net\""
  proxied = false
  ttl     = 1
}

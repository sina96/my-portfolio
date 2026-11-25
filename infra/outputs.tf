output "cms_access_aud" {
  description = "AUD tag of the CMS Access app (Vercel env CF_ACCESS_AUD)."
  value       = cloudflare_zero_trust_access_application.cms.aud
}

output "dnssec_ds" {
  description = "DS record to publish at the registrar."
  value       = cloudflare_zone_dnssec.this.ds
}

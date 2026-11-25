variable "account_id" {
  description = "Cloudflare account ID (zone Overview sidebar → API)."
  type        = string
}

variable "zone_id" {
  description = "Zone ID of sinabastani.dev (zone Overview sidebar → API)."
  type        = string
}

variable "forward_to_email" {
  description = "Private inbox that Email Routing forwards to. Kept out of this public repo."
  type        = string
  sensitive   = true
}

variable "admin_emails" {
  description = "GitHub-verified emails allowed into the CMS through Cloudflare Access."
  type        = list(string)
  sensitive   = true
}

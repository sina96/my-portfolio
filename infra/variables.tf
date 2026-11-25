variable "account_id" {
  description = "Cloudflare account ID (zone Overview sidebar → API)."
  type        = string
}

variable "zone_id" {
  description = "Zone ID of sinabastani.dev (zone Overview sidebar → API)."
  type        = string
}

variable "inboxes" {
  description = "Destination inboxes for Email Routing, by name (e.g. { primary = \"me@example.com\" }). Kept out of this public repo."
  type        = map(string)
  sensitive   = true
}

variable "forward_to" {
  description = "Name (key in inboxes) of the inbox the forwarding rules use. Switch only to a verified inbox."
  type        = string
  default     = "primary"
}

variable "admin_emails" {
  description = "GitHub-verified emails allowed into the CMS through Cloudflare Access."
  type        = list(string)
  sensitive   = true
}

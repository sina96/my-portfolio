# State lives in a private Cloudflare R2 bucket through the S3-compatible API.
# Credentials come from AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (an R2 API token scoped to the bucket).
terraform {
  backend "s3" {
    bucket = "sinabastani-tofu-state"
    key    = "cloudflare/terraform.tfstate"
    region = "auto"

    endpoints = {
      s3 = "https://2c8abf0465843feab7d50ee3a64603da.r2.cloudflarestorage.com"
    }

    use_lockfile                = true
    use_path_style              = true
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    skip_s3_checksum            = true
  }
}

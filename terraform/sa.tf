# # Service account that GitHub Actions will impersonate
# resource "google_service_account" "github_deploy" {
#   account_id   = "github-deploy"
#   display_name = "GitHub Actions Deploy"
#   description  = "Used by GitHub Actions to deploy infrastructure"
#   project      = var.project_id
# }

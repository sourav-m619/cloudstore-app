# Service account that GitHub Actions will impersonate
resource "google_service_account" "github_deploy" {
  account_id   = "github-deploy"
  display_name = "GitHub Actions Deploy"
  description  = "Used by GitHub Actions to deploy infrastructure"
  project      = var.project_id
}
# Service Account for GKE
resource "google_service_account" "gke-node-sa-cs" {
  account_id   = "cs-gke-node-sa"
  display_name = "GKE Node Service Account"
  description  = "Used by GKE nodes — least privilege"
  project = var.project_id
}

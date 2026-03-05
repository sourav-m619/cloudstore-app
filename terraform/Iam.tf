# Create a Workload Identity Pool
resource "google_iam_workload_identity_pool" "github" {
  project                   = var.project_id
  workload_identity_pool_id = "gitaction-pool"
  display_name              = "GitHub Actions Pool"
  description               = "Pool for GitHub Actions OIDC authentication"

  # Pool must be enabled
  disabled = false
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "gitaction-provider"
  display_name                       = "github"
  description                        = "GitHub Actions identity pool provider for authentication"
  attribute_condition                = "attribute.repository == 'sourav-m619/cloudstore-app'"
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.aud"        = "assertion.aud"
    "attribute.repository" = "assertion.repository"
  }
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

#giving IAM Role to the Service Account Used by Workload identity
resource "google_project_iam_member" "iam_roles" {
  project = var.project_id
  for_each = toset(var.iam_roles)
  role = each.value
  member  = "serviceAccount:${google_service_account.github_deploy.email}"
}

resource "google_service_account_iam_member" "github_impersonation" {
  service_account_id = google_service_account.github_deploy.name
  for_each = toset(var.role_sa_wip_impersonate)
  role = each.value
  member = "principalSet://iam.googleapis.com/projects/152133621626/locations/global/workloadIdentityPools/gitaction-pool/attribute.repository/sourav-m619/cloudstore-app"
}

#giving Iam Role to GKE Service Account

resource "google_project_iam_member" "iam_roles_gke" {
  project = var.project_id
  for_each = toset(var.iam-roles-gke)
  role = each.value
  member  = "serviceAccount:${google_service_account.gke-node-sa-cs.email}"
}
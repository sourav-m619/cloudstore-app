# # Create a Workload Identity Pool
# resource "google_iam_workload_identity_pool" "github" {
#   project                   = var.project_id
#   workload_identity_pool_id = "github-pool"
#   display_name              = "GitHub Actions Pool"
#   description               = "Pool for GitHub Actions OIDC authentication"

#   # Pool must be enabled
#   disabled = false
# }

# resource "google_iam_workload_identity_pool_provider" "github" {
#   workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
#   workload_identity_pool_provider_id = "cs-gcp-provider"
#   display_name                       = "github"
#   description                        = "GitHub Actions identity pool provider for authentication"
#   disabled                           = true
#   attribute_condition = <<EOT
#     attribute.repository == "sourav-m619/cloudstore-app" &&
# EOT
#   attribute_mapping = {
#     "google.subject"       = "assertion.sub"
#     "attribute.actor"      = "assertion.actor"
#     "attribute.aud"        = "assertion.aud"
#     "attribute.repository" = "assertion.repository"
#   }
#   oidc {
#     issuer_uri = "https://token.actions.githubusercontent.com"
#   }
# }

# #giving IAM Role to the Service Account Used by Workload identity
# resource "google_project_iam_member" "iam_roles" {
#   project = var.project_id
#   for_each = toset(var.iam_roles)
#   role = each.value
#   member  = "serviceAccount:${google_service_account.github_deploy.email}"
# }

# resource "google_service_account_iam_member" "github_impersonation" {
#   service_account_id = google_service_account.github_deploy.name
#   role = var.role_sa_wip_impersonate
#   member = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/sourav-m619/cloudstore-app}"
# }

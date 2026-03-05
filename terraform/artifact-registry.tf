resource "google_artifact_registry_repository" "cloudstore-repo" {
  project = var.project_id
  location      = var.region
  repository_id = "cloudstore-image-repo"
  description   = "This Repo consists of cloudstore app Images"
  format        = "DOCKER"
  
  vulnerability_scanning_config {
    enablement_config = "ENABLED"
  }
  cleanup_policies {
    id     = "keep-last-10"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }
}



# Output — needed in GitHub Actions CI/CD
output "registry_url" {
  description = "Use this URL in GitHub Actions to push images"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.cloudstore-repo.repository_id}"
}
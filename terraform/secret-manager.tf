resource "google_secret_manager_secret" "db_password" {
  project = var.project_id
  secret_id = "db-password"
  replication {
    auto {}
  }
}

# Actual password value stored in secret
resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.db_password
}

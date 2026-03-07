# Managed PostgreSQL 15
# Private IP only — not accessible from internet
resource "google_sql_database_instance" "postgres" {
  name             = var.db_instance_name
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro"
    ip_configuration {
      # No public IP — private only
      ipv4_enabled    = false
      private_network = google_compute_network.vpc-cs.id

      # Allows Cloud SQL to be reached
      # via private IP from Google services
      enable_private_path_for_google_cloud_services = true
    }

    # Automated daily backups
    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      start_time                     = "03:00"
      backup_retention_settings {
        retained_backups = 7
      }
    }

    # Maintenance window — Sunday 3am
    maintenance_window {
      day          = 7
      hour         = 3
      update_track = "stable"
    }

    database_flags {
      name  = "max_connections"
      value = "100"
    }
  }

  deletion_protection = false

  depends_on = [
    google_service_networking_connection.private_vpc_connection
  ]
}

resource "google_sql_database" "app-db" {
    name = var.db_name
    instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "app-db-user" {
  name = var.db_user_name
  instance = google_sql_database.app-db.id
  password = var.db_password
}


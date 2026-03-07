# ── GKE Cluster ───────────────────────────────────────
resource "google_container_cluster" "gke-cluster" {
  name     = var.cluster_name
  location = var.region

  # We manage node pool separately
  remove_default_node_pool = true
  initial_node_count       = 1

  node_config {
    disk_type    = "pd-standard"   # ← fixes SSD quota error
    disk_size_gb = 50
    machine_type = "e2-medium"     # smallest for bootstrap
  }
  # Use our private VPC
  network    = google_compute_network.vpc-cs.name
  subnetwork = google_compute_subnetwork.subnet-cs.name

  # Private cluster — nodes have no public IPs
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  # VPC-native — uses secondary IP ranges
  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  # Workload Identity — pods auth to GCP without keys
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Enables Kubernetes NetworkPolicy objects
  network_policy {
    enabled  = true
    provider = "CALICO"
  }

  # Addons
  addons_config {
    http_load_balancing {
      disabled = false
    }
    horizontal_pod_autoscaling {
      disabled = false
    }
  }

  # Built-in monitoring with Prometheus
  monitoring_config {
    managed_prometheus {
      enabled = true
    }
  }

  # Logging for all workloads
  logging_config {
    enable_components = ["SYSTEM_COMPONENTS", "WORKLOADS"]
  }

  # Stable K8s version auto updates
  release_channel {
    channel = "STABLE"
  }

  deletion_protection = false

  depends_on = [
    google_compute_subnetwork.subnet-cs,
    google_compute_router_nat.nat-cs,
  ]
}

# ── Node Pool ─────────────────────────────────────────
resource "google_container_node_pool" "primary_nodes" {
  name     = "primary-pool"
  location = var.region
  cluster  = google_container_cluster.gke-cluster.name

  # Auto-scaling per zone
  autoscaling {
    min_node_count = 1
    max_node_count = 2
  }

  # Auto-repair and auto-upgrade
  management {
    auto_repair  = true
    auto_upgrade = true
  }

  # Zero downtime node upgrades
  upgrade_settings {
    max_surge       = 1
    max_unavailable = 0
  }

  node_config {
    machine_type = var.node_machine_type
    disk_size_gb = 50
    disk_type    = "pd-standard"

    # Attach dedicated node SA
    service_account = google_service_account.gke-node-sa-cs.email

    # Matches our firewall rules
    tags = ["gke-cloudstore"]

    # Required for Workload Identity
    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    # Shielded nodes — protects against rootkits
    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]

    labels = {
      env = "production"
      app = "cloudstore"
    }

    # Disable legacy metadata API
    metadata = {
      disable-legacy-endpoints = "true"
    }
  }
}



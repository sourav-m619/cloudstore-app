#VPC
resource "google_compute_network" "vpc-cs" {
  project                 = var.project_id
  name                    = "cs-vpc"
  auto_create_subnetworks = false
  mtu                     = 1460
}
#sub-network
resource "google_compute_subnetwork" "subnet-cs" {
  name          = "cs-subnetwork"
  ip_cidr_range = "10.0.0.0/18"
  region        = var.region
  network       = google_compute_network.vpc-cs.id

#secondary ip Range for Pods
  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.48.0.0/14"
  }
#secondary ip Range for services
  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.52.0.0/20"
  }
  private_ip_google_access = true
}

#NAT Router to connect to the Public IP

resource "google_compute_router" "nat-router-cs" {
  name = "cs-nat-router"
  region = google_compute_subnetwork.subnet-cs.region
  network = google_compute_network.vpc-cs.id
  bgp {
    asn =64514
    }
}

resource "google_compute_router_nat" "nat-cs" {
  name                               = "cs-nat"
  router                             = google_compute_router.nat-router-cs.name
  region                             = google_compute_subnetwork.subnet-cs.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

# Allocates private IP range for Cloud SQL
# Database never gets a public IP
resource "google_compute_global_address" "private_ip" {
  name          = "cloudstore-sql-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc-cs.id
}
resource "google_compute_firewall" "allow_gke_internal" {
  name      = "cloudstore-allow-gke-internal"
  network   = google_compute_network.vpc-cs.name
  direction = "INGRESS"
  priority = 800

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "icmp"
  }

  source_ranges = [
    "10.0.0.0/18", #node ip
    "10.48.0.0/14", #pod ip
  ]
  target_tags = ["gke-cloudstore"]
}

resource "google_compute_firewall" "allow_services_internal" {
  name      = "cloudstore-allow-services"
  network   = google_compute_network.vpc-cs.name
  direction = "INGRESS"


  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  source_ranges = ["10.52.0.0/20"] #serviceip
  target_tags   = ["gke-cloudstore"] #destination tag i.e GKE Cluster 
}

resource "google_compute_firewall" "allow_health_checks" {
  name      = "cloudstore-allow-health-checks"
  network   = google_compute_network.vpc-cs.name
  direction = "INGRESS"

  allow {
    protocol = "tcp"
  }

  source_ranges = ["130.211.0.0/22", "35.191.0.0/16"] # healthcheck ips
  target_tags   = ["gke-cloudstore"]
}

resource "google_compute_firewall" "allow_master_to_nodes" {
  name      = "cloudstore-allow-master-nodes"
  network   = google_compute_network.vpc-cs.name
  direction = "INGRESS"

  allow {
    protocol = "tcp"
    ports    = ["443", "10250"]
  }

  source_ranges = ["172.16.0.0/28"] # masternodeip
  target_tags   = ["gke-cloudstore"]
}

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
  region                             = google_compute_router.router.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}


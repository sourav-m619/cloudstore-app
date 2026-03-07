variable "project_id" {
    type = string
    default = "cloudstore-489011"
}


variable "iam_roles" {
    type = list(string)
    default = [ "roles/storage.admin",
     "roles/iam.serviceAccountUser",
     "roles/compute.admin",
     "roles/iam.serviceAccountTokenCreator",
     "roles/iam.workloadIdentityUser",
     "roles/resourcemanager.projectIamAdmin",
     "roles/iam.workloadIdentityPoolAdmin",
      "roles/iam.serviceAccountAdmin",
      "roles/compute.networkAdmin", #Network resources
      "roles/container.clusterAdmin", #for GKE Resources
      "roles/cloudsql.admin", #For cloudSQL 
      "roles/artifactregistry.admin", #For Artifact registry
      "roles/secretmanager.admin", #for secret manager
      "roles/servicenetworking.networksAdmin" #for Cloud SQL to connect with the private IP
      ]
}

variable "role_sa_wip_impersonate" {
    type = list(string)
    default = ["roles/iam.workloadIdentityUser"]
}

variable "region" {
     type = string
     default = "us-central1"
}

variable "iam-roles-gke" {
    type =list(string)
    default=["roles/artifactregistry.reader",
    "roles/logging.logWriter","roles/monitoring.metricWriter",
    "roles/monitoring.viewer"]
  
}

variable "cluster_name" {
  type = string
  default = "cloud-store-cluster"
}

variable "node_machine_type" {
  type = string
  default = "e2-standard-2"
}

variable "db_instance_name" {
  type = string
  default = "postgresql-cs"
}
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
     "roles/iam.workloadIdentityUser"]
}

variable "role_sa_wip_impersonate" {
    type = list(string)
    default = ["roles/iam.workloadIdentityUser"]
}
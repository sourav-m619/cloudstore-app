terraform {
  backend "gcs" {
    bucket = "tf-backend-cloudstore"
    prefix = "tf-state"
  }
}
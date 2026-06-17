# ==============================================================================
#             SOVEREIGN FABLES PRODUCTION OUTBOUND NETWORKING LAYER Blueprint
# ==============================================================================
# This Terraform configuration provisions a static egress infrastructure for 
# serverless Cloud Run deployments on Google Cloud Platform. 
#
# architecture flow:
# [Cloud Run] -> [VPC Access Connector] -> [VPC Network] -> [Cloud NAT] -> [Static IP] -> [MEXC API]
# ==============================================================================

terraform {
  required_version = ">= 1.3.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.50.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# ------------------------------------------------------------------------------
# VARIABLES
# ------------------------------------------------------------------------------
variable "gcp_project_id" {
  type        = string
  description = "Target Google Cloud Project ID"
}

variable "gcp_region" {
  type        = string
  default     = "us-central1"
  description = "Region for subnet, VPC connector, and NAT gateway"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Logical deployment stage name"
}

# ------------------------------------------------------------------------------
# VPC NETWORK & SUBNETWORK
# ------------------------------------------------------------------------------
resource "google_compute_network" "vpc_network" {
  name                    = "egress-vpc-${var.environment}"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "connector_subnet" {
  name          = "vpc-connector-subnet-${var.environment}"
  ip_cidr_range = "10.0.0.0/28" # Small /28 range is sufficient for VPC connector
  region        = var.gcp_region
  network       = google_compute_network.vpc_network.id
}

# ------------------------------------------------------------------------------
# SERVERLESS VPC ACCESS CONNECTOR
# ------------------------------------------------------------------------------
resource "google_vpc_access_connector" "connector" {
  name          = "cr-connector-${var.environment}"
  region        = var.gcp_region
  ip_cidr_range = "10.8.0.0/28" # Must be unallocated block, distinct from subnet
  network       = google_compute_network.vpc_network.name
  
  # Scaling parameters optimized for throughput
  min_instances = 2
  max_instances = 3
}

# ------------------------------------------------------------------------------
# STATIC EXTERNAL IP (This is your whitelisted MEXC target IP)
# ------------------------------------------------------------------------------
resource "google_compute_address" "nat_static_ip" {
  name   = "cloudrun-static-nat-ip-${var.environment}"
  region = var.gcp_region
}

# ------------------------------------------------------------------------------
# CLOUD ROUTER & CLOUD NAT
# ------------------------------------------------------------------------------
resource "google_compute_router" "router" {
  name    = "nat-router-${var.environment}"
  region  = var.gcp_region
  network = google_compute_network.vpc_network.id
}

resource "google_compute_router_nat" "nat_gateway" {
  name                               = "nat-gateway-${var.environment}"
  router                             = google_compute_router.router.name
  region                             = var.gcp_region
  nat_ip_allocate_option             = "MANUAL_ONLY"
  
  # Bind our reserved static IP address
  nat_ips                            = [google_compute_address.nat_static_ip.self_link]
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# ------------------------------------------------------------------------------
# OUTPUTS
# ------------------------------------------------------------------------------
output "static_outbound_ip" {
  value       = google_compute_address.nat_static_ip.address
  description = "PROVIDE THIS PERMANENT IP TO THE MEXC OR BINANCE API KEY WHITELIST"
}

output "vpc_connector_id" {
  value       = google_vpc_access_connector.connector.id
  description = "The VPC connector id to bind within Cloud Run deployment configuration"
}

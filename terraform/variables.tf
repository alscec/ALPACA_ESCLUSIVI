# Project Configuration
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "project_name" {
  description = "Project name prefix for resources"
  type        = string
  default     = "alpaca-esclusivi"
}

variable "region" {
  description = "GCP region for resources"
  type        = string
  default     = "europe-west1"
}

variable "environment" {
  description = "Environment (production or staging)"
  type        = string
  default     = "production"
  
  validation {
    condition     = contains(["production", "staging"], var.environment)
    error_message = "Environment must be either 'production' or 'staging'."
  }
}

# Database Configuration
variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro" # For staging, use db-custom-1-3840 for production
}

variable "db_disk_size" {
  description = "Database disk size in GB"
  type        = number
  default     = 10
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "alpaca_db"
}

variable "db_user" {
  description = "Database user"
  type        = string
  default     = "alpaca_user"
}

# Application Configuration
variable "allowed_origins" {
  description = "Comma-separated list of allowed CORS origins"
  type        = string
  default     = "https://alpaca-esclusivi.web.app,https://alpaca-esclusivi.firebaseapp.com"
}

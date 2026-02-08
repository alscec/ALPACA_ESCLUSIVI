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
  description = "Cloud SQL instance tier (use db-f1-micro for staging, db-custom-1-3840 for production)"
  type        = string
  default     = "db-f1-micro"
  
  validation {
    condition     = can(regex("^db-(f1-micro|g1-small|custom-[0-9]+-[0-9]+)$", var.db_tier))
    error_message = "Database tier must be a valid Cloud SQL tier (e.g., db-f1-micro, db-custom-1-3840)."
  }
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

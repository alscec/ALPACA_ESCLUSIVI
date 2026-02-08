# Backend Service Outputs
output "cloud_run_url" {
  description = "URL of the Cloud Run service"
  value       = google_cloud_run_service.backend.status[0].url
}

output "service_account_email" {
  description = "Email of the Cloud Run service account"
  value       = google_service_account.cloud_run_sa.email
}

# Database Outputs
output "database_connection_name" {
  description = "Cloud SQL instance connection name"
  value       = google_sql_database_instance.postgres.connection_name
}

output "database_private_ip" {
  description = "Private IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.postgres.private_ip_address
}

# Secret Manager Outputs
output "stripe_secret_key_name" {
  description = "Name of the Stripe secret key in Secret Manager"
  value       = google_secret_manager_secret.stripe_secret_key.secret_id
}

output "stripe_webhook_secret_name" {
  description = "Name of the Stripe webhook secret in Secret Manager"
  value       = google_secret_manager_secret.stripe_webhook_secret.secret_id
}

output "db_password_secret_name" {
  description = "Name of the database password in Secret Manager"
  value       = google_secret_manager_secret.db_password.secret_id
}

# Artifact Registry Output
output "artifact_registry_url" {
  description = "URL of the Artifact Registry repository"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}"
}

# Network Outputs
output "vpc_network_name" {
  description = "Name of the VPC network"
  value       = google_compute_network.vpc_network.name
}

output "vpc_connector_id" {
  description = "ID of the VPC access connector"
  value       = google_vpc_access_connector.connector.id
}

# Instructions
output "deployment_instructions" {
  description = "Next steps for deployment"
  value       = <<-EOT
    ====================================
    Deployment Instructions
    ====================================
    
    1. Add Stripe secrets:
       gcloud secrets versions add ${google_secret_manager_secret.stripe_secret_key.secret_id} --data-file=- <<< "sk_live_your_stripe_key"
       gcloud secrets versions add ${google_secret_manager_secret.stripe_webhook_secret.secret_id} --data-file=- <<< "whsec_your_webhook_secret"
    
    2. Build and push Docker image:
       gcloud builds submit --tag ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}/backend:latest ./backend
    
    3. Deploy to Cloud Run:
       gcloud run deploy ${google_cloud_run_service.backend.name} \
         --image ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}/backend:latest \
         --region ${var.region}
    
    4. Your backend will be available at:
       ${google_cloud_run_service.backend.status[0].url}
    
    5. Update frontend VITE_API_URL to:
       ${google_cloud_run_service.backend.status[0].url}
  EOT
}

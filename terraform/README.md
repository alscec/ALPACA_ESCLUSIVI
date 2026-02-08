# Terraform Infrastructure for Alpaca Esclusivi

This directory contains Infrastructure as Code (IaC) for deploying Alpaca Esclusivi to Google Cloud Platform.

## Quick Start

```bash
# Initialize Terraform
terraform init

# Create terraform.tfvars with your configuration
cat > terraform.tfvars <<EOF
project_id      = "your-gcp-project-id"
project_name    = "alpaca-esclusivi"
region          = "europe-west1"
environment     = "production"
db_tier         = "db-custom-1-3840"
allowed_origins = "https://your-frontend-domain.web.app"
EOF

# Review the plan
terraform plan

# Apply infrastructure
terraform apply
```

## Resources Created

- **VPC Network**: Private network for resources
- **VPC Access Connector**: Connects Cloud Run to VPC
- **Cloud SQL (PostgreSQL)**: Database with private IP
- **Cloud Run**: Serverless container platform
- **Secret Manager**: Secure storage for secrets
- **Artifact Registry**: Docker image repository
- **IAM**: Service accounts and permissions

## Variables

See `variables.tf` for all configurable options.

## Outputs

After applying, important values are output:
- `cloud_run_url`: Backend API URL
- `artifact_registry_url`: Docker registry URL
- `database_connection_name`: Cloud SQL connection string

## State Management

For production, configure remote state in GCS:

```hcl
terraform {
  backend "gcs" {
    bucket = "your-terraform-state-bucket"
    prefix = "terraform/state"
  }
}
```

## Security Notes

- Database uses private IP only
- Secrets managed in Secret Manager
- Service accounts follow least privilege
- SSL/TLS enforced

See [DEPLOYMENT.md](../DEPLOYMENT.md) for complete setup instructions.

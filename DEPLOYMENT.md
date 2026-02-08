# Deployment Guide - Alpaca Esclusivi

This guide explains how to deploy the Alpaca Esclusivi application to Google Cloud Platform (GCP) with production-ready infrastructure.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Initial GCP Setup](#initial-gcp-setup)
- [Workload Identity Federation Setup](#workload-identity-federation-setup)
- [Infrastructure Deployment (Terraform)](#infrastructure-deployment-terraform)
- [Stripe Configuration](#stripe-configuration)
- [Firebase Hosting Setup](#firebase-hosting-setup)
- [GitHub Actions Configuration](#github-actions-configuration)
- [Deployment](#deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Firebase Hosting (CDN)      │
        │   - Vite/React Frontend       │
        │   - Global edge caching       │
        └──────────────┬────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Cloud Run (Serverless)      │
        │   - Node.js/Express Backend   │
        │   - Auto-scaling              │
        │   - HTTPS/TLS                 │
        └──────────────┬────────────────┘
                       │
        ┌──────────────┴────────────────┐
        │                               │
        ▼                               ▼
┌──────────────┐              ┌──────────────────┐
│  Cloud SQL   │              │ Secret Manager   │
│  PostgreSQL  │              │ - Stripe Keys    │
│  - Private   │              │ - DB Password    │
│  - SSL/TLS   │              └──────────────────┘
└──────────────┘
```

## Prerequisites

### Required Tools
- **gcloud CLI**: [Install](https://cloud.google.com/sdk/docs/install)
- **Terraform**: v1.0+ [Install](https://www.terraform.io/downloads)
- **Node.js**: v20+ [Install](https://nodejs.org/)
- **Docker**: [Install](https://docs.docker.com/get-docker/)
- **Firebase CLI**: `npm install -g firebase-tools`

### Required Accounts
- Google Cloud Platform account with billing enabled
- Stripe account ([Sign up](https://dashboard.stripe.com/register))
- GitHub account with repository access

## Initial GCP Setup

### 1. Create GCP Project

```bash
# Set your project name
export PROJECT_ID="alpaca-esclusivi-prod"

# Create the project
gcloud projects create $PROJECT_ID --name="Alpaca Esclusivi"

# Set as default project
gcloud config set project $PROJECT_ID

# Link billing account (replace with your billing account ID)
gcloud billing projects link $PROJECT_ID \
  --billing-account=YOUR_BILLING_ACCOUNT_ID
```

### 2. Enable Required APIs

```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  vpcaccess.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  cloudresourcemanager.googleapis.com \
  compute.googleapis.com \
  servicenetworking.googleapis.com
```

## Workload Identity Federation Setup

**SECURITY**: We use Workload Identity Federation (WIF) instead of service account keys for GitHub Actions authentication.

### 1. Create Workload Identity Pool

```bash
# Create the workload identity pool
gcloud iam workload-identity-pools create "github-actions-pool" \
  --project="$PROJECT_ID" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Get the pool ID
export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe "github-actions-pool" \
  --project="$PROJECT_ID" \
  --location="global" \
  --format="value(name)")
```

### 2. Create Workload Identity Provider

```bash
# Replace with your GitHub organization/user and repository
export GITHUB_REPO="alscec/ALPACA_ESCLUSIVI"

gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="$PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="github-actions-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

### 3. Create Service Account for GitHub Actions

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --project="$PROJECT_ID" \
  --display-name="GitHub Actions Service Account"

export SA_EMAIL="github-actions@$PROJECT_ID.iam.gserviceaccount.com"

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/iam.serviceAccountUser"
```

### 4. Allow GitHub to Impersonate Service Account

```bash
gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${GITHUB_REPO}"
```

### 5. Get WIF Provider Name (for GitHub Secrets)

```bash
export WIF_PROVIDER="projects/$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider"

echo "WIF_PROVIDER: $WIF_PROVIDER"
echo "WIF_SERVICE_ACCOUNT: $SA_EMAIL"
```

## Infrastructure Deployment (Terraform)

### 1. Initialize Terraform

```bash
cd terraform

# Initialize Terraform
terraform init
```

### 2. Configure Variables

Create `terraform.tfvars`:

```hcl
project_id       = "alpaca-esclusivi-prod"
project_name     = "alpaca-esclusivi"
region           = "europe-west1"
environment      = "production"
db_tier          = "db-custom-1-3840"  # Adjust based on needs
db_disk_size     = 20
allowed_origins  = "https://alpaca-esclusivi.web.app,https://alpaca-esclusivi.firebaseapp.com"
```

### 3. Review and Apply Infrastructure

```bash
# Review the execution plan
terraform plan

# Apply the infrastructure
terraform apply

# Save the outputs
terraform output > ../terraform-outputs.txt
```

### 4. Note Important Outputs

```bash
# Get Cloud Run URL
terraform output cloud_run_url

# Get Artifact Registry URL
terraform output artifact_registry_url

# Get secret names
terraform output stripe_secret_key_name
terraform output stripe_webhook_secret_name
```

## Stripe Configuration

### 1. Get Stripe Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **API keys**
3. Copy your **Secret key** (starts with `sk_live_...` for production)
4. Go to **Developers** → **Webhooks**
5. Create a new webhook endpoint pointing to: `https://YOUR_CLOUD_RUN_URL/api/webhooks/stripe`
6. Copy the **Signing secret** (starts with `whsec_...`)

### 2. Add Stripe Keys to Secret Manager

```bash
# Add Stripe secret key
echo -n "sk_live_YOUR_STRIPE_SECRET_KEY" | \
  gcloud secrets versions add stripe-secret-key-production \
  --data-file=-

# Add Stripe webhook secret
echo -n "whsec_YOUR_WEBHOOK_SECRET" | \
  gcloud secrets versions add stripe-webhook-secret-production \
  --data-file=-

# Verify secrets
gcloud secrets versions access latest --secret="stripe-secret-key-production"
```

## Firebase Hosting Setup

### 1. Create Firebase Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase in the project
cd frontend
firebase init hosting

# Select options:
# - Use existing project or create new one
# - Public directory: dist
# - Single-page app: Yes
# - GitHub Actions: No (we'll configure manually)
```

### 2. Configure Firebase

Create `frontend/firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### 3. Get Firebase Service Account

```bash
# Create service account for GitHub Actions
firebase use YOUR_FIREBASE_PROJECT_ID

# The service account JSON will be provided by Firebase
# Store it as a GitHub secret: FIREBASE_SERVICE_ACCOUNT
```

## GitHub Actions Configuration

### Add GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**, and add:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GCP_PROJECT_ID` | `alpaca-esclusivi-prod` | Your GCP project ID |
| `WIF_PROVIDER` | `projects/.../workloadIdentityPools/...` | From WIF setup step 5 |
| `WIF_SERVICE_ACCOUNT` | `github-actions@....iam.gserviceaccount.com` | From WIF setup step 3 |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID | From Firebase console |
| `FIREBASE_SERVICE_ACCOUNT` | `{...}` | Firebase service account JSON |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe publishable key (safe for client) |
| `PRODUCTION_API_URL` | `https://...run.app` | Cloud Run URL from Terraform output |
| `STAGING_API_URL` | `https://...run.app` | Cloud Run staging URL |

### Create GitHub Environments

1. Go to **Settings** → **Environments**
2. Create two environments:
   - `production` (with protection rules)
   - `staging`

## Deployment

### Manual Deployment

#### Backend (Cloud Run)

```bash
cd backend

# Build image
gcloud builds submit \
  --tag europe-west1-docker.pkg.dev/$PROJECT_ID/alpaca-esclusivi-docker/backend:latest

# Deploy to Cloud Run
gcloud run deploy alpaca-esclusivi-backend-production \
  --image europe-west1-docker.pkg.dev/$PROJECT_ID/alpaca-esclusivi-docker/backend:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

#### Frontend (Firebase)

```bash
cd frontend

# Create production environment file
echo "VITE_API_URL=https://YOUR_CLOUD_RUN_URL" > .env.production
echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_live_..." >> .env.production

# Build
npm run build

# Deploy
firebase deploy --only hosting
```

### Automated Deployment (GitHub Actions)

Simply push to `main` or `staging` branch:

```bash
git checkout main
git push origin main
```

GitHub Actions will automatically:
1. Run tests
2. Build Docker image
3. Push to Artifact Registry
4. Deploy to Cloud Run
5. Build frontend
6. Deploy to Firebase Hosting

## Monitoring and Maintenance

### View Logs

```bash
# Cloud Run logs
gcloud run services logs read alpaca-esclusivi-backend-production \
  --region europe-west1 \
  --limit 50

# Cloud SQL logs
gcloud sql operations list --instance=alpaca-esclusivi-db-production
```

### Monitor Performance

- **Cloud Run**: https://console.cloud.google.com/run
- **Cloud SQL**: https://console.cloud.google.com/sql
- **Cloud Logging**: https://console.cloud.google.com/logs
- **Firebase Hosting**: https://console.firebase.google.com

### Database Migrations

```bash
# Connect to Cloud SQL
gcloud sql connect alpaca-esclusivi-db-production --user=alpaca_user

# Or use Cloud SQL Proxy for local Prisma migrations
cloud-sql-proxy --credentials-file=key.json alpaca-esclusivi-db-production
```

### Backup and Recovery

```bash
# Create on-demand backup
gcloud sql backups create \
  --instance=alpaca-esclusivi-db-production

# List backups
gcloud sql backups list \
  --instance=alpaca-esclusivi-db-production

# Restore from backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance=alpaca-esclusivi-db-production \
  --backup-id=BACKUP_ID
```

### Scaling

```bash
# Update Cloud Run max instances
gcloud run services update alpaca-esclusivi-backend-production \
  --max-instances 20 \
  --region europe-west1

# Update Cloud SQL tier
gcloud sql instances patch alpaca-esclusivi-db-production \
  --tier=db-custom-2-7680
```

## Security Checklist

- [x] No service account keys in code
- [x] Workload Identity Federation for CI/CD
- [x] Secrets in Secret Manager
- [x] Database private IP only
- [x] SSL/TLS enforced everywhere
- [x] CORS restricted to specific origins
- [x] Rate limiting enabled
- [x] Helmet security headers
- [x] Non-root user in Docker
- [x] Automatic backups enabled

## Troubleshooting

### Common Issues

**Issue**: `Failed to create VPC connector`
- **Solution**: Ensure `vpcaccess.googleapis.com` API is enabled

**Issue**: `Permission denied on Secret Manager`
- **Solution**: Grant `roles/secretmanager.secretAccessor` to Cloud Run service account

**Issue**: `Database connection timeout`
- **Solution**: Verify VPC connector and Cloud SQL private IP configuration

**Issue**: `CORS errors in browser`
- **Solution**: Update `ALLOWED_ORIGINS` in Cloud Run environment variables

### Support

- **GCP Documentation**: https://cloud.google.com/docs
- **Terraform GCP Provider**: https://registry.terraform.io/providers/hashicorp/google
- **Firebase Documentation**: https://firebase.google.com/docs

## Cost Optimization

- **Cloud Run**: Scales to zero, only pay for requests
- **Cloud SQL**: Use `db-f1-micro` for staging
- **Firebase Hosting**: Free tier sufficient for most use cases
- **Secret Manager**: First 6 secret versions free

Estimated monthly cost (production, moderate traffic):
- Cloud Run: ~$10-30
- Cloud SQL: ~$30-50
- Firebase Hosting: $0-10
- **Total**: ~$40-90/month

## License

See LICENSE file for details.

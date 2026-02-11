<div align="center">
<img width="1200" height="475" alt="Alpaca Esclusivi Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🦙 Alpaca Esclusivi - Production-Ready Cloud Application

A cutting-edge NFT-like platform for exclusive digital Alpaca assets with "Hostile Takeover" mechanics, deployed on Google Cloud Platform.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![GCP](https://img.shields.io/badge/GCP-Cloud%20Run-4285F4)](https://cloud.google.com/run)
[![Security](https://img.shields.io/badge/Security-CodeQL%20✓-success)](https://github.com/github/codeql)

## 🌟 Features

- **🎨 Customizable NFT Alpacas**: Own and personalize unique digital assets
- **💰 Hostile Takeover Mechanics**: Bid higher to steal ownership (with factory reset)
- **🔐 Secure Authentication**: bcrypt password hashing with anti-phishing compliance
- **⚡ Real-time Transactions**: Complete transaction history with cooldown protection
- **💳 Stripe Integration**: Production-ready payment processing
- **🌍 Global CDN Delivery**: Firebase Hosting for blazing-fast frontend
- **📊 Cloud Infrastructure**: Fully scalable GCP architecture

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (Firebase Hosting)                                │
│  ├─ React 18 + TypeScript                                   │
│  ├─ Vite build + Tailwind CSS                               │
│  └─ Global CDN edge caching                                 │
│                           ↓                                  │
│  Backend (Cloud Run - Serverless)                           │
│  ├─ Node.js/Express + TypeScript                            │
│  ├─ Clean Architecture (DDD)                                │
│  ├─ Security: Helmet, CORS, Rate Limiting                   │
│  └─ Structured Logging (Winston → Cloud Logging)            │
│                           ↓                                  │
│  Database (Cloud SQL PostgreSQL)                            │
│  ├─ Private IP only                                         │
│  ├─ SSL/TLS enforced                                        │
│  ├─ Automated backups                                       │
│  └─ Prisma ORM                                              │
│                                                              │
│  Secrets (Secret Manager)                                   │
│  ├─ Stripe API keys                                         │
│  └─ Database credentials                                    │
│                                                              │
│  CI/CD (GitHub Actions)                                     │
│  ├─ Workload Identity Federation                            │
│  ├─ Automated testing                                       │
│  └─ Zero-downtime deployments                               │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Local Development

#### Prerequisites
- Node.js 20+
- npm or yarn
- Docker (optional, for local backend testing)

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local configuration
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

The frontend will be available at `http://localhost:5173`
The backend API at `http://localhost:3000`

### Running Tests

The project includes comprehensive unit, integration, and E2E tests for both backend and frontend.

```bash
# Backend tests (123 tests)
cd backend
npm test                    # Run all tests
npm test -- --coverage      # Run with coverage report
npm test -- --watch         # Run in watch mode

# Frontend tests (21 tests)
cd frontend
npm test                    # Run all tests
npm run test:coverage       # Run with coverage
npm run test:watch          # Run in watch mode
npm run test:ui             # Run with UI

# Total: 144 passing tests
```

**Test Coverage Summary**:
- Backend Core Logic: **100%** coverage (Domain, Services, Use Cases, Presentation)
- Frontend Services: **100%** coverage
- Overall Backend: **65.71%** (excludes infrastructure requiring DB/external services)

For detailed testing documentation, see [TESTING.md](./TESTING.md)

## 🌩️ Production Deployment

### Deploy to Google Cloud Platform

**Complete guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

**Quick overview**:
1. Set up GCP project and Workload Identity Federation
2. Deploy infrastructure with Terraform
3. Configure GitHub Secrets
4. Push to `main` branch (triggers automated deployment)

```bash
# Deploy infrastructure
cd terraform
terraform init
terraform apply

# Add Stripe secrets
gcloud secrets versions add stripe-secret-key-production --data-file=-

# Configure GitHub and push
git push origin main
```

## 📁 Project Structure

```
ALPACA_ESCLUSIVI/
├── backend/                    # Node.js Express Backend
│   ├── src/
│   │   ├── presentation/       # HTTP Controllers
│   │   ├── core/               # Domain logic (DDD)
│   │   ├── infrastructure/     # External services
│   │   ├── usecases/           # Business logic orchestration
│   │   └── tests/              # Jest unit tests
│   ├── prisma/                 # Database schema
│   ├── Dockerfile              # Production container
│   └── package.json
├── frontend/                   # React Vite Frontend
│   ├── src/
│   │   ├── components/         # React UI components
│   │   ├── services/           # API client layer
│   │   └── types.ts            # TypeScript interfaces
│   ├── firebase.json           # Hosting config
│   └── package.json
├── terraform/                  # Infrastructure as Code
│   ├── main.tf                 # GCP resources
│   ├── variables.tf            # Configuration
│   └── outputs.tf              # Deployment info
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── DEPLOYMENT.md               # Detailed deployment guide
├── CLOUD_TRANSFORMATION_SUMMARY.md  # Change summary
└── README.md                   # This file
```

## 🔒 Security Features

### Implemented Security Measures
- ✅ **No hardcoded secrets** - All credentials in Secret Manager
- ✅ **Workload Identity Federation** - No service account keys
- ✅ **OWASP Top 10** - Helmet, CORS, rate limiting, input validation
- ✅ **Private database** - No public IP, SSL/TLS enforced
- ✅ **bcrypt hashing** - Secure password storage
- ✅ **CodeQL scanning** - Zero security alerts
- ✅ **Non-root containers** - Least privilege Docker user
- ✅ **Audit logging** - GCP Cloud Logging integration

### Security Scan Results
- **CodeQL**: 0 alerts ✅
- **npm audit**: No critical vulnerabilities ✅
- **Code Review**: All findings addressed ✅

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript 5.6
- **ORM**: Prisma 5.22
- **Authentication**: bcryptjs
- **Validation**: Zod
- **Logging**: Winston
- **Testing**: Jest
- **DI**: tsyringe

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router 6

### Infrastructure
- **Cloud**: Google Cloud Platform
- **Container**: Docker
- **IaC**: Terraform
- **Hosting**: Firebase Hosting (Frontend)
- **Compute**: Cloud Run (Backend)
- **Database**: Cloud SQL PostgreSQL
- **Secrets**: Secret Manager
- **Registry**: Artifact Registry
- **CI/CD**: GitHub Actions

### Payment
- **Provider**: Stripe
- **Features**: Payment intents, webhooks, refunds

## 📊 Database Schema

```prisma
model Alpaca {
  id               Int           @id @default(autoincrement())
  name             String
  color            String
  accessory        String
  currentValue     Float
  ownerName        String
  password         String?
  backgroundImage  String?
  stableColor      String?
  lastBidAt        DateTime?
  transactions     Transaction[]
}

model Transaction {
  id            Int      @id @default(autoincrement())
  alpacaId      Int
  timestamp     DateTime @default(now())
  previousOwner String
  newOwner      String
  amount        Float
  alpaca        Alpaca   @relation(fields: [alpacaId], references: [id])
}
```

## 🎯 API Endpoints

### Backend API (`/api`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/alpaca` | List all alpacas |
| `POST` | `/api/alpaca/:id/bid` | Place a bid (hostile takeover) |
| `PATCH` | `/api/alpaca/:id` | Customize alpaca (owner only) |

**Example Request**:
```bash
curl -X POST https://your-backend.run.app/api/alpaca/1/bid \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150,
    "newOwner": "Alice",
    "password": "mysecretpin"
  }'
```

## 📈 Monitoring & Logs

### GCP Cloud Logging
```bash
# View backend logs
gcloud run services logs read alpaca-esclusivi-backend-production \
  --region europe-west1 \
  --limit 50

# View Cloud SQL logs
gcloud sql operations list --instance=alpaca-esclusivi-db-production
```

### Metrics
- Cloud Run: Request count, latency, errors
- Cloud SQL: Connections, CPU, memory
- Firebase: Bandwidth, requests

## 💰 Cost Optimization

**Estimated monthly costs** (production, moderate traffic):
- Cloud Run: ~$10-30 (scales to zero)
- Cloud SQL: ~$30-50
- Firebase Hosting: $0-10 (free tier)
- Secret Manager: $0 (free)
- **Total**: ~$40-90/month

**Staging**: ~$10-20/month

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Google Cloud Platform** for infrastructure
- **Stripe** for payment processing
- **Firebase** for hosting
- **Prisma** for database ORM

## 📞 Support

- **Documentation**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Summary**: [CLOUD_TRANSFORMATION_SUMMARY.md](./CLOUD_TRANSFORMATION_SUMMARY.md)
- **GCP Docs**: https://cloud.google.com/docs
- **Terraform Docs**: https://registry.terraform.io/providers/hashicorp/google

## 🔗 Links

- **AI Studio App**: https://ai.studio/apps/drive/1KbD4NQ11Gb4lwENKs6NMmNRPNJbG7nDa
- **Repository**: https://github.com/alscec/ALPACA_ESCLUSIVI

---

**Built with ❤️ using TypeScript, React, and Google Cloud Platform**

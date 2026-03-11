# ☁️ CloudStore: Application & Infrastructure Monorepo

![CI Backend](https://img.shields.io/badge/CI_Backend-Passing-success?style=for-the-badge&logo=githubactions)
![CI Frontend](https://img.shields.io/badge/CI_Frontend-Passing-success?style=for-the-badge&logo=githubactions)
![Terraform](https://img.shields.io/badge/Terraform-1.5+-blue?style=for-the-badge&logo=terraform)
![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-Instrumented-blueviolet?style=for-the-badge&logo=opentelemetry)

This monorepo houses the CloudStore application source code (React/Node.js), the Infrastructure as Code (Terraform) required to bootstrap the Google Cloud Platform (GCP) environment, and the Continuous Integration (CI) pipelines.

Deployment to the GKE cluster is managed asynchronously via ArgoCD in the [`cloudstore-gitops`](https://github.com/sourav-m619/cloudstore-gitops.git) repository.


<img width="1376" height="768" alt="4c49115290ac83f96cbb36d00221fccf" src="https://github.com/user-attachments/assets/f2c6bc60-5e17-41fe-9974-af3f9a359b65" />


---

## 🏗️ System Architecture

* **Frontend Tier:** React 18 Single Page Application (SPA). Served via an unprivileged Nginx container (`nginxinc/nginx-unprivileged:alpine`).
* **Backend Tier:** Node.js (Express) REST API. Fully instrumented with `@opentelemetry/sdk-node` for auto-tracing HTTP and pg requests.
* **Data Tier:** PostgreSQL 15 hosted on Cloud SQL. Accessed exclusively via Private Service Connect (PSC) at `10.239.0.3`.
* **Cloud Infrastructure:** VPC (Custom Mode), Cloud NAT, Private GKE Cluster (us-central1, 3 nodes), Artifact Registry, and Secret Manager.

---

## 📂 Deep Directory Structure

```text
cloudstore-app/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.js           # Express server entry
│   │   │   ├── tracing.js         # OTEL SDK initialization (runs before index)
│   │   │   └── routes/
│   │   ├── package.json
│   │   └── Dockerfile           # Multi-stage, distroless Node.js image
│   └── frontend/
│       ├── src/                 
│       ├── nginx.conf           # Custom Nginx routing & security headers
│       ├── package.json
│       └── Dockerfile           # Multi-stage, builder -> nginx-unprivileged
├── terraform/                   
│   ├── modules/                 # Reusable TF modules
│   │   ├── vpc/
│   │   ├── gke/                 # provisions private cluster + gke-node-sa
│   │   └── cloudsql/
│   ├── main.tf                  # Root module orchestrating child modules
│   ├── backend.tf               # GCS State Backend definition
│   ├── providers.tf             # google & google-beta providers
│   └── variables.tf
├── docker-compose.yml           # Local development stack (App + Postgres + OTEL)
└── .github/
    └── workflows/
        ├── terraform.yml        # PR plan / Main apply
        ├── ci-backend.yml       # Triggers on paths: 'apps/backend/**'
        └── ci-frontend.yml      # Triggers on paths: 'apps/frontend/**'
🔐 Security Posture & Workload Identity Federation (WIF)
This repository strictly adheres to a Zero Key policy. There are no static GCP Service Account JSON keys stored in GitHub Secrets.

GitHub Actions to GCP Auth Flow:
The GitHub Actions runner requests an OIDC token from GitHub.

The token is presented to the GCP Workload Identity Pool.

GCP verifies the token signature and the repository/branch claims.

GCP issues a short-lived, scoped access token for the github-actions-sa@YOUR_PROJECT.iam.gserviceaccount.com Service Account.

Required IAM Roles for CI SA:

roles/artifactregistry.writer (to push images)

roles/container.developer (optional, if running integration tests against dev cluster)

🛠️ CI Pipeline Technical Breakdown
The .github/workflows/ci-backend.yml and ci-frontend.yml pipelines execute the following strict DevSecOps gates:

1. Hardened Secret Scanning
YAML
- name: Run Gitleaks
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    GITLEAKS_ENABLE_UPLOAD_ARTIFACT: false
Fails the build with exit code 1 if any high-entropy strings, keys, or passwords are detected in the diff.

2. Linting & SCA (Software Composition Analysis)
Dockerfile Linting: Runs hadolint/hadolint-action ensuring rules like DL3008 (pin versions) and DL3002 (non-root user) are met.

Dependency Audit: Runs npm audit --audit-level=high.

3. Container Image Scanning
Images are built locally on the runner and scanned before being pushed to Artifact Registry.

YAML
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'cloudstore-backend:${{ github.sha }}'
    format: 'table'
    exit-code: '1'
    ignore-unfixed: true
    vuln-type: 'os,library'
    severity: 'CRITICAL,HIGH'
4. GitOps Auto-Commit
Uses a restricted GitHub Personal Access Token (GITOPS_TOKEN) to update the target manifest in the cloudstore-gitops repository via Kustomize or yq.

💻 Local Development Setup
To replicate the production environment as closely as possible, use the provided docker-compose.yml which spins up the Frontend, Backend, a local PostgreSQL database, and a local Jaeger instance for tracing.

Prerequisites
Docker & Docker Compose v2

Node.js 18+

Bootstrapping Local Environment
Start the infrastructure:

Bash
docker-compose up -d db jaeger
Run the Backend:

Bash
cd apps/backend
npm install

# Export OTEL variables to point to local Jaeger
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
export OTEL_SERVICE_NAME="cloudstore-backend-local"
export DB_HOST="localhost"
export DB_PASSWORD="local_dev_password"

npm run dev
Run the Frontend:

Bash
cd apps/frontend
npm install
npm start
Viewing Local Traces
Navigate to http://localhost:16686 to view the Jaeger UI. As you interact with the local React frontend, you will see the distributed traces generated by the Node.js backend's auto-instrumentation.

⚙️ Infrastructure (Terraform) Operations
The terraform/ directory manages the foundational GCP environment. State is stored in GCS (cloudstore-terraform-state).

Manual Provisioning (Break-Glass)
Normally, TF is executed by GitHub Actions. If manual intervention is required:

Bash
cd terraform/

# Authenticate via user credentials (must have roles/owner or equivalent)
gcloud auth application-default login

terraform init

# Targeting specific modules to avoid wide-impact changes
terraform plan -target=module.gke

terraform apply -target=module.gke
Note on Terraform State: State is locked via GCS. Do not attempt to force-unlock unless you have confirmed no CI pipelines are currently running.



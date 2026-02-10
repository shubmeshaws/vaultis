# Kubernetes Deployment Guide

Deploy Vaultis to a Kubernetes cluster (EKS, GKE, or local K8s).

## 1. Create Secrets
Store your sensitive database strings:
```bash
kubectl create secret generic vaultis-secrets \
  --from-literal=DATABASE_URL="postgresql://user:pass@host:5432/db" \
  --from-literal=NEXTAUTH_SECRET="your-secret" \
  --from-literal=GITHUB_ID="your-id" \
  --from-literal=GITHUB_SECRET="your-secret" \
  --from-literal=GOOGLE_ID="your-id" \
  --from-literal=GOOGLE_SECRET="your-secret" \
  --from-literal=ALLOWED_DOMAINS="gmail.com,prismforce.ai" \
  --from-literal=NEXT_PUBLIC_ALLOWED_DOMAINS_MSG="Access denied."
```

## 2. Deployment Manifest (`deployment.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vaultis
spec:
  replicas: 2
  selector:
    matchLabels:
      app: vaultis
  template:
    metadata:
      labels:
        app: vaultis
    spec:
      containers:
      - name: vaultis
        image: your-docker-hub/vaultis:latest
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: vaultis-secrets
        env:
        - name: NEXTAUTH_URL
          value: "https://vaultis.yourdomain.com"
```

## 3. Service Manifest (`service.yaml`)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: queryx-service
spec:
  selector:
    app: queryx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

## 4. Database Setup

### Connecting to Supabase
- Ensure your cluster white-lists Supabase IPs or allows public egress.
- Pass the connection string via the `vaultis-secrets`.

### Internal PostgreSQL (StatefulSet)
For a production-grade internal DB, use a Helm chart like `bitnami/postgresql`.
```bash
helm install my-db bitnami/postgresql
```
Update `DATABASE_URL` to point to `my-db-postgresql.default.svc.cluster.local`.

## 5. Apply Configurations
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

## 6. Database Initialization
After the pods are running, run the following (once) to setup your schema and admin account:
```bash
kubectl exec -it deployment/vaultis -- npx prisma migrate deploy
kubectl exec -it deployment/vaultis -- npm run create-admin your@email.com yourpassword "Your Name"
```

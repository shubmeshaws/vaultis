# Kubernetes Deployment Guide

Deploy QueryX to a Kubernetes cluster (EKS, GKE, or local K8s).

## 1. Create Secrets
Store your sensitive database strings:
```bash
kubectl create secret generic queryx-secrets \
  --from-literal=DATABASE_URL="postgresql://user:pass@host:5432/db" \
  --from-literal=NEXTAUTH_SECRET="your-secret"
```

## 2. Deployment Manifest (`deployment.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: queryx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: queryx
  template:
    metadata:
      labels:
        app: queryx
    spec:
      containers:
      - name: queryx
        image: your-docker-hub/queryx:latest
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: queryx-secrets
        env:
        - name: NEXTAUTH_URL
          value: "https://queryx.yourdomain.com"
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
- Pass the connection string via the `queryx-secrets`.

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
kubectl exec -it deployment/queryx -- npx prisma migrate deploy
kubectl exec -it deployment/queryx -- npm run create-admin your@email.com yourpassword "Your Name"
```

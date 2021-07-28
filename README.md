# K8S Goku

K8s Goku helps to debug production applications locally without impacting your production system.

## Quickstart

You need a small deployment to your kubernetes cluster to get the "listener" deployed.

K8s-goku is atm designed to work with Projectcontour.io style `HTTPProxies`.

### Deploy to kubernetes

```
kubectl apply -f k8s-deploy/deploy.yaml
```


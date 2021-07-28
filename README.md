# K8S Goku

K8s Goku helps to debug production applications locally without impacting your production system.

Features:
- Relay captured requests to a locally running application (or anywhere the host running the consumer can reach)
- Save requests to disk /when using together with an endpoint this also captures the response and request duraion)
- Transparent to your production traffic
- Multiple consumers can be attached at the same time

Requirements:
- Kuberneters Cluster and the ability to use `port-forward`
- Project Contour as ingress controller (Others using `HTTPProxies` might work as well if they support mirroring)
- NodeJS on the host

## Quickstart

You need a small deployment to your kubernetes cluster to get the "listener" deployed.

K8s-goku is atm designed to work with Projectcontour.io style `HTTPProxies`.

### Deploy to kubernetes

```
kubectl apply -f k8s-deploy/deploy.yaml
```
### Mirror traffic in contour

Go to edit your `HTTPProxy` and add this to the services:

```
- mirror: true
  name: k8s-goku
  port: 8000
```

Your `routes` should now look somwthing like this:

```
routes:
  - conditions:
    - prefix: /
    services:
    - name: my-normal-service
      port: 5000
    - mirror: true
      name: k8s-goku
      port: 8000
```

### Port forward the redis

Enable a port forward via the Kubernetes API server:

```
kubectl port-forward k8s-goku-redis-69dbfc9576-x9w5d 6000:6379
```

This will expose the k8s-goku redis on `localhost:6000`

### Run the consumer

To relay the traffic to your local debug app:

```
node src/consumer.js -r localhost -p 6000 -e <url-of-your-debug-app>
```

## Consumer options

```
Usage: consumer [options]

Options:
  -V, --version           output the version number
  -e, --endpoint <url>    Endpoint to send requests to
  -n, --name <name>       Name of current run - if omitted a name is generated (run-<timestamp>) (default: "run-1627500598430")
  -s, --save              Save requests and responses
  -r, --redishost <host>  IP/Hostname of redis
  -p, --redisport <port>  port of redis (default: "6379")
  -h, --help              display help for command
```
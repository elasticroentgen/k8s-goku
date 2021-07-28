const redis = require('redis');
const express = require('express');
const app = express();

const redisHost = process.env.REDISHOST || "localhost"
const port = process.env.PORT || "8000";

// create redis client
const redisClient = redis.createClient({
    host: redisHost,
});

function log(msg) {
    const today = new Date(Date.now());
    console.log(today.toISOString() + " | " + msg);
}

redisClient.on('error', err => {
    log('Redis Error ' + err);
});

// fire up express
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Ingest route
app.use((req,res,next) => {

    const reqInfo = {
        path: req.path,
        hostname: req.hostname,
        ip: req.ip,
        method: req.method,
        body: req.body
    };

    const jsonReq = JSON.stringify(reqInfo);

    log("proxy request for " + reqInfo.ip + " - " + reqInfo.method + " - " + reqInfo.path);
    redisClient.publish("http-forward", jsonReq)
    // just end the request
    res.end();
});

log("K8s Goku starting.");

app.listen(port, () => {
    log(`\tListening on ${port}...`);
});

process.on('SIGTERM', function () {
    log("Exiting....")
 });
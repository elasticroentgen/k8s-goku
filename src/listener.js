const redis = require('redis');
const express = require('express');
const app = express();

// create redis client
const redisClient = redis.createClient({
    host: '172.16.10.194',
});

function log(msg) {
    console.log(Date.now() + " | " + msg);
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

app.listen('8000', () => {
    log("HTTP Ingest listening on 8000...");
});

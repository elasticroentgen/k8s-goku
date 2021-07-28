const redis = require('redis');
const axios = require('axios');
const fs = require('fs');

function log(msg) {
    console.log(Date.now() + " | " + msg);
}

const save = (reqInfo, reqId, durationMs, response) => {
    if(saveToDisk) {
        const diskObj = {
            request: reqInfo,
            duration: durationMs,
            response: null
        };

        if(response) {
            diskObj["response"] = {
                data: response.data,
                status: response.status
            };
        }

        fs.writeFile(`${runname}-${reqId}.json`, JSON.stringify(diskObj), (err) => {
            if (err) {
                log("Error writing response to disk.")
            }

          });

    }
}

// sezup commander for CLI options
const { program } = require('commander');
program
    .version('0.0.1')
    .option('-e, --endpoint <url>', 'Endpoint to send requests to')
    .option('-n, --name <name>', 'Name of current run - if omitted a name is generated (run-<timestamp>)', `run-${Date.now()}`)
    .option('-s, --save', 'Save requests and responses')
    .option('-r, --redishost <host>', 'IP/Hostname of redis')
    .option('-p, --redisport <port>', 'port of redis','6379')

// Parse options
program.parse(process.argv);
const options = program.opts();

if (!options.redishost) {
    log("No --redishost given.")
    return;
}

let saveToDisk = false;
if(options.save) {
    saveToDisk = true;
}

const endpoint = options.endpoint;
const runname = options.name;

// create redis client
const redisClient = redis.createClient({
    host: options.redishost,
    port: parseInt(options.redisport)
});

redisClient.on('error', err => {
    log('Redis Error ' + err);
});

let requestId = 0;

redisClient.on("message", (channel, message) => {
    const reqInfo = JSON.parse(message);
    const reqId = requestId++;
    log(`Received request #${reqId} | ${reqInfo.ip} - ${reqInfo.method} - ${reqInfo.path}`)

    const startTime = Date.now();

    if(!options.endpoint) {
        log(`Saving request #${reqId} to disk`)
        save(reqInfo, reqId,-1)
        return;
    }

    // send to endpoint
    axios({
        method: reqInfo.method,
        url: endpoint + reqInfo.path,
        data: reqInfo.body
    })
        .then((response) => {
            const durationMs = Date.now() - startTime;
            const jsonString = JSON.stringify(response.data);
            log(`Response for #${reqId} | [${response.status}]`);

            save(reqInfo, reqId, durationMs, response);


        })
        .catch((error) => {
            log(`Response for #${reqId} | [FAIL] ${error}`)
        });

})

redisClient.subscribe("http-forward");
log(`Run name: ${runname}`)

if(options.endpoint) {
    log(`Consumer ready. Waiting for requests to send to ${endpoint}...`)
} else {
    log(`Consumer ready. No endpoint given. Saving to disk only...`)
}

const express = require("express")
const fetch = require('node-fetch');
const nodeJobProfiles = require("./profiles.json");

var app = express();
app.use(express.json())


const port = 1234;

async function startCLNodeJob(nodeJob){
      
    // Call session manager to get cookie //
    var url = nodeJob.nodeIp + "/sessions";
    var data = {"email": nodeJob.nodeUser, "password": nodeJob.nodePassword};

    var r = await fetch(url, { method: 'POST', body: JSON.stringify(data) });
    var accessCookie = r.headers.raw()['set-cookie'][1];
    
    // Call endpoint to start node Job //
    url = nodeJob.nodeIp + "/v2/specs/"+ nodeJob.jobId + "/runs";
  
    var params = {
        "method": "POST",
        "headers": { 
            "cookie": accessCookie, 
            "Content-Type": "application/x-www-form-urlencoded" 
        },
        "body": JSON.stringify(nodeJob.bodyData)
    };

    r = await fetch(url, params);

    return;
}

var apiRoutes = express.Router(); 

apiRoutes.post('/', async function(req, res){
  
    let nodeJobSpec = nodeJobProfiles[req.body.agentProfile];
    nodeJobSpec.bodyData =  req.body.data;

    await startCLNodeJob(nodeJobSpec);

    console.log("Started job:", nodeJobSpec.jobId, " with data: ", req.body.data);

    res.json({"status":"OK"});

});

app.use('/easyadapteragent', apiRoutes);

var server = app.listen(port);

console.log("Easyadapter agent ready...");


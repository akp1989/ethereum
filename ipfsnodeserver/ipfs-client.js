const express= require('express');
const cors = require('cors');
var IpfsHttpClient = require('ipfs-http-client');


const app = express();
const port = 3100;

app.use(cors());

app.use(express.json({limit: '50mb'}));

app.get('/', (req,res) => {
	res.send("Welcome to Genera node client for IPFS");
});

app.post('/upload', async (req,res) =>{
    const path = req.body.path;
    const content = req.body.content;
    const IPFS = await IpfsHttpClient.create({protocol:'http',
                                        host:'host.docker.internal',
                                        port:'5001',
                                        path:'api/v0'});
    const ipfsResponse = await IPFS.add({path:path,
                                         content:content});
    return res.json({"CID" : ipfsResponse.cid.toString()});
})

app.post('/download', async (req,res) =>{
    const cid = req.body.cid; 
   
    const responseJSON = await getDocument(cid);

    return res.send(JSON.parse(responseJSON));
})
 
async function getDocument(cid){
    const IPFS = await IpfsHttpClient.create({protocol:'http',
                                                host:'host.docker.internal',
                                                port:'5001',
                                                path:'api/v0'});
    console.log (await IPFS.isOnline());
    var stringBuffer='';
    for await(const chunkData of IPFS.cat(cid))
    {   
        stringBuffer += chunkData;
    }
    return (stringBuffer);
} 

app.listen(port, () => console.log("Application started"))
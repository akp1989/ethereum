const express= require('express');
const cors = require('cors');
var IpfsHttpClient = require('ipfs-http-client');
const multer  = require('multer');
const fs = require('fs');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/tmp/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  
const upload = multer({ storage: storage })

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
    //Infura API for client side access.
    // const IPFS= IpfsHttpClient.create("https://ipfs.infura.io:5001");
    const IPFS = await IpfsHttpClient.create({protocol:'http',
                                        //host:'host.docker.internal',
                                        host:'127.0.0.1',
                                        port:'5001',
                                        path:'api/v0'});
    const ipfsResponse = await IPFS.add({path:path,
                                         content:content});
    console.log('Uploaded the file with CID : ', ipfsResponse.cid.toString());
    return res.json({"CID" : ipfsResponse.cid.toString()});
})

app.post('/download', async (req,res) =>{
    const cid = req.body.cid; 
   
    const responseJSON = await getDocument(cid);

    return res.send(JSON.parse(responseJSON));
})
 
async function getDocument(cid){
    //Infura API for client side access.
    //const IPFS= IpfsHttpClient.create("https://ipfs.infura.io:5001");
    const IPFS = await IpfsHttpClient.create({protocol:'http',
                                                //host:'host.docker.internal',
                                                host:'127.0.0.1',
                                                port:'5001',
                                                path:'api/v0'});
    //console.log (await IPFS.isOnline());
    console.log ('Get document request for :',cid );
    var stringBuffer='';
    for await(const chunkData of IPFS.cat(cid))
    {   
        stringBuffer += chunkData;
    }
    return (stringBuffer);
} 

app.post('/uploadMultipart', upload.single('fileName'), async function (req, res, next){
    var jsonData = {};
    var fileDetailData = 'data:'+req.file.mimetype+';base64,';
    var additionalParams = JSON.parse(req.body.additionalParams);
    for(var additionalParam of Object.keys(additionalParams))
    {
      jsonData[additionalParam] = additionalParams[additionalParam];
    }
    const filename = req.file.originalname;
    const filepath = '/tmp/'+filename; 
    const base64file = '/tmp/base64'+filename;
    
    fs.readFile(filepath,'base64',function(err, data){
          jsonData['fileContent'] = fileDetailData.concat(data);
          fs.writeFile(base64file,JSON.stringify(jsonData),function(err){
            console.log(err);
          })
    });
    fs.unlink(filepath, function (err) {
      if (err) throw err;
      console.log(new Date().toUTCString()+': File at' +filepath+'deleted!');
    });

    console.log(new Date().toUTCString()+': File received for ' + filename);
    const IPFS = await IpfsHttpClient.create({protocol:'http',
                                        //host:'host.docker.internal',
                                        host:'127.0.0.1',
                                        port:'5001',
                                        path:'api/v0'});
    const fileDetails = {path: filename, content: base64file};
    console.log(new Date().toUTCString()+': Starting ipfs upload for ' + filename);
    const ipfsResponse = await IPFS.add(fileDetails);
    
    fs.unlink(base64file, function (err) {
      if (err) throw err;
      console.log(new Date().toUTCString()+': File at' +base64file+'deleted!');
    });
    return res.json({"CID" : ipfsResponse.cid.toString()});
  })

app.listen(port, () => console.log("Application started"))
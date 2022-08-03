const express= require('express');
const cors = require('cors');
var IpfsHttpClient = require('ipfs-http-client');
const multer  = require('multer');
const fs = require('fs');
const path = require('path');


const tempPath = '/tmp/';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, tempPath)
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
    var additionalParams = JSON.parse(req.body.additionalParams);
    for(var additionalParam of Object.keys(additionalParams))
    {
      jsonData[additionalParam] = additionalParams[additionalParam];
    }
   
    const filename = req.file.originalname;
    const filepath = path.join(tempPath,filename);
    const b64filename = 'b64'+filename;
    const b64filepath = path.join(tempPath,b64filename);
    console.log(new Date().toUTCString()+': File received for ' + filename);

    await convertFile(filepath,b64filepath,jsonData,req.file.mimetype);
    console.log(new Date().toUTCString()+': File converted for ' + filename);
   
    await fs.unlink(filepath, function (err) {
      if (err) throw err;
      console.log(new Date().toUTCString()+': File at' +filepath+'deleted!');
    });

    const IPFS = await IpfsHttpClient.create({protocol:'http',
                                        //host:'host.docker.internal',
                                        host:'127.0.0.1',
                                        port:'5001',
                                        path:'api/v0'});
    const fileDetails = {path: filename, content: fs.createReadStream(b64filepath)};
    console.log(new Date().toUTCString()+': Starting ipfs upload for ' + filename);
    const ipfsResponse = await IPFS.add(fileDetails);


    fs.unlink(b64filepath, function (err) {
      if (err) throw err;
      console.log(new Date().toUTCString()+': File at' +b64filepath+'deleted!');
    });
    
    return res.json({"CID" : ipfsResponse.cid.toString()});
  })

  function convertFile(filepath,b64filepath,jsonData,mimetype){
    var fileDetailData = 'data:'+mimetype+';base64,';
    return new Promise((accept,reject) => {
      fs.readFile(filepath,'base64',function(err, data){
        jsonData['fileContent'] = fileDetailData.concat(data);
        fs.writeFile(b64filepath,JSON.stringify(jsonData),function(err){
          console.log(err);
          accept();
        })
      });
      
    });
  }


app.listen(port, () => console.log("Application started"))
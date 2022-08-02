const express= require('express');
const cors = require('cors');
const fs = require('fs')
var IpfsHttpClient = require('ipfs-http-client');
const multer  = require('multer')



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  
const upload = multer({ storage: storage })
const app = express();
const port = 3200;

app.use(cors());

app.use(express.json({limit: '50mb'}));

app.get('/', (req,res) => {
	res.send("Welcome to Genera node client for IPFS");
});

app.post('/upload', upload.single('fileName'), async function (req, res, next){
  const filename = req.file.originalname;
  const filepath = 'uploads/'+filename;

  const IPFS = await IpfsHttpClient.create({protocol:'http',
                                      host:'127.0.0.1',
                                      port:'5001',
                                      path:'api/v0'});
  const fileDetails = {path: filename, content: filepath}
  fs.unlink(filepath, function (err) {
    if (err) throw err;
    console.log('File at' +filepath+'deleted!');
  });
  const ipfsResponse = await IPFS.add(fileDetails)
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
                                                host:'host.docker.internal',
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

app.listen(port, () => console.log("Application started"))
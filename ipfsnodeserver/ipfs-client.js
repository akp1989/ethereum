const express= require('express');
const cors = require('cors');
var IpfsHttpClient = require('ipfs-http-client');
const multer  = require('multer');
const path = require('path');
const fs= require('fs');
const crypto = require('crypto'); 

const AppendInitStream = require ('./appendInitStream');

const algorithm = "aes-256-cbc";

const tempPath = '/tmp';

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

app.post('/add', async (req,res,next) =>{
  var content;
  var response;
  //Infura API for client side access.
  // const IPFS= IpfsHttpClient.create("https://ipfs.infura.io:5001");
    
  const IPFS = await IpfsHttpClient.create({protocol:'http',
                                            //host:'host.docker.internal',
                                            host:'127.0.0.1',
                                            port:'5001',
                                            path:'api/v0'});
  try{
    content = JSON.stringify(req.body);
    console.log(new Date().toUTCString()+': Contect received for adding');
    response = await IPFS.add(content);
    console.log(new Date().toUTCString() + 'Uploaded the file with CID : ', response.cid.toString());
  }catch(err){
    var errorMessage = ' Add request errored with '+ err;
    return res.status(500).send(errorMessage);
  }
  return res.json({"CID" : response.cid.toString()});
})

app.get('/get/:cid', async (req,res,next) =>{
  var cid;
  let response = '';
  const textDecoder = new TextDecoder();
  //Infura API for client side access.
  // const IPFS= IpfsHttpClient.create("https://ipfs.infura.io:5001");
  const IPFS = await IpfsHttpClient.create({protocol:'http',
                                      //host:'host.docker.internal',
                                      host:'127.0.0.1',
                                      port:'5001',
                                      path:'api/v0'});
  try{
    cid = req.params.cid;
    console.log (new Date().toUTCString() + ' Get request for :',cid );
    for await(const chunkData of IPFS.cat(cid)){
      response += textDecoder.decode(chunkData,{stream:true});
      
    }
  }catch(err){
    var errorMessage = ' Get request errored with '+ err;
    return res.status(500).send(errorMessage);
  }
  return res.json(JSON.parse(response));
})


//Handler to receive the uploaded file as multipart request
app.post('/uploadMultipart', upload.single('fileName'), async function (req, res, next){
    var jsonData = {}; 
    var ipfsResponse,securitykey;
    //Initiate IPFS and upload the encrypted file
    //Passes a readstream object in the place of file content
    const IPFS = IpfsHttpClient.create({protocol:'http',
                                        //host:'host.docker.internal',
                                        host:'127.0.0.1',
                                        port:'5001',
                                        path:'api/v0'});
    try{
      //Additional params passed with the file as json object
      var additionalParams = JSON.parse(req.body.additionalParams);
      for(var additionalParam of Object.keys(additionalParams))
      {
        jsonData[additionalParam] = additionalParams[additionalParam];
      }
      //Two different filepaths are defined
      // filepath --> Actual file received from the user
      // b64encpath --> Base64 encoded and AES encrypted file to be uploaded to the IPFS
      const filename = req.file.originalname;
      const filepath = path.join(tempPath,filename);
      const b64encname = 'b64enc'+filename;
      const b64encpath = path.join(tempPath,b64encname);
      console.log(new Date().toUTCString()+': File received for ' + filename);

      //Async method to convert the file. Returns the security key of encryption in hex encoding
      securitykey = await convertEncryptFile(filepath,b64encpath,jsonData,req.file.mimetype);
      console.log(new Date().toUTCString()+': File converted for ' + filename);
      //Remove the actual file received from user
      fs.unlink(filepath, function (err) {
        if (err) console.log(err);
        console.log(new Date().toUTCString()+': File at' +filepath+'deleted!');
      });
      const fileDetails = {path: filename, content: fs.createReadStream(b64encpath)};
      console.log(new Date().toUTCString()+': Starting ipfs upload for ' + filename);
      ipfsResponse = await IPFS.add(fileDetails);
      console.log(new Date().toUTCString() + ':File uploaded to ipds with CID : '+ ipfsResponse.cid.toString());
  
      //Remove the encrypted file from the server
      fs.unlink(b64encpath, function (err) {
        if (err) console.log(err);
        console.log(new Date().toUTCString()+': File at' +b64encpath+'deleted!');
      });
    }catch(err){
      var errorMessage = ' Upload file errored with '+ err;
      return res.status(500).send(errorMessage);
    }
    return res.json({"CID" : ipfsResponse.cid.toString(),"secretKey":securitykey});

  })

// Async function to base64 encode and encrypt the file
  function convertEncryptFile(filepath,b64filepath,jsonData,mimetype){
    
    //Crypto random generated init vecotor and security key
    const initVector = crypto.randomBytes(16);
    const securityKey = crypto.randomBytes(32);
    const cipher = crypto.createCipheriv(algorithm,securityKey,initVector);

    //Add the init vector, cipher algorithm and file mime type to the metadata json
    jsonData['cipherIV'] = initVector.toString("hex");
    jsonData['cipherSecret'] = securityKey.toString("hex");
    jsonData['cipher'] = algorithm;
    jsonData['mime'] = mimetype;
    var metadata = JSON.stringify(jsonData);

    //Initiate a transfer stream to append the metadata before the encrypted data
    var appendInitStream = new AppendInitStream(padLeadingZeros(metadata.length)+metadata);

    //Read the actual file with encoding:base64
    // Write stream encoding : utf-8 (default)
    var readStream = fs.createReadStream(filepath,{encoding:'base64'});
    var writeStream = fs.createWriteStream(b64filepath);

    return new Promise((accept,reject) =>{

      // 1) Pipe the readstream through cipher and set the output encoding to hex
      // 2) Pipe the hex encoded cipher output to the transform stream to add the metadata first
      // 3) Pass the transform stream to the write stream to finally write the file <metadata + encrypted text>
      readStream.pipe(cipher).setEncoding('hex').pipe(appendInitStream).pipe(writeStream);
      readStream.on('close',()=>{
        writeStream.on('close',()=>{
          //Return the security key as hex via async promise 
          accept (securityKey.toString("hex"));
        });
      });
    });
  }

//Handler to download the file from IPFS for a given CID
app.post('/download', async (req,res) =>{
  var cid;
  var secretKey;
  try{
    cid = req.body.CID;
    secretKey = req.body.secretKey;
    await getDocument(cid,secretKey); 
    const b64decpath = path.join(tempPath,cid);
    var responseStream =  fs.createReadStream(b64decpath);
    responseStream.pipe(res);
  }catch(err){
    var errorMessage = ' Download file errored with '+ err;
    return res.status(500).send(errorMessage);
  }
})

//Handler to download the file from IPFS for a given CID
app.get('/download/:cid/:secretKey', async (req,res) =>{
  var cid;
  var secretKey;
  try{
    cid = req.params.cid;
    secretKey = req.params.secretKey;
    //async function to get the document
    await getDocument(cid,secretKey);
    const b64decpath = path.join(tempPath,cid);
    var responseStream =  fs.createReadStream(b64decpath);
    responseStream.pipe(res);
  } catch(err){
    var errorMessage = ' Download file errored with '+ err;
    return res.status(500).send(errorMessage);
  }
 
})

//Async function the receives the document from IPFS 
async function getDocument(cid,secretKey){
    //Infura API for client side access.
    //const IPFS= IpfsHttpClient.create("https://ipfs.infura.io:5001");
    const IPFS = IpfsHttpClient.create({protocol:'http',
                                                //host:'host.docker.internal',
                                                host:'127.0.0.1',
                                                port:'5001',
                                                path:'api/v0'});
    //console.log (await IPFS.isOnline());
    console.log (new Date().toUTCString() + ' Get document request for :',cid );
    
    //Define two files 1) temporary and 2) cid name 
    const filepath = path.join(tempPath,'b64temp');
    const b64decpath = path.join(tempPath,cid);

    var writeStream =  fs.createWriteStream(b64decpath);
    
    //Read the file content from IPFS
    for await(const chunkData of IPFS.cat(cid))
    {   
        writeStream.write(chunkData,((error) => {
          if(error) throw error;
        }))
    }

    //Async method to strip metdata from the file and decrypt it back to base64 format
    await convertDecryptFile(b64decpath,filepath,secretKey);
   
    
} 

 //Async method to strip metdata from the file and decrypt it back to base64 format
  async function convertDecryptFile(originalfile,tempfile,securitykey){

    //Async function to strip the metadata and convert the file back to hex encoding to feed it to cipher
    var metadata = await readMetadata(originalfile,tempfile);
    var filemeta = 'data:'+metadata.mime+';base64,';
    
    //Create the read and write streams
    var readStream = fs.createReadStream(tempfile);
    var writeStream = fs.createWriteStream(originalfile);
    
    //Read the initvector and the cipher algorithm from the metadata
    var initvectorb = Buffer.from(metadata.cipherIV,'hex');
    var securitykeyb = Buffer.from(securitykey,'hex');
    const decipher = crypto.createDecipheriv(algorithm, securitykeyb, initvectorb);

    //Transform stream to add the file mime type at the beginning of the base64 content
    var appendInitStream = new AppendInitStream(filemeta);

    //Return promise for the async function
    return new Promise((accept,reject) =>{ 

      // 1) Pipe the hex encoded file to the cipher 
      // 2) Pipe the decrypted content to transfer stream to add the base64 mime conent
      // 3) Pass the transformed stream to the write stream (base64 header + content)
      readStream.pipe(decipher).pipe(appendInitStream).pipe(writeStream);
      readStream.on('close',()=>{
        writeStream.on('close',()=>{

          //Delete the temporary file
          fs.unlink(tempfile, function (err) {
            if (err) console.log(err);
            console.log(new Date().toUTCString()+': File at' +tempfile+'deleted!');
            accept();
          });
        });
      });
    });
 
}

//Async function to read metadata from the envrypted file
async function readMetadata(originalfile,tempfile) {
  var metadatalength;
  var metadata;

  //Read the first 8 byte of the file to get the lenght of the metadata
  var readStream = fs.createReadStream(originalfile,{end:7});
  readStream.on("data", (chunk)=>{
      
    metadatalength = parseInt(chunk.toString())+8;
      //console.log(metadatalength); 
  });

  return new Promise((accept,reject) =>{
    readStream.on("close",()=>{

      //Read the metadata off the file
      var readStream2 = fs.createReadStream(originalfile,{start:8, end:metadatalength-1});
      
      readStream2.on("data", (chunk)=>{
        metadata = JSON.parse(chunk);
  
        readStream2.on("close",()=>{

            //Read the remaining encrypted file content and write it to a new file in a hex encoding
            //This converts the utf-8 content back to hex, to pass to the cipher function
            var readStream = fs.createReadStream(originalfile,{start:metadatalength,encoding:'utf-8'});
            var writeStream = fs.createWriteStream(tempfile,{encoding:'hex'});
                       
            readStream.pipe(writeStream);
            readStream.on('close',()=>{
              writeStream.on('close',()=>{

                //Delete the original file which later will be used to write the actual base64 decrypted content
                fs.unlink(originalfile, function (err) {
                  if (err) console.log(err);
                  console.log(new Date().toUTCString()+': File at' +originalfile+'deleted!');
                  accept(metadata);
                });
              
               
              });
            });

        });

      });
    
    });
  });

  
}

  //Function to return a numeric with 8 digit format 
  //First 8 byte of the encrypted file metadata contains the length of the metadata
  function padLeadingZeros(num) {
    var s = num+"";
    while (s.length < 8) s = "0" + s;
    return s;
}

app.post('/pincheck', async (req,res) =>{
  
  const IPFS = IpfsHttpClient.create({protocol:'http',
                                                //host:'host.docker.internal',
                                                host:'127.0.0.1',
                                                port:'5001',
                                                path:'api/v0'});
  var results = [];                                           
  for await (const{cid,type} of IPFS.pin.ls({type:"recursive"}) )
  {
    var result = { "cid" : cid.toString(), "type": type};
    results.push(result)
  } 
  return res.send(JSON.stringify(results));
})

app.post('/removepin', async (req,res) =>{
  
  const CID = req.body.CID;
  const IPFS = IpfsHttpClient.create({protocol:'http',
                                                //host:'host.docker.internal',
                                                host:'127.0.0.1',
                                                port:'5001',
                                                path:'api/v0'});
  var result;
  try{
    for await (const{cid,type} of IPFS.pin.ls({paths:CID,type:"recursive"}) ){
      await IPFS.pin.rm(CID);
      result = {"response": "success"};
    }     
  }catch(err){
    result ={"response" : "CID not pinned"};
  }
  return res.send(JSON.stringify(result));
})

app.listen(port, () => console.log("Application started"))
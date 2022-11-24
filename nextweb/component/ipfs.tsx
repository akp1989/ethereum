import axios from 'axios';
const config = require ('./contractABI/config');

const uploadRequest = {
    fileName: '',
    author:'',
    fileContent:null
}

const uploadURL = config.ipfs.uploadURL;
const downloadURL = config.ipfs.downloadURL;
const contentuploadURL = config.ipfs.contentuploadURL;
const contentdownloadURL = config.ipfs.contentdownloadURL;

export const uploadContent = async(proposalDescription) =>{
    var proposalJSON;
    try{
        proposalJSON = JSON.parse(proposalDescription);
    }catch(err){
        return "Unable to parse the proposal description as json";
    }
    
    let uploadResponse = await axios.post(contentuploadURL,proposalJSON);
    return uploadResponse.data;
}

export const downloadContent = async(cid) =>{
    let ipfsContent = await axios.get(contentdownloadURL.concat(cid));
    return ipfsContent;
}

export const uploadDocument = async (authorName, fileInput, addParams)=>{
    const formData = new FormData();
    addParams["fileName"] = fileInput.name;
    addParams["author"] = authorName;
    formData.append('additionalParams',JSON.stringify(addParams));
    formData.append('fileName',fileInput);
    const config = {
        headers: {
            'content-type': 'multipart/form-data'
        }
    }
    let uploadResponse = await axios.post(uploadURL,formData,config);
    return uploadResponse.data;    
}

//temporary change
// export const downloadDocument = async(CID,securitykey) =>{
//     var fileName = CID;
export const downloadDocument = async(fileName,CID,securitykey) =>{
    let downloadResponse = await axiosCall(downloadURL,{CID:CID,secretKey:securitykey});
    await base64ToFile(fileName,downloadResponse);
}

const axiosCall = async(url,request) => {
   let responseData = await axios.post(url,request);
   return responseData.data;
};

const base64ToFile = async(fileName,responseData) =>{
    
    var arr = responseData.toString().split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = window.atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);

    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    } 
  
    const blob = new Blob([u8arr],{type: mime});
    
      const elem = window.document.createElement('a');
      var url  = window.URL.createObjectURL(blob);
      elem.href = url;
      elem.download = fileName;        
      document.body.appendChild(elem);
      elem.click();        
      document.body.removeChild(elem);
      window.URL.revokeObjectURL(url);
    
  }
  
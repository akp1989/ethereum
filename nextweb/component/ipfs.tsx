import axios from 'axios';

const uploadRequest = {
    fileName: '',
    author:'',
    fileContent:null
}

const uploadURL = 'http://157.245.55.46:3100/upload';
const downloadURL = 'http://157.245.55.46:3100/download';

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
    return uploadResponse.data.CID;    
}

export const downloadDocument = async(fileName,CID) =>{
    let downloadResponse = await axiosCall(downloadURL,{cid:CID});
    await base64ToFile(fileName,downloadResponse.fileContent);
}

const toBase64 = file => new Promise((resolve,reject)=>{
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = error => reject(error);
});

const axiosCall = async(url,request) => {
   let responseData = await axios.post(url,request);
   return responseData.data;
};

const base64ToFile = async(fileName,dataURL) =>{
    var arr = dataURL.split(','),mime = arr[0].match(/:(.*?);/)[1],
    bstr = window.atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
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
  
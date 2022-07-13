import axios from 'axios';
import { clear } from 'console';

const uploadRequest = {
    fileName: '',
    author:'',
    fileContent:null,
    cid:''
}

const uploadURL = 'http://157.245.55.46:3100/upload';
const downloadURL = 'http://157.245.55.46:3100/download';

export const uploadDocument = async (documentId, authorName, fileInput)=>{
    uploadRequest.fileName = documentId;
    uploadRequest.author = authorName;
    uploadRequest.fileContent = await toBase64(fileInput);
    let uploadResponse = await axiosCall(uploadURL,{path:fileInput.name, content:JSON.stringify(uploadRequest)});
    return uploadResponse.CID;
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
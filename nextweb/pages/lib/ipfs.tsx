

export const uploadDocument = (fileInput) =>{
    var fileReader = new FileReader();
    fileReader.readAsDataURL(fileInput); 
    fileReader.onload = () =>{
      console.log(fileReader.result)
    }
}
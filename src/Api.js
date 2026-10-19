const API_URL="http://localhost:5000";

async function apiRequest(endpoint,method="GET",body=null){
     const url=`${API_URL}${endpoint}`;
      const token=localStorage.getItem("token");
      if(!token){
        throw new Error("token is expired ! please log in again");
      }

      const isFormData=  body instanceof FormData;
const headers={
       "Authorization":`Bearer ${token}`
}

      if(!isFormData){
        headers["content-type"]="application/json"
      }
     const response= await fetch(url,{
        method:method,
        headers,
        body:body?isFormData?body:JSON.stringify(body):undefined
    
    });
     
if (response.status === 401) {
    localStorage.removeItem("token");
    throw new Error("Your session is invalid. Please log in again.");
}
     return response;
}

export default apiRequest;
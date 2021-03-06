//utility function for showing timestamp on post
export const timeSince = (timestamp,short) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  
    let interval = Math.floor(seconds / 31536000); //make into year
  
    if (interval > 1) {
      return !short?interval + " years":interval + "y";
    }
  
    interval = Math.floor(seconds / 604800); //make into months
    if (interval > 1) {
      return !short?interval + " weeks":interval + "w";
    }
  
    interval = Math.floor(seconds / 86400); //make into days
    if (interval > 1) {
      return !short?interval + " days":interval + "d";
    }
  
    interval = Math.floor(seconds / 3600);//make into hours
    if (interval > 1) {
      return !short?interval + " hours":interval + "h";
    }
  
    interval = Math.floor(seconds / 60);//make into minutes
    
    if (interval > 1) {
      return !short?interval + " minutes":interval + "m";
    }
    if(short)
      return Math.floor(seconds) + "s"
    return Math.floor(seconds)>5?Math.floor(seconds) + " seconds":"few seconds";//else finally second
  };
  //make request to server for fetching data
  export const connect = (endpoint, { body, ...customConfig } = {}) => {
    const token = localStorage.getItem("accesstoken");
    const headers = { "Content-Type": "application/json" };
  
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  
    const config = {
      method: body ? "POST" : "GET",
      ...customConfig,
      headers: {
        ...headers,
        ...customConfig.headers,
      },
    };
  
    if (body) {
      config.body = JSON.stringify(body);
    }
  //http://localhost:55000 https://complaintlodger.herokuapp.com
    return fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, config).then(
      async (res) => {
        const data = await res.json();
  
        if (res.ok) {
         // console.log(data);
          if(data.unseennotice&&data.unseennotice>0){
            if(document.getElementById('noti-count')){
            document.getElementById('noti-count').textContent=data.unseennotice;
            document.getElementById('noti-wrapper').style.display='flex';
          }
            if(document.getElementById('noti-count-mobile')){
            document.getElementById('noti-count-mobile').textContent=data.unseennotice;            
            document.getElementById('noti-wrapper-mobile').style.display='flex';
            }
          }
          else{
            if(document.getElementById('noti-wrapper')){
              document.getElementById('noti-wrapper').style.display='none';
            if(document.getElementById('noti-wrapper-mobile'))
              document.getElementById('noti-wrapper-mobile').style.display='none';
            }
          }
          if(data.unseenmsg&&data.unseenmsg>0){
            if(document.getElementById('inb-count')){
            document.getElementById('inb-count').textContent=data.unseenmsg;
            document.getElementById('inb-wrapper').style.display='flex';
            }
            if(document.getElementById('inb-count-mobile')){
            document.getElementById('inb-count-mobile').textContent=data.unseenmsg;            
            document.getElementById('inb-wrapper-mobile').style.display='flex';
            }
          }
          else{
            if(document.getElementById('inb-wrapper'))
              document.getElementById('inb-wrapper').style.display='none';
            if(document.getElementById('inb-wrapper-mobile'))
              document.getElementById('inb-wrapper-mobile').style.display='none';
          }
          return data;
        } else {
          return Promise.reject(data);
        }
      }
    );
  };
  
  export const uploadImage = (file) => {
    const data = new FormData();
    console.log("Compressed size--->",file.size,"bytes");
    data.append("file", file);
    data.append("upload_preset", "complaintlodgeriitr");
    
  
    return fetch(process.env.REACT_APP_UPLOAD_URL, {
      method: "POST",
      body: data,
    }).then((res) => res.json());
  };

//utility function for showing timestamp on post
export const timeSince = (timestamp,short) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  
    let interval = Math.floor(seconds / 31536000); //make into year
  
    if (interval > 1) {
      return !short?interval + " years":interval + "y";
    }
  
    interval = Math.floor(seconds / 2592000); //make into months
    if (interval > 1) {
      return !short?interval + " months":interval + "mon";
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
  // ${process.env.REACT_APP_BACKEND_URL}${endpoint}
    return fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, config).then(
      async (res) => {
        const data = await res.json();
  
        if (res.ok) {
          return data;
        } else {
          return Promise.reject(data);
        }
      }
    );
  };
  
  export const uploadImage = (file) => {
    const data = new FormData();
    data.append("file", file);
    //Add your preset here....   data.append("upload_preset", "<YOUR_UPLOAD_PRESET");    
  
    return fetch(`${process.env.REACT_APP_UPLOAD_URL}`, {
      method: "POST",
      body: data,
    }).then((res) => res.json());
  };

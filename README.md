# csn-291

## To use it on localhost

Open up your terminal and clone the repo

### `git clone https://github.com/kanhaiya-2000/csn-291.git`

After cloning is done successfully.<br />
Navigate to csn-291 folder and run the command

### `npm install`

This will install required dependencies for server part.<br />
Navigate to the client directory and run

### `npm install`

For installing all required client dependencies.

### Set up .env file

**Including 2 .env file is mandatory before running it.**

content of client .env can be(To be added at client route)

```javascript
REACT_APP_BACKEND_URL="http://localhost:55000"  //here take care of your operating system.
REACT_APP_UPLOAD_URL="https://api.cloudinary.com/v1_1/<YOUR_CLOUD_NAME>/image/upload"
```

head over to [cloudinary.com](https://cloudinary.com) to get your cloud uri.

content of server .env (To be added at the main route)

```javascript
JWT_SECRET="<ANY_STRING>"
JWT_EXPIRE=30d||whatever you wish
MONGOURI="mongodb+srv://<YOUR_MONGO_URI>?retryWrites=true&w=majority"
```
Finally,create a new gmail account and configure it to allow for less secure app<br/>
Replace user and pass fields in the files [auth.js](/controllers/auth.js) and [user.js]<br/> with your gmail address and its password<br/>The existing password has been changed so dont use it.

After this head over to the main route and <br/>
run each command in 2 separate windows of terminal 

```bash
nodemon server
npm run dev
```

After few seconds,you will be automatically taken to localhost:3000.<br/>
You can now login using your gsuite email id.


const jwt = require("jsonwebtoken");
const Userdb = require("../models/User");

exports.Verify = async (req, res, next) => {
    let token;
    
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next({
            message: "Please login to continue further",//redirect to login
            statusCode: 403,
            logout:"true"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);        
        const User = await Userdb.findById(decoded.id).select("-password");
        //console.log('\nuser',User);
            if (!User) {
                return next({ message: `No User found for ID ${decoded.id} and tempid ${decoded.tempid}`,logout:true });
            }
            if(User.tempid!=decoded.tempid){
                return next({
                    message:"Your session expired.Please login again",
                    logout:true
                })
            }
            //console.log("Verify",User);
            req.user = User;                    
            next();
                
    } catch (err) {
        next({
            message: err.message,//redirect to login on frontend
            statusCode: 403,
        });
    }
};
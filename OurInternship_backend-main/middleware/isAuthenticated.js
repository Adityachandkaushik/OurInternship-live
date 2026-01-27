//middleware work between request and response

import jwt from "jsonwebtoken";

const isAuthenticated=async(req,res,next)=>{
    try {   
        const token=req.cookies.token;
        if(!token){
            return res.status(401).json({
                message:"Unauthorized Access ",
                success:false
            })
        }
        const decode= jwt.verify(token,process.env.SECRET_KEY);
        if(!decode){
            return res.status(401).json({
                message:"Invalid Token",
                success:false
            })
        }
        req.id=decode.userId;
        next(); 
        
        //sending forward to route
    } catch (error) {
       console.log("validation error"+error) 
    }
}
export default isAuthenticated;
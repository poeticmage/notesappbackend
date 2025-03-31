import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import { Octokit } from "@octokit/core"; //git gist documentations
import cors from "cors";//To handle different server request
import { tokenT, gst1, gst2 } from "./config.js";

//start

const app=express();
// app.listen(3000,()=>{
//     console.log("started");
// });
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());//For handling different server
const router=app.Router();

router.get("/login",async (req,res)=>{

    var GIVENPASSWORD=req.query.password;
    var GIVENNAME=req.query.username; 
    //Fetch The Request, update username and password checks in the following
  
    try{
     const infor=await axios.get(`https://api.github.com/gists/${gst1}`, {
        headers:{
            Authorization: `token ${tokenT}`,
             "Cache-Control": "no-cache",
            "If-None-Match": "" // Force fresh fetch
         }

     })
const fileKey = Object.keys(infor.data.files).find(key => key.endsWith(".json"));
const info= JSON.parse(infor.data.files[fileKey].content);
     const ans=(info).users; 
     
     if(GIVENNAME in ans) {
        const pass=ans[GIVENNAME];
        if(pass===GIVENPASSWORD){ //password matches
            const userid=GIVENNAME+pass;
            const userdataF=await axios.get(`https://api.github.com/gists/${gst2}`,{
                headers:{
                    Authorization: `token ${tokenT}`,
                     "Cache-Control": "no-cache",
                     "If-None-Match": "" // Force fresh fetch
                     }
            })
const fileKeyF = Object.keys(userdataF.data.files).find(key => key.endsWith(".json"));
const userdata=JSON.parse(userdataF.data.files[fileKeyF].content);
            const note=userdata.users[userid];
            res.send({"username":GIVENNAME,"password":pass,"userid":userid,"note":note});

        }
        else res.send({"username":"","password":"","userid":"","note":[]}); //password doesn't match/username already taken
     }
     else{
        //New Account unique  username and username + password
        const newusername=GIVENNAME;
        const newpassword=GIVENPASSWORD;
        const newuserid=newusername+newpassword;
        ans[newusername] = newpassword;

       
        // Patching new ccount to gist
        const octokit = new Octokit({
            auth: tokenT
          })
          
          await octokit.request('PATCH /gists/{gist_id}', {
            gist_id: gst1,
            description: 'user updated',
            files: {
                "users.json": {
                    content: JSON.stringify({ users: ans }, null, 2)
                }
            },
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          })
        //
        res.send({"username":newusername,"password":newpassword,"userid":newuserid,"note":[]});

     }
    }
    catch(e){
        console.error(e);
    }
});




export default router;

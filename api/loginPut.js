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
const router=express.Router();



//put request  to jsonbin to be done with queue handling...
const queue=[];//first in first serve os...
let wait=false;


async function waitHandling() {
    if(wait||queue.length===0) return; //wait or done...
    wait=true;
    const {req,res}=queue.shift();

    const username=req.params.username;
    const userdata=req.body; 
            //to ensure the latest cache free version is uploaded, gist has cache problems...
           const infor=await axios.get(`https://api.github.com/gists/${gst1}`, {
           headers:{
               Authorization: `token ${tokenT}`,
                "Cache-Control": "no-cache",
               "If-None-Match": "" // Force fresh fetch
            }
        })
  const fileKey = Object.keys(infor.data.files).find(key => key.endsWith(".json"));
const info=JSON.parse(infor.data.files[fileKey].content);
    const password=info.users[username];
    const uid=username+password;
    const usersdsF=await axios.get(`https://api.github.com/gists/${gst2}`,{
        headers:{
            Authorization: `token ${tokenT}`,
             "Cache-Control": "no-cache",
              "If-None-Match": "" // Force fresh fetch
             }
    })
    const fileKeyF = Object.keys(usersdsF.data.files).find(key => key.endsWith(".json"));
const usersds=JSON.parse(usersdsF.data.files[fileKeyF].content);
    const fullds= usersds; //console.log(fullds);
    fullds.users[uid]=userdata;

    const octokit2 = new Octokit({
        auth: tokenT
      })
      
      await octokit2.request('PATCH /gists/{gist_id}', {
        gist_id: gst2,
        description: 'user data updated',
        files: {
            "users.json": {
                content: JSON.stringify(fullds, null, 2)
            }
        },
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
      res.send({ message: "Your notes are updated" });

      wait=false;
      waitHandling();
}


router.put("/user/:username", async (req,res)=>{
    console.log("Received request for username: ", req.params.username);
    queue.push({req,res});
    waitHandling();
});
export default (req, res) => {
    app(req, res);  // This is how you tell Vercel to use Express
  };

import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import { Octokit } from "@octokit/core"; //git gist documentations
import cors from "cors";//To handle different server request
import { tokenT, gst1, gst2 } from "./config.js";
import loginget from "./api/loginGet.js";
import loginput from "./api/loginPut.js";

//start

const app=express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());//For handling different server
app.use(cors({ origin: "https://notes-sepia-ten.vercel.app", credentials: true }));

//Requests handling...
app.use('/api/login',loginget);
app.use('/api/user/:username',loginput);

// app.listen(3000,()=>{
//     console.log("started");
// });

export default app;
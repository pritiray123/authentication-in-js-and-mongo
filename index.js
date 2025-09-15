const express = require("express");

const app= express();
const jwt = require("jsonwebtoken");
const JWT_SECRET="jwtsecret";
const mongoose=require("mongoose");

const {userModel,todoModel} = require("./db");
app.use(express.json());
mongoose.connect("mongodb+srv://nede1:bUm2lSyZNIhKC0gj@cluster0.mssdpea.mongodb.net/todo-nede");

app.post("/signup",async (req,res)=>{

    const name = req.body.name;
    const password= req.body.password;
    const email = req.body.email;

   await userModel.create({
        email:email,
        password:password,
        name:name
        
        
    })

    res.json({
        msg:"db updated"
    })

    console.log(userModel);
})

app.post("/login",async (req,res)=>{
    const password= req.body.password;
    const email = req.body.email;

    const user =await userModel.findOne({
        email:email,
        password:password
    })
    console.log(user);

    if(user){
        const token= jwt.sign({
            id:user._id.toString()
        },JWT_SECRET)
        user.token=token;

        res.json({
            token:token
        })
        console.log(token);
    }
    else(
        res.status(403).json({
                msg:"you are not logged in"
        })
    )
    
    
})

function auth(req,res,next){
    const token= req.headers.token;
    const decode = jwt.verify(token,JWT_SECRET);
    if(decode){
        req.userid = decode.id;
        next();
    }
    else{
        res.status(403).send({
            msg:"wrong cred"
        })
    }
}

app.post("/todo",auth,(req,res)=>{
    const userid = req.userid; 
    const title = req.body.title;

    todoModel.create({
        title:title,
        userid
    })
    res.send({
        userid:userid
    })
})


app.get("/todo",auth,async(req,res)=>{
    const userid= req.userid;
    const todo = await todoModel.find({
        userid:userid
    })
    res.send({
        todo
    })
})

app.listen(3000);



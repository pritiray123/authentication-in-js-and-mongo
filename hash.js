const express = require("express");
const bcrypt = require("bcrypt");
const app= express();
const jwt = require("jsonwebtoken");
const JWT_SECRET=process.env.JWT_SECRET;
const mongoose=require("mongoose");
const{z}=require("zod");
const {userModel,todoModel} = require("./db");
app.use(express.json());
mongoose.connect("mongodb+srv://nede1:bUm2lSyZNIhKC0gj@cluster0.mssdpea.mongodb.net/todo-now");

app.post("/signup",async (req,res)=>{

    const reqbody=z.object({
        email:z.string().min(10).max(100).email(),
        name:z.string().min(2).max(20),
        password:z.string().min(8,{message:"pass mst be 8 char long"})
        .regex(/[A-Z]/,{message:"must contain one uppercase"})
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" })
    })

    const parseddata = reqbody.safeParse(req.body);

    if(!parseddata.success){
        res.send({
            msg:"not good to go",
            error:parseddata.error
        })
        return
    }

    const name = req.body.name;
    const password= req.body.password;
    const email = req.body.email;
    //change in signup to get the pass in hashedformat

    let goterr=false;
    try{
    const hashedpass= await bcrypt.hash(password,5);
    console.log(hashedpass);

   await userModel.create({
        email:email,
        password:hashedpass,
        name:name
        
        
    })
    }catch(e){
        if(e===11000){
        res.status(400).send({
            msg:"user exists"

        })}
        else{
            res.status(500).send({
                msg:"something went wrong"
            })
        }

        goterr=true;
    }
    if(!goterr){
    res.json({
        msg:"db updated"
    })}

    // console.log(userModel);
})

app.post("/login",async (req,res)=>{
    const password= req.body.password;
    const email = req.body.email;
    //change in login to get bcrypt pass
    
    const user =await userModel.findOne({
        email:email,
        
    })

    if(!user){
        return res.send({
            msg:"user not found"
        })
    }
    console.log(user);
    //change in login to check and compare bcrypt pass
    const passmatch=await bcrypt.compare(password,user.password)

    if(passmatch){
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



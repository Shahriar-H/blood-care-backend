const express = require("express")
const cors = require("cors");
const connection = require("./config");
const { ObjectId } = require("mongodb");
const http = require('http');
const { Server } = require('socket.io');

const { emailsender } = require("./send_email");
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configuration
// cloudinary.config({ 
//     cloud_name: 'dqljmx6ai', 
//     api_key: '445638554684912', 
//     api_secret: 'UnO629-Pt3xR96MJFGXDhXmXikU' // Click 'View API Keys' above to copy your API secret
// });
// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  



const app = express();

// app.use(cors({
//     origin: "*"
// }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

// Create a new instance of Socket.IO and attach it to the server
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins (CORS)
        methods: ['GET', 'POST'],
    },
});

// Functions


const isFoundDuplicate = async ({ table, query }) => {
    const db = await connection();
    const result = await db.collection(table).find(query).toArray();
    // console.log(result, table, query);
    
    if (result?.length > 0) {
        // already exist
        return true;
    }
    // not found duplicate email or phone
    return false;
};
//functions

app.get("/",(req,res)=>{
    io.emit("Notification","Hello")
    res.send("Started")

})

const insertNotification = async (data) => {
    const db = await connection();
    console.log("data",data);
    
    const result = await db.collection("notifications").insertOne({...data, created_at: new Date().getTime() });
    console.log(result);
    
};




app.post("/insert-item", async (req, res) => {
    try {
        const { data, table } = req?.body;
        if (table === 'users') {
            // Await the isFoundDuplicate function
            const isDuplicate = await isFoundDuplicate({ query: {
                $or: [
                    { email: data?.email },
                    { phone: data?.phone }
                ]
            }, table });

            if (isDuplicate) {
                return res.send({ status: 203, message: "Email or Phone Already Exist" });
            }
        }

        

        const db = await connection();
        const result = await db.collection(table).insertOne({ ...data, created_at: new Date().getTime() });

        if(table==='blood_requests'){
            insertNotification({...data,title:"Blood Request",id:result?.insertedId})
            io.emit("Notification",`New Blood Request in ${data?.city}, ${data?.district}`)
        }

        res.send({ status: 200, result, message: "Success!" });
    } catch (error) {
        res.send({ status: 500, error, message: "Not Inserted!" });
    }
});


app.post("/get-item",async (req,res)=>{

    try {
        const {table,query,limit} = req?.body
        const db = await connection()
        let myQuery = query;
        if(query?.id){
            const theid = new ObjectId(query?.id)
            delete query['id']
            myQuery={...query,_id:theid}
        }
        let itemlimit=0;
        if(limit){
            itemlimit=limit
        }

        const result = await db.collection(table).find(myQuery).sort({"_id": -1}).limit(itemlimit).toArray()

        return res.send({status:200,result,message:"Success!"})

    } catch (error) {
        return res.send({status:500,error,message:"Not Fetched!"})
    }
    
})


app.post("/delete-item",async (req,res)=>{

    try {
        const {table,query} = req?.body
        const db = await connection()
        let myQuery = query;
        if(query?.id){
            const theid = new ObjectId(query?.id)
            delete query['id']
            myQuery={...query,_id:theid}
        }
        const result = await db.collection(table).deleteOne(myQuery);
        console.log(result,myQuery);
        
        res.send({status:200,result,message:"Success!"})

    } catch (error) {
        res.send({status:500,error,message:"Not Deleted!"})
    }
    
})


app.post("/update-item",async (req,res)=>{

    try {
        const {data,table,id} = req?.body
        const db = await connection()
        const objId = new ObjectId(id)
        const result = await db.collection(table).updateOne(
            { _id:objId },          // Filter
            { $set: { ...data } }       // Update
          );

        res.send({status:200,result,message:"Success!"})

    } catch (error) {
        res.send({status:500,error,message:"Not Fetched!"})
    }
    
})

app.post("/upload-image",async (req,res)=>{
    const data = req?.file
    console.log(data);
    
    // try {
    //     (async function() {

        
    //         // Upload an image
    //          const uploadResult = await cloudinary.uploader
    //            .upload(
    //             image, {
    //                    public_id: 'shoes',
    //                }
    //            )
    //            .catch((error) => {
    //                console.log(error);
    //            });
            
    //         console.log(uploadResult);
            
    //         // Optimize delivery by resizing and applying auto-format and auto-quality
    //         const optimizeUrl = cloudinary.url('shoes', {
    //             fetch_format: 'auto',
    //             quality: 'auto'
    //         });
            
    //         console.log(optimizeUrl);
            
    //         // Transform the image: auto-crop to square aspect_ratio
    //         const autoCropUrl = cloudinary.url('shoes', {
    //             crop: 'auto',
    //             gravity: 'auto',
    //             width: 500,
    //             height: 500,
    //         });
            
    //         console.log(autoCropUrl);    
    //     })();
    //     // const {data,table} = req?.body
    //     // if(table==='users'){
    //     //     if(isFoundDuplicate({query:{email:data?.email,phone:data?.phone},table})){
    //     //         return res.send({status:203,message:"Email or Phone Already Exist"})
    //     //     }
    //     // }
    //     // const db = await connection()
    //     // const result = await db.collection(table).insertOne({...data, created_at:new Date().getTime()});

    //     // res.send({status:200,result,message:"Success!"})

    // } catch (error) {
    //     res.send({status:500,error,message:"Not Inserted!"})
    // }
    

})

app.post("/sendemail",async (req,res)=>{
    const data = req?.body
   
    //{email,message,subject}
    emailsender(data).catch((err)=>{
        console.log(err);
        
        return res.send({status:500,error:err})
    })
    return res.send({status:200})
})



server.listen(4430,"0.0.0.0",()=>{
    console.log("Server Started");
    
})
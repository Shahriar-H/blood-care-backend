const {MongoClient} = require("mongodb")
const url = "mongodb+srv://shaki:shaki@cluster1.o9bisql.mongodb.net/"
const client = new MongoClient(url)

const db_name = "blood_bd";
let db = null;
const connection = async ()=>{
    if(!db){
        try {
            await client.connect();
            console.log("Connected MongoDb")
            db = client.db(db_name)
        } catch (error) {
            console.log(error);
            
            console.log("Not Connected MongoDb")
        }
    }
    return db;
}

module.exports = connection
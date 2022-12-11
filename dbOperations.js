



var { MongoClient } = require('mongodb');
const { query } = require('express');
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
// var url = 'mongodb://localhost:27017';
var url = 'mongodb+srv://wplproj:lCfJZgawc8WGXVHu@cluster0.sbaukov.mongodb.net/test';
var client = new MongoClient(url);
var dbName = 'apnabnb'


// run the following queries to make mysql compatible with node
//ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'admin'
//flush privileges




const updateDoc = async(collectionName, IdentifierKey, IdentifierValue, attributesToChange) =>{

    try{

        
        
        await client.connect();
        console.log('Connected successfully to server');
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

       
      
      
        let identifier = {}
        identifier[IdentifierKey] = IdentifierValue

    
        
        await collection.updateOne(identifier,
        {$set:{...attributesToChange}},{multi:true})
  

    }
    catch(e){

        console.log("Error in getting list")
        console.log(e)
    }

}

const upsertDoc = async (collectionName, newDoc, key, value) => {

    try{

        
        
        await client.connect();
        console.log('Connected successfully to server');
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        let filter = {}
        filter[key] = value

        await collection.updateOne(filter, 
            {$set: newDoc}, 
            { upsert : true } )
        // await collection.insertOne(newDoc)
        client.close()
  
 

    }
    catch(e){

        console.log("Error in getting list")
        console.log(e)
    }

}


const insertDoc = async (collectionName, newDoc) => {

    try{

        
        
        await client.connect();
        console.log('Connected successfully to server');
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

       
        await collection.insertOne(newDoc)
        // await collection.insertOne(newDoc)
        client.close()
  
 

    }
    catch(e){

        console.log("Error in inserting doc")
        console.log(e)
    }

}


const deleteDoc = async (collectionName, key, value) => {


    try{

        
        
        await client.connect();
        console.log('Connected successfully to server');
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        let query = {}
        query[key] = value

        await collection.deleteMany(query)
        client.close()
  
 

    }
    catch(e){

        console.log("Error in getting list")
        console.log(e)
    }


}

const getFilteredList = async (collectionName, key, value) => {

    try{

        
        value = parseInt(value)
        await client.connect();
        console.log('Connected successfully to server');
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        let query = {}
        query[key] = value
        const findResult = await collection.find(query).toArray()
        client.close()
  
    // the following code examples can be pasted here...
        console.log("#######")
        console.log(typeof key)
        console.log(typeof value)
        console.log(query)
        console.log(findResult)
        return findResult;

    }
    catch(e){

        console.log("Error in getting list")
        console.log(e)
    }

}

const getDoc = async (collectionName, key, value) =>{



    return new Promise(async (resolve, reject) => {


        try{

        
            value = parseInt(value)
            await client.connect();
            console.log('Connected successfully to server');
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
    
            let query = {}
            query[key] = value
            
            collection.findOne(query, (err, item) => {
    
                console.log("########")
                console.log(query)
                
                
                client.close()

                resolve(item)
            })
            
      
        // the following code examples can be pasted here...
           
    
        }
        catch(e){
    
            console.log("Error in getting list")
            reject(e)
            console.log(e)
        }

    })
    

}

const getList = async (colletionName) => {

    try{

        await client.connect();
        console.log('Connected successfully to server');
        const db = client.db(dbName);
        const collection = db.collection(colletionName);
        const findResult = await collection.find({}).toArray();
        client.close()
  
    // the following code examples can be pasted here...
        console.log("#######")
        console.log(findResult)
        return findResult;

    }
    catch(e){

        console.log("Error in getting list")
        console.log(e)
    }
    
  
  }









module.exports = {getList, getDoc, upsertDoc, updateDoc, deleteDoc, getFilteredList, insertDoc}


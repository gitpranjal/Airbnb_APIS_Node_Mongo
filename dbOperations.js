
const { query } = require('express');
const mysql = require('mysql');

// run the following queries to make mysql compatible with node
//ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'admin'
//flush privileges

const createConnection = async () => {
    let con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "admin123",
        database : 'testDB'
      });

      return new Promise((resolve, reject) => {
    
            try{

                con.connect(function(err) {
                    if (err) throw err;
                    console.log("Connected!");
    
                  });
    
                resolve(con)

            }
            catch(e){
                reject(e)
            }
            
  
      })
      
}


const createTables = async () => {
    // Function to return the sentiment analysis object for any text string
    return new Promise((resolve, reject) => {
        
        try{
            console.log("Will create tables")
            resolve("Created tables")
        }
        catch(e){
            console.log("###### Error in creating Tables ######")
            reject(e)
        }
    })

}

const updateTables = async (operationType, query) => {
    // Function to split a text into sentences and return an object containing comparitive sentiment score mapped against the sentence
    return new Promise((resolve, reject) => {
        try{
            console.log(query, " Query will be executed")
            resolve(1)
        }
        catch(e){
            reject(e)
        }
    })

}

const executeQuery = async (query) => {
    return new Promise(async (resolve, reject) => {

        try {
            databaseConnection = await createConnection()
            databaseConnection.query(query, function (err, result) {
             if(err) throw err

            console.log("Database testDB created");
            console.log(result)
            resolve(result)
              });
        }
        catch(e){
            reject(e)
        }
    })
    
}


executeQuery("select * from Persons;")
.then((result) => {
    console.log("########## Got the data ############")
    console.log(result)
})
.catch((e) => {
    console.log("###### Error ##########")
    console.log(e)
})

//module.exports = {updateTables}


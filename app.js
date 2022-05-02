const {updateTables, executeQuery} = require("./dbOperations")

const express = require("express")
const multer = require('multer')
const path = require('path')
const bodyParser = require("body-parser")
const fs = require('fs').promises
const { request } = require("http")
const { response } = require("express")
const res = require("express/lib/response")
const { exec } = require("child_process")
const cors = require('cors')


const hostname = "0.0.0.0"
const port =  process.env.PORT || 3000

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs')

const upload = multer({ dest: './uploads/' })

let loggedInUserObject = {}

app.use(cors({
    origin: '*'
}));

app.get("/", (request, response) => {
    response.render("tableCreation.html")
})

app.post("/login", async (request, response) => {

    let inputObject = request.body
    let username = inputObject.username
    let password = inputObject.password
    
    console.log("#######Request Object ###########")
    console.log(inputObject)

    let databaseUserMatchList = await executeQuery(`select * from users where Username="${username}" and Password="${password}"`)
    console.log("############# databaseMatchList ###########", databaseUserMatchList)

    if (databaseUserMatchList.length == 0)
        response.json({loginStatus: false})
    else
    {
        loggedInUserObject = databaseUserMatchList[0]
        //response.json({loginStatus: true})
        response.redirect("/userInfoPage")
    }

    
})

app.get("/userInfoPage", async (request, response) => {

    
    let databaseUserMatchList = await executeQuery(`select * from users where Username="${loggedInUserObject.Username}" and Password="${loggedInUserObject.Password}"`)
    let currentUserInfo = databaseUserMatchList[0]

    response.json(currentUserInfo)


})

app.get("/flightDetails", async (request, response) => {

    
    let flightList = await executeQuery(`select * from Flight`)
   
    response.json(flightList)


})

app.get("/announcements", async (request, response) => {

    
    let announcementList = await executeQuery(`select * from Announcement`)
   
    response.json(announcementList)


})

app.post("/addUser", async (request, response) => {

    let inputObject = request.body
    if (inputObject == null)
    {
        response.send({"updationStatus": "Failed", "message": "No updation object specified"})
        return
    }

    if(inputObject.SSN == null)
    {
        response.send({"updationStatus": "Failed", "message": "SSN not supplied"})
        return
    }

    let userListWithProvidedSSN = await executeQuery(`select * from Users where SSN=${inputObject.SSN}`)

    

    if(userListWithProvidedSSN.length != 0)
    {
        console.log("SSN already present")
        response.send({"updationStatus": "Failed", "message": "SSN already present"})
        return
    }


    

    try{

       await  executeQuery(`insert into Users (SSN, Password, Address, Phoneno, Fname, Mname, Lname, Username, UserType)
                        values (${inputObject.SSN},
                             "${inputObject.Password}", 
                             "${inputObject.Address}", 
                             ${inputObject.Phoneno},
                             "${inputObject.Fname}",
                             "${inputObject.Mname}",
                             "${inputObject.Lname}",
                             "${inputObject.Username}",
                             "${inputObject.UserType}")`  
                        )

 
response.send({"updationStatus": "Success"})
return

    }
   catch(e){

       console.log("########## Couldn't update ##########")
       console.log(e)
       response.send({"updationStatus": "Failed", "message": "An error occured"})
   }
   
})

app.post("/deleteUser", async(request, response) => {

    let inputObject = request.body

    if(inputObject.SSN == null)
    {
        response.send({"updationStatus": "Failed", "message": "SSN not supplied"})
        return
    }

    try{

        await executeQuery(`delete from Users where SSN = ${inputObject.SSN};`)

        response.send({"updationStatus": "Success"})

    }
   catch(e){

       console.log("########## Couldn't delete ##########")
       console.log(e)
       response.send({"updationStatus": "Failed", "message": "An error occured"})
   }
    
})

app.post("/updateUserInfo", async (request, response) => {

    let inputObject = request.body

    if(inputObject.SSN == null)
    {
        response.send({"updationStatus": "Failed", "message": "SSN not supplied"})
        return
    }

    if (inputObject.updatedInfoObject == null)
    {
        response.send({"updationStatus": "Failed", "message": "No updation object specified"})
        return
    }
    
    let userObjectBeforeUpdation = await executeQuery(`select * from Users where SSN=${inputObject.SSN}`)

    
    userObjectBeforeUpdation = userObjectBeforeUpdation[0]
    console.log("########## User info before updation #########")
    console.log(userObjectBeforeUpdation)


    let updatedInfoObject = inputObject.updatedInfoObject
    // let adminSSNList = await executeQuery("select A_Ssn from Admins")
    // adminSSNList = adminSSNList.map((adminObj) => {return adminObj.A_Ssn})
    // let isCurrentUserAdmin = false

    // for(let ssn of adminSSNList)
    // {
    //     if(loggedInUserObject.SSN == ssn)
    //         isCurrentUserAdmin = true

    // }



    try{

        executeQuery(`update Users set SSN=${updatedInfoObject.SSN != null ? updatedInfoObject.SSN : userObjectBeforeUpdation.SSN},
        Password="${updatedInfoObject.Password != null ? updatedInfoObject.Password : userObjectBeforeUpdation.Password}",
        Address="${updatedInfoObject.Address != null ? updatedInfoObject.Address : userObjectBeforeUpdation.Address}",
        Phoneno=${updatedInfoObject.Phoneno != null ? updatedInfoObject.Phoneno : userObjectBeforeUpdation.Phoneno},
        Fname="${updatedInfoObject.Fname != null ? updatedInfoObject.Fname :userObjectBeforeUpdation.Fname}",
        Mname="${updatedInfoObject.Mname != null ? updatedInfoObject.Mname : userObjectBeforeUpdation.Mname}",
        Lname="${updatedInfoObject.Lname != null ? updatedInfoObject.Lname : userObjectBeforeUpdation.Lname}",
        Username="${updatedInfoObject.Username != null ? updatedInfoObject.Username : userObjectBeforeUpdation.Username}",
        UserType="${updatedInfoObject.UserType != null ? updatedInfoObject.UserType : userObjectBeforeUpdation.UserType}"
        where SSN = ${inputObject.SSN};
    `)

    if(loggedInUserObject.SSN == null || loggedInUserObject.SSN == inputObject.SSN)
        loggedInUserObject = inputObject.updatedInfoObject

response.send({"updationStatus": "Success"})

    }
   catch(e){

       console.log("########## Couldn't update ##########")
       console.log(e)
       response.send({"updationStatus": "Failed", "message": "An error occured"})
   }
   
    

})



app.get("/getUserList", async (request, response) => {

    let userList = await executeQuery("select * from users");
    // let userNames = userList.map((userObj) => {return userObj.Fname});
    // console.log("###### user Names ########")
    // console.log(userNames)
    response.send(userList)
})







module.exports = {app: app, port: port, hostname: hostname}

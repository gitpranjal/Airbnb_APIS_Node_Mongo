const {getList, getDoc, getDocMultivalue, getDocSorted, upsertDoc, updateDoc, deleteDoc, getFilteredList, insertDoc, upsertDocMultifilter} = require("./dbOperations")

const express = require("express")
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const multer = require('multer')
const path = require('path')
const bodyParser = require("body-parser")
const moment = require("moment")


const cors = require('cors')
const { request } = require("http")
const { response } = require("express")


const hostname = "0.0.0.0"
const port =  process.env.PORT || 3000



const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs')
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "ashd23874@*&^#iadgv",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
app.use(cookieParser());

const upload = multer({ dest: './uploads/' })

let loggedInUserObject = {}

app.use(cors({
    origin: '*'
}));

const reviewRouter = require('./routes/reviews/reviewRoutes');
const userRouter = require('./routes/userops/userRoutes');
const wishlistRouter = require('./routes/wishlist/wishlistRoutes');
const reservationRouter = require('./routes/reservations/reservationRoutes');
app.use('/reviews', reviewRouter);
app.use('/user', userRouter);
app.use('/wishlist', wishlistRouter);
app.use('/reservation', reservationRouter);

// app.get("/", (request, response) => {
//     response.render("tableCreation.html")
// })

app.get("/", async (request, response) => {
    
    let list = await getList('properties');
    response.json(list)
})

app.get("/getProperties", async (request, response) => {
    
    let list = await getList('properties');
    response.json(list)
})


app.post("/updateProperty", async (request, response) => {
    
    // let list = await getList('properties');
    let inputObject = request.body

    if(typeof inputObject.propertyID == "undefined" || inputObject.propertyID ==  null) 
    {
        response.send("PropertyID not found")
        return
    }

    let IdentifierKey = 'propertyID'
    let IdentifierValue = inputObject['propertyID']
    let attributesToChange = {...inputObject}
    delete attributesToChange['propertyID']

    await updateDoc('properties', IdentifierKey, IdentifierValue, attributesToChange)
    response.send("Property updated sucessfully")
    
})


app.get("/getPropertyDetails", async (request, response) => {
    
    // let list = await getList('properties');
    let property = await getDoc('properties', 'propertyID', request.query.propertyID)
    response.json(property)
    
    
})


app.post("/addProperty", async (request, response) => {

    let inputObject = request.body

    if(typeof inputObject.hostID == "undefined" || inputObject.hostID ==  null) 
    {
        response.send("Invalid entry. host Id not found")
        return
    }

    if(typeof inputObject.propertyID == "undefined" || inputObject.propertyID ==  null) 
    {
        response.send("Invalid entry. propertyId Id not found")
        return
    }
    

    try{
        let key = 'propertyID'
        let value = parseInt(inputObject.propertyID)
        await upsertDoc('properties', inputObject, key, value)
        // await upsertDoc('properties', inputObject)
        response.send("Property added added successfully")
    }
    catch(e){

      console.log(e)
      response.send("Could't insert new document")
    }
        
})


app.get("/deleteProperty", async (request, response) => {
    
    // let list = await getList('properties');
    let userID = request.session.userID
    let host = request.session.host
    if(typeof userID == "undefined" || userID ==  null || host ==  "undefined" || host ==  null) {
        response.send("Not logged in or not host")
        return
    }
    if(typeof request.query.propertyID == "undefined" || request.query.propertyID ==  null) 
    {
        response.send("Invalid request. Property Id not found")
        return
    }
    let propertyID = parseInt(request.query.propertyID)
    await deleteDoc('properties', {'propertyID':propertyID})
    response.send("Property deleted sucessfully")
    
    
})

module.exports = {app: app, port: port, hostname: hostname}

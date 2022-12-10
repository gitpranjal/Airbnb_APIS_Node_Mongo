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
app.use('/reviews', reviewRouter);
app.use('/user', userRouter);

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




app.post("/getUserWishList", async (request, response) => {

    let userID = request.session.userID

    if(typeof userID == "undefined" || userID ==  null) 
    {
        response.send("Invalid request. UserID Id not found")
        return
    }

    let userWishList = await getFilteredList('wishlist', 'userID', userID)
    response.json(userWishList)


})


app.get("/getWishlistDetails", async (request, response) => {

    
    let wishlistID = request.query.wishlistID

    if(typeof wishlistID == "undefined" || wishlistID ==  null) 
    {
        response.send("Invalid request. wishlistID Id not found")
        return
    }

    let wishlistDetails = await getFilteredList('wishlistitems', 'wishlistID', wishlistID)
    response.json(wishlistDetails)


})

app.post("/addPropertyToWishlist", async (request, response) => {

    let {propertyID, wishlistID} = request.body


    if(typeof propertyID == "undefined" || propertyID ==  null) 
    {
        response.send("Invalid request. propertyID Id not found")
        return
    }

    if(typeof wishlistID == "undefined" || wishlistID ==  null) 
    {
        response.send("Invalid request. wishlistID Id not found")
        return
    }

    let wishlistDetails = await getFilteredList('wishlistitems', 'wishlistID', wishlistID)

    for(let wishListObj of wishlistDetails)
    {
        if(wishListObj.propertyID == propertyID)
        {
            response.status(400).send({"message": "property already exists"})
            return
        }
    }


    try{
    
        await insertDoc('wishlistitems', request.body)
        response.send("Reservation added successfully")
    }
    catch(e){

      console.log(e)
      response.send("Could't insert new reservation")
    }

})


app.post("/addWishList", async (request, response) => {
    
    // let list = await getList('properties');
    let inputObject = request.body
    

    if(typeof wishlistID == "undefined" || wishlistID ==  null) 
    {
        response.send("Invalid request. wishlistID Id not found")
        return
    }

    if(typeof userID == "undefined" || userID ==  null) 
    {
        response.send("Invalid request. UserID Id not found")
        return
    }

    if(typeof wishListName == "undefined" || wishListName ==  null) 
    {
        response.send("Invalid request. wishListName Id not found")
        return
    }

    inputObject["createDate"] = moment().moment().format('MMMM Do YYYY, h:mm:ss a')

    try{
        let key = 'wishlistID'
        let value = parseInt(inputObject.wishlistID)
        await upsertDoc('wishlist', inputObject, key, value)
        // await upsertDoc('properties', inputObject)
        response.send("Wishlist added successfully")
    }
    catch(e){

      console.log(e)
      response.send("Could't insert new wishlist")
    }
    
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

app.post("/updateReservation", async (request, response) => {
    
    // let list = await getList('properties');
    let inputObject = request.body

    if(typeof inputObject.reservationId == "undefined" || inputObject.reservationId ==  null) 
    {
        response.send("Reservation ID not found")
        return
    }

    let IdentifierKey = 'reservationId'
    let IdentifierValue = inputObject['reservationId']
    let attributesToChange = {...inputObject}
    delete attributesToChange['reservationId']

    await updateDoc('reservations', IdentifierKey, IdentifierValue, attributesToChange)
    response.send("Reservation updated sucessfully")
    
})


app.get("/getPropertyDetails", async (request, response) => {
    
    // let list = await getList('properties');
    let property = await getDoc('properties', 'propertyID', request.query.propertyID)
    response.json(property)
    
    
})

app.get("/getReservationDetails", async (request, response) => {
    
    // let list = await getList('properties');
    let property = await getDoc('reservations', 'reservationId', request.query.reservationId)
    response.json(property)
    
    
})

app.post("/addReservation", async (request, response) => {

    let inputObject = request.body
    let userID = request.session.userID
    inputObject.userID = userID
    if(typeof userID == "undefined" || userID ==  null) {
        response.send("Not logged in")
        return
    }
    if(typeof inputObject.reservationId == "undefined" || inputObject.reservationId ==  null) 
    {
        response.send("Invalid entry. Reservation Id not found")
        return
    }

    if(typeof inputObject.propertyID == "undefined" || inputObject.propertyID ==  null) 
    {
        response.send("Invalid entry. property Id not found")
        return
    }
    if(typeof inputObject.hostID == "undefined" || inputObject.hostID ==  null) 
    {
        response.send("Invalid entry. host Id not found")
        return
    }
    
    try{
        let key = 'reservationId'
        let value = parseInt(inputObject.reservationId)
        await upsertDoc('reservations', inputObject, key, value)
        response.send("Reservation added successfully")
    }
    catch(e){

      console.log(e)
      response.send("Could't insert new document")
    }
        
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

app.get("/deleteReservation", async (request, response) => {
    
    // let list = await getList('properties');
    let userID = request.session.userID
    if(typeof userID == "undefined" || userID ==  null) {
        response.send("Not logged in")
        return
    }
    if(typeof request.query.reservationId == "undefined" || request.query.reservationId ==  null) 
    {
        response.send("Invalid request. Reseravtion Id not found")
        return
    }
    let reservationId = parseInt(request.query.reservationId)
    await deleteDoc('reservation', {'reservationId':reservationId,"userID":userID})
    response.send("Reservation deleted sucessfully")
    
    
})


module.exports = {app: app, port: port, hostname: hostname}

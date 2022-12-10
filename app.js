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

app.post("/login", async (request, response) => {
    
    let emailID = request.body.emailID
    let password = request.body.pass

    if(typeof emailID == "undefined" || emailID ==  null || password ==  "undefined" || password ==  null) 
    {
        response.send("Enter emailID and password")
        return
    }

    q ={}
    q['emailID'] = emailID
    q['password'] = password

    let user = await getDocMultivalue('users', q)
    if (user){
        request.session.userID = user.userId
        if(user.isHost == true){
            request.session.host = true
        }
        response.send(request.session)
    }else{
        response.send("Incorrect Id and Pass")
    }
    
})

app.post("/register", async (request, response) => {
    
    let emailID = request.body.emailID
    let password = request.body.pass
    let name = request.body.name
    let ishost = false

    if(typeof name == "undefined" || name ==  null || typeof emailID == "undefined" || emailID ==  null || password ==  "undefined" || password ==  null) {
        response.send("Enter emailID, password and name")
        return
    }

    let existingUser = await getDocMultivalue('users',{'emailID':emailID})
    if(existingUser){
        response.send("User already exists")
        return
    }

    valuestoupdate = {
        "emailID":emailID,
        "password":password,
        "isHost":ishost,
        "createDate":new Date().getTime()/1000,
        "isVerified":true
    }

    // get last userid to update - 
    let result = await getDocSorted('users',{},{'userId':-1},1)
    result.forEach(user => {
         lastuser = user.userId
    });
    
    let newUserId = lastuser + 1

    valuestoupdate["userId"] = newUserId

    await upsertDoc('users', valuestoupdate, "emailID", emailID)
    request.session.userID = newUserId
    response.send(request.session)
})

app.post("/becomehost", async (request, response) => {
    let userID = request.session.userID
    let dob = request.body.dob
    let phoneNumber = request.body.phoneNumber
    let ssn = request.body.ssn
    let address = request.body.address

    if(typeof userID == "undefined" || userID ==  null) 
    {
        response.send("Not logged in")
        return
    }
    if(typeof ssn == "undefined" || ssn ==  null) 
    {
        response.send("ssn is mandatory")
        return
    }
    update = {"DOB":dob, "phoneNumber":phoneNumber, "isHost":true}
    await upsertDoc('users', update, "userId", userID)
    // get last userid to update - 
    let result = await getDocSorted('hosts',{},{'hostID':-1},1)
    result.forEach(host => {
         lasthost = host.hostID
    });
    let newhostId = lasthost + 1
    await upsertDoc('hosts', {"ssn":ssn, "hostID":newhostId, "address":address}, "userID", userID)
    response.send("Congrats. kamale paisa")
})

app.post("/logout", async (request, response) => {
    request.session.destroy(function(err) {
        if(err) {
          console.log(err);
        } else {
            response.send("Logout success")
        }
      });
})

app.post("/addreview", async (request, response) => {
    let userID = request.session.userID
    if(typeof userID == "undefined" || userID ==  null) 
    {
        response.send("Not logged in")
        return
    }
    let propertyID = request.body.propertyID
    let rating = request.body.rating
    let review = request.body.review
    if(typeof propertyID == "undefined" || propertyID ==  null || typeof rating == "undefined" || rating ==  null || review ==  "undefined" || review ==  null) {
        response.send("Enter review, rating and property")
        return
    }
    valuestoupdate = {
        "userID":userID,
        "propertyID":propertyID,
        "rating":rating,
        "review":review
    }
    let result = await getDocSorted('feedbacks',{},{'reviewID':-1},1)
    result.forEach(review => {
         lastreview = review.reviewID
    });
    reviewID = lastreview + 1
    valuestoupdate["reviewID"]=reviewID
    await upsertDocMultifilter('feedbacks', valuestoupdate, {"userID":userID,"propertyID":propertyID})
    response.send("Reviewed successfully")
})

app.get("/getReviews", async (request, response) => {
    let propertyID = parseInt(request.query.propertyID)
    let list = await getFilteredList('feedbacks',"propertyID",propertyID);
    response.json(list)
})









module.exports = {app: app, port: port, hostname: hostname}

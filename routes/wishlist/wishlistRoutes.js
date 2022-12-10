const { request, response } = require('express');
const express = require('express');
const {getList, getDoc, getDocMultivalue, getDocSorted, upsertDoc, updateDoc, deleteDoc, getFilteredList, insertDoc, upsertDocMultifilter} = require("../../dbOperations")

const wishlistRouter = express.Router();

wishlistRouter.get("/user", async (request, response) => {

    let userID = request.session.userID

    if(typeof userID == "undefined" || userID ==  null) {
        response.send("Not logged in")
        return
    }

    let userWishList = await getFilteredList('wishlist', 'userID', userID)
    response.json(userWishList)
})


wishlistRouter.get("/item", async (request, response) => {

    
    let wishlistID = request.query.wishlistID
    let userID = request.session.userID

    if(typeof userID == "undefined" || userID ==  null) {
        response.send("Not logged in")
        return
    }

    if(typeof wishlistID == "undefined" || wishlistID ==  null) {
        response.send("Invalid request. wishlistID Id not found")
        return
    }

    let wishlistDetails = await getDocMultivalue('wishlistitems', {'wishlistID':parseInt(wishlistID),"userID":userID})
    response.json(wishlistDetails)

})

wishlistRouter.post("/item", async (request, response) => {

    let userID = request.session.userID

    if(typeof userID == "undefined" || userID ==  null) {
        response.send("Not logged in")
        return
    }

    let {propertyID, wishlistID} = request.body


    if(typeof propertyID == "undefined" || propertyID ==  null) {
        response.send("Invalid request. propertyID Id not found")
        return
    }

    if(typeof wishlistID == "undefined" || wishlistID ==  null) {
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
        response.send("Property added to wishlist succesfully")
    }
    catch(e){

      console.log(e)
      response.send("Could't insert new reservation")
    }

})

wishlistRouter.delete("/item", async (request, response) => {
    let userID = request.session.userID

    if(typeof userID == "undefined" || userID ==  null) {
        response.send("Not logged in")
        return
    }
    let propertyID = request.query.propertyID
    let wishlistID = request.query.wishlistID
    if(typeof propertyID == "undefined" || propertyID ==  null) {
        response.send("Invalid request. propertyID Id not found")
        return
    }

    if(typeof wishlistID == "undefined" || wishlistID ==  null) {
        response.send("Invalid request. wishlistID Id not found")
        return
    }
    await deleteDoc("wishlistitems",{'wishlistID':parseInt(wishlistID),"propertyID":parseInt(propertyID)})
    response.send("Property deleted from wishlist succesfully")
})


wishlistRouter.post("/create", async (request, response) => {
    
    // let list = await getList('properties');
    let userID = request.session.userID

    if(typeof userID == "undefined" || userID ==  null) {
        response.send("Not logged in")
        return
    }
    let wishListName = request.body.wishListName
    
    if(typeof wishListName == "undefined" || wishListName ==  null) {
        response.send("Invalid request. wishListName not found")
        return
    }

    let result = await getDocSorted('wishlist',{},{'wishlistID':-1},1)
    result.forEach(wishlist => {
         lastwish = wishlist.wishlistID
    });
    wishlistID = lastwish+1

    valuestoupdate = {
        "userID":userID,
        "wishlistID":wishlistID,
        "wishListName":wishListName,
        "createDate":new Date().getTime()/1000
    }

    try{
        let key = 'wishlistID'
        let value = parseInt(wishlistID)
        await upsertDoc('wishlist', valuestoupdate, key, value)
        // await upsertDoc('properties', inputObject)
        response.send("Wishlist added successfully")
    }
    catch(e){

      console.log(e)
      response.send("Could't insert new wishlist")
    }
    
})



module.exports = wishlistRouter;
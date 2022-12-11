const express = require('express');
const {getList, getDoc, getDocMultivalue, getDocSorted, upsertDoc, updateDoc, deleteDoc, getFilteredList, insertDoc, upsertDocMultifilter} = require("../../dbOperations")
// Generate a salt
const propertyRouter = express.Router();

propertyRouter.get("/all", async (request, response) => {
    let list = await getList('properties');
    response.json(list)
})


propertyRouter.post("/update", async (request, response) => {
    
    // let list = await getList('properties');
    let userID = request.session.userID
    let host = request.session.host
    if(typeof userID == "undefined" || userID ==  null || host ==  "undefined" || host ==  null) {
        response.send("Not logged in or not host")
        return
    }
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


propertyRouter.get("/details", async (request, response) => {
    
    // let list = await getList('properties');
    let property = await getDoc('properties', 'propertyID', request.query.propertyID)
    response.json(property)
})


propertyRouter.post("/create", async (request, response) => {

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


propertyRouter.delete("/", async (request, response) => {
    
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
    await upsertDocMultifilter('properties', {'propertyID':propertyID,'status':0},{'propertyID':propertyID})
    response.send("Property deleted sucessfully")
    
    
})

module.exports = propertyRouter;

const express = require('express');
const {getList, getDoc, getDocMultivalue, getDocSorted, upsertDoc, updateDoc, deleteDoc, getFilteredList, insertDoc, upsertDocMultifilter} = require("../../dbOperations")
const propertyRouter = express.Router();

propertyRouter.get("/all", async (request, response) => {
    let list = await getList('properties');
    response.json(list)
})


propertyRouter.post("/update", async (request, response) => {
    let host = request.session.host
    if(host ==  "undefined" || host ==  null) {
        response.send("Not logged in or not host")
        return
    }
    let inputObject = request.body

    if(typeof inputObject.propertyID == "undefined" || inputObject.propertyID ==  null) 
    {
        response.send("PropertyID not found")
        return
    }
    let attributesToChange = {...inputObject}
    delete attributesToChange['propertyID']

    await updateDoc('properties',attributesToChange,{'propertyID':parseInt(inputObject.propertyID),'hostID':host})
    response.send("Property updated sucessfully")
    
})


propertyRouter.get("/details", async (request, response) => {
    let property = await getDoc('properties', 'propertyID', request.query.propertyID)
    response.json(property)
})


propertyRouter.post("/create", async (request, response) => {

    let inputObject = request.body
    let host = request.session.host
    if(host ==  "undefined" || host ==  null) {
        response.send("Not logged in or not host")
        return
    }

    let result = await getDocSorted('properties',{},{'propertyID':-1},1)
    result.forEach(property => {
         lastProperty = property.propertyID+1
    });
    try{
        await upsertDocMultifilter('properties', inputObject,{'hostID':host,'propertyID':lastProperty})
        response.send("Property added added successfully")
    }
    catch(e){
        console.log(e)
        response.send("Could't insert new document")
    }    
})


propertyRouter.delete("/", async (request, response) => {
    
    let host = request.session.host
    if(host ==  "undefined" || host ==  null) {
        response.send("Not logged in or not host")
        return
    }
    if(typeof request.query.propertyID == "undefined" || request.query.propertyID ==  null) {
        response.send("Invalid request. Property Id not found")
        return
    }
    let propertyID = parseInt(request.query.propertyID)
    await updateDoc('properties', {'propertyID':propertyID,'status':0},{'propertyID':propertyID, 'hostID':host})
    response.send("Property deleted sucessfully")
})

module.exports = propertyRouter;

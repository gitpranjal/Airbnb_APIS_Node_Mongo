const express = require('express');
const {getList, getDoc, getDocMultivalue, getDocSorted, upsertDoc, updateDoc, deleteDoc, getFilteredList, insertDoc, upsertDocMultifilter} = require("../../dbOperations")

const reservationRouter = express.Router();

reservationRouter.get("/", async (request, response) => {
    let userID = request.session.userID
    if(typeof userID == "undefined" || userID ==  null) {
        response.send("Not logged in")
        return
    }
    let property = await getFilteredList('reservations', 'userID', userID)
    response.json(property)
})

reservationRouter.get("/detail", async (request, response) => {
    let userID = request.session.userID
    let reservationId = request.query.reservationId
    if(typeof userID == "undefined" || userID ==  null) {
        response.send("Not logged in")
        return
    }
    if(typeof reservationId == "undefined" || reservationId ==  null) {
        response.send("Reservation Id not found")
        return
    }
    let property = await getDocMultivalue('reservations', {'reservationId':parseInt(request.query.reservationId),"userID":userID})
    response.json(property)
})

reservationRouter.post("/update", async (request, response) => {
    let userID = request.session.userID
    if(typeof userID == "undefined" || userID ==  null) {
        response.send("Not logged in")
        return
    }
    let inputObject = request.body

    if(typeof inputObject.reservationId == "undefined" || inputObject.reservationId ==  null) 
    {
        response.send("Reservation ID not found")
        return
    }

    let IdentifierValue = parseInt(inputObject['reservationId'])
    let attributesToChange = {...inputObject}
    delete attributesToChange['reservationId']

    await upsertDocMultifilter('reservations', attributesToChange, {'reservationId':IdentifierValue,"userID":userID})
    response.send("Reservation updated sucessfully")
    
})


reservationRouter.post("/create", async (request, response) => {

    let inputObject = request.body
    let userID = request.session.userID
    inputObject.userID = userID
    if(typeof userID == "undefined" || userID ==  null) {
        response.send("Not logged in")
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

    let result = await getDocSorted('reservations',{},{'reservationId':-1},1)
    result.forEach(reservation => {
         lastid = reservation.reservationId
    });

    inputObject.reservationId = lastid + 1
    
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

reservationRouter.delete("/cancel", async (request, response) => {
    let userID = request.session.userID
    if(typeof userID == "undefined" || userID ==  null) {
        response.send("Not logged in")
        return
    }
    if(typeof request.query.reservationId == "undefined" || request.query.reservationId ==  null) {
        response.send("Invalid request. Reseravtion Id not found")
        return
    }
    let reservationId = parseInt(request.query.reservationId)
    await deleteDoc('reservations', {'reservationId':reservationId,"userID":userID})
    response.send("Reservation deleted sucessfully")
})

module.exports = reservationRouter;
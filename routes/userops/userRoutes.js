const express = require('express');
const {getList, getDoc, getDocMultivalue, getDocSorted, upsertDoc, updateDoc, deleteDoc, getFilteredList, insertDoc, upsertDocMultifilter} = require("../../dbOperations")

const userRouter = express.Router();

userRouter.post("/login", async (request, response) => {
    
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

userRouter.post("/register", async (request, response) => {
    
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

userRouter.post("/becomehost", async (request, response) => {
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

userRouter.post("/logout", async (request, response) => {
    request.session.destroy(function(err) {
        if(err) {
          console.log(err);
        } else {
            response.send("Logout success")
        }
      });
})

module.exports = userRouter;

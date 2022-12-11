const express = require('express');
const {getList, getDoc, getDocMultivalue, getDocSorted, upsertDoc, updateDoc, deleteDoc, getFilteredList, insertDoc, upsertDocMultifilter} = require("../../dbOperations")
const crypto = require('crypto');
// Generate a salt
const salt = "c3955ace684b926f54c793c9eadc692d";
const userRouter = express.Router();

userRouter.post("/login", async (request, response) => {
    
    let emailID = request.body.emailID
    let password = request.body.pass

    if(typeof emailID == "undefined" || emailID ==  null || password ==  "undefined" || password ==  null) 
    {
        response.send("Enter emailID and password")
        return
    }

    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    q ={}
    q['emailID'] = emailID
    q['password'] = hash

    let user = await getDocMultivalue('users', q)
    if (user){
        request.session.cookie.userID = user.userId 
        if(user.isHost == true){
            host = await getDocMultivalue('hosts',{'userID':userID})
            if(host){
                request.session.host = host.hostID
            }
        }
        response.status(200).send(request.session)
    }else{
        response.status(401).send("Incorrect Id and Pass")
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
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    valuestoupdate = {
        "emailID":emailID,
        "password":hash,
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
    // get last hostid to update - 
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

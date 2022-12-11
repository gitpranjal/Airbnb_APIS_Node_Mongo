const express = require('express');
const {getList, getDoc, getDocMultivalue, getDocSorted, upsertDoc, updateDoc, deleteDoc, getFilteredList, insertDoc, upsertDocMultifilter} = require("../../dbOperations")

const reviewRouter = express.Router();

reviewRouter.get("/getReviews", async (request, response) => {
    let propertyID = parseInt(request.query.propertyID)
    let list = await getFilteredList('feedbacks',{"propertyID":propertyID});
    response.json(list)
})

reviewRouter.post("/addreview", async (request, response) => {
    let userID = request.body.userID
    if(typeof userID == "undefined" || userID ==  null) {
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

reviewRouter.delete("/", async (request, response) => {
    let userID = request.query.userID
    if(typeof userID == "undefined" || userID ==  null) {
        response.send("Not logged in")
        return
    }
    let reviewID = parseInt(request.query.reviewID)
    if(typeof reviewID == "undefined" || reviewID ==  null) {
        response.send("Enter reviewId not found")
        return
    }
    await deleteDoc('feedbacks',{"reviewID":reviewID,"userID":userID});
    response.json("Deleted Successfully")
})


module.exports = reviewRouter;
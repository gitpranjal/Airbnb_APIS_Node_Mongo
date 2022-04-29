const {createTables, updateTables} = require("./dbOperations")

const express = require("express")
const multer = require('multer')
const path = require('path')
const bodyParser = require("body-parser")
const fs = require('fs').promises
const { request } = require("http")
const { response } = require("express")


const hostname = "0.0.0.0"
const port =  process.env.PORT || 3000

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs')

const upload = multer({ dest: './uploads/' })

app.get("/", (request, response) => {
    response.render("tableCreation.html")
})

app.post("/analyseSentiment", upload.single('uploadedTextFile'), async function (request, response){
     // The endpoint where the sentiment analysis calculation takes place and is subsequently displayed
      try{

        let text = await readTextFromFile(request.file.path)
        let sentimentInfoObject = await analSentiment(text)
        let sentimentObjectSentenceBySentence = await analSentimentSentenceBySentence(text)
        let finalOutput = "######## ORIGNAL TEXT ######## </br>"+ text + "</br></br> ###### SENTIMENT ANALYSIS ###### </br></br>"
        finalOutput += "</br>Overall comparitive sentiment score (-5 being most negative, +5 being mst positive, 0 being neutral)</br>"
        finalOutput += ""+sentimentInfoObject["comparative"]+"</br>"
        finalOutput += "</br>Sentiment score of each word/token (-5 being most negative +5 being postive)</br>"

        for(let tokenObject of sentimentInfoObject["calculation"])
        finalOutput += JSON.stringify(tokenObject)+"</br>"

        finalOutput += "</br>Sentiment score of each sentence </br>"
        for(let sentencesSentimentObjectsList of sentimentObjectSentenceBySentence)
            finalOutput += JSON.stringify(sentencesSentimentObjectsList)+"</br>"
        

        //JSON.stringify(sentimentInfoObject)
        response.send(finalOutput)
      }
      catch(e){
          response.send(e)
      }
    }
)



module.exports = {app: app, port: port, hostname: hostname}

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
    origin: ['http://localhost:3001','http://localhost:3000'],
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
    credentials: true
}));

const reviewRouter = require('./routes/reviews/reviewRoutes');
const userRouter = require('./routes/userops/userRoutes');
const wishlistRouter = require('./routes/wishlist/wishlistRoutes');
const reservationRouter = require('./routes/reservations/reservationRoutes');
const propertyRouter = require('./routes/properties/propertyRoutes');
app.use('/reviews', reviewRouter);
app.use('/user', userRouter);
app.use('/wishlist', wishlistRouter);
app.use('/reservation', reservationRouter);
app.use('/property', propertyRouter);

// app.get("/", (request, response) => {
//     response.render("tableCreation.html")
// })

module.exports = {app: app, port: port, hostname: hostname}

const express = require('express')
require('./db/mongoose')
require('./services/passport')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const outhRouter = require('./routers/oauth')
const passport = require('passport');//
const cookieSession = require('cookie-session');//
const bodyParser = require('body-parser');//
const cors = require('cors');//
const app = express()
const path= require('path')

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(bodyParser.json());// for passport
app.use(cookieSession({
    session:true,
    maxAge: 9000000,
    resave:true,
    saveUninitialized: true,
    secret:"939",
    keys: ["key"]
  })
);
app.use(passport.initialize());
app.use(passport.session());///
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
app.use(outhRouter)
module.exports = app
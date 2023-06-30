const mongoose = require('mongoose')
const MONGODB_URL ="mongodb://127.0.0.1:27017/two-do"
try {mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}) }
catch(err){
   // console.log("moooonnnggoooooo!!!")
    console.error(err);
}
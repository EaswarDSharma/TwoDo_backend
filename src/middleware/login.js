
const isLoggedIn = (req, res, next) => {
    console.log("checking authenticity")
    if (req.user) {
        if(!req.user.firsttimeentry){
            //console.log("firsttimers not")
            console.log("autherized  +++    "+req.user)
        next();}
    } else {
        console.log("not authed  ..  "+ req + "user is "+req.user)
        res.sendStatus(401);
    }
};
module.exports=isLoggedIn;
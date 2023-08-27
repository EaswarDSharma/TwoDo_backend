
const isLoggedIn = (req, res, next) => {
    if (req.user) {
        if(!req.user.firsttimeentry){
        next();}
    } else {
        res.sendStatus(401);
    }
};
module.exports=isLoggedIn;
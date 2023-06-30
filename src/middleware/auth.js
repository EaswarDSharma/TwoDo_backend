const jwt = require('jsonwebtoken')
const User1 = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token, 'thisisasecretformyapp')/*process.env.JWT_SECRET*/
        const user = await User1.findOne({ _id: decoded._id, 'token': token })
      //  console.log(decoded._id+" at auth token is :"+token)
        if (!user) {
            throw new Error()
        }
        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth
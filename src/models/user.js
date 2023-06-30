const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        //unique: true,
        required: true,
        trim: true
    },
    name2:{
        type: String,
        trim: true
    },
    email1: {
        type: String,
        //unique: true,
       // required: ,
        trim: true,
        lowercase: true,
        validate(v) {
            if (!validator.isEmail(v)) {
                throw new Error('Email is invalid')
            }
        }
    },
    email2: {
        type: String,
        // unique: true,
       // required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        //required: true,
        minlength: 7,
        trim: true,
        validate(v) {
            if (v.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    /*fid: {
        type: new mongoose.Types.ObjectId(),
        default: '',
        required: false
    },*/
    age: {
        type: Number,
        default: 0,
        validate(v) {
            if (v < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
   // tokens: [{
        token: {
            type: String,
            //required: true
        }
   // }]
   ,
    avatar: {
        type: String
    },
    avatar2:{
        type:String
    },
    firsttimeentry:{
        type:Boolean
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {    //populating
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

/*userSchema.virtual('sign', {
    ref: 'Task',
    localField: 'name',
    foreignField: 'signature'
})*/

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() },'thisisasecretformyapp')/*process.env.JWT_SECRET*/
    //user.tokens = user.tokens.concat({ token })
    user.token=token
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email1, password) => {
    let user = await User1.findOne({ email1 })

    if (!user) {
        email2=email1

        user =await User1.findOne({ email2 })
        if(!user) {  throw new Error('Unable to login')  }
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User1 = mongoose.model('User1', userSchema)

module.exports = User1
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User1 = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Mike',
    email1: 'mike@example.com',
    email2: 'mikea@example.com',
    password: '56what!!',
    //tokens: [{
        token: jwt.sign({ _id: userOneId }, 'thisisasecretformyapp')//process.env.JWT_SECRET)
    //}]
}


const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Jess',
    email1: 'jess@example.com',
    email2: 'mika@example.com',
    password: 'myhouse099@@',
    //tokens: [{
        token: jwt.sign({ _id: userTwoId }, 'thisisasecretformyapp')//process.env.JWT_SECRET)
    //}]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First task',
    completed: false,
    owner: userOne._id,
    //signature:userOne.name
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second task',
    completed: true,
    owner: userOne._id,
    //signature:userOne.name

}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Third task',
    completed: true,
    owner: userTwo._id,
    //signature:userTwo.name


}

const setupDatabase = async () => {
    await User1.deleteMany()
    await Task.deleteMany()
    await new User1(userOne).save()
    await new User1(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}
const request = require('supertest')
const app = require('../src/app')
const bcrypt = require('bcryptjs')
const User1 = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)
// 16 test train

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Andrew',
        email1: 'andrew@example.com',
        email2: 'andre@example.com',
        password: 'MyPass777!'
    }).expect(201)
    // Assert that the database was changed correctly
    const user = await User1.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Andrew',
            email1: 'andrew@example.com',
            email2: 'andre@example.com'
        },
        token: user.token
    })
    expect(user.password).not.toBe('MyPass777!')
})

test('Should login existing user', async () => { //mail2
    const response = await request(app).post('/users/login').send({
        email2: userOne.email2,
        password: userOne.password
    }).expect(200)
    const user = await User1.findById(userOneId)
    //console.log(user);
    expect(response.body.token).toBe(user.token)
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email1: userOne.email1,
        password: 'thisisnotmypass'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.token}`)
        .send()
        .expect(200)
    const user = await User1.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticate user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User1.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.token}`)
        .send({
            name: 'Jess'
        })
        .expect(200)
    const user = await User1.findById(userOneId)
    expect(user.name).toEqual('Jess')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.token}`)
        .send({
            location: 'Philadelphia'
        })
        .expect(400)
})
test('Should not signup user with invalid email', async () => {
    // Assertion to check bad email address
    await request(app)
        .post('/users')
        .send({
            name: 'Devika',
            email1: 'dev.com',
            password: 'DDAANN12'
        })
        .expect(400)
})

test('Should not signup user with invalid password', async () => {
    // Assertion to check bad password
    await request(app)
        .post('/users')
        .send({
            name: 'Devika',
            emial1: 'dev@gmail.com',
            email2: 'andre@example.com',
            password: 'DEV12'
        })
        .expect(400)
})

test('Should not update the user if unauthenticated', async () => {
    // Assertion to check the security 
    await request(app)
        .patch('/users/me')
        .send({
            name: 'Dev'
        })
        .expect(401)
})

test('Should not update user with invalid email', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.token}`)
        .send({
            email1: 'dev123.com'
        })
        .expect(400)

    const user = await User1.findById(userOneId)
    expect(user.email1).not.toBe('dev123.com')
})

test('Should not update user with invalid password', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.token}`)
        .send({
            password: '1234'
        })
        .expect(400)

    const user = await User1.findById(userOneId)
    const isSame = await bcrypt.compare('1234', user.password)
    expect(isSame).toBe(false)
})

test('Should update user with valid password', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.token}`)
        .send({
            password: 'aAa12@34sSs'
        })
        .expect(200)

    const user = await User1.findById(userOneId)
    const isSame = await bcrypt.compare('aAa12@34sSs', user.password)
    expect(isSame).toBe(true)
})

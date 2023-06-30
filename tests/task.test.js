const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { userOneId, userOne, userTwo, taskOne, taskThree, setupDatabase } = require('./fixtures/db')
const { response } = require('express')

beforeEach(setupDatabase)
// 17 task test train
//
test('Should create a task for authorized user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.token}`)
        .send({
            description: 'Testing from jest',
        })
        .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.description).toBe('Testing from jest')
    expect(task.completed).toBe(false)

})

test('should fetch user tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.token}`)
        .send()
        .expect(200)

    // Assertion to check the number of tasks for a user
    expect(response.body.length).toBe(2) //can also use toEqual

    // Assertion to check if the completed property is set to false by default
    expect(response.body[0].completed).toBe(false)
    //console.log(response.body)
    // Assertion to check if the task is updated in the database
    expect(response.body[1].description).toBe('Second task')
})

test('Should be able to delete task for authorized user', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.token}`)
        .send()
        .expect(200)

    const task = await Task.findById(taskOne._id)
    expect(task).toBeNull()
})

test('Should not able to delete task if unauthorized', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
})

test('Should not create task with invalid completed field', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.token}`)
        .send({
            completed: 'true'
        })
        .expect(400)
})

test('Should not update task with invalid completed field', async () => {
    await request(app)
        .patch('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userOne.token}`)
        .send({
            completed: 'got'
        })
        .expect(400)

    expect(taskOne.completed).not.toBe('got')
})

test('Should not update other users task', async () => {
    await request(app)
        .patch('/tasks/update/' + taskThree._id)
        .set('Authorization', `Bearer ${userOne.token}`)
        .send({
            description: 'New Three'
        })
        .expect(404)

    const task = await Task.findById(taskThree._id)
    expect(task.description).not.toBe('New Three')
})
test('Should fetch user task by ID', async () => {
    // Assertion to fetch the user task
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.token}`)
        .send()
        .expect(200)

    expect(response.body.description).toBe(taskOne.description)
})

test('Should not able to fetch task with ID if not authorized', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
})

test('Should not allow user to delete other users task', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `${userTwo.token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not fetch other users task by ID', async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.token}`)
        .send()
        .expect(404)
})

test('Should only fetch completed task', async () => {
    const response = await request(app)
        .get(`/tasks?completed=true`)
        .set('Authorization', `Bearer ${userOne.token}`)
        .send()
        .expect(200)

    expect(response.body.length).toBe(1)
})

test('Should only fetch incomplete task', async () => {
    const response = await request(app)
        .get(`/tasks?completed=false`)
        .set('Authorization', `Bearer ${userOne.token}`)
        .send()
        .expect(200)

    expect(response.body.length).toBe(1)
})

test('Should sort task by description', async () => {
    const response = await request(app)
        .get(`/tasks?sortBy=description:desc`)
        .set('Authorization', `Bearer ${userOne.token}`)
        .send()
        .expect(200)

    expect(response.body[0].description).toBe('Second task')
})

test('Should sort task by createdAt', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=createdAt:desc')
        .set('Authorization', `Bearer ${userOne.token}`)
        .send()
        .expect(200)

    expect(response.body[0].description).toBe('Second task')
})

test('Shoud sort task by updateAt', async () => {
    // Updating the first task
    await Task.findByIdAndUpdate(taskOne._id, { description: 'First Again' })
    // Assertion to test sorting by updateAt in descending
    const response = await request(app)
        .get('/tasks?sortBy=updatedAt:desc')
        .set('Authorization', `Bearer ${userOne.token}`)
        .send()
        .expect(200)

    expect(response.body[0].description).toBe('First Again')
})

test('Shoud fetch pages of tasks', async () => {
    //console.log(userOne.token+"this is the token of autherization")
    const response = await request(app)
        .get('/tasks?limit=1')
        .set('Authorization', `Bearer ${userOne.token}`)
        .send()
        .expect(200)

    expect(response.body.length).toBe(1)
})
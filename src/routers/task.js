const express = require('express')
const auth = require('../middleware/login')
const router = new express.Router()
const Task = require('../models/task')
const clearCache = require('../services/clearCache')



router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if (req.query.sortBy) {
    
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate() 
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})



router.post('/tasks', auth, async (req, res) => {
    console.log("in post tasks")
    const task = new Task({
        ...req.body,
        owner: req.user._id,
        //signature:req.user.name
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})
router.get('/tasks/:id', auth, async (req, res) => {
    

    try { 
        const task = await Task.findOne({
            _id : req.params.id,
            owner: req.user._id
             }).cache( {key: req.user._id}); // it should be owner bruh.. Future
        if (!task) {
            return res.status(404).send()
        }
        res.send(task);

    } catch (e) {
        res.status(500).send()
    }
})
router.delete('/tasks/:id', auth,async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, clearCache,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id}).cache({key:req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router

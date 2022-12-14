const express = require('express');
const { route } = require('express/lib/application');
const router = express.Router();
const Person = require('../models/Person');

// GET BACK ALL THE POSTS
router.get('/', async (req, res) => {
  try {
    const persons = await Person.find();
    res.json(persons);
  } catch (err) {
    res.json({ message: err });
  }
});

// SUBMITS A POST
router.post('/', async (req, res) => {
  const person = new Post({
    keycode: req.body.keycode,
    firstname: req.body. firstname,
    lastname: req.body.lastname,
    description: req.body.description,
  });
  try {
    const savedPerson = await person.save();
    res.json(savedPerson);
  } catch (err) {
    res.json({ message: err });
  }
});

// SPECIFIC POST
router.get('/:postId', async (req, res) => {
  try {
    const person = await Person.findById(req.params.keycode);
    res.json(person);
  } catch (err) {
    res.json({ message: err });
  }
});

// Delete Post
router.delete('/:postId', async (req, res) => {
  try {
    const removedPerson = await Person.remove({ _id: req.params.keycode });
    res.json(removedPerson);
  } catch (err) {
    res.json({ message: err });
  }
});

// Update a post
router.patch('/:postId', async (req, res) => {
  try {
    const updatedPerson = await Person.updateOne(
      { keycode: req.params.keycode },
      { $set: { description: req.body.description } }
    );
    res.json(updatedPerson);
  } catch (err) {
    res.json({ message: err });
  }
});
module.exports = router;
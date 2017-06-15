const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const {firearm} = require('./models');

// get request at /guns
router.get('/', (req,res) => {
  firearm
  .find()
  .exec()
  .then(gun => {
    res.json(gun.map(gun => gun.apiRepr()));
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({error: 'something went terribly wrong'});
  });
});

// get request for a single firearmRouter
router.get('/:id', (req, res) => {
  firearm
    .findById(req.params.id)
    .exec()
    .then(firearm => res.json(firearm.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went horribly awry'});
    });
});

// Posting a new gun to the database
router.post('/', jsonParser, (req, res) => {

  const requiredFields = ['manufacturer', 'model', 'chambering', 'type', 'image', 'serial_number', 'serial_number', 'value', 'sold', 'buyer'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  firearm
    .create({
      manufacturer: req.body.manufacturer,
      model: req.body.model,
      chambering: req.body.chambering,
      type: req.body.type,
      image: req.body.image,
      serial_number: req.body.serial_number,
      value: req.body.value,
      sold: req.body.sold,
      buyer: req.body.buyer
    })
    .then(firearm => res.status(201).json(firearm.apiRepr()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    });
});

// remove a firearm from the database
router.delete('/:id', (req, res) => {
  firearm
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      res.status(204).json({message: 'Success! It\'s gone! '});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

// update a firearm's record in the database
router.put('/:id', jsonParser, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['manufacturer', 'model', 'chambering', 'image', 'type', 'serial_number', 'serial_number', 'value', 'sold', 'buyer'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  firearm
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .exec()
    .then(updatedFilm => res.status(201).json(updatedFilm.apiRepr()))
    .catch(err => res.status(500).json({message: 'Something went wrong'}));
});


module.exports = router;

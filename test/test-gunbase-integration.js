const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const {firearm} = require('../src/js/models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

// used to put randomish documents in db
// so we have data to work with and assert about.
// we use the Faker library to automatically
// generate placeholder values for author, title, content
// and then we insert that data into mongo
function seedGunData() {
  console.info('seeding firearm data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generateGunData());
  }
  // this will return a promise
  return firearm.insertMany(seedData);
}


// generate an object represnting a restaurant.
// can be used to generate seed data for db
// or request.body data
function generateGunData() {
  return {
    manufacturer: faker.company.companyName(),
    model: faker.lorem.words(),
    chambering: faker.lorem.words(),
    type: faker.lorem.words(),
    serial_number: faker.lorem.words(),
    image: faker.internet.url(),
    value: faker.random.number(500),
    sold: faker.random.boolean(),
    buyer: faker.name.lastName()

  }
}

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure  ata from one test does not stick
// around for next one
function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Firearm API resource', function() {

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedRestaurantData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedGunData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  })

  // note the use of nested `describe` blocks.
  // this allows us to make clearer, more discrete tests that focus
  // on proving something small
  describe('GET endpoint', function() {

    it('should return all existing guns', function() {
      // strategy:
      //    1. get back all guns returned by by GET request to `/guns`
      //    2. prove res has right status, data type
      //    3. prove the number of guns we got back is equal to number
      //       in db.
      //
      // need to have access to mutate and access `res` across
      // `.then()` calls below, so declare it here so can modify in place
      let res;
      return chai.request(app)
        .get('/guns')
        .then(function(_res) {
          // so subsequent .then blocks can access resp obj.
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.should.have.length.of.at.least(1);
          return firearm.count();
        })
        .then(function(count) {
          res.body.should.have.length.of(count);
        });
    });


    it('should return firearms with right fields', function() {
      // Strategy: Get back all restaurants, and ensure they have expected keys

      let resFirearm;
      return chai.request(app)
        .get('/guns')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);

          res.body.forEach(function(gun) {
            gun.should.be.a('object');
            gun.should.include.keys(

              'manufacturer', 'model', 'id', 'chambering', 'type', 'serial_number', 'image', 'value', 'sold', 'buyer');
          });
          resFirearm = res.body[0];
          return firearm.findById(resFirearm.id);
        })
        .then(function(gun) {

          resFirearm.manufacturer.should.equal(gun.manufacturer);
          resFirearm.model.should.equal(gun.model);
          resFirearm.chambering.should.equal(gun.chambering);
          resFirearm.type.should.equal(gun.type);
          resFirearm.serial_number.should.equal(gun.serial_number);
          resFirearm.image.should.equal(gun.image);
          resFirearm.value.should.equal(gun.value);
          resFirearm.sold.should.equal(gun.sold);
          resFirearm.buyer.should.equal(gun.buyer);

        });
    });
  });

  describe('POST endpoint', function() {
    // strategy: make a POST request with data,
    // then prove that the gun we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new firearm', function() {

      const newFirearm = generateGunData();

      return chai.request(app)
        .post('/guns')
        .send(newFirearm)
        .then(function(res) {

          //console.log('HEY! ',res);

          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'manufacturer', 'id', 'model', 'chambering', 'type', 'serial_number', 'image', 'value', 'sold', 'buyer');
          res.body.manufacturer.should.equal(newFirearm.manufacturer);
          // cause Mongo should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.model.should.equal(newFirearm.model);
          res.body.chambering.should.equal(newFirearm.chambering);
          res.body.type.should.equal(newFirearm.type);
          res.body.serial_number.should.equal(newFirearm.serial_number);
          res.body.image.should.equal(newFirearm.image);
          res.body.value.should.equal(newFirearm.value);
          res.body.sold.should.equal(newFirearm.sold);
          res.body.buyer.should.equal(newFirearm.buyer);

          return firearm.findById(res.body.id);
        })
        .then(function(gun) {

          gun.model.should.equal(newFirearm.model);
          gun.serial_number.should.equal(newFirearm.serial_number);
          gun.value.should.equal(newFirearm.value);
        });
    });
  });

  describe('PUT endpoint', function() {

    // strategy:
    //  1. Get an existing gun from db
    //  2. Make a PUT request to update that record
    //  3. Prove gun returned by request contains data we sent
    //  4. Prove gun in db is correctly updated
    it('should update fields you send over', function() {
      const updateData = {
        manufacturer: 'fofofofofofofof',
        model: 'foo bar baz bee bop aree bop ruhbarb pie'
      };


      return firearm
        .findOne()
        .exec()
        .then(function(gun) {
          updateData.id = gun.id;

          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/guns/${gun.id}`)
            .send(updateData);

        })
        .then(function(res) {
          // server.js file specifies status 201 on success...
          res.should.have.status(201);

          return firearm.findById(updateData.id).exec();
        })
        .then(function(gun) {
          gun.manufacturer.should.equal(updateData.manufacturer);
          gun.model.should.equal(updateData.model);
        });
      });
  });

  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a gun
    //  2. make a DELETE request for that gun's id
    //  3. assert that response has right status code
    //  4. prove that gun with the id doesn't exist in db anymore
    it('delete a firearm by id', function() {

      let gun;

      return firearm
        .findOne()
        .exec()
        .then(function(_gun) {
          gun = _gun;
          return chai.request(app).delete(`/guns/${gun.id}`);
        })
        .then(function(res) {
          res.should.have.status(204);
          return firearm.findById(gun.id).exec();
        })
        .then(function(gun) {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_gun.should.be.null` would raise
          // an error. `should.be.null(_post)` is how we can
          // make assertions about a null value.
          should.not.exist(gun);
        });
    });
  });
});

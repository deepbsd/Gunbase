const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const {DATABASE_URL, PORT} = require('./config');


const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());



const {firearm} = require('./src/js/models');


app.use( '/', express.static(__dirname + '/public') );
app.use( '/css', express.static(__dirname + '/src/css') );
app.use( '/img', express.static(__dirname + '/src/img') );
app.use( '/js', express.static(__dirname + '/src/js') );
app.use('/jquery', express.static(__dirname+'/node_modules/jquery/dist'));
app.use('/fonts', express.static(__dirname + '/src/fonts/oldbob'));
app.use('/sounds', express.static(__dirname + '/src/sounds'));



//So far this is the only endpoint...
const firearmRouter = require('./src/js/firearmRouter');
app.use('/guns', firearmRouter);


app.get('/heartbeat', function(req, res) {
  res.json({
    is: 'working'
  })
});

mongoose.Promise = global.Promise;


app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

app.all('*', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE');
  next();
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};

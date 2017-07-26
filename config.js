exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/firearms';
                      // 'mongodb://deepbsd:2D33p4m3!@ds133162.mlab.com:33162/firearms';
exports.TEST_DATABASE_URL = (
   process.env.TEST_DATABASE_URL ||
   'mongodb://localhost/testfirearms');

exports.PORT = process.env.PORT || 8080;

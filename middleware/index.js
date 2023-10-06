const applyHelmet = require('./helmet');
const applyBodyParser = require('./bodyParser');
const applyMorgan = require('./morgan');

module.exports = function(app) {
  applyHelmet(app);
  applyBodyParser(app);
  applyMorgan(app);
}

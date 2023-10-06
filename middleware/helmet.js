const helmet = require('helmet');

module.exports = function(app) {
  // Use Helmet to set various security headers
  app.use(helmet());
}

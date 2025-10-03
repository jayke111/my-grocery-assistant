// src/setupProxy.js

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
  });
};
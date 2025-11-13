const { onRequest } = require('firebase-functions/v2/https');
  const server = import('firebase-frameworks');
  exports.ssrstudio3687522943485c = onRequest({}, (req, res) => server.then(it => it.handle(req, res)));
  
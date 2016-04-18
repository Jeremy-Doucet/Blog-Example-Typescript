import * as path from 'path';

export default function(app) {

  app.use('/api/v1/auth', require('./auth'));

  // All undefined api or asset routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*').get((req, res, next) => {
    res.sendStatus(404);
  });

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
    res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
  });
}

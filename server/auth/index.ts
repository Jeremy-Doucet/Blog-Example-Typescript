import * as express from 'express';

import config = require('../config/environment');
require('./facebook/passport').setup(config);

const router = express.Router();

router.use('/facebook', require('./facebook'));
router.use('/local', require('./local'));

export = router;

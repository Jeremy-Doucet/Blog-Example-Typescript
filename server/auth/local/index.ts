import * as express from 'express';
import * as controller from './controller';

const router = express.Router();

router.post('/login', controller.login);
router.post('/register', controller.register);

export = router;

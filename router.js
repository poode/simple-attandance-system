const { Router } = require('express');

const controller = require('./controller');
const middlewares = require('./middlewares');

const router = Router();

router.post('/register', controller.registerUser);
router.post('/login', controller.login);
router.get('/check-in', middlewares.auth, controller.checkIn);
router.get('/check-out', middlewares.auth, controller.checkOut);
router.get('/report', middlewares.auth, middlewares.isManager, controller.report);

module.exports = router;

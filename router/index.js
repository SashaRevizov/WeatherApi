const { Router } = require('express');

const controller = require('../controller');

const router = Router();

router.get('/capitals', controller.getCapitals);
router.get('/maxCalls', controller.maxNumOfCalls);
router.post('/weather', controller.getWeather);
router.post('/avgWeather', controller.getAvgTemperature);


module.exports = router;
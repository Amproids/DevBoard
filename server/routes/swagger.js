const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger');
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

module.exports = router;

const express = require('express');
const router = express.Router();
const localityController = require('../controllers/locality.controller');

// Routes
router.post('/locality/add', localityController.addLocality);
router.get('/locality/all', localityController.getAllLocalities);
router.put('/locality/update/:id', localityController.updateLocality);
router.delete('/locality/delete/:id', localityController.deleteLocality);

module.exports = router;
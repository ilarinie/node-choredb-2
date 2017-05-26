const express = require('express');
const router = express.Router();

router.get('/', function(req, res)  {
    res.redirect(301, 'https://github.com/ilarinie/node-choredb-2/wiki/ChoreDB2---API');
})


module.exports = router;

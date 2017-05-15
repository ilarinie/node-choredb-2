(function (routeConfig) {

  'use strict';

  routeConfig.init = function (app) {

    // *** routes *** //
    const routes = require('../routes/index');
    const communeRoutes = require('../routes/communes');
    const choreRoutes = require('../routes/chores');
    const purchaseRoutes = require('../routes/purchases');
    const authRoutes = require('../routes/auth');

    // *** register routes *** //
    app.use('/', routes);
    app.use('/communes', communeRoutes);
    app.use('/chores', choreRoutes);
    app.use('/purchases', purchaseRoutes)
    app.use('/auth', authRoutes);

  };

})(module.exports);

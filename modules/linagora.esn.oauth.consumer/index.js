const AwesomeModule = require('awesome-module');
const Dependency = AwesomeModule.AwesomeModuleDependency;
const path = require('path');

const FRONTEND_PATH = path.join(__dirname, 'frontend');
const innerApps = ['esn'];
const angularModuleFiles = ['app.js', 'services.js'];
const modulesOptions = {
  localJsFiles: angularModuleFiles.map(file => path.resolve(FRONTEND_PATH, 'js', file))
};

const moduleData = {
  shortName: 'oauth',
  fullName: 'linagora.esn.oauth.consumer',
  angularModules: []
};

moduleData.angularModules.push([moduleData.shortName, angularModuleFiles, moduleData.fullName, innerApps, modulesOptions]);

var oauthModule = new AwesomeModule(moduleData.fullName, {
  dependencies: [
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.logger', 'logger'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.user', 'user'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.oauth', 'oauth'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.esn-config', 'esn-config'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.i18n', 'i18n'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.wrapper', 'webserver-wrapper'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.middleware.authorization', 'authorizationMW')
  ],
  data: moduleData,
  states: {
    lib: function(dependencies, callback) {
      const libModule = require('./backend/lib')(dependencies);
      const oauth = require('./backend/webserver/api/oauth')(dependencies);
      const lib = {
        api: {
          oauth: oauth
        },
        lib: libModule
      };

      return callback(null, lib);
    },

    deploy: function(dependencies, callback) {
      const logger = dependencies('logger');
      const webserverWrapper = dependencies('webserver-wrapper');
      const app = require('./backend/webserver/application')(dependencies);

      app.use('/', this.api.oauth);
      app.use((err, req, res, next) => {
        logger.error('Unhandled error on OAuth Express Server', err.stack);
        next(err);
      });

      moduleData.angularModules.forEach(mod => webserverWrapper.injectAngularModules.apply(webserverWrapper, mod));
      webserverWrapper.addApp(moduleData.shortName, app);

      return callback();
    },

    start: function(dependencies, callback) {
      this.lib.start(callback);
    }
  }
});

module.exports = oauthModule;

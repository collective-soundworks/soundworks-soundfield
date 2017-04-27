'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cwd = process.cwd();

// Configuration of the application.
// Other entries can be added (as long as their name doesn't conflict with
// existing ones) to define global parameters of the application (e.g. BPM,
// synth parameters) that can then be shared easily among all clients using
// the `shared-config` service.
exports.default = {
  // name of the application, used in the `.ejs` template and by default in
  // the `platform` service to populate its view
  appName: 'Soundfield',

  // name of the environnement ('production' enable cache in express application)
  env: 'production',

  // version of application, can be used to force reload css and js files
  // from server (cf. `html/default.ejs`)
  version: '0.0.1',

  // name of the default client type, i.e. the client that can access the
  // application at its root URL
  defaultClient: 'player',

  // define from where the assets (static files) should be loaded, these value
  // could also refer to a separate server for scalability reasons. This value
  // should also be used client-side to configure the `loader` service.
  assetsDomain: 'https://apps.cosima.ircam.fr/soundfield/',

  // port used to open the http server, in production this value is typically 80
  port: 8003,

  // describe the location where the experience takes places, theses values are
  // used by the `placer`, `checkin` and `locator` services.
  // if one of these service is required, this entry shouldn't be removed.
  setup: {
    area: {
      width: 5,
      height: 8,
      // path to an image to be used in the area representation
      background: null
    },
    // list of predefined labels
    labels: null,
    // list of predefined coordinates given as an array of `[x:Number, y:Number]`
    coordinates: null,
    // maximum number of clients allowed in a position
    maxClientsPerPosition: 1,
    // maximum number of positions (may limit or be limited by the number of
    // labels and/or coordinates)
    capacity: Infinity
  },

  // socket.io configuration
  socketIO: {
    url: 'https://apps.cosima.ircam.fr:8003',
    transports: ['websocket']
  },

  // define if the HTTP server should be launched using secure connections.
  // For development purposes when set to `true` and no certificates are given
  // (cf. `httpsInfos`), a self-signed certificate is created.
  useHttps: true,

  // paths to the key and certificate to be used in order to launch the https
  // server. Both entries are required otherwise a self-signed certificate
  // is generated.
  httpsInfos: {
    key: '/etc/ssl/letsencrypt/certs/cosima-apps.ircam.fr/privkey.pem',
    cert: '/etc/ssl/letsencrypt/certs/cosima-apps.ircam.fr/fullchain.pem'
  },

  // password to be used by the `auth` service
  password: '',

  // define if the server should use gzip compression for static files
  enableGZipCompression: true,

  // location of the public directory (accessible through http(s) requests)
  publicDirectory: _path2.default.join(cwd, 'public'),

  // directory where the server templating system looks for the `ejs` templates
  templateDirectory: _path2.default.join(cwd, 'html'),

  // bunyan configuration
  logger: {
    name: 'soundworks',
    level: 'info',
    streams: [{
      level: 'info',
      stream: process.stdout
    }, {
      level: 'info',
      path: _path2.default.join(process.cwd(), 'logs', 'soundworks.log')
    }]
  },

  // directory where error reported from the clients are written
  errorReporterDirectory: _path2.default.join(cwd, 'logs', 'clients')
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvc2ltYS1hcHBzLmpzIl0sIm5hbWVzIjpbImN3ZCIsInByb2Nlc3MiLCJhcHBOYW1lIiwiZW52IiwidmVyc2lvbiIsImRlZmF1bHRDbGllbnQiLCJhc3NldHNEb21haW4iLCJwb3J0Iiwic2V0dXAiLCJhcmVhIiwid2lkdGgiLCJoZWlnaHQiLCJiYWNrZ3JvdW5kIiwibGFiZWxzIiwiY29vcmRpbmF0ZXMiLCJtYXhDbGllbnRzUGVyUG9zaXRpb24iLCJjYXBhY2l0eSIsIkluZmluaXR5Iiwic29ja2V0SU8iLCJ1cmwiLCJ0cmFuc3BvcnRzIiwidXNlSHR0cHMiLCJodHRwc0luZm9zIiwia2V5IiwiY2VydCIsInBhc3N3b3JkIiwiZW5hYmxlR1ppcENvbXByZXNzaW9uIiwicHVibGljRGlyZWN0b3J5Iiwiam9pbiIsInRlbXBsYXRlRGlyZWN0b3J5IiwibG9nZ2VyIiwibmFtZSIsImxldmVsIiwic3RyZWFtcyIsInN0cmVhbSIsInN0ZG91dCIsInBhdGgiLCJlcnJvclJlcG9ydGVyRGlyZWN0b3J5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7O0FBQ0EsSUFBTUEsTUFBTUMsUUFBUUQsR0FBUixFQUFaOztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7a0JBQ2U7QUFDYjtBQUNBO0FBQ0FFLFdBQVMsWUFISTs7QUFLYjtBQUNBQyxPQUFLLFlBTlE7O0FBUWI7QUFDQTtBQUNBQyxXQUFTLE9BVkk7O0FBWWI7QUFDQTtBQUNBQyxpQkFBZSxRQWRGOztBQWdCYjtBQUNBO0FBQ0E7QUFDQUMsZ0JBQWMsMENBbkJEOztBQXFCYjtBQUNBQyxRQUFNLElBdEJPOztBQXdCYjtBQUNBO0FBQ0E7QUFDQUMsU0FBTztBQUNMQyxVQUFNO0FBQ0pDLGFBQU8sQ0FESDtBQUVKQyxjQUFRLENBRko7QUFHSjtBQUNBQyxrQkFBWTtBQUpSLEtBREQ7QUFPTDtBQUNBQyxZQUFRLElBUkg7QUFTTDtBQUNBQyxpQkFBYSxJQVZSO0FBV0w7QUFDQUMsMkJBQXVCLENBWmxCO0FBYUw7QUFDQTtBQUNBQyxjQUFVQztBQWZMLEdBM0JNOztBQTZDYjtBQUNBQyxZQUFVO0FBQ1JDLFNBQUssbUNBREc7QUFFUkMsZ0JBQVksQ0FBQyxXQUFEO0FBRkosR0E5Q0c7O0FBd0RiO0FBQ0E7QUFDQTtBQUNBQyxZQUFVLElBM0RHOztBQTZEYjtBQUNBO0FBQ0E7QUFDQUMsY0FBWTtBQUNWQyxTQUFLLDZEQURLO0FBRVZDLFVBQU07QUFGSSxHQWhFQzs7QUFxRWI7QUFDQUMsWUFBVSxFQXRFRzs7QUF3RWI7QUFDQUMseUJBQXVCLElBekVWOztBQTJFYjtBQUNBQyxtQkFBaUIsZUFBS0MsSUFBTCxDQUFVNUIsR0FBVixFQUFlLFFBQWYsQ0E1RUo7O0FBOEViO0FBQ0E2QixxQkFBbUIsZUFBS0QsSUFBTCxDQUFVNUIsR0FBVixFQUFlLE1BQWYsQ0EvRU47O0FBaUZiO0FBQ0E4QixVQUFRO0FBQ05DLFVBQU0sWUFEQTtBQUVOQyxXQUFPLE1BRkQ7QUFHTkMsYUFBUyxDQUFDO0FBQ1JELGFBQU8sTUFEQztBQUVSRSxjQUFRakMsUUFBUWtDO0FBRlIsS0FBRCxFQUdOO0FBQ0RILGFBQU8sTUFETjtBQUVESSxZQUFNLGVBQUtSLElBQUwsQ0FBVTNCLFFBQVFELEdBQVIsRUFBVixFQUF5QixNQUF6QixFQUFpQyxnQkFBakM7QUFGTCxLQUhNO0FBSEgsR0FsRks7O0FBOEZiO0FBQ0FxQywwQkFBd0IsZUFBS1QsSUFBTCxDQUFVNUIsR0FBVixFQUFlLE1BQWYsRUFBdUIsU0FBdkI7QUEvRlgsQyIsImZpbGUiOiJjb3NpbWEtYXBwcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuY29uc3QgY3dkID0gcHJvY2Vzcy5jd2QoKTtcblxuXG4vLyBDb25maWd1cmF0aW9uIG9mIHRoZSBhcHBsaWNhdGlvbi5cbi8vIE90aGVyIGVudHJpZXMgY2FuIGJlIGFkZGVkIChhcyBsb25nIGFzIHRoZWlyIG5hbWUgZG9lc24ndCBjb25mbGljdCB3aXRoXG4vLyBleGlzdGluZyBvbmVzKSB0byBkZWZpbmUgZ2xvYmFsIHBhcmFtZXRlcnMgb2YgdGhlIGFwcGxpY2F0aW9uIChlLmcuIEJQTSxcbi8vIHN5bnRoIHBhcmFtZXRlcnMpIHRoYXQgY2FuIHRoZW4gYmUgc2hhcmVkIGVhc2lseSBhbW9uZyBhbGwgY2xpZW50cyB1c2luZ1xuLy8gdGhlIGBzaGFyZWQtY29uZmlnYCBzZXJ2aWNlLlxuZXhwb3J0IGRlZmF1bHQge1xuICAvLyBuYW1lIG9mIHRoZSBhcHBsaWNhdGlvbiwgdXNlZCBpbiB0aGUgYC5lanNgIHRlbXBsYXRlIGFuZCBieSBkZWZhdWx0IGluXG4gIC8vIHRoZSBgcGxhdGZvcm1gIHNlcnZpY2UgdG8gcG9wdWxhdGUgaXRzIHZpZXdcbiAgYXBwTmFtZTogJ1NvdW5kZmllbGQnLFxuXG4gIC8vIG5hbWUgb2YgdGhlIGVudmlyb25uZW1lbnQgKCdwcm9kdWN0aW9uJyBlbmFibGUgY2FjaGUgaW4gZXhwcmVzcyBhcHBsaWNhdGlvbilcbiAgZW52OiAncHJvZHVjdGlvbicsXG5cbiAgLy8gdmVyc2lvbiBvZiBhcHBsaWNhdGlvbiwgY2FuIGJlIHVzZWQgdG8gZm9yY2UgcmVsb2FkIGNzcyBhbmQganMgZmlsZXNcbiAgLy8gZnJvbSBzZXJ2ZXIgKGNmLiBgaHRtbC9kZWZhdWx0LmVqc2ApXG4gIHZlcnNpb246ICcwLjAuMScsXG5cbiAgLy8gbmFtZSBvZiB0aGUgZGVmYXVsdCBjbGllbnQgdHlwZSwgaS5lLiB0aGUgY2xpZW50IHRoYXQgY2FuIGFjY2VzcyB0aGVcbiAgLy8gYXBwbGljYXRpb24gYXQgaXRzIHJvb3QgVVJMXG4gIGRlZmF1bHRDbGllbnQ6ICdwbGF5ZXInLFxuXG4gIC8vIGRlZmluZSBmcm9tIHdoZXJlIHRoZSBhc3NldHMgKHN0YXRpYyBmaWxlcykgc2hvdWxkIGJlIGxvYWRlZCwgdGhlc2UgdmFsdWVcbiAgLy8gY291bGQgYWxzbyByZWZlciB0byBhIHNlcGFyYXRlIHNlcnZlciBmb3Igc2NhbGFiaWxpdHkgcmVhc29ucy4gVGhpcyB2YWx1ZVxuICAvLyBzaG91bGQgYWxzbyBiZSB1c2VkIGNsaWVudC1zaWRlIHRvIGNvbmZpZ3VyZSB0aGUgYGxvYWRlcmAgc2VydmljZS5cbiAgYXNzZXRzRG9tYWluOiAnaHR0cHM6Ly9hcHBzLmNvc2ltYS5pcmNhbS5mci9zb3VuZGZpZWxkLycsXG5cbiAgLy8gcG9ydCB1c2VkIHRvIG9wZW4gdGhlIGh0dHAgc2VydmVyLCBpbiBwcm9kdWN0aW9uIHRoaXMgdmFsdWUgaXMgdHlwaWNhbGx5IDgwXG4gIHBvcnQ6IDgwMDMsXG5cbiAgLy8gZGVzY3JpYmUgdGhlIGxvY2F0aW9uIHdoZXJlIHRoZSBleHBlcmllbmNlIHRha2VzIHBsYWNlcywgdGhlc2VzIHZhbHVlcyBhcmVcbiAgLy8gdXNlZCBieSB0aGUgYHBsYWNlcmAsIGBjaGVja2luYCBhbmQgYGxvY2F0b3JgIHNlcnZpY2VzLlxuICAvLyBpZiBvbmUgb2YgdGhlc2Ugc2VydmljZSBpcyByZXF1aXJlZCwgdGhpcyBlbnRyeSBzaG91bGRuJ3QgYmUgcmVtb3ZlZC5cbiAgc2V0dXA6IHtcbiAgICBhcmVhOiB7XG4gICAgICB3aWR0aDogNSxcbiAgICAgIGhlaWdodDogOCxcbiAgICAgIC8vIHBhdGggdG8gYW4gaW1hZ2UgdG8gYmUgdXNlZCBpbiB0aGUgYXJlYSByZXByZXNlbnRhdGlvblxuICAgICAgYmFja2dyb3VuZDogbnVsbCxcbiAgICB9LFxuICAgIC8vIGxpc3Qgb2YgcHJlZGVmaW5lZCBsYWJlbHNcbiAgICBsYWJlbHM6IG51bGwsXG4gICAgLy8gbGlzdCBvZiBwcmVkZWZpbmVkIGNvb3JkaW5hdGVzIGdpdmVuIGFzIGFuIGFycmF5IG9mIGBbeDpOdW1iZXIsIHk6TnVtYmVyXWBcbiAgICBjb29yZGluYXRlczogbnVsbCxcbiAgICAvLyBtYXhpbXVtIG51bWJlciBvZiBjbGllbnRzIGFsbG93ZWQgaW4gYSBwb3NpdGlvblxuICAgIG1heENsaWVudHNQZXJQb3NpdGlvbjogMSxcbiAgICAvLyBtYXhpbXVtIG51bWJlciBvZiBwb3NpdGlvbnMgKG1heSBsaW1pdCBvciBiZSBsaW1pdGVkIGJ5IHRoZSBudW1iZXIgb2ZcbiAgICAvLyBsYWJlbHMgYW5kL29yIGNvb3JkaW5hdGVzKVxuICAgIGNhcGFjaXR5OiBJbmZpbml0eSxcbiAgfSxcblxuICAvLyBzb2NrZXQuaW8gY29uZmlndXJhdGlvblxuICBzb2NrZXRJTzoge1xuICAgIHVybDogJ2h0dHBzOi8vYXBwcy5jb3NpbWEuaXJjYW0uZnI6ODAwMycsXG4gICAgdHJhbnNwb3J0czogWyd3ZWJzb2NrZXQnXSxcbiAgICAvLyBAbm90ZTogRW5naW5lSU8gZGVmYXVsdHNcbiAgICAvLyBwaW5nVGltZW91dDogMzAwMCxcbiAgICAvLyBwaW5nSW50ZXJ2YWw6IDEwMDAsXG4gICAgLy8gdXBncmFkZVRpbWVvdXQ6IDEwMDAwLFxuICAgIC8vIG1heEh0dHBCdWZmZXJTaXplOiAxMEU3LFxuICB9LFxuXG4gIC8vIGRlZmluZSBpZiB0aGUgSFRUUCBzZXJ2ZXIgc2hvdWxkIGJlIGxhdW5jaGVkIHVzaW5nIHNlY3VyZSBjb25uZWN0aW9ucy5cbiAgLy8gRm9yIGRldmVsb3BtZW50IHB1cnBvc2VzIHdoZW4gc2V0IHRvIGB0cnVlYCBhbmQgbm8gY2VydGlmaWNhdGVzIGFyZSBnaXZlblxuICAvLyAoY2YuIGBodHRwc0luZm9zYCksIGEgc2VsZi1zaWduZWQgY2VydGlmaWNhdGUgaXMgY3JlYXRlZC5cbiAgdXNlSHR0cHM6IHRydWUsXG5cbiAgLy8gcGF0aHMgdG8gdGhlIGtleSBhbmQgY2VydGlmaWNhdGUgdG8gYmUgdXNlZCBpbiBvcmRlciB0byBsYXVuY2ggdGhlIGh0dHBzXG4gIC8vIHNlcnZlci4gQm90aCBlbnRyaWVzIGFyZSByZXF1aXJlZCBvdGhlcndpc2UgYSBzZWxmLXNpZ25lZCBjZXJ0aWZpY2F0ZVxuICAvLyBpcyBnZW5lcmF0ZWQuXG4gIGh0dHBzSW5mb3M6IHtcbiAgICBrZXk6ICcvZXRjL3NzbC9sZXRzZW5jcnlwdC9jZXJ0cy9jb3NpbWEtYXBwcy5pcmNhbS5mci9wcml2a2V5LnBlbScsXG4gICAgY2VydDogJy9ldGMvc3NsL2xldHNlbmNyeXB0L2NlcnRzL2Nvc2ltYS1hcHBzLmlyY2FtLmZyL2Z1bGxjaGFpbi5wZW0nLFxuICB9LFxuXG4gIC8vIHBhc3N3b3JkIHRvIGJlIHVzZWQgYnkgdGhlIGBhdXRoYCBzZXJ2aWNlXG4gIHBhc3N3b3JkOiAnJyxcblxuICAvLyBkZWZpbmUgaWYgdGhlIHNlcnZlciBzaG91bGQgdXNlIGd6aXAgY29tcHJlc3Npb24gZm9yIHN0YXRpYyBmaWxlc1xuICBlbmFibGVHWmlwQ29tcHJlc3Npb246IHRydWUsXG5cbiAgLy8gbG9jYXRpb24gb2YgdGhlIHB1YmxpYyBkaXJlY3RvcnkgKGFjY2Vzc2libGUgdGhyb3VnaCBodHRwKHMpIHJlcXVlc3RzKVxuICBwdWJsaWNEaXJlY3Rvcnk6IHBhdGguam9pbihjd2QsICdwdWJsaWMnKSxcblxuICAvLyBkaXJlY3Rvcnkgd2hlcmUgdGhlIHNlcnZlciB0ZW1wbGF0aW5nIHN5c3RlbSBsb29rcyBmb3IgdGhlIGBlanNgIHRlbXBsYXRlc1xuICB0ZW1wbGF0ZURpcmVjdG9yeTogcGF0aC5qb2luKGN3ZCwgJ2h0bWwnKSxcblxuICAvLyBidW55YW4gY29uZmlndXJhdGlvblxuICBsb2dnZXI6IHtcbiAgICBuYW1lOiAnc291bmR3b3JrcycsXG4gICAgbGV2ZWw6ICdpbmZvJyxcbiAgICBzdHJlYW1zOiBbe1xuICAgICAgbGV2ZWw6ICdpbmZvJyxcbiAgICAgIHN0cmVhbTogcHJvY2Vzcy5zdGRvdXQsXG4gICAgfSwge1xuICAgICAgbGV2ZWw6ICdpbmZvJyxcbiAgICAgIHBhdGg6IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnbG9ncycsICdzb3VuZHdvcmtzLmxvZycpLFxuICAgIH1dXG4gIH0sXG5cbiAgLy8gZGlyZWN0b3J5IHdoZXJlIGVycm9yIHJlcG9ydGVkIGZyb20gdGhlIGNsaWVudHMgYXJlIHdyaXR0ZW5cbiAgZXJyb3JSZXBvcnRlckRpcmVjdG9yeTogcGF0aC5qb2luKGN3ZCwgJ2xvZ3MnLCAnY2xpZW50cycpLFxufVxuIl19
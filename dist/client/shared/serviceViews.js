'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _client = require('soundworks/client');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// --------------------------- example
/**
 * Interface for the view of the `audio-buffer-manager` service.
 *
 * @interface AbstractAudioBufferManagerView
 * @extends module:soundworks/client.View
 */
/**
 * Method called when a new information about the currently loaded assets
 * is received.
 *
 * @function
 * @name AbstractAudioBufferManagerView.onProgress
 * @param {Number} percent - The purcentage of loaded assets.
 */
// ------------------------------------

var noop = function noop() {};

function getStartInteraction() {
  var interaction = 'click';

  if (_client.client.interation !== null) {
    if (_client.client.interation === 'touch') interaction = 'touchstart';else interaction = 'mousedown';
  }

  return interaction;
}

var serviceViews = {
  // ------------------------------------------------
  // AudioBufferManager
  // ------------------------------------------------
  'service:audio-buffer-manager': function (_SegmentedView) {
    (0, _inherits3.default)(AudioBufferManagerView, _SegmentedView);

    function AudioBufferManagerView() {
      (0, _classCallCheck3.default)(this, AudioBufferManagerView);

      var _this = (0, _possibleConstructorReturn3.default)(this, (AudioBufferManagerView.__proto__ || (0, _getPrototypeOf2.default)(AudioBufferManagerView)).call(this));

      _this.template = '\n        <div class="section-top flex-middle">\n          <p><%= msg[status] %></p>\n        </div>\n        <div class="section-center flex-center">\n          <% if (showProgress) { %>\n          <div class="progress-wrap">\n            <div class="progress-bar"></div>\n          </div>\n          <% } %>\n        </div>\n        <div class="section-bottom"></div>\n      ';

      _this.model = {
        status: 'loading',
        showProgress: true,
        msg: {
          loading: 'Loading sounds...',
          decoding: 'Decoding sounds...'
        }
      };
      return _this;
    }

    (0, _createClass3.default)(AudioBufferManagerView, [{
      key: 'onRender',
      value: function onRender() {
        (0, _get3.default)(AudioBufferManagerView.prototype.__proto__ || (0, _getPrototypeOf2.default)(AudioBufferManagerView.prototype), 'onRender', this).call(this);
        this.$progressBar = this.$el.querySelector('.progress-bar');
      }
    }, {
      key: 'setProgressRatio',
      value: function setProgressRatio(ratio) {
        var percent = Math.round(ratio * 100);

        if (percent === 100) {
          this.model.status = 'decoding';
          this.render('.section-top');
        }

        if (this.model.showProgress) this.$progressBar.style.width = percent + '%';
      }
    }]);
    return AudioBufferManagerView;
  }(_client.SegmentedView),

  // ------------------------------------------------
  // Auth
  // ------------------------------------------------
  'service:auth': function (_SegmentedView2) {
    (0, _inherits3.default)(AuthView, _SegmentedView2);

    function AuthView() {
      (0, _classCallCheck3.default)(this, AuthView);

      var _this2 = (0, _possibleConstructorReturn3.default)(this, (AuthView.__proto__ || (0, _getPrototypeOf2.default)(AuthView)).call(this));

      _this2.template = '\n        <% if (!rejected) { %>\n          <div class="section-top flex-middle">\n            <p><%= instructions %></p>\n          </div>\n          <div class="section-center flex-center">\n            <div>\n              <input type="password" id="password" />\n              <button class="btn" id="send"><%= send %></button>\n            </div>\n          </div>\n          <div class="section-bottom flex-middle">\n            <button id="reset" class="btn"><%= reset %></button>\n          </div>\n        <% } else { %>\n          <div class="section-top"></div>\n          <div class="section-center flex-center">\n            <p><%= rejectMessage %></p>\n          </div>\n          <div class="section-bottom flex-middle">\n            <button id="reset" class="btn"><%= reset %></button>\n          </div>\n        <% } %>\n      ';

      _this2.model = {
        instructions: 'Login',
        send: 'Send',
        reset: 'Reset',
        rejectMessage: 'Sorry, you don\'t have access to this client',
        rejected: false
      };

      _this2._sendPasswordCallback = noop;
      _this2._resetPasswordCallback = noop;
      return _this2;
    }

    (0, _createClass3.default)(AuthView, [{
      key: 'onRender',
      value: function onRender() {
        var _this3 = this,
            _installEvents;

        (0, _get3.default)(AuthView.prototype.__proto__ || (0, _getPrototypeOf2.default)(AuthView.prototype), 'onRender', this).call(this);

        var interaction = getStartInteraction();

        this.installEvents((_installEvents = {}, (0, _defineProperty3.default)(_installEvents, interaction + ' #send', function () {
          var password = _this3.$el.querySelector('#password').value;

          if (password !== '') _this3._sendPasswordCallback(password);
        }), (0, _defineProperty3.default)(_installEvents, interaction + ' #reset', function () {
          return _this3._resetPasswordCallback();
        }), _installEvents));
      }
    }, {
      key: 'setSendPasswordCallback',
      value: function setSendPasswordCallback(callback) {
        this._sendPasswordCallback = callback;
      }
    }, {
      key: 'setResetPasswordCallback',
      value: function setResetPasswordCallback(callback) {
        this._resetPasswordCallback = callback;
      }
    }, {
      key: 'updateRejectedStatus',
      value: function updateRejectedStatus(value) {
        this.model.rejected = value;
        this.render();
      }
    }]);
    return AuthView;
  }(_client.SegmentedView),

  // ------------------------------------------------
  // Checkin
  // ------------------------------------------------
  'service:checkin': function (_SegmentedView3) {
    (0, _inherits3.default)(CheckinView, _SegmentedView3);

    function CheckinView() {
      (0, _classCallCheck3.default)(this, CheckinView);

      var _this4 = (0, _possibleConstructorReturn3.default)(this, (CheckinView.__proto__ || (0, _getPrototypeOf2.default)(CheckinView)).call(this));

      _this4.template = '\n        <% if (label) { %>\n          <div class="section-top flex-middle">\n            <p class="big"><%= labelPrefix %></p>\n          </div>\n          <div class="section-center flex-center">\n            <div class="checkin-label">\n              <p class="huge bold"><%= label %></p>\n            </div>\n          </div>\n          <div class="section-bottom flex-middle">\n            <p class="small"><%= labelPostfix %></p>\n          </div>\n        <% } else { %>\n          <div class="section-top"></div>\n          <div class="section-center flex-center">\n            <p><%= error ? errorMessage : wait %></p>\n          </div>\n          <div class="section-bottom"></div>\n        <% } %>\n      ';

      _this4.model = {
        labelPrefix: 'Go to',
        labelPostfix: 'Touch the screen<br class="portrait-only" />when you are ready.',
        error: false,
        errorMessage: 'Sorry,<br/>no place available',
        wait: 'Please wait...',
        label: ''
      };

      _this4._readyCallback = null;
      return _this4;
    }

    (0, _createClass3.default)(CheckinView, [{
      key: 'onRender',
      value: function onRender() {
        var _this5 = this;

        (0, _get3.default)(CheckinView.prototype.__proto__ || (0, _getPrototypeOf2.default)(CheckinView.prototype), 'onRender', this).call(this);

        var interaction = getStartInteraction();

        this.installEvents((0, _defineProperty3.default)({}, interaction, function () {
          return _this5._readyCallback();
        }));
      }
    }, {
      key: 'setReadyCallback',
      value: function setReadyCallback(callback) {
        this._readyCallback = callback;
      }
    }, {
      key: 'updateLabel',
      value: function updateLabel(value) {
        this.model.label = value;
        this.render();
      }
    }, {
      key: 'updateErrorStatus',
      value: function updateErrorStatus(value) {
        this.model.error = value;
        this.render();
      }
    }]);
    return CheckinView;
  }(_client.SegmentedView),

  // ------------------------------------------------
  // Locator
  // ------------------------------------------------
  'service:locator': function (_SquaredView) {
    (0, _inherits3.default)(LocatorView, _SquaredView);

    function LocatorView() {
      (0, _classCallCheck3.default)(this, LocatorView);

      var _this6 = (0, _possibleConstructorReturn3.default)(this, (LocatorView.__proto__ || (0, _getPrototypeOf2.default)(LocatorView)).call(this));

      _this6.template = '\n        <div class="section-square"></div>\n        <div class="section-float flex-middle">\n          <% if (!showBtn) { %>\n            <p class="small"><%= instructions %></p>\n          <% } else { %>\n            <button class="btn"><%= send %></button>\n          <% } %>\n        </div>\n      ';

      _this6.model = {
        instructions: 'Define your position in the area',
        send: 'Send',
        showBtn: false
      };

      _this6.area = null;
      _this6._selectCallback = noop;

      _this6._onAreaTouchStart = _this6._onAreaTouchStart.bind(_this6);
      _this6._onAreaTouchMove = _this6._onAreaTouchMove.bind(_this6);
      return _this6;
    }

    (0, _createClass3.default)(LocatorView, [{
      key: 'onRender',
      value: function onRender() {
        (0, _get3.default)(LocatorView.prototype.__proto__ || (0, _getPrototypeOf2.default)(LocatorView.prototype), 'onRender', this).call(this);
        this.$areaContainer = this.$el.querySelector('.section-square');
      }
    }, {
      key: 'setArea',
      value: function setArea(area) {
        this._area = area;
        this._renderArea();
      }
    }, {
      key: 'setSelectCallback',
      value: function setSelectCallback(callback) {
        this._selectCallback = callback;
      }
    }, {
      key: 'remove',
      value: function remove() {
        (0, _get3.default)(LocatorView.prototype.__proto__ || (0, _getPrototypeOf2.default)(LocatorView.prototype), 'remove', this).call(this);

        this.surface.removeListener('touchstart', this._onAreaTouchStart);
        this.surface.removeListener('touchmove', this._onAreaTouchMove);
      }
    }, {
      key: 'onResize',
      value: function onResize(viewportWidth, viewportHeight, orientation) {
        (0, _get3.default)(LocatorView.prototype.__proto__ || (0, _getPrototypeOf2.default)(LocatorView.prototype), 'onResize', this).call(this, viewportWidth, viewportHeight, orientation);
        this.selector.onResize(viewportWidth, viewportHeight, orientation);
      }
    }, {
      key: '_renderArea',
      value: function _renderArea() {
        this.selector = new _client.SpaceView();
        this.selector.setArea(this._area);

        this.selector.render();
        this.selector.appendTo(this.$areaContainer);
        this.selector.onRender();
        this.selector.show();

        this.surface = new _client.TouchSurface(this.selector.$svgContainer);
        this.surface.addListener('touchstart', this._onAreaTouchStart);
        this.surface.addListener('touchmove', this._onAreaTouchMove);
      }
    }, {
      key: '_onAreaTouchStart',
      value: function _onAreaTouchStart(id, normX, normY) {
        var _this7 = this;

        if (!this.position) {
          this._createPosition(normX, normY);

          this.model.showBtn = true;
          this.render('.section-float');
          this.installEvents({
            'click .btn': function clickBtn(e) {
              return _this7._selectCallback(_this7.position.x, _this7.position.y);
            }
          });
        } else {
          this._updatePosition(normX, normY);
        }
      }
    }, {
      key: '_onAreaTouchMove',
      value: function _onAreaTouchMove(id, normX, normY) {
        this._updatePosition(normX, normY);
      }
    }, {
      key: '_createPosition',
      value: function _createPosition(normX, normY) {
        this.position = {
          id: 'locator',
          x: normX * this._area.width,
          y: normY * this._area.height
        };

        this.selector.addPoint(this.position);
      }
    }, {
      key: '_updatePosition',
      value: function _updatePosition(normX, normY) {
        this.position.x = normX * this._area.width;
        this.position.y = normY * this._area.height;

        this.selector.updatePoint(this.position);
      }
    }]);
    return LocatorView;
  }(_client.SquaredView),

  // ------------------------------------------------
  // Placer
  // ------------------------------------------------
  'service:placer': function (_SquaredView2) {
    (0, _inherits3.default)(PlacerViewList, _SquaredView2);

    function PlacerViewList() {
      (0, _classCallCheck3.default)(this, PlacerViewList);

      var _this8 = (0, _possibleConstructorReturn3.default)(this, (PlacerViewList.__proto__ || (0, _getPrototypeOf2.default)(PlacerViewList)).call(this));

      _this8.template = '\n        <div class="section-square flex-middle">\n          <% if (rejected) { %>\n          <div class="fit-container flex-middle">\n            <p><%= reject %></p>\n          </div>\n          <% } %>\n        </div>\n        <div class="section-float flex-middle">\n          <% if (!rejected) { %>\n            <% if (showBtn) { %>\n              <button class="btn"><%= send %></button>\n            <% } %>\n          <% } %>\n        </div>\n      ';

      _this8.model = {
        instructions: 'Select your position',
        send: 'Send',
        reject: 'Sorry, no place is available',
        showBtn: false,
        rejected: false
      };

      _this8._onSelectionChange = _this8._onSelectionChange.bind(_this8);
      return _this8;
    }

    (0, _createClass3.default)(PlacerViewList, [{
      key: '_onSelectionChange',
      value: function _onSelectionChange(e) {
        var _this9 = this;

        this.model.showBtn = true;
        this.render('.section-float');

        this.installEvents({
          'click .btn': function clickBtn(e) {
            var position = _this9.selector.value;

            if (position) _this9._onSelect(position.index, position.label, position.coordinates);
          }
        });
      }
    }, {
      key: 'onRender',
      value: function onRender() {
        (0, _get3.default)(PlacerViewList.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlacerViewList.prototype), 'onRender', this).call(this);
        this.$selectorContainer = this.$el.querySelector('.section-square');
      }
    }, {
      key: 'onResize',
      value: function onResize(viewportWidth, viewportHeight, orientation) {
        (0, _get3.default)(PlacerViewList.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlacerViewList.prototype), 'onResize', this).call(this, viewportWidth, viewportHeight, orientation);
        this.selector.onResize(viewportWidth, viewportHeight, orientation);
      }
    }, {
      key: 'setArea',
      value: function setArea(area) {/* no need for area */}
    }, {
      key: 'setSelectCallack',
      value: function setSelectCallack(callback) {
        this._onSelect = callback;
      }
    }, {
      key: 'displayPositions',
      value: function displayPositions(capacity) {
        var labels = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var coordinates = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var maxClientsPerPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

        this.positions = [];
        this.numberPositions = capacity / maxClientsPerPosition;

        for (var index = 0; index < this.numberPositions; index++) {
          var label = labels !== null ? labels[index] : (index + 1).toString();
          var position = { index: index, label: label };

          if (coordinates) position.coordinates = coordinates[index];

          this.positions.push(position);
        }

        this.selector = new _client.SelectView({
          instructions: this.model.instructions,
          entries: this.positions
        });

        this.selector.render();
        this.selector.appendTo(this.$selectorContainer);
        this.selector.onRender();
        this.selector.show();

        this.selector.installEvents({
          'change': this._onSelectionChange
        });
      }
    }, {
      key: 'updateDisabledPositions',
      value: function updateDisabledPositions(indexes) {
        for (var index = 0; index < this.numberPositions; index++) {
          if (indexes.indexOf(index) === -1) this.selector.enableIndex(index);else this.selector.disableIndex(index);
        }
      }
    }, {
      key: 'reject',
      value: function reject(disabledPositions) {
        this.model.rejected = true;
        this.render();
      }
    }]);
    return PlacerViewList;
  }(_client.SquaredView),

  // graphic placer flavor for predetermined coordinates
  // 'service:placer': class PlacerViewGraphic extends SquaredView {
  //   constructor() {
  //     super();

  //     this.template = `
  //       <div class="section-square flex-middle">
  //         <% if (rejected) { %>
  //         <div class="fit-container flex-middle">
  //           <p><%= reject %></p>
  //         </div>
  //         <% } %>
  //       </div>
  //       <div class="section-float flex-middle">
  //         <% if (!rejected) { %>
  //           <% if (showBtn) { %>
  //             <button class="btn"><%= send %></button>
  //           <% } %>
  //         <% } %>
  //       </div>
  //     `;

  //     this.model = {
  //       instructions: 'Select your position',
  //       send: 'Send',
  //       reject: 'Sorry, no place is available',
  //       showBtn: false,
  //       rejected: false,
  //     };

  //     this._area = null;
  //     this._disabledPositions = [];
  //     this._onSelectionChange = this._onSelectionChange.bind(this);
  //   }

  //   onRender() {
  //     super.onRender();
  //     this.$selectorContainer = this.$el.querySelector('.section-square');
  //   }

  //   onResize(viewportWidth, viewportHeight, orientation) {
  //     super.onResize(viewportWidth, viewportHeight, orientation);
  //     this.selector.onResize(viewportWidth, viewportHeight, orientation);
  //   }

  //   _onSelectionChange(e) {
  //     const position = this.selector.shapePointMap.get(e.target);
  //     const disabledIndex = this._disabledPositions.indexOf(position.index);

  //     if (disabledIndex === -1)
  //       this._onSelect(position.id, position.label, [position.x, position.y]);
  //   }

  //   setArea(area) {
  //     this._area = area;
  //   }

  //   displayPositions(capacity, labels = null, coordinates = null, maxClientsPerPosition = 1) {
  //     this.numberPositions = capacity / maxClientsPerPosition;
  //     this.positions = [];

  //     for (let i = 0; i < this.numberPositions; i++) {
  //       const label = labels !== null ? labels[i] : (i + 1).toString();
  //       const position = { id: i, label: label };
  //       const coords = coordinates[i];
  //       position.x = coords[0];
  //       position.y = coords[1];

  //       this.positions.push(position);
  //     }

  //     this.selector = new SpaceView();
  //     this.selector.setArea(this._area);
  //     this.selector.render();
  //     this.selector.appendTo(this.$selectorContainer);
  //     this.selector.onRender();
  //     this.selector.show();
  //     this.selector.setPoints(this.positions);

  //     this.selector.installEvents({
  //       'click .point': this._onSelectionChange
  //     });
  //   }

  //   updateDisabledPositions(indexes) {
  //     this._disabledPositions = indexes;

  //     for (let index = 0; index < this.numberPositions; index++) {
  //       const position = this.positions[index];
  //       const isDisabled = indexes.indexOf(index) !== -1;
  //       position.selected = isDisabled ? true : false;
  //       this.selector.updatePoint(position);
  //     }
  //   }

  //   setSelectCallack(callback) {
  //     this._onSelect = callback;
  //   }

  //   reject(disabledPositions) {
  //     this.model.rejected = true;
  //     this.render();
  //   }
  // },

  // ------------------------------------------------
  // Platform
  // ------------------------------------------------
  'service:platform': function (_SegmentedView4) {
    (0, _inherits3.default)(PlatformView, _SegmentedView4);

    function PlatformView() {
      (0, _classCallCheck3.default)(this, PlatformView);

      var _this10 = (0, _possibleConstructorReturn3.default)(this, (PlatformView.__proto__ || (0, _getPrototypeOf2.default)(PlatformView)).call(this));

      _this10.template = '\n        <% if (isCompatible === false) { %>\n          <div class="section-top"></div>\n          <div class="section-center flex-center">\n            <p><%= errorCompatibleMessage %></p>\n          </div>\n          <div class="section-bottom"></div>\n        <% } else if (hasAuthorizations === false) { %>\n          <div class="section-top"></div>\n          <div class="section-center flex-center">\n            <p><%= errorHooksMessage %></p>\n          </div>\n          <div class="section-bottom"></div>\n        <% } else { %>\n          <div class="section-top flex-middle"></div>\n          <div class="section-center flex-center">\n              <p class="big">\n                <%= intro %>\n                <br />\n                <b><%= globals.appName %></b>\n              </p>\n          </div>\n          <div class="section-bottom flex-middle">\n            <% if (checking === true) { %>\n            <p class="small soft-blink"><%= checkingMessage %></p>\n            <% } else if (hasAuthorizations === true) { %>\n            <p class="small soft-blink"><%= instructions %></p>\n            <% } %>\n          </div>\n        <% } %>\n      ';

      _this10.model = {
        isCompatible: null,
        hasAuthorizations: null,
        checking: false,
        intro: 'Welcome to',
        instructions: 'Touch the screen to join!',
        checkingMessage: 'Please wait while checking compatiblity',
        errorCompatibleMessage: 'Sorry,<br />Your device is not compatible with the application.',
        errorHooksMessage: 'Sorry,<br />The application didn\'t obtain the necessary authorizations.'
      };

      _this10._touchstartCallback = noop;
      _this10._mousedownCallback = noop;
      return _this10;
    }

    (0, _createClass3.default)(PlatformView, [{
      key: 'onRender',
      value: function onRender() {
        var _this11 = this;

        (0, _get3.default)(PlatformView.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlatformView.prototype), 'onRender', this).call(this);

        this.installEvents({
          'mousedown': function mousedown(e) {
            return _this11._mousedownCallback(e);
          },
          'touchstart': function touchstart(e) {
            return _this11._touchstartCallback(e);
          }
        });
      }
    }, {
      key: 'setTouchStartCallback',
      value: function setTouchStartCallback(callback) {
        this._touchstartCallback = callback;
      }
    }, {
      key: 'setMouseDownCallback',
      value: function setMouseDownCallback(callback) {
        this._mousedownCallback = callback;
      }
    }, {
      key: 'updateCheckingStatus',
      value: function updateCheckingStatus(value) {
        this.model.checking = value;
        this.render();
      }
    }, {
      key: 'updateIsCompatibleStatus',
      value: function updateIsCompatibleStatus(value) {
        this.model.isCompatible = value;
        this.render();
      }
    }, {
      key: 'updateHasAuthorizationsStatus',
      value: function updateHasAuthorizationsStatus(value) {
        this.model.hasAuthorizations = value;
        this.render();
      }
    }]);
    return PlatformView;
  }(_client.SegmentedView),

  // ------------------------------------------------
  // Raw-Socket
  // ------------------------------------------------
  'service:raw-socket': function (_SegmentedView5) {
    (0, _inherits3.default)(RawSocketView, _SegmentedView5);

    function RawSocketView() {
      (0, _classCallCheck3.default)(this, RawSocketView);

      var _this12 = (0, _possibleConstructorReturn3.default)(this, (RawSocketView.__proto__ || (0, _getPrototypeOf2.default)(RawSocketView)).call(this));

      _this12.template = '\n        <div class="section-top"></div>\n        <div class="section-center flex-center">\n          <p class="soft-blink"><%= wait %></p>\n        </div>\n        <div class="section-bottom"></div>\n      ';

      _this12.model = {
        wait: 'Opening socket,<br />stand by&hellip;'
      };
      return _this12;
    }

    return RawSocketView;
  }(_client.SegmentedView),

  // ------------------------------------------------
  // Sync
  // ------------------------------------------------
  'service:sync': function (_SegmentedView6) {
    (0, _inherits3.default)(RawSocketView, _SegmentedView6);

    function RawSocketView() {
      (0, _classCallCheck3.default)(this, RawSocketView);

      var _this13 = (0, _possibleConstructorReturn3.default)(this, (RawSocketView.__proto__ || (0, _getPrototypeOf2.default)(RawSocketView)).call(this));

      _this13.template = '\n        <div class="section-top"></div>\n        <div class="section-center flex-center">\n          <p class="soft-blink"><%= wait %></p>\n        </div>\n        <div class="section-bottom"></div>\n      ';

      _this13.model = {
        wait: 'Clock syncing,<br />stand by&hellip;'
      };
      return _this13;
    }

    return RawSocketView;
  }(_client.SegmentedView),

  // public API
  has: function has(id) {
    return !!this[id];
  },
  get: function get(id, config) {
    var ctor = this[id];
    var view = new ctor();
    // additionnal configuration
    view.model.globals = (0, _assign2.default)({}, config);
    view.options.id = id.replace(/\:/g, '-');
    view.options.className = _client.client.type;

    return view;
  }
};

exports.default = serviceViews;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZpY2VWaWV3cy5qcyJdLCJuYW1lcyI6WyJub29wIiwiZ2V0U3RhcnRJbnRlcmFjdGlvbiIsImludGVyYWN0aW9uIiwiaW50ZXJhdGlvbiIsInNlcnZpY2VWaWV3cyIsInRlbXBsYXRlIiwibW9kZWwiLCJzdGF0dXMiLCJzaG93UHJvZ3Jlc3MiLCJtc2ciLCJsb2FkaW5nIiwiZGVjb2RpbmciLCIkcHJvZ3Jlc3NCYXIiLCIkZWwiLCJxdWVyeVNlbGVjdG9yIiwicmF0aW8iLCJwZXJjZW50IiwiTWF0aCIsInJvdW5kIiwicmVuZGVyIiwic3R5bGUiLCJ3aWR0aCIsImluc3RydWN0aW9ucyIsInNlbmQiLCJyZXNldCIsInJlamVjdE1lc3NhZ2UiLCJyZWplY3RlZCIsIl9zZW5kUGFzc3dvcmRDYWxsYmFjayIsIl9yZXNldFBhc3N3b3JkQ2FsbGJhY2siLCJpbnN0YWxsRXZlbnRzIiwicGFzc3dvcmQiLCJ2YWx1ZSIsImNhbGxiYWNrIiwibGFiZWxQcmVmaXgiLCJsYWJlbFBvc3RmaXgiLCJlcnJvciIsImVycm9yTWVzc2FnZSIsIndhaXQiLCJsYWJlbCIsIl9yZWFkeUNhbGxiYWNrIiwic2hvd0J0biIsImFyZWEiLCJfc2VsZWN0Q2FsbGJhY2siLCJfb25BcmVhVG91Y2hTdGFydCIsImJpbmQiLCJfb25BcmVhVG91Y2hNb3ZlIiwiJGFyZWFDb250YWluZXIiLCJfYXJlYSIsIl9yZW5kZXJBcmVhIiwic3VyZmFjZSIsInJlbW92ZUxpc3RlbmVyIiwidmlld3BvcnRXaWR0aCIsInZpZXdwb3J0SGVpZ2h0Iiwib3JpZW50YXRpb24iLCJzZWxlY3RvciIsIm9uUmVzaXplIiwic2V0QXJlYSIsImFwcGVuZFRvIiwib25SZW5kZXIiLCJzaG93IiwiJHN2Z0NvbnRhaW5lciIsImFkZExpc3RlbmVyIiwiaWQiLCJub3JtWCIsIm5vcm1ZIiwicG9zaXRpb24iLCJfY3JlYXRlUG9zaXRpb24iLCJlIiwieCIsInkiLCJfdXBkYXRlUG9zaXRpb24iLCJoZWlnaHQiLCJhZGRQb2ludCIsInVwZGF0ZVBvaW50IiwicmVqZWN0IiwiX29uU2VsZWN0aW9uQ2hhbmdlIiwiX29uU2VsZWN0IiwiaW5kZXgiLCJjb29yZGluYXRlcyIsIiRzZWxlY3RvckNvbnRhaW5lciIsImNhcGFjaXR5IiwibGFiZWxzIiwibWF4Q2xpZW50c1BlclBvc2l0aW9uIiwicG9zaXRpb25zIiwibnVtYmVyUG9zaXRpb25zIiwidG9TdHJpbmciLCJwdXNoIiwiZW50cmllcyIsImluZGV4ZXMiLCJpbmRleE9mIiwiZW5hYmxlSW5kZXgiLCJkaXNhYmxlSW5kZXgiLCJkaXNhYmxlZFBvc2l0aW9ucyIsImlzQ29tcGF0aWJsZSIsImhhc0F1dGhvcml6YXRpb25zIiwiY2hlY2tpbmciLCJpbnRybyIsImNoZWNraW5nTWVzc2FnZSIsImVycm9yQ29tcGF0aWJsZU1lc3NhZ2UiLCJlcnJvckhvb2tzTWVzc2FnZSIsIl90b3VjaHN0YXJ0Q2FsbGJhY2siLCJfbW91c2Vkb3duQ2FsbGJhY2siLCJoYXMiLCJnZXQiLCJjb25maWciLCJjdG9yIiwidmlldyIsImdsb2JhbHMiLCJvcHRpb25zIiwicmVwbGFjZSIsImNsYXNzTmFtZSIsInR5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFTQTtBQUNBOzs7Ozs7QUFNQTs7Ozs7Ozs7QUFRQTs7QUFFQSxJQUFNQSxPQUFPLFNBQVBBLElBQU8sR0FBTSxDQUFFLENBQXJCOztBQUVBLFNBQVNDLG1CQUFULEdBQStCO0FBQzdCLE1BQUlDLGNBQWMsT0FBbEI7O0FBRUEsTUFBSSxlQUFPQyxVQUFQLEtBQXNCLElBQTFCLEVBQWdDO0FBQzlCLFFBQUksZUFBT0EsVUFBUCxLQUFzQixPQUExQixFQUNFRCxjQUFjLFlBQWQsQ0FERixLQUdFQSxjQUFjLFdBQWQ7QUFDSDs7QUFFRCxTQUFPQSxXQUFQO0FBQ0Q7O0FBRUQsSUFBTUUsZUFBZTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUFBOztBQUNFLHNDQUFxQjtB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QUEvQjtBQUNBLGFBQUtaLE1BQUw7QUFDRDtBQWpGSDtBQUFBO0FBQUEsMEJBbGdCbUI7O0FBc2xCbkI7QUFDQTtBQUNBO0FBQ0E7QUFBQTs7QUFDRSw2QkFBYztBQUFBOztBQUFBOztBQUdaLGNBQUtkLFFBQUw7O0FBUUEsY0FBS0MsS0FBTCxHQUFhO0FBQ1grQjtBQURXLE9BQWI7QUFYWTtBQWNiOztBQWZIO0FBQUEsMEJBemxCbUI7O0FBMm1CbkI7QUFDQTtBQUNBO0FBQ0E7QUFBQTs7QUFDRSw2QkFBYztBQUFBOztBQUFBOztBQUdaLGNBQUtoQyxRQUFMOztBQVFBLGNBQUtDLEtBQUwsR0FBYTtBQUNYK0I7QUFEVyxPQUFiO0FBWFk7QUFjYjs7QUFmSDtBQUFBLDBCQTltQm1COztBQWlvQm5CO0FBQ0FpRSxLQWxvQm1CLGVBa29CZnhDLEVBbG9CZSxFQWtvQlg7QUFDTixXQUFPLENBQUMsQ0FBQyxLQUFLQSxFQUFMLENBQVQ7QUFDRCxHQXBvQmtCO0FBc29CbkJ5QyxLQXRvQm1CLGVBc29CZnpDLEVBdG9CZSxFQXNvQlgwQyxNQXRvQlcsRUFzb0JIO0FBQ2QsUUFBTUMsT0FBTyxLQUFLM0MsRUFBTCxDQUFiO0FBQ0EsUUFBTTRDLE9BQU8sSUFBSUQsSUFBSixFQUFiO0FBQ0E7QUFDQUMsU0FBS3BHLEtBQUwsQ0FBV3FHLE9BQVgsR0FBcUIsc0JBQWMsRUFBZCxFQUFrQkgsTUFBbEIsQ0FBckI7QUFDQUUsU0FBS0UsT0FBTCxDQUFhOUMsRUFBYixHQUFrQkEsR0FBRytDLE9BQUgsQ0FBVyxLQUFYLEVBQWtCLEdBQWxCLENBQWxCO0FBQ0FILFNBQUtFLE9BQUwsQ0FBYUUsU0FBYixHQUF5QixlQUFPQyxJQUFoQzs7QUFFQSxXQUFPTCxJQUFQO0FBQ0Q7QUEvb0JrQixDQUFyQjs7a0JBa3BCZXRHLFkiLCJmaWxlIjoic2VydmljZVZpZXdzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgU2VnbWVudGVkVmlldyxcbiAgU2VsZWN0VmlldyxcbiAgU3BhY2VWaWV3LFxuICBTcXVhcmVkVmlldyxcbiAgVG91Y2hTdXJmYWNlLFxuICBjbGllbnQsXG59IGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGV4YW1wbGVcbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgdmlldyBvZiB0aGUgYGF1ZGlvLWJ1ZmZlci1tYW5hZ2VyYCBzZXJ2aWNlLlxuICpcbiAqIEBpbnRlcmZhY2UgQWJzdHJhY3RBdWRpb0J1ZmZlck1hbmFnZXJWaWV3XG4gKiBAZXh0ZW5kcyBtb2R1bGU6c291bmR3b3Jrcy9jbGllbnQuVmlld1xuICovXG4vKipcbiAqIE1ldGhvZCBjYWxsZWQgd2hlbiBhIG5ldyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudGx5IGxvYWRlZCBhc3NldHNcbiAqIGlzIHJlY2VpdmVkLlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgQWJzdHJhY3RBdWRpb0J1ZmZlck1hbmFnZXJWaWV3Lm9uUHJvZ3Jlc3NcbiAqIEBwYXJhbSB7TnVtYmVyfSBwZXJjZW50IC0gVGhlIHB1cmNlbnRhZ2Ugb2YgbG9hZGVkIGFzc2V0cy5cbiAqL1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IG5vb3AgPSAoKSA9PiB7fTtcblxuZnVuY3Rpb24gZ2V0U3RhcnRJbnRlcmFjdGlvbigpIHtcbiAgbGV0IGludGVyYWN0aW9uID0gJ2NsaWNrJztcblxuICBpZiAoY2xpZW50LmludGVyYXRpb24gIT09IG51bGwpIHtcbiAgICBpZiAoY2xpZW50LmludGVyYXRpb24gPT09ICd0b3VjaCcpXG4gICAgICBpbnRlcmFjdGlvbiA9ICd0b3VjaHN0YXJ0JztcbiAgICBlbHNlXG4gICAgICBpbnRlcmFjdGlvbiA9ICdtb3VzZWRvd24nO1xuICB9XG5cbiAgcmV0dXJuIGludGVyYWN0aW9uO1xufVxuXG5jb25zdCBzZXJ2aWNlVmlld3MgPSB7XG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBBdWRpb0J1ZmZlck1hbmFnZXJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICdzZXJ2aWNlOmF1ZGlvLWJ1ZmZlci1tYW5hZ2VyJzogY2xhc3MgQXVkaW9CdWZmZXJNYW5hZ2VyVmlldyBleHRlbmRzIFNlZ21lbnRlZFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgIHN1cGVyKCk7XG5cbiAgICAgIHRoaXMudGVtcGxhdGUgPSBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcCBmbGV4LW1pZGRsZVwiPlxuICAgICAgICAgIDxwPjwlPSBtc2dbc3RhdHVzXSAlPjwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPlxuICAgICAgICAgIDwlIGlmIChzaG93UHJvZ3Jlc3MpIHsgJT5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJvZ3Jlc3Mtd3JhcFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByb2dyZXNzLWJhclwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwlIH0gJT5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbVwiPjwvZGl2PlxuICAgICAgYDtcblxuICAgICAgdGhpcy5tb2RlbCA9IHtcbiAgICAgICAgc3RhdHVzOiAnbG9hZGluZycsXG4gICAgICAgIHNob3dQcm9ncmVzczogdHJ1ZSxcbiAgICAgICAgbXNnOiB7XG4gICAgICAgICAgbG9hZGluZzogJ0xvYWRpbmcgc291bmRzLi4uJyxcbiAgICAgICAgICBkZWNvZGluZzogJ0RlY29kaW5nIHNvdW5kcy4uLicsXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgb25SZW5kZXIoKSB7XG4gICAgICBzdXBlci5vblJlbmRlcigpO1xuICAgICAgdGhpcy4kcHJvZ3Jlc3NCYXIgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcucHJvZ3Jlc3MtYmFyJyk7XG4gICAgfVxuXG4gICAgc2V0UHJvZ3Jlc3NSYXRpbyhyYXRpbykge1xuICAgICAgY29uc3QgcGVyY2VudCA9IE1hdGgucm91bmQocmF0aW8gKiAxMDApO1xuXG4gICAgICBpZiAocGVyY2VudCA9PT0gMTAwKSB7XG4gICAgICAgIHRoaXMubW9kZWwuc3RhdHVzID0gJ2RlY29kaW5nJztcbiAgICAgICAgdGhpcy5yZW5kZXIoJy5zZWN0aW9uLXRvcCcpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5tb2RlbC5zaG93UHJvZ3Jlc3MpXG4gICAgICAgIHRoaXMuJHByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gYCR7cGVyY2VudH0lYDtcbiAgICB9XG4gIH0sXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEF1dGhcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICdzZXJ2aWNlOmF1dGgnOiBjbGFzcyBBdXRoVmlldyBleHRlbmRzIFNlZ21lbnRlZFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIoKTtcblxuICAgICAgdGhpcy50ZW1wbGF0ZSA9IGBcbiAgICAgICAgPCUgaWYgKCFyZWplY3RlZCkgeyAlPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcCBmbGV4LW1pZGRsZVwiPlxuICAgICAgICAgICAgPHA+PCU9IGluc3RydWN0aW9ucyAlPjwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBpZD1cInBhc3N3b3JkXCIgLz5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0blwiIGlkPVwic2VuZFwiPjwlPSBzZW5kICU+PC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b20gZmxleC1taWRkbGVcIj5cbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCJyZXNldFwiIGNsYXNzPVwiYnRuXCI+PCU9IHJlc2V0ICU+PC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwlIH0gZWxzZSB7ICU+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wXCI+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgICAgICAgICA8cD48JT0gcmVqZWN0TWVzc2FnZSAlPjwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b20gZmxleC1taWRkbGVcIj5cbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCJyZXNldFwiIGNsYXNzPVwiYnRuXCI+PCU9IHJlc2V0ICU+PC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwlIH0gJT5cbiAgICAgIGA7XG5cbiAgICAgIHRoaXMubW9kZWwgPSB7XG4gICAgICAgIGluc3RydWN0aW9uczogJ0xvZ2luJyxcbiAgICAgICAgc2VuZDogJ1NlbmQnLFxuICAgICAgICByZXNldDogJ1Jlc2V0JyxcbiAgICAgICAgcmVqZWN0TWVzc2FnZTogYFNvcnJ5LCB5b3UgZG9uJ3QgaGF2ZSBhY2Nlc3MgdG8gdGhpcyBjbGllbnRgLFxuICAgICAgICByZWplY3RlZDogZmFsc2UsXG4gICAgICB9O1xuXG4gICAgICB0aGlzLl9zZW5kUGFzc3dvcmRDYWxsYmFjayA9IG5vb3A7XG4gICAgICB0aGlzLl9yZXNldFBhc3N3b3JkQ2FsbGJhY2sgPSBub29wO1xuICAgIH1cblxuICAgIG9uUmVuZGVyKCkge1xuICAgICAgc3VwZXIub25SZW5kZXIoKTtcblxuICAgICAgY29uc3QgaW50ZXJhY3Rpb24gPSBnZXRTdGFydEludGVyYWN0aW9uKCk7XG5cbiAgICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAgIFtpbnRlcmFjdGlvbiArICcgI3NlbmQnXTogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBhc3N3b3JkID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignI3Bhc3N3b3JkJykudmFsdWU7XG5cbiAgICAgICAgICBpZiAocGFzc3dvcmQgIT09ICcnKVxuICAgICAgICAgICAgdGhpcy5fc2VuZFBhc3N3b3JkQ2FsbGJhY2socGFzc3dvcmQpO1xuICAgICAgICB9LFxuICAgICAgICBbaW50ZXJhY3Rpb24gKyAnICNyZXNldCddOiAoKSA9PiB0aGlzLl9yZXNldFBhc3N3b3JkQ2FsbGJhY2soKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldFNlbmRQYXNzd29yZENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLl9zZW5kUGFzc3dvcmRDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cblxuICAgIHNldFJlc2V0UGFzc3dvcmRDYWxsYmFjayhjYWxsYmFjaykge1xuICAgICAgdGhpcy5fcmVzZXRQYXNzd29yZENhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuXG4gICAgdXBkYXRlUmVqZWN0ZWRTdGF0dXModmFsdWUpIHtcbiAgICAgIHRoaXMubW9kZWwucmVqZWN0ZWQgPSB2YWx1ZTtcbiAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuICB9LFxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBDaGVja2luXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAnc2VydmljZTpjaGVja2luJzogY2xhc3MgQ2hlY2tpblZpZXcgZXh0ZW5kcyBTZWdtZW50ZWRWaWV3IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHN1cGVyKCk7XG5cbiAgICAgIHRoaXMudGVtcGxhdGUgPSBgXG4gICAgICAgIDwlIGlmIChsYWJlbCkgeyAlPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcCBmbGV4LW1pZGRsZVwiPlxuICAgICAgICAgICAgPHAgY2xhc3M9XCJiaWdcIj48JT0gbGFiZWxQcmVmaXggJT48L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2hlY2tpbi1sYWJlbFwiPlxuICAgICAgICAgICAgICA8cCBjbGFzcz1cImh1Z2UgYm9sZFwiPjwlPSBsYWJlbCAlPjwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbSBmbGV4LW1pZGRsZVwiPlxuICAgICAgICAgICAgPHAgY2xhc3M9XCJzbWFsbFwiPjwlPSBsYWJlbFBvc3RmaXggJT48L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwlIH0gZWxzZSB7ICU+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wXCI+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgICAgICAgICA8cD48JT0gZXJyb3IgPyBlcnJvck1lc3NhZ2UgOiB3YWl0ICU+PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbVwiPjwvZGl2PlxuICAgICAgICA8JSB9ICU+XG4gICAgICBgO1xuXG4gICAgICB0aGlzLm1vZGVsID0ge1xuICAgICAgICBsYWJlbFByZWZpeDogJ0dvIHRvJyxcbiAgICAgICAgbGFiZWxQb3N0Zml4OiAnVG91Y2ggdGhlIHNjcmVlbjxiciBjbGFzcz1cInBvcnRyYWl0LW9ubHlcIiAvPndoZW4geW91IGFyZSByZWFkeS4nLFxuICAgICAgICBlcnJvcjogZmFsc2UsXG4gICAgICAgIGVycm9yTWVzc2FnZTogJ1NvcnJ5LDxici8+bm8gcGxhY2UgYXZhaWxhYmxlJyxcbiAgICAgICAgd2FpdDogJ1BsZWFzZSB3YWl0Li4uJyxcbiAgICAgICAgbGFiZWw6ICcnLFxuICAgICAgfTtcblxuICAgICAgdGhpcy5fcmVhZHlDYWxsYmFjayA9IG51bGw7XG4gICAgfVxuXG4gICAgb25SZW5kZXIoKSB7XG4gICAgICBzdXBlci5vblJlbmRlcigpO1xuXG4gICAgICBjb25zdCBpbnRlcmFjdGlvbiA9IGdldFN0YXJ0SW50ZXJhY3Rpb24oKTtcblxuICAgICAgdGhpcy5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICAgW2ludGVyYWN0aW9uXTogKCkgPT4gdGhpcy5fcmVhZHlDYWxsYmFjaygpLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0UmVhZHlDYWxsYmFjayhjYWxsYmFjaykge1xuICAgICAgdGhpcy5fcmVhZHlDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cblxuICAgIHVwZGF0ZUxhYmVsKHZhbHVlKSB7XG4gICAgICB0aGlzLm1vZGVsLmxhYmVsID0gdmFsdWU7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHVwZGF0ZUVycm9yU3RhdHVzKHZhbHVlKSB7XG4gICAgICB0aGlzLm1vZGVsLmVycm9yID0gdmFsdWU7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cbiAgfSxcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gTG9jYXRvclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgJ3NlcnZpY2U6bG9jYXRvcic6IGNsYXNzIExvY2F0b3JWaWV3IGV4dGVuZHMgU3F1YXJlZFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIoKTtcblxuICAgICAgdGhpcy50ZW1wbGF0ZSA9IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tc3F1YXJlXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWZsb2F0IGZsZXgtbWlkZGxlXCI+XG4gICAgICAgICAgPCUgaWYgKCFzaG93QnRuKSB7ICU+XG4gICAgICAgICAgICA8cCBjbGFzcz1cInNtYWxsXCI+PCU9IGluc3RydWN0aW9ucyAlPjwvcD5cbiAgICAgICAgICA8JSB9IGVsc2UgeyAlPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0blwiPjwlPSBzZW5kICU+PC9idXR0b24+XG4gICAgICAgICAgPCUgfSAlPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIGA7XG5cbiAgICAgIHRoaXMubW9kZWwgPSB7XG4gICAgICAgIGluc3RydWN0aW9uczogJ0RlZmluZSB5b3VyIHBvc2l0aW9uIGluIHRoZSBhcmVhJyxcbiAgICAgICAgc2VuZDogJ1NlbmQnLFxuICAgICAgICBzaG93QnRuOiBmYWxzZSxcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuYXJlYSA9IG51bGw7XG4gICAgICB0aGlzLl9zZWxlY3RDYWxsYmFjayA9IG5vb3A7XG5cbiAgICAgIHRoaXMuX29uQXJlYVRvdWNoU3RhcnQgPSB0aGlzLl9vbkFyZWFUb3VjaFN0YXJ0LmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9vbkFyZWFUb3VjaE1vdmUgPSB0aGlzLl9vbkFyZWFUb3VjaE1vdmUuYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBvblJlbmRlcigpIHtcbiAgICAgIHN1cGVyLm9uUmVuZGVyKCk7XG4gICAgICB0aGlzLiRhcmVhQ29udGFpbmVyID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLnNlY3Rpb24tc3F1YXJlJyk7XG4gICAgfVxuXG4gICAgc2V0QXJlYShhcmVhKSB7XG4gICAgICB0aGlzLl9hcmVhID0gYXJlYTtcbiAgICAgIHRoaXMuX3JlbmRlckFyZWEoKTtcbiAgICB9XG5cbiAgICBzZXRTZWxlY3RDYWxsYmFjayhjYWxsYmFjaykge1xuICAgICAgdGhpcy5fc2VsZWN0Q2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG5cbiAgICByZW1vdmUoKSB7XG4gICAgICBzdXBlci5yZW1vdmUoKTtcblxuICAgICAgdGhpcy5zdXJmYWNlLnJlbW92ZUxpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fb25BcmVhVG91Y2hTdGFydCk7XG4gICAgICB0aGlzLnN1cmZhY2UucmVtb3ZlTGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX29uQXJlYVRvdWNoTW92ZSk7XG4gICAgfVxuXG4gICAgb25SZXNpemUodmlld3BvcnRXaWR0aCwgdmlld3BvcnRIZWlnaHQsIG9yaWVudGF0aW9uKSB7XG4gICAgICBzdXBlci5vblJlc2l6ZSh2aWV3cG9ydFdpZHRoLCB2aWV3cG9ydEhlaWdodCwgb3JpZW50YXRpb24pO1xuICAgICAgdGhpcy5zZWxlY3Rvci5vblJlc2l6ZSh2aWV3cG9ydFdpZHRoLCB2aWV3cG9ydEhlaWdodCwgb3JpZW50YXRpb24pO1xuICAgIH1cblxuICAgIF9yZW5kZXJBcmVhKCkge1xuICAgICAgdGhpcy5zZWxlY3RvciA9IG5ldyBTcGFjZVZpZXcoKTtcbiAgICAgIHRoaXMuc2VsZWN0b3Iuc2V0QXJlYSh0aGlzLl9hcmVhKTtcblxuICAgICAgdGhpcy5zZWxlY3Rvci5yZW5kZXIoKTtcbiAgICAgIHRoaXMuc2VsZWN0b3IuYXBwZW5kVG8odGhpcy4kYXJlYUNvbnRhaW5lcik7XG4gICAgICB0aGlzLnNlbGVjdG9yLm9uUmVuZGVyKCk7XG4gICAgICB0aGlzLnNlbGVjdG9yLnNob3coKTtcblxuICAgICAgdGhpcy5zdXJmYWNlID0gbmV3IFRvdWNoU3VyZmFjZSh0aGlzLnNlbGVjdG9yLiRzdmdDb250YWluZXIpO1xuICAgICAgdGhpcy5zdXJmYWNlLmFkZExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fb25BcmVhVG91Y2hTdGFydCk7XG4gICAgICB0aGlzLnN1cmZhY2UuYWRkTGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX29uQXJlYVRvdWNoTW92ZSk7XG4gICAgfVxuXG4gICAgX29uQXJlYVRvdWNoU3RhcnQoaWQsIG5vcm1YLCBub3JtWSkge1xuICAgICAgaWYgKCF0aGlzLnBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuX2NyZWF0ZVBvc2l0aW9uKG5vcm1YLCBub3JtWSk7XG5cbiAgICAgICAgdGhpcy5tb2RlbC5zaG93QnRuID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5yZW5kZXIoJy5zZWN0aW9uLWZsb2F0Jyk7XG4gICAgICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAgICAgJ2NsaWNrIC5idG4nOiAoZSkgPT4gdGhpcy5fc2VsZWN0Q2FsbGJhY2sodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uKG5vcm1YLCBub3JtWSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX29uQXJlYVRvdWNoTW92ZShpZCwgbm9ybVgsIG5vcm1ZKSB7XG4gICAgICB0aGlzLl91cGRhdGVQb3NpdGlvbihub3JtWCwgbm9ybVkpO1xuICAgIH1cblxuICAgIF9jcmVhdGVQb3NpdGlvbihub3JtWCwgbm9ybVkpIHtcbiAgICAgIHRoaXMucG9zaXRpb24gPSB7XG4gICAgICAgIGlkOiAnbG9jYXRvcicsXG4gICAgICAgIHg6IG5vcm1YICogdGhpcy5fYXJlYS53aWR0aCxcbiAgICAgICAgeTogbm9ybVkgKiB0aGlzLl9hcmVhLmhlaWdodCxcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuc2VsZWN0b3IuYWRkUG9pbnQodGhpcy5wb3NpdGlvbik7XG4gICAgfVxuXG4gICAgX3VwZGF0ZVBvc2l0aW9uKG5vcm1YLCBub3JtWSkge1xuICAgICAgdGhpcy5wb3NpdGlvbi54ID0gbm9ybVggKiB0aGlzLl9hcmVhLndpZHRoO1xuICAgICAgdGhpcy5wb3NpdGlvbi55ID0gbm9ybVkgKiB0aGlzLl9hcmVhLmhlaWdodDtcblxuICAgICAgdGhpcy5zZWxlY3Rvci51cGRhdGVQb2ludCh0aGlzLnBvc2l0aW9uKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFBsYWNlclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgJ3NlcnZpY2U6cGxhY2VyJzogY2xhc3MgUGxhY2VyVmlld0xpc3QgZXh0ZW5kcyBTcXVhcmVkVmlldyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICBzdXBlcigpO1xuXG4gICAgICB0aGlzLnRlbXBsYXRlID0gYFxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1zcXVhcmUgZmxleC1taWRkbGVcIj5cbiAgICAgICAgICA8JSBpZiAocmVqZWN0ZWQpIHsgJT5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZml0LWNvbnRhaW5lciBmbGV4LW1pZGRsZVwiPlxuICAgICAgICAgICAgPHA+PCU9IHJlamVjdCAlPjwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8JSB9ICU+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1mbG9hdCBmbGV4LW1pZGRsZVwiPlxuICAgICAgICAgIDwlIGlmICghcmVqZWN0ZWQpIHsgJT5cbiAgICAgICAgICAgIDwlIGlmIChzaG93QnRuKSB7ICU+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG5cIj48JT0gc2VuZCAlPjwvYnV0dG9uPlxuICAgICAgICAgICAgPCUgfSAlPlxuICAgICAgICAgIDwlIH0gJT5cbiAgICAgICAgPC9kaXY+XG4gICAgICBgO1xuXG4gICAgICB0aGlzLm1vZGVsID0ge1xuICAgICAgICBpbnN0cnVjdGlvbnM6ICdTZWxlY3QgeW91ciBwb3NpdGlvbicsXG4gICAgICAgIHNlbmQ6ICdTZW5kJyxcbiAgICAgICAgcmVqZWN0OiAnU29ycnksIG5vIHBsYWNlIGlzIGF2YWlsYWJsZScsXG4gICAgICAgIHNob3dCdG46IGZhbHNlLFxuICAgICAgICByZWplY3RlZDogZmFsc2UsXG4gICAgICB9O1xuXG4gICAgICB0aGlzLl9vblNlbGVjdGlvbkNoYW5nZSA9IHRoaXMuX29uU2VsZWN0aW9uQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgX29uU2VsZWN0aW9uQ2hhbmdlKGUpIHtcbiAgICAgIHRoaXMubW9kZWwuc2hvd0J0biA9IHRydWU7XG4gICAgICB0aGlzLnJlbmRlcignLnNlY3Rpb24tZmxvYXQnKTtcblxuICAgICAgdGhpcy5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICAgJ2NsaWNrIC5idG4nOiAoZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5zZWxlY3Rvci52YWx1ZTtcblxuICAgICAgICAgIGlmIChwb3NpdGlvbilcbiAgICAgICAgICAgIHRoaXMuX29uU2VsZWN0KHBvc2l0aW9uLmluZGV4LCBwb3NpdGlvbi5sYWJlbCwgcG9zaXRpb24uY29vcmRpbmF0ZXMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBvblJlbmRlcigpIHtcbiAgICAgIHN1cGVyLm9uUmVuZGVyKCk7XG4gICAgICB0aGlzLiRzZWxlY3RvckNvbnRhaW5lciA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5zZWN0aW9uLXNxdWFyZScpO1xuICAgIH1cblxuICAgIG9uUmVzaXplKHZpZXdwb3J0V2lkdGgsIHZpZXdwb3J0SGVpZ2h0LCBvcmllbnRhdGlvbikge1xuICAgICAgc3VwZXIub25SZXNpemUodmlld3BvcnRXaWR0aCwgdmlld3BvcnRIZWlnaHQsIG9yaWVudGF0aW9uKTtcbiAgICAgIHRoaXMuc2VsZWN0b3Iub25SZXNpemUodmlld3BvcnRXaWR0aCwgdmlld3BvcnRIZWlnaHQsIG9yaWVudGF0aW9uKTtcbiAgICB9XG5cbiAgICBzZXRBcmVhKGFyZWEpIHsgLyogbm8gbmVlZCBmb3IgYXJlYSAqLyB9XG5cbiAgICBzZXRTZWxlY3RDYWxsYWNrKGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLl9vblNlbGVjdCA9IGNhbGxiYWNrO1xuICAgIH1cblxuICAgIGRpc3BsYXlQb3NpdGlvbnMoY2FwYWNpdHksIGxhYmVscyA9IG51bGwsIGNvb3JkaW5hdGVzID0gbnVsbCwgbWF4Q2xpZW50c1BlclBvc2l0aW9uID0gMSkge1xuICAgICAgdGhpcy5wb3NpdGlvbnMgPSBbXTtcbiAgICAgIHRoaXMubnVtYmVyUG9zaXRpb25zID0gY2FwYWNpdHkgLyBtYXhDbGllbnRzUGVyUG9zaXRpb247XG5cbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLm51bWJlclBvc2l0aW9uczsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCBsYWJlbCA9IGxhYmVscyAhPT0gbnVsbCA/IGxhYmVsc1tpbmRleF0gOiAoaW5kZXggKyAxKS50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHsgaW5kZXg6IGluZGV4LCBsYWJlbDogbGFiZWwgfTtcblxuICAgICAgICBpZiAoY29vcmRpbmF0ZXMpXG4gICAgICAgICAgcG9zaXRpb24uY29vcmRpbmF0ZXMgPSBjb29yZGluYXRlc1tpbmRleF07XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbnMucHVzaChwb3NpdGlvbik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2VsZWN0b3IgPSBuZXcgU2VsZWN0Vmlldyh7XG4gICAgICAgIGluc3RydWN0aW9uczogdGhpcy5tb2RlbC5pbnN0cnVjdGlvbnMsXG4gICAgICAgIGVudHJpZXM6IHRoaXMucG9zaXRpb25zLFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2VsZWN0b3IucmVuZGVyKCk7XG4gICAgICB0aGlzLnNlbGVjdG9yLmFwcGVuZFRvKHRoaXMuJHNlbGVjdG9yQ29udGFpbmVyKTtcbiAgICAgIHRoaXMuc2VsZWN0b3Iub25SZW5kZXIoKTtcbiAgICAgIHRoaXMuc2VsZWN0b3Iuc2hvdygpO1xuXG4gICAgICB0aGlzLnNlbGVjdG9yLmluc3RhbGxFdmVudHMoe1xuICAgICAgICAnY2hhbmdlJzogdGhpcy5fb25TZWxlY3Rpb25DaGFuZ2UsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB1cGRhdGVEaXNhYmxlZFBvc2l0aW9ucyhpbmRleGVzKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5udW1iZXJQb3NpdGlvbnM7IGluZGV4KyspIHtcbiAgICAgICAgaWYgKGluZGV4ZXMuaW5kZXhPZihpbmRleCkgPT09IC0xKVxuICAgICAgICAgIHRoaXMuc2VsZWN0b3IuZW5hYmxlSW5kZXgoaW5kZXgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhpcy5zZWxlY3Rvci5kaXNhYmxlSW5kZXgoaW5kZXgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlamVjdChkaXNhYmxlZFBvc2l0aW9ucykge1xuICAgICAgdGhpcy5tb2RlbC5yZWplY3RlZCA9IHRydWU7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cbiAgfSxcblxuICAvLyBncmFwaGljIHBsYWNlciBmbGF2b3IgZm9yIHByZWRldGVybWluZWQgY29vcmRpbmF0ZXNcbiAgLy8gJ3NlcnZpY2U6cGxhY2VyJzogY2xhc3MgUGxhY2VyVmlld0dyYXBoaWMgZXh0ZW5kcyBTcXVhcmVkVmlldyB7XG4gIC8vICAgY29uc3RydWN0b3IoKSB7XG4gIC8vICAgICBzdXBlcigpO1xuXG4gIC8vICAgICB0aGlzLnRlbXBsYXRlID0gYFxuICAvLyAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1zcXVhcmUgZmxleC1taWRkbGVcIj5cbiAgLy8gICAgICAgICA8JSBpZiAocmVqZWN0ZWQpIHsgJT5cbiAgLy8gICAgICAgICA8ZGl2IGNsYXNzPVwiZml0LWNvbnRhaW5lciBmbGV4LW1pZGRsZVwiPlxuICAvLyAgICAgICAgICAgPHA+PCU9IHJlamVjdCAlPjwvcD5cbiAgLy8gICAgICAgICA8L2Rpdj5cbiAgLy8gICAgICAgICA8JSB9ICU+XG4gIC8vICAgICAgIDwvZGl2PlxuICAvLyAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1mbG9hdCBmbGV4LW1pZGRsZVwiPlxuICAvLyAgICAgICAgIDwlIGlmICghcmVqZWN0ZWQpIHsgJT5cbiAgLy8gICAgICAgICAgIDwlIGlmIChzaG93QnRuKSB7ICU+XG4gIC8vICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG5cIj48JT0gc2VuZCAlPjwvYnV0dG9uPlxuICAvLyAgICAgICAgICAgPCUgfSAlPlxuICAvLyAgICAgICAgIDwlIH0gJT5cbiAgLy8gICAgICAgPC9kaXY+XG4gIC8vICAgICBgO1xuXG4gIC8vICAgICB0aGlzLm1vZGVsID0ge1xuICAvLyAgICAgICBpbnN0cnVjdGlvbnM6ICdTZWxlY3QgeW91ciBwb3NpdGlvbicsXG4gIC8vICAgICAgIHNlbmQ6ICdTZW5kJyxcbiAgLy8gICAgICAgcmVqZWN0OiAnU29ycnksIG5vIHBsYWNlIGlzIGF2YWlsYWJsZScsXG4gIC8vICAgICAgIHNob3dCdG46IGZhbHNlLFxuICAvLyAgICAgICByZWplY3RlZDogZmFsc2UsXG4gIC8vICAgICB9O1xuXG4gIC8vICAgICB0aGlzLl9hcmVhID0gbnVsbDtcbiAgLy8gICAgIHRoaXMuX2Rpc2FibGVkUG9zaXRpb25zID0gW107XG4gIC8vICAgICB0aGlzLl9vblNlbGVjdGlvbkNoYW5nZSA9IHRoaXMuX29uU2VsZWN0aW9uQ2hhbmdlLmJpbmQodGhpcyk7XG4gIC8vICAgfVxuXG4gIC8vICAgb25SZW5kZXIoKSB7XG4gIC8vICAgICBzdXBlci5vblJlbmRlcigpO1xuICAvLyAgICAgdGhpcy4kc2VsZWN0b3JDb250YWluZXIgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuc2VjdGlvbi1zcXVhcmUnKTtcbiAgLy8gICB9XG5cbiAgLy8gICBvblJlc2l6ZSh2aWV3cG9ydFdpZHRoLCB2aWV3cG9ydEhlaWdodCwgb3JpZW50YXRpb24pIHtcbiAgLy8gICAgIHN1cGVyLm9uUmVzaXplKHZpZXdwb3J0V2lkdGgsIHZpZXdwb3J0SGVpZ2h0LCBvcmllbnRhdGlvbik7XG4gIC8vICAgICB0aGlzLnNlbGVjdG9yLm9uUmVzaXplKHZpZXdwb3J0V2lkdGgsIHZpZXdwb3J0SGVpZ2h0LCBvcmllbnRhdGlvbik7XG4gIC8vICAgfVxuXG4gIC8vICAgX29uU2VsZWN0aW9uQ2hhbmdlKGUpIHtcbiAgLy8gICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5zZWxlY3Rvci5zaGFwZVBvaW50TWFwLmdldChlLnRhcmdldCk7XG4gIC8vICAgICBjb25zdCBkaXNhYmxlZEluZGV4ID0gdGhpcy5fZGlzYWJsZWRQb3NpdGlvbnMuaW5kZXhPZihwb3NpdGlvbi5pbmRleCk7XG5cbiAgLy8gICAgIGlmIChkaXNhYmxlZEluZGV4ID09PSAtMSlcbiAgLy8gICAgICAgdGhpcy5fb25TZWxlY3QocG9zaXRpb24uaWQsIHBvc2l0aW9uLmxhYmVsLCBbcG9zaXRpb24ueCwgcG9zaXRpb24ueV0pO1xuICAvLyAgIH1cblxuICAvLyAgIHNldEFyZWEoYXJlYSkge1xuICAvLyAgICAgdGhpcy5fYXJlYSA9IGFyZWE7XG4gIC8vICAgfVxuXG4gIC8vICAgZGlzcGxheVBvc2l0aW9ucyhjYXBhY2l0eSwgbGFiZWxzID0gbnVsbCwgY29vcmRpbmF0ZXMgPSBudWxsLCBtYXhDbGllbnRzUGVyUG9zaXRpb24gPSAxKSB7XG4gIC8vICAgICB0aGlzLm51bWJlclBvc2l0aW9ucyA9IGNhcGFjaXR5IC8gbWF4Q2xpZW50c1BlclBvc2l0aW9uO1xuICAvLyAgICAgdGhpcy5wb3NpdGlvbnMgPSBbXTtcblxuICAvLyAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm51bWJlclBvc2l0aW9uczsgaSsrKSB7XG4gIC8vICAgICAgIGNvbnN0IGxhYmVsID0gbGFiZWxzICE9PSBudWxsID8gbGFiZWxzW2ldIDogKGkgKyAxKS50b1N0cmluZygpO1xuICAvLyAgICAgICBjb25zdCBwb3NpdGlvbiA9IHsgaWQ6IGksIGxhYmVsOiBsYWJlbCB9O1xuICAvLyAgICAgICBjb25zdCBjb29yZHMgPSBjb29yZGluYXRlc1tpXTtcbiAgLy8gICAgICAgcG9zaXRpb24ueCA9IGNvb3Jkc1swXTtcbiAgLy8gICAgICAgcG9zaXRpb24ueSA9IGNvb3Jkc1sxXTtcblxuICAvLyAgICAgICB0aGlzLnBvc2l0aW9ucy5wdXNoKHBvc2l0aW9uKTtcbiAgLy8gICAgIH1cblxuICAvLyAgICAgdGhpcy5zZWxlY3RvciA9IG5ldyBTcGFjZVZpZXcoKTtcbiAgLy8gICAgIHRoaXMuc2VsZWN0b3Iuc2V0QXJlYSh0aGlzLl9hcmVhKTtcbiAgLy8gICAgIHRoaXMuc2VsZWN0b3IucmVuZGVyKCk7XG4gIC8vICAgICB0aGlzLnNlbGVjdG9yLmFwcGVuZFRvKHRoaXMuJHNlbGVjdG9yQ29udGFpbmVyKTtcbiAgLy8gICAgIHRoaXMuc2VsZWN0b3Iub25SZW5kZXIoKTtcbiAgLy8gICAgIHRoaXMuc2VsZWN0b3Iuc2hvdygpO1xuICAvLyAgICAgdGhpcy5zZWxlY3Rvci5zZXRQb2ludHModGhpcy5wb3NpdGlvbnMpO1xuXG4gIC8vICAgICB0aGlzLnNlbGVjdG9yLmluc3RhbGxFdmVudHMoe1xuICAvLyAgICAgICAnY2xpY2sgLnBvaW50JzogdGhpcy5fb25TZWxlY3Rpb25DaGFuZ2VcbiAgLy8gICAgIH0pO1xuICAvLyAgIH1cblxuICAvLyAgIHVwZGF0ZURpc2FibGVkUG9zaXRpb25zKGluZGV4ZXMpIHtcbiAgLy8gICAgIHRoaXMuX2Rpc2FibGVkUG9zaXRpb25zID0gaW5kZXhlcztcblxuICAvLyAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMubnVtYmVyUG9zaXRpb25zOyBpbmRleCsrKSB7XG4gIC8vICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbnNbaW5kZXhdO1xuICAvLyAgICAgICBjb25zdCBpc0Rpc2FibGVkID0gaW5kZXhlcy5pbmRleE9mKGluZGV4KSAhPT0gLTE7XG4gIC8vICAgICAgIHBvc2l0aW9uLnNlbGVjdGVkID0gaXNEaXNhYmxlZCA/IHRydWUgOiBmYWxzZTtcbiAgLy8gICAgICAgdGhpcy5zZWxlY3Rvci51cGRhdGVQb2ludChwb3NpdGlvbik7XG4gIC8vICAgICB9XG4gIC8vICAgfVxuXG4gIC8vICAgc2V0U2VsZWN0Q2FsbGFjayhjYWxsYmFjaykge1xuICAvLyAgICAgdGhpcy5fb25TZWxlY3QgPSBjYWxsYmFjaztcbiAgLy8gICB9XG5cbiAgLy8gICByZWplY3QoZGlzYWJsZWRQb3NpdGlvbnMpIHtcbiAgLy8gICAgIHRoaXMubW9kZWwucmVqZWN0ZWQgPSB0cnVlO1xuICAvLyAgICAgdGhpcy5yZW5kZXIoKTtcbiAgLy8gICB9XG4gIC8vIH0sXG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFBsYXRmb3JtXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAnc2VydmljZTpwbGF0Zm9ybSc6IGNsYXNzIFBsYXRmb3JtVmlldyBleHRlbmRzIFNlZ21lbnRlZFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIoKTtcblxuICAgICAgdGhpcy50ZW1wbGF0ZSA9IGBcbiAgICAgICAgPCUgaWYgKGlzQ29tcGF0aWJsZSA9PT0gZmFsc2UpIHsgJT5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi10b3BcIj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICAgICAgICAgIDxwPjwlPSBlcnJvckNvbXBhdGlibGVNZXNzYWdlICU+PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbVwiPjwvZGl2PlxuICAgICAgICA8JSB9IGVsc2UgaWYgKGhhc0F1dGhvcml6YXRpb25zID09PSBmYWxzZSkgeyAlPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcFwiPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPlxuICAgICAgICAgICAgPHA+PCU9IGVycm9ySG9va3NNZXNzYWdlICU+PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbVwiPjwvZGl2PlxuICAgICAgICA8JSB9IGVsc2UgeyAlPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcCBmbGV4LW1pZGRsZVwiPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPlxuICAgICAgICAgICAgICA8cCBjbGFzcz1cImJpZ1wiPlxuICAgICAgICAgICAgICAgIDwlPSBpbnRybyAlPlxuICAgICAgICAgICAgICAgIDxiciAvPlxuICAgICAgICAgICAgICAgIDxiPjwlPSBnbG9iYWxzLmFwcE5hbWUgJT48L2I+XG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b20gZmxleC1taWRkbGVcIj5cbiAgICAgICAgICAgIDwlIGlmIChjaGVja2luZyA9PT0gdHJ1ZSkgeyAlPlxuICAgICAgICAgICAgPHAgY2xhc3M9XCJzbWFsbCBzb2Z0LWJsaW5rXCI+PCU9IGNoZWNraW5nTWVzc2FnZSAlPjwvcD5cbiAgICAgICAgICAgIDwlIH0gZWxzZSBpZiAoaGFzQXV0aG9yaXphdGlvbnMgPT09IHRydWUpIHsgJT5cbiAgICAgICAgICAgIDxwIGNsYXNzPVwic21hbGwgc29mdC1ibGlua1wiPjwlPSBpbnN0cnVjdGlvbnMgJT48L3A+XG4gICAgICAgICAgICA8JSB9ICU+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwlIH0gJT5cbiAgICAgIGA7XG5cbiAgICAgIHRoaXMubW9kZWwgPSB7XG4gICAgICAgIGlzQ29tcGF0aWJsZTogbnVsbCxcbiAgICAgICAgaGFzQXV0aG9yaXphdGlvbnM6IG51bGwsXG4gICAgICAgIGNoZWNraW5nOiBmYWxzZSxcbiAgICAgICAgaW50cm86ICdXZWxjb21lIHRvJyxcbiAgICAgICAgaW5zdHJ1Y3Rpb25zOiAnVG91Y2ggdGhlIHNjcmVlbiB0byBqb2luIScsXG4gICAgICAgIGNoZWNraW5nTWVzc2FnZTogJ1BsZWFzZSB3YWl0IHdoaWxlIGNoZWNraW5nIGNvbXBhdGlibGl0eScsXG4gICAgICAgIGVycm9yQ29tcGF0aWJsZU1lc3NhZ2U6ICdTb3JyeSw8YnIgLz5Zb3VyIGRldmljZSBpcyBub3QgY29tcGF0aWJsZSB3aXRoIHRoZSBhcHBsaWNhdGlvbi4nLFxuICAgICAgICBlcnJvckhvb2tzTWVzc2FnZTogYFNvcnJ5LDxiciAvPlRoZSBhcHBsaWNhdGlvbiBkaWRuJ3Qgb2J0YWluIHRoZSBuZWNlc3NhcnkgYXV0aG9yaXphdGlvbnMuYCxcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuX3RvdWNoc3RhcnRDYWxsYmFjayA9IG5vb3A7XG4gICAgICB0aGlzLl9tb3VzZWRvd25DYWxsYmFjayA9IG5vb3A7XG4gICAgfVxuXG4gICAgb25SZW5kZXIoKSB7XG4gICAgICBzdXBlci5vblJlbmRlcigpO1xuXG4gICAgICB0aGlzLmluc3RhbGxFdmVudHMoe1xuICAgICAgICAnbW91c2Vkb3duJzogKGUpID0+IHRoaXMuX21vdXNlZG93bkNhbGxiYWNrKGUpLFxuICAgICAgICAndG91Y2hzdGFydCc6IChlKSA9PiB0aGlzLl90b3VjaHN0YXJ0Q2FsbGJhY2soZSksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXRUb3VjaFN0YXJ0Q2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuX3RvdWNoc3RhcnRDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cblxuICAgIHNldE1vdXNlRG93bkNhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLl9tb3VzZWRvd25DYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cblxuICAgIHVwZGF0ZUNoZWNraW5nU3RhdHVzKHZhbHVlKSB7XG4gICAgICB0aGlzLm1vZGVsLmNoZWNraW5nID0gdmFsdWU7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHVwZGF0ZUlzQ29tcGF0aWJsZVN0YXR1cyh2YWx1ZSkge1xuICAgICAgdGhpcy5tb2RlbC5pc0NvbXBhdGlibGUgPSB2YWx1ZTtcbiAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlSGFzQXV0aG9yaXphdGlvbnNTdGF0dXModmFsdWUpIHtcbiAgICAgIHRoaXMubW9kZWwuaGFzQXV0aG9yaXphdGlvbnMgPSB2YWx1ZTtcbiAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuICB9LFxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBSYXctU29ja2V0XG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAnc2VydmljZTpyYXctc29ja2V0JzogY2xhc3MgUmF3U29ja2V0VmlldyBleHRlbmRzIFNlZ21lbnRlZFZpZXcge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIoKTtcblxuICAgICAgdGhpcy50ZW1wbGF0ZSA9IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPlxuICAgICAgICAgIDxwIGNsYXNzPVwic29mdC1ibGlua1wiPjwlPSB3YWl0ICU+PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tXCI+PC9kaXY+XG4gICAgICBgO1xuXG4gICAgICB0aGlzLm1vZGVsID0ge1xuICAgICAgICB3YWl0OiBgT3BlbmluZyBzb2NrZXQsPGJyIC8+c3RhbmQgYnkmaGVsbGlwO2AsXG4gICAgICB9O1xuICAgIH1cbiAgfSxcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU3luY1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgJ3NlcnZpY2U6c3luYyc6IGNsYXNzIFJhd1NvY2tldFZpZXcgZXh0ZW5kcyBTZWdtZW50ZWRWaWV3IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHN1cGVyKCk7XG5cbiAgICAgIHRoaXMudGVtcGxhdGUgPSBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICAgICAgICA8cCBjbGFzcz1cInNvZnQtYmxpbmtcIj48JT0gd2FpdCAlPjwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbVwiPjwvZGl2PlxuICAgICAgYDtcblxuICAgICAgdGhpcy5tb2RlbCA9IHtcbiAgICAgICAgd2FpdDogYENsb2NrIHN5bmNpbmcsPGJyIC8+c3RhbmQgYnkmaGVsbGlwO2AsXG4gICAgICB9O1xuICAgIH1cbiAgfSxcblxuXG4gIC8vIHB1YmxpYyBBUElcbiAgaGFzKGlkKSB7XG4gICAgcmV0dXJuICEhdGhpc1tpZF07XG4gIH0sXG5cbiAgZ2V0KGlkLCBjb25maWcpIHtcbiAgICBjb25zdCBjdG9yID0gdGhpc1tpZF07XG4gICAgY29uc3QgdmlldyA9IG5ldyBjdG9yKCk7XG4gICAgLy8gYWRkaXRpb25uYWwgY29uZmlndXJhdGlvblxuICAgIHZpZXcubW9kZWwuZ2xvYmFscyA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZyk7XG4gICAgdmlldy5vcHRpb25zLmlkID0gaWQucmVwbGFjZSgvXFw6L2csICctJyk7XG4gICAgdmlldy5vcHRpb25zLmNsYXNzTmFtZSA9IGNsaWVudC50eXBlO1xuXG4gICAgcmV0dXJuIHZpZXc7XG4gIH0sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBzZXJ2aWNlVmlld3M7XG4iXX0=
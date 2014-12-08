// Generated by CoffeeScript 1.8.0
'use-strict';
var global,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

global = typeof exports !== "undefined" && exports !== null ? exports : this;

global.Fun = {};

Fun.getFunctionName = function(fun) {
  var n;
  if ((n = fun.toString().match(/function+\s{1,}([a-zA-Z_0-9]*)/)) != null) {
    return n[1];
  } else {
    return null;
  }
};

Fun.getConstructorName = function(fun) {
  var name;
  return fun.constructor.name || ((name = this.getFunctionName(fun.constructor)) != null ? name : null);
};

if (global.WebSock == null) {
  global.WebSock = {
    CHAT_PROTO: 'http',
    CHAT_ADDR: '0.0.0.0',
    CHAT_PORT: 3000
  };
}

WebSock.Client = (function() {
  function Client(connect) {
    if (connect == null) {
      connect = false;
    }
    _.extend(this, Backbone.Events);
    this.model = WebSock.SockData;
    (this.stream = new Bacon.Bus).filter(function(message) {
      return !message.id;
    }).onValue((function(_this) {
      return function(message, params) {
        return _this.socket.emit("" + ((message.__type.replace(/^([A-Z]{1,1})/, function(s) {
          return s.toLowerCase();
        })).replace(/[A-Z]{1}/g, function(s) {
          return ' ' + s.toLowerCase();
        })), message);
      };
    })(this));
    this.messages = new WebSock.Messages;
    this.send = (function(_this) {
      return function(message) {
        var msg;
        return msg = new WebSock.Message({
          body: message
        }).save({
          success: function() {
            return _this.model.add(msg);
          }
        });
      };
    })(this);
    this.connect = (function(_this) {
      return function() {
        _this.socket = io.connect(("" + WebSock.CHAT_PROTO + "://" + WebSock.CHAT_ADDR + ":" + WebSock.CHAT_PORT + "/").replace(/\:+$/, '')).on('message', function(data) {
          return _this.messages.add(new _this.model(data));
        }).on('connect', function() {
          WebSock.SockModel.__connection__ = _this;
          return _this.trigger('connected', _this);
        }).on('disconnect', function() {
          return _this.trigger('disconnected');
        }).on('message', function(data) {
          return _this.trigger('message', data);
        });
        return _this;
      };
    })(this);
    if ((connect != null) && connect) {
      this.connect();
    }
  }

  Client.prototype.getClientId = function() {
    var _ref, _ref1;
    if (((_ref = this.socket) != null ? (_ref1 = _ref.io) != null ? _ref1.engine : void 0 : void 0) == null) {
      return null;
    }
    return this.socket.io.engine.id;
  };

  return Client;

})();

WebSock.SockModel = (function(_super) {
  __extends(SockModel, _super);

  SockModel.prototype._t = null;

  function SockModel(attributes, options) {
    SockModel.__super__.constructor.call(this, attributes, options);
    this.__type = Fun.getConstructorName(this);
  }

  SockModel.prototype.sync = function(mtd, mdl, opt) {
    if (mtd === 'create') {
      mdl.attributes = _.extend(mdl.attributes, {
        __type: this.__type
      });
      return SockModel.__connection__.stream.push(mdl.toJSON());
    }
  };

  return SockModel;

})(Backbone.Model);

WebSock.Message = (function(_super) {
  __extends(Message, _super);

  function Message() {
    return Message.__super__.constructor.apply(this, arguments);
  }

  Message.prototype.defaults = {
    body: ""
  };

  return Message;

})(WebSock.SockModel);

WebSock.SockData = (function(_super) {
  __extends(SockData, _super);

  function SockData() {
    return SockData.__super__.constructor.apply(this, arguments);
  }

  SockData.prototype.models = {
    message: WebSock.Message
  };

  SockData.prototype.defaults = {
    ts: new Date().getTime(),
    tz_offset: new Date().getTimezoneOffset()
  };

  SockData.prototype.parse = function(response) {
    return _.each(this.models, (function(_this) {
      return function(v, k) {
        var embeddedClass, embeddedData;
        embeddedClass = _this.models[key];
        embeddedData = response[key];
        if (embeddedClass != null) {
          return response[key] = new embeddedClass(embeddedData, {
            parse: true
          });
        }
      };
    })(this));
  };

  return SockData;

})(Backbone.Model);

WebSock.Messages = (function(_super) {
  __extends(Messages, _super);

  function Messages() {
    return Messages.__super__.constructor.apply(this, arguments);
  }

  Messages.prototype.model = WebSock.SockData;

  Messages.prototype.messageFilter = function(message) {
    return true;
  };

  Messages.prototype.consume = function(stream) {
    this.stream = stream;
    return this.stream.onValue((function(_this) {
      return function(message) {
        _this.add(message);
        return Bacon.more;
      };
    })(this));
  };

  return Messages;

})(Backbone.Collection);

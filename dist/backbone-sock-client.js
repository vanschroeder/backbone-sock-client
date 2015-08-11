// Generated by CoffeeScript 1.9.3
'use-strict';
var Backbone, Fun, WebSock, _, global, ref,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

global = typeof exports !== "undefined" && exports !== null ? exports : this;

_ = (typeof exports !== 'undefined' ? require('lodash') : global)._;

Backbone = typeof exports !== 'undefined' ? require('backbone') : global.Backbone;

Fun = global.Fun = {};

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

WebSock = global.WebSock != null ? global.WebSock : global.WebSock = {};

WebSock.Client = (function() {
  Client.prototype.__streamHandlers = {};

  function Client(__addr, __options) {
    this.__addr = __addr;
    this.__options = __options != null ? __options : {};
    _.extend(this, Backbone.Events);
    this.model = WebSock.SockData;
    if (!((this.__options.auto_connect != null) && this.__options.auto_connect === false)) {
      this.connect();
    }
  }

  Client.prototype.connect = function() {
    var opts, validationModel;
    validationModel = Backbone.Model.extend({
      defaults: {
        header: {
          sender_id: String,
          type: String,
          sntTime: Date,
          srvTime: Date,
          rcvTime: Date,
          size: Number
        },
        body: null
      },
      validate: function(o) {
        var i, key, len, ref;
        if (o == null) {
          o = this.attributes;
        }
        if (o.header == null) {
          return "required part 'header' was not defined";
        }
        ref = this.defaults.header;
        for (i = 0, len = ref.length; i < len; i++) {
          key = ref[i];
          if (o.header[key] == null) {
            return "required header " + key + " was not defined";
          }
        }
        if (typeof o.header.sender_id !== 'string') {
          return "wrong value for sender_id header";
        }
        if (typeof o.header.type !== 'string') {
          return "wrong value for type header";
        }
        if ((new Date(o.header.sntTime)).getTime() !== o.header.sntTime) {
          return "wrong value for sntTime header";
        }
        if ((new Date(o.header.srvTime)).getTime() !== o.header.srvTime) {
          return "wrong value for srvTime header";
        }
        if ((new Date(o.header.rcvTime)).getTime() !== o.header.rcvTime) {
          return "wrong value for rcvTime header";
        }
        if (!o.body) {
          return "required part 'body' was not defined";
        }
        if (!JSON.stringify(o.body === o.size)) {
          return "content size was invalid";
        }
      }
    });
    opts = {
      multiplex: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    };
    _.extend(opts, _.pick(this.__options, _.keys(opts)));
    this.socket = io("" + this.__addr, opts).on('ws:datagram', (function(_this) {
      return function(data) {
        var dM, stream;
        data.header.rcvTime = Date.now();
        (dM = new validationModel).set(data);
        if (dM.isValid() && ((stream = _this.__streamHandlers[dM.attributes.header.type]) != null)) {
          return stream.add(dM.attributes);
        }
      };
    })(this)).on('connect', (function(_this) {
      return function() {
        WebSock.SockData.__connection__ = _this;
        return _this.trigger('connect', _this);
      };
    })(this)).on('disconnect', (function(_this) {
      return function() {
        return _this.trigger('disconnect');
      };
    })(this)).on('reconnect', (function(_this) {
      return function() {
        return _this.trigger('reconnect');
      };
    })(this)).on('reconnecting', (function(_this) {
      return function() {
        return _this.trigger('reconnecting', _this);
      };
    })(this)).on('reconnect_attempt', (function(_this) {
      return function() {
        return _this.trigger('reconnect_attempt', _this);
      };
    })(this)).on('reconnect_error', (function(_this) {
      return function() {
        return _this.trigger('reconnect_error', _this);
      };
    })(this)).on('reconnect_failed', (function(_this) {
      return function() {
        return _this.trigger('reconnect_failed', _this);
      };
    })(this)).on('error', (function(_this) {
      return function() {
        return _this.trigger('error', _this);
      };
    })(this));
    return this;
  };

  Client.prototype.addStream = function(name, clazz) {
    var s;
    if ((s = this.__streamHandlers[name]) != null) {
      return s;
    }
    return this.__streamHandlers[name] = clazz;
  };

  Client.prototype.removeStream = function(name) {
    if (this.__streamHandlers[name] == null) {
      return null;
    }
    return delete this.__streamHandlers[name];
  };

  Client.prototype.getClientId = function() {
    var ref, ref1;
    if (((ref = this.socket) != null ? (ref1 = ref.io) != null ? ref1.engine : void 0 : void 0) == null) {
      return null;
    }
    return this.socket.io.engine.id;
  };

  return Client;

})();

WebSock.SockData = (function(superClass) {
  extend(SockData, superClass);

  function SockData() {
    return SockData.__super__.constructor.apply(this, arguments);
  }

  SockData.prototype.header = {};

  SockData.prototype.initialize = function(attributes, options) {
    this.__type = Fun.getConstructorName(this);
    return SockData.__super__.initialize.call(this, attributes, options);
  };

  SockData.prototype.sync = function(mtd, mdl, opt) {
    var base, m;
    if (opt == null) {
      opt = {};
    }
    m = {};
    if (opt.header != null) {
      _.extend(this.header, opt.header);
    }
    if (mtd === 'create') {
      if ((base = this.header).type == null) {
        base.type = this.__type;
      }
      m.header = _.extend(this.header, {
        sntTime: Date.now()
      });
      m.body = mdl.attributes;
      return SockData.__connection__.socket.emit('ws:datagram', m);
    }
  };

  SockData.prototype.getSenderId = function() {
    return this.header.sender_id || null;
  };

  SockData.prototype.getSentTime = function() {
    return this.header.sntTime || null;
  };

  SockData.prototype.getServedTime = function() {
    return this.header.srvTime || null;
  };

  SockData.prototype.getRecievedTime = function() {
    return this.header.rcvTime || null;
  };

  SockData.prototype.getSize = function() {
    return this.header.size || null;
  };

  SockData.prototype.setRoomId = function(id) {
    return this.header.room_id = id;
  };

  SockData.prototype.getRoomId = function() {
    return this.header.room_id;
  };

  SockData.prototype.parse = function(data) {
    this.header = Object.freeze(data.header);
    return SockData.__super__.parse.call(data.body);
  };

  return SockData;

})(Backbone.Model);

WebSock.Message = (function(superClass) {
  extend(Message, superClass);

  function Message() {
    return Message.__super__.constructor.apply(this, arguments);
  }

  Message.prototype.defaults = {
    text: ""
  };

  return Message;

})(WebSock.SockData);

WebSock.RoomMessage = (function(superClass) {
  extend(RoomMessage, superClass);

  function RoomMessage() {
    return RoomMessage.__super__.constructor.apply(this, arguments);
  }

  RoomMessage.prototype.defaults = {
    room_id: null,
    status: "pending"
  };

  RoomMessage.prototype.validate = function(o) {
    if (!((o.room_id != null) || this.attributes.room_id)) {
      return "parameter 'room_id' must be set";
    }
  };

  RoomMessage.prototype.initialize = function(attrs, options) {
    if (options == null) {
      options = {};
    }
    if (options.room_id != null) {
      this.header.room_id = options.room_id;
    }
    return RoomMessage.__super__.initialize.apply(this, arguments);
  };

  return RoomMessage;

})(WebSock.SockData);

WebSock.CreateRoom = (function(superClass) {
  extend(CreateRoom, superClass);

  function CreateRoom() {
    return CreateRoom.__super__.constructor.apply(this, arguments);
  }

  return CreateRoom;

})(WebSock.RoomMessage);

WebSock.ListRooms = (function(superClass) {
  extend(ListRooms, superClass);

  function ListRooms() {
    return ListRooms.__super__.constructor.apply(this, arguments);
  }

  ListRooms.prototype.defaults = {
    rooms: []
  };

  return ListRooms;

})(WebSock.SockData);

WebSock.JoinRoom = (function(superClass) {
  extend(JoinRoom, superClass);

  function JoinRoom() {
    return JoinRoom.__super__.constructor.apply(this, arguments);
  }

  JoinRoom.prototype.set = function(attrs, opts) {
    if (attrs.room_id != null) {
      this.header.room_id = attrs.room_id;
    }
    return JoinRoom.__super__.set.call(this, attrs, opts);
  };

  JoinRoom.prototype.sync = function(mtd, mdl, opts) {
    delete mdl.body;
    return JoinRoom.__super__.sync.call(this, mtd, mdl, opts);
  };

  return JoinRoom;

})(WebSock.RoomMessage);

WebSock.LeaveRoom = (function(superClass) {
  extend(LeaveRoom, superClass);

  function LeaveRoom() {
    return LeaveRoom.__super__.constructor.apply(this, arguments);
  }

  return LeaveRoom;

})(WebSock.RoomMessage);

WebSock.StreamCollection = (function(superClass) {
  extend(StreamCollection, superClass);

  function StreamCollection() {
    return StreamCollection.__super__.constructor.apply(this, arguments);
  }

  StreamCollection.prototype.model = WebSock.SockData;

  StreamCollection.prototype.fetch = function() {
    return false;
  };

  StreamCollection.prototype.sync = function() {
    return false;
  };

  StreamCollection.prototype._prepareModel = function(attrs, options) {
    var model;
    if (attrs instanceof Backbone.Model) {
      if (!attrs.collection) {
        attrs.collection = this;
      }
      return attrs;
    }
    options = options ? _.clone(options) : {};
    options.collection = this;
    model = new this.model(attrs.body, options);
    model.header = Object.freeze(attrs.header);
    if (!model.validationError) {
      return model;
    }
    this.trigger('invalid', this, model.validationError, options);
    return false;
  };

  StreamCollection.prototype.send = function(data) {
    return this.create(data);
  };

  StreamCollection.prototype.initialize = function() {
    var _client;
    if (arguments[0] instanceof WebSock.Client) {
      return _client = arguments[0];
    }
  };

  return StreamCollection;

})(Backbone.Collection);

if ((typeof module !== "undefined" && module !== null ? (ref = module.exports) != null ? ref.WebSock : void 0 : void 0) != null) {
  module.exports.init = function(app, listeners) {
    var io, redis, server;
    if (listeners == null) {
      listeners = [];
    }
    server = require('http').Server(app);
    io = require('socket.io')(server);
    redis = require('socket.io-redis');
    io.adapter(redis({
      host: 'localhost',
      port: 6379
    }));
    return io.sockets.on('connect', (function(_this) {
      return function(client) {
        var l, listener;
        client.on('ws:datagram', function(data) {
          data.header.srvTime = Date.now();
          data.header.sender_id = client.id;
          if (data.header.type === 'ListRooms') {
            data.body.status = 'success';
            data.body.rooms = _.keys(io.sockets.adapter.rooms);
            client.emit('ws:datagram', data);
            return;
          }
          if (data.header.type === 'CreateRoom') {
            if (!(0 <= (_.keys(io.sockets.adapter.rooms)).indexOf(data.body.room_id))) {
              data.body.status = 'success';
              client.join(data.body.room_id);
            } else {
              data.body.status = 'error';
            }
            client.emit('ws:datagram', data);
            return;
          }
          if (data.header.type === 'JoinRoom') {
            if (data.body.room_id) {
              client.join(data.body.room_id);
              data.body.status = 'success';
              client.emit('ws:datagram', data);
            }
            return;
          }
          if (data.header.type === 'LeaveRoom') {
            client.leave(data.header.room_id);
            data.body.status = 'success';
            client.emit('ws:datagram', data);
            return;
          }
          return (typeof data.header.room_id === 'undefined' || data.header.room_id === null ? io.sockets : io["in"](data.header.room_id)).emit('ws:datagram', data);
        });
        for (listener in listeners) {
          if (((l = client._events[listener]) != null) && typeof l === 'function') {
            client.removeListener(listener, l);
          }
          client.on(listener, listeners[listener]);
        }
        return client;
      };
    })(this));
  };
}

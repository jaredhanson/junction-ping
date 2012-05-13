var vows = require('vows');
var assert = require('assert');
var IQ = require('junction').elements.IQ;
var XMLElement = require('junction').XMLElement;
var StanzaError = require('junction').StanzaError;
var util = require('util');
var ping = require('ping');


vows.describe('ping').addBatch({

  'middleware': {
    topic: function() {
      return ping();
    },
    
    'when handling a ping request': {
      topic: function(ping) {
        var self = this;
        var req = new IQ('juliet@capulet.lit/balcony', 'capulet.lit', 'get');
        req.c(new XMLElement('ping', { xmlns: 'urn:xmpp:ping' }));
        req = req.toXML();
        req.type = req.attrs.type;
        var res = new XMLElement('iq', { id: req.attrs.id,
                                         to: req.attrs.from,
                                       type: 'result' });
        
        res.send = function() {
          self.callback(null, res);
        }
        function next(err) {
          self.callback(new Error('should not call next'));
        }
        process.nextTick(function () {
          ping(req, res, next)
        });
      },
      
      'should not call next' : function(err, stanza) {
        assert.isNull(err);
      },
      'should call send' : function(err, stanza) {
        assert.isNotNull(stanza);
      },
    },
    
    'when handling a ping result': {
      topic: function(ping) {
        var self = this;
        var req = new IQ('capulet.lit', 'juliet@capulet.lit/balcony', 'result');
        req.c(new XMLElement('ping', { xmlns: 'urn:xmpp:ping' }));
        req = req.toXML();
        req.type = req.attrs.type;
        var res = new XMLElement('iq', { id: req.attrs.id,
                                         to: req.attrs.from,
                                       type: 'result' });
        
        res.send = function() {
          self.callback(new Error('should not call send'));
        }
        function next(err) {
          self.callback(null, res);
        }
        process.nextTick(function () {
          ping(req, res, next)
        });
      },
      
      'should not call send' : function(err, stanza) {
        assert.isNull(err);
      },
      'should call next' : function(err, stanza) {
        assert.isNotNull(stanza);
      },
    },
    
    'when handling a non-IQ-get ping request': {
      topic: function(ping) {
        var self = this;
        var req = new IQ('juliet@capulet.lit/balcony', 'capulet.lit', 'set');
        req.c(new XMLElement('ping', { xmlns: 'urn:xmpp:ping' }));
        req = req.toXML();
        req.type = req.attrs.type;
        var res = new XMLElement('iq', { id: req.attrs.id,
                                         to: req.attrs.from,
                                       type: 'result' });
        
        res.send = function() {
          self.callback(new Error('should not call send'));
        }
        function next(err) {
          self.callback(err, req);
        }
        process.nextTick(function () {
          ping(req, res, next)
        });
      },
      
      'should indicate an error' : function(err, stanza) {
        assert.instanceOf(err, StanzaError);
        assert.equal(err.type, 'modify');
        assert.equal(err.condition, 'bad-request');
      },
    },
    
    'when handling an IQ stanza that is not a ping stanza': {
      topic: function(ping) {
        var self = this;
        var iq = new IQ('romeo@example.net', 'juliet@example.com', 'get');
        iq = iq.toXML();
        iq.type = iq.attrs.type;
        var res = new XMLElement('iq', { id: iq.attrs.id,
                                         to: iq.attrs.from,
                                       type: 'result' });
        
        res.send = function() {
          self.callback(new Error('should not call send'));
        }
        function next(err) {
          self.callback(err, iq);
        }
        process.nextTick(function () {
          ping(iq, res, next)
        });
      },
      
      'should not call send' : function(err, stanza) {
        assert.isNull(err);
      },
      'should call next' : function(err, stanza) {
        assert.isNotNull(stanza);
      },
    },
  },

}).export(module);

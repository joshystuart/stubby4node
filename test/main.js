'use strict';

var CLI = require('../src/console/cli');
var defaults = CLI.getArgs([]);
var assert = require('assert');
var Stubby = require('../src/main').Stubby;

describe('main', function () {
  var sut, options;

  function stopStubby (finish) {
    if (sut != null) {
      sut.stop(finish);
    } else {
      finish();
    }
  }

  beforeEach(function (done) {
    function finish () {
      sut = new Stubby();
      done();
    }

    stopStubby(finish);
  });

  afterEach(stopStubby);

  describe('put', function () {
    it('should return warning when the contract is violated', function (done) {
      sut.endpoints = {
        update: function (_, __, cb) {
          return cb(null);
        }
      };

      sut.put('42', {
        request: {
          url: '/somewhere'
        },
        response: {
          status: 800
        }
      }, function (err) {
        assert.strictEqual(err, "The supplied endpoint data couldn't be saved");
        done();
      });
    });

    it('should not return warning when the contract is upheld', function (done) {
      sut.endpoints = {
        update: function (_, __, cb) {
          cb(null);
        }
      };

      sut.put('42', {
        request: {
          url: '/somewhere'
        },
        response: {
          status: 200
        }
      }, function (err) {
        assert.strictEqual(err, null);
        done();
      });
    });
  });

  describe('post', function () {
    it('should return warning when the contract is violated', function (done) {
      sut.post({
        request: {
          url: '/somewhere'
        },
        response: {
          status: 800
        }
      }, function (err) {
        assert.strictEqual(err, "The supplied endpoint data couldn't be saved");
        done();
      });
    });

    it('should not return warning when the contract is upheld', function (done) {
      sut.post({
        request: {
          url: '/somewhere'
        },
        response: {
          status: 200
        }
      }, function (err) {
        assert.strictEqual(err, null);
        done();
      });
    });
  });

  describe('delete', function () {
    it('should call delete all when only a callback is passed', function (done) {
      sut.endpoints = {
        deleteAll: function (cb) {
          cb(null);
        }
      };

      sut.delete(function () {
        done();
      });
    });

    it('should call delete all when no params are passed', function (done) {
      sut.endpoints = {
        deleteAll: function () {
          done();
        }
      };

      sut.delete();
    });

    it('should call delete when an id is passed', function (done) {
      sut.endpoints = {
        delete: function (id, cb) {
          assert.strictEqual(id, '1');
          assert.strictEqual(cb, id);
          done();
        }
      };

      sut.delete('1');
    });

    it('should call delete when an id and callback are passed', function (done) {
      sut.endpoints = {
        delete: function (id, cb) {
          assert.strictEqual(id, '1');
          cb();
        }
      };

      sut.delete('1', function () {
        done();
      });
    });
  });

  describe('start', function () {
    beforeEach(function () {
      options = {};
    });

    describe('callback', function () {
      it('should not fail to start a server without options or a callback', function (done) {
        sut.start();
        done();
      });

      it('should treat the callback as optional', function (done) {
        sut.start({}, done);
      });

      it('should take one parameter as a function', function (done) {
        sut.start(done);
      });
    });

    describe('options', function () {
      it('should default stub port to CLI port default', function (done) {
        sut.start(options, function () {
          assert.strictEqual(options.stubs, defaults.stubs);
          done();
        });
      });

      it('should default admin port to CLI port default', function (done) {
        sut.start(options, function () {
          assert.strictEqual(options.admin, defaults.admin);
          done();
        });
      });

      it('should default location to CLI default', function (done) {
        sut.start(options, function () {
          assert.strictEqual(options.location, defaults.location);
          done();
        });
      });

      it('should default data to empty array', function (done) {
        sut.start(options, function () {
          assert(options.data instanceof Array);
          assert.strictEqual(options.data.length, 0);
          done();
        });
      });

      it('should default key to null', function (done) {
        sut.start(options, function () {
          assert.strictEqual(options.key, defaults.key);
          done();
        });
      });

      it('should default cert to null', function (done) {
        sut.start(options, function () {
          assert.strictEqual(options.cert, defaults.cert);
          done();
        });
      });
    });
  });
});

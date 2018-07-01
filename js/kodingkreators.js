// kodingkreators.js

(function(ext) {
  //* START: VARIABLE DEFINITIONS
  var device = null;
  var _rxBuf = [];

  var levels = {
    HIGH: 1,
    LOW: 0,
  };
  var analogSensorIDs = {
    AnalogSensor1: 0,
    AnalogSensor2: 1,
    AnalogSensor3: 2,
    AnalogSensor4: 3,
  };
  var digitalSensorIDs = {
    DigitalSensor1: 13,
    DigitalSensor2: 12,
    DigitalSensor3: 5,
    DigitalSensor4: 4,
  };
  //* END: VARIABLE DEFINITIONS

  //* START: SETUP CODE FOR EXTENSION
  ext.resetAll = function() {
    if (device && device.send) {
      device.send([0xff, 0x55, 2, 0, 4]);
    } else {
      trace(
        'Device is ' + device.toString() + ' and ' + device.send.toString()
      );
    }
  };

  ext.runArduino = function() {
    if (responseValue) {
      responseValue();
    } else {
      trace('responseValue() is ' + responseValue.toString());
    }
  };
  //* END: SETUP CODE FOR EXTENSION

  //* START: CUSTOM FUNCTIONS

  //=== READ ANALOG PINS

  function readAnalogPin(nextID, pin) {
    var deviceId = 31;
    getPackage(nextID, deviceId, pin);
  }

  ext.getAnalogSensor = function(nextID, pin) {
    var analogPin = analogSensorIDs[pin];
    readAnalogPin(nextID, analogPin);
  };

  ext.getPotentiometer = function(nextID) {
    var pin = 4; // A4
    readAnalogPin(nextID, pin);
  };

  //=== READ DIGITAL PINS

  function readDigitalPin(nextID, pin) {
    var deviceId = 30;
    getPackage(nextID, deviceId, pin);
  }

  ext.getDigitalSensor = function(nextID, pin) {
    var digitalPin = digitalSensorIDs[pin];
    readDigitalPin(nextID, digitalPin);
  };

  ext.getGreenButtonState = function(nextID) {
    var pin = 8; // D8
    readDigitalPin(nextID, pin);
  };

  ext.getUltrasonicSensor = function(nextID) {
    var deviceId = 36;
    var triggerPin = 7;
    var echoPin = 6;
    getPackage(nextID, deviceId, triggerPin, echoPin);
  };

  //=== WRITE DIGITAL PINS

  function writeDigitalPin(pin, level) {
    runPackage(30, pin, level);
  }

  ext.setDigitalSensor = function(pin, level) {
    var digitalPin =
      typeof pin === 'string' ? digitalSensorIDs[pin] : parseInt(pin, 10);
    var state = typeof level === 'string' ? levels[level] : parseInt(level, 10);
    writeDigitalPin(digitalPin, state);
  };

  //* END: CUSTOM FUNCTIONS

  //* START: HELPER FUNCTIONS
  function processData(bytes) {
    var len = bytes.length;

    trace(bytes);

    if (_rxBuf.length > 30) {
      _rxBuf = [];
    }

    for (var index = 0; index < bytes.length; index++) {
      var c = bytes[index];
      _rxBuf.push(c);
      if (_rxBuf.length >= 2) {
        if (
          _rxBuf[_rxBuf.length - 1] == 0x55 &&
          _rxBuf[_rxBuf.length - 2] == 0xff
        ) {
          _isParseStart = true;
          _isParseStartIndex = _rxBuf.length - 2;
        }
        if (
          _rxBuf[_rxBuf.length - 1] == 0xa &&
          _rxBuf[_rxBuf.length - 2] == 0xd &&
          _isParseStart
        ) {
          _isParseStart = false;

          var position = _isParseStartIndex + 2;
          var extId = _rxBuf[position];
          position++;
          var type = _rxBuf[position];
          position++;
          //1 byte 2 float 3 short 4 len+string 5 double
          var value;
          switch (type) {
            case 1:
              {
                value = _rxBuf[position];
                position++;
              }
              break;
            case 2:
              {
                value = readFloat(_rxBuf, position);
                position += 4;
                if (value < -255 || value > 1023) {
                  value = 0;
                }
              }
              break;
            case 3:
              {
                value = readInt(_rxBuf, position, 2);
                position += 2;
              }
              break;
            case 4:
              {
                var l = _rxBuf[position];
                position++;
                value = readString(_rxBuf, position, l);
              }
              break;
            case 5:
              {
                value = readDouble(_rxBuf, position);
                position += 4;
              }
              break;
            case 6:
              value = readInt(_rxBuf, position, 4);
              position += 4;
              break;
          }
          if (type <= 6) {
            responseValue(extId, value);
          } else {
            responseValue();
          }
          _rxBuf = [];
        }
      }
    }
  }

  function getPackage() {
    var nextID = arguments[0];
    Array.prototype.shift.call(arguments);
    sendPackage(arguments, 1);
  }

  function sendPackage(argList, type) {
    var bytes = [0xff, 0x55, 0, 0, type];
    for (var i = 0; i < argList.length; ++i) {
      var val = argList[i];
      if (val.constructor === '[class Array]') {
        bytes = bytes.concat(val);
      } else {
        bytes.push(val);
      }
    }
    bytes[2] = bytes.length - 3;
    device.send(bytes);
  }

  function runPackage() {
    sendPackage(arguments, 2);
  }
  //* END: HELPER FUNCTIONS

  //* START: Extension API interactions
  var potentialDevices = [];
  ext._deviceConnected = function(dev) {
    potentialDevices.push(dev);

    if (!device) {
      tryNextDevice();
    }
  };

  function tryNextDevice() {
    // If potentialDevices is empty, device will be undefined.
    // That will get us back here next time a device is connected.
    device = potentialDevices.shift();
    if (device) {
      device.open(
        { stopBits: 0, bitRate: 115200, ctsFlowControl: 0 },
        deviceOpened
      );
    }
  }

  function deviceOpened(dev) {
    if (!dev) {
      // Opening the port failed.
      tryNextDevice();
      return;
    }
    device.set_receive_handler('kodingkreators', function(data) {
      processData(data);
    });
  }

  ext._deviceRemoved = function(dev) {
    if (device != dev) return;
    device = null;
  };

  ext._shutdown = function() {
    if (device) device.close();
    device = null;
  };

  ext._getStatus = function() {
    if (!device) return { status: 1, msg: 'kodingkreators disconnected' };
    return { status: 2, msg: 'kodingkreators connected' };
  };
  //* END: Extensions API interactions

  //! REGISTER PLUGIN
  var descriptor = {};
  ScratchExtensions.register('kodingkreators', descriptor, ext, {
    type: 'serial',
  });
})({});

// kodingkreators.js

(function (ext) {
  //* START: VARIABLE DEFINITIONS
  var device = null;
  var _rxBuf = [];

  var levels = {
    HIGH: 1,
    LOW: 0
  };
  var analogSensorIDs = {
    AnalogSensor1: 0,
    AnalogSensor2: 1,
    AnalogSensor3: 2,
    AnalogSensor4: 3
  };
  var digitalSensorIDs = {
    DigitalSensor1: 13,
    DigitalSensor2: 12,
    DigitalSensor3: 5,
    DigitalSensor4: 4
  };
  var servoMotorIDs = {
    ServoMotor1: 11,
    ServoMotor2: 10
  };
  var ledIndicies = {
    LED1: 1,
    LED2: 2,
    LED3: 3,
    LED4: 4
  };
  var notes = {
    B0: 31,
    C1: 33,
    D1: 37,
    E1: 41,
    F1: 44,
    G1: 49,
    A1: 55,
    B1: 62,
    C2: 65,
    D2: 73,
    E2: 82,
    F2: 87,
    G2: 98,
    A2: 110,
    B2: 123,
    C3: 131,
    D3: 147,
    E3: 165,
    F3: 175,
    G3: 196,
    A3: 220,
    B3: 247,
    C4: 262,
    D4: 294,
    E4: 330,
    F4: 349,
    G4: 392,
    A4: 440,
    B4: 494,
    C5: 523,
    D5: 587,
    E5: 659,
    F5: 698,
    G5: 784,
    A5: 880,
    B5: 988,
    C6: 1047,
    D6: 1175,
    E6: 1319,
    F6: 1397,
    G6: 1568,
    A6: 1760,
    B6: 1976,
    C7: 2093,
    D7: 2349,
    E7: 2637,
    F7: 2794,
    G7: 3136,
    A7: 3520,
    B7: 3951,
    C8: 4186,
    D8: 4699
  };
  var beats = {
    Half: 500,
    Quarter: 250,
    Eighth: 125,
    Whole: 1000,
    Double: 2000,
    Zero: 0
  };
  //* END: VARIABLE DEFINITIONS

  //* START: SETUP CODE FOR EXTENSION
  ext.resetAll = function () {
    if (device && device.send) {
      device.send([0xff, 0x55, 0x02, 0x00, 0x04]);
    } else {
      trace(
          "Device is " + device.toString() + " and " + device.send.toString()
      );
    }
  };

  ext.runArduino = function () {
    if (responseValue) {
      responseValue();
    } else {
      trace("responseValue() is " + responseValue.toString());
    }
  };
  //* END: SETUP CODE FOR EXTENSION

  //* START: CUSTOM FUNCTIONS

  //=== READ ANALOG PINS

  function readAnalogPin(nextID, pin) {
    var deviceId = 31;
    getPackage(nextID, deviceId, pin);
  }

  ext.getAnalogSensor = function (nextID, pin) {
    var analogPin = analogSensorIDs[pin];
    readAnalogPin(nextID, analogPin);
  };

  ext.getPotentiometer = function (nextID) {
    var pin = 4; // A4
    readAnalogPin(nextID, pin);
  };

  //=== READ DIGITAL PINS

  function readDigitalPin(nextID, pin) {
    var deviceId = 30;
    getPackage(nextID, deviceId, pin);
  }

  ext.getDigitalSensor = function (nextID, pin) {
    var digitalPin = digitalSensorIDs[pin];
    readDigitalPin(nextID, digitalPin);
  };

  ext.getGreenButtonState = function (nextID) {
    var pin = 8; // D8
    readDigitalPin(nextID, pin);
  };

  ext.getUltrasonicSensor = function (nextID) {
    var deviceId = 36;
    var triggerPin = 7;
    var echoPin = 6;
    getPackage(nextID, deviceId, triggerPin, echoPin);
  };

  //=== WRITE DIGITAL PINS

  function writeDigitalPin(pin, level) {
    runPackage(30, pin, level);
  }

  ext.setDigitalSensor = function (pin, level) {
    var digitalPin =
        typeof pin === "string" ? digitalSensorIDs[pin] : parseInt(pin, 10);
    var state = typeof level === "string" ? levels[level] : parseInt(level, 10);
    writeDigitalPin(digitalPin, state);
  };

  //=== WRITE SERVO MOTOR PINS

  function writeServoMotor(pin, angle) {
    runPackage(33, pin, angle);
  }

  ext.setServoMotor = function (pin, angle) {
    var digitalPin =
        typeof pin === "string" ? servoMotorIDs[pin] : parseInt(pin, 10);
    var servoAngle = typeof angle === "number" ? angle : parseInt(angle, 10);
    writeServoMotor(digitalPin, servoAngle);
  };

  //=== LED STRIP SUPPORT

  ext.setLEDStrip = function (index, red, green, blue) {
    var port = 9;
    var ledIndex = typeof index === "string" ? ledIndicies[index] : index;
    runPackage(8, 0, port, ledIndex, red, green, blue);
  };

  //=== SPEAKER SUPPORT

  ext.setSpeaker = function (note, beat) {
    var speakerPin = 3;
    var audioNote = typeof note === "number" ? note : notes[note];
    var audioBeat = typeof beat === "number" ? beat : beats[beat];
    var audioNoteArray = [audioNote];
    var audioBeatArray = [audioBeat];
    // 0x1 magic constants... I am not sure why such padding is required, but it does work...
    runPackage(34, speakerPin, audioNoteArray, 0x1, audioBeatArray, 0x1);
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
            case 1: {
              value = _rxBuf[position];
              position++;
            }
              break;
            case 2: {
              value = readFloat(_rxBuf, position);
              position += 4;
              if (value < -255 || value > 1023) {
                value = 0;
              }
            }
              break;
            case 3: {
              value = readInt(_rxBuf, position, 2);
              position += 2;
            }
              break;
            case 4: {
              var l = _rxBuf[position];
              position++;
              value = readString(_rxBuf, position, l);
            }
              break;
            case 5: {
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
      if (val.constructor === "[class Array]") {
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
  ext._deviceConnected = function (dev) {
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
          {stopBits: 0, bitRate: 115200, ctsFlowControl: 0},
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
    device.set_receive_handler("kodingkreators", function (data) {
      processData(data);
    });
  }

  ext._deviceRemoved = function (dev) {
    if (device != dev) {
      return;
    }
    device = null;
  };

  ext._shutdown = function () {
    if (device) {
      device.close();
    }
    device = null;
  };

  ext._getStatus = function () {
    if (!device) {
      return {status: 1, msg: "kodingkreators disconnected"};
    }
    return {status: 2, msg: "kodingkreators connected"};
  };
  //* END: Extensions API interactions

  //! REGISTER PLUGIN
  var descriptor = {};
  ScratchExtensions.register("kodingkreators", descriptor, ext, {
    type: "serial"
  });
})({});

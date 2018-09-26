/*global ScratchExtensions*/
/*global trace*/
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  }
}(typeof self !== "undefined" ? self : this, function () {
  /*****************************************************/
  // Ensure mBlock 3 API functions and objects are defined to allow this module to be testable.
  // Create dummy functions and objects if they do not exist.
  var ScratchExtensions = ScratchExtensions || {
    register: function (pluginName, descriptor, extension, options) {}
  };

  var trace = trace || function (content) {};
  /*****************************************************/

  var EXTENSION = {};

  /*****************************************************/
  var device = null;
  var readBuffer = [];

  var pinState = {
    HIGH: 1,
    LOW: 0
  };

  var pins = {
    PIN_0: 0,
    PIN_1: 1,
    PIN_2: 2,
    PIN_3: 3,
    PIN_4: 4,
    PIN_5: 5,
    PIN_6: 6,
    PIN_7: 7,
    PIN_8: 8,
    PIN_9: 9,
    PIN_10: 10,
    PIN_11: 11,
    PIN_12: 12,
    PIN_13: 13
  };

  var ledStrip = {
    LED_1: 1,
    LED_2: 2,
    LED_3: 3,
    LED_4: 4
  };

  var analogSensorPins = {
    ANALOG_SENSOR_1: pins.PIN_0,
    ANALOG_SENSOR_2: pins.PIN_1,
    ANALOG_SENSOR_3: pins.PIN_2,
    ANALOG_SENSOR_4: pins.PIN_3
  };

  var digitalSensorPins = {
    DIGITAL_SENSOR_1: pins.PIN_13,
    DIGITAL_SENSOR_2: pins.PIN_12,
    DIGITAL_SENSOR_3: pins.PIN_5,
    DIGITAL_SENSOR_4: pins.PIN_4
  };

  var servoMotorPins = {
    SERVO_MOTOR_1: pins.PIN_11,
    SERVO_MOTOR_2: pins.PIN_10
  };

  var ledInStripPins = {
    LED_1: ledStrip.LED_1,
    LED_2: ledStrip.LED_2,
    LED_3: ledStrip.LED_3,
    LED_4: ledStrip.LED_4
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
    HALF: 500,
    QUARTER: 250,
    EIGHTH: 125,
    WHOLE: 1000,
    DOUBLE: 2000,
    ZERO: 0
  };

  /*****************************************************/

  // mBlock firmware protocol (MFP)
  // https://forum.makeblock.com/t/mblock-firmware-protocol-introduction/2281
  var requestFrame = {
    HEAD: [0xFF, 0x55],
    LENGTH: [0x00],
    INDEX: [0x00],
    ACTION: [0x00],
    DEVICE: [0x00],
    PORT: [0x00],
    SLOT: [0x00],
    DATA: [0x00]
  };

  var responseFrame = {
    HEAD: [0xFF, 0x55],               // 2 identifier bytes
    INDEX: [0x00],                    // Request number (1 byte)
    TYPE: [0x00],                     // Data type (1 byte)
                                      // 0x01: byte;  0x02: float;  0x03: short;  0x04: length+string
    DATA: [0x00]                      // Length determined by data type
  };

  var actionType = {
    GET: 0x00,
    RUN: 0x01,
    RESET: 0x02,
    START: 0x03
  };

  var deviceType = {
    VERSION: 0x00,
    ULTRASONIC_SENSOR: 0x01,
    TEMPERATURE_SENSOR: 0x02,
    LIGHT_SENSOR: 0x03,
    POTENTIOMETER: 0x04,
    JOYSTICK: 0x05,
    GYRO: 0x06,
    SOUND_SENSOR: 0x07,
    LED: 0x08,
    SEVEN_SEGMENT_DISPLAY: 0x09,
    MOTOR: 0x10,
    SERVO: 0x11,
    ENCODER: 0x12,
    INFRARED: 0x13,
    INFRARED_REMOTE: 0x14,
    PIR_MOTION_SENSOR: 0x15,
    INFRARED_TYPE_2: 0x16,
    LINE_FOLLOWER: 0x17,
    INFRARED_REMOTE_CODE: 0x18,
    SHUTTER: 0x20,
    LIMIT_SWITCH: 0x21,
    BUTTON: 0x22,
    DIGITAL: 0x30,
    ANALOG: 0x31,
    PWM: 0x32,
    SERVO_PIN: 0x33,
    SPEAKER: 0x34,
    BUTTON_INNER: 0x35,
    TIMER: 0x50
  };

  /*****************************************************/

  // mBlock request / response constructing helpers
  function createRequestFrame(content) {
    var args = extend(requestFrame, content);
    var _requestFrame = [
      args.HEAD[0],
      args.HEAD[1],
      args.LENGTH[0],
      args.INDEX[0],
      args.ACTION[0],
      args.DEVICE[0],
      args.PORT[0],
      args.SLOT[0]
    ];

    for (var i = 0; i < args.DATA.length; i++) {
      _requestFrame.push(args.DATA[i]);
    }

    return _requestFrame;
  }

  function createResponseFrame(content) {
    var args = extend(responseFrame, content);
    var _responseFrame = [
      args.HEAD[0],
      args.HEAD[1],
      args.INDEX[0],
      args.TYPE[0]
    ];

    for (var i = 0; i < args.DATA.length; i++) {
      _responseFrame.push(args.DATA[i]);
    }

    return _responseFrame;
  }

  function extend() {
    for (var i = 0; i < arguments.length; i++) {
      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          arguments[0][key] = arguments[i][key];
        }
      }
    }

    return arguments[0];
  }

  /*****************************************************/

  EXTENSION.resetAll = function () {
    if (deviceIsAvailable()) {
      device.send([0xff, 0x55, 2, 0, 4]);
    }

    function deviceIsAvailable() {
      return device && device.send;
    }
  };

  /*****************************************************/
  ///=== Register this plugin with the mBlock 3 JavaScript runtime
  var pluginName = "kodingkreators";
  var descriptor = {};
  var options = {type: "serial"};
  ScratchExtensions.register(pluginName, descriptor, EXTENSION, options);

  // mBlock API stubs to allow this module to be testable
  var _mblockApiStubs = {
    ScratchExtensions: ScratchExtensions,
    trace: trace,
    device: device,
    requestFrame: requestFrame,
    responseFrame: responseFrame,
    actionType: actionType,
    deviceType: deviceType
  };

  var _mblockApiHelpers = {
    extend: extend,
    createRequestFrame: createRequestFrame,
    createResponseFrame: createResponseFrame
  };

  ///=== Expose this module to allow it to be testable
  EXTENSION = {
    _mblockApiStubs: _mblockApiStubs,
    _mblockApiHelpers: _mblockApiHelpers,
    device: device,
    readBuffer: readBuffer,
    pinState: pinState,
    pins: pins,
    analogSensorPins: analogSensorPins,
    digitalSensorPins: digitalSensorPins,
    servoMotorPins: servoMotorPins,
    ledInStripPins: ledInStripPins,
    notes: notes,
    beats: beats
  };

  return EXTENSION;
  /*****************************************************/
}));
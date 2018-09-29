let chai = require(`chai`);
let expect = chai.expect;

let KodingKreators = require("../kodingkreators.umd.js");

const TOTAL_PINS_COUNT = 14;
const LEDS_IN_STRIP = 4;

describe("KodingKreators", () => {
  it(`should be defined`, () => {
    expect(KodingKreators).to.be.an("object");
  });

  describe(`#_mblockApiStubs`, () => {
    it(`should be defined`, () => {
      expect(KodingKreators._mblockApiStubs).to.be.a("object");
    });

    describe(`##ScratchExtensions`, () => {
      it(`should be defined`, () => {
        expect(KodingKreators._mblockApiStubs.ScratchExtensions).to.be.a("object");
      });

      describe(`###register`, () => {
        it(`should be defined and is a function`, () => {
          let register = KodingKreators._mblockApiStubs.ScratchExtensions.register;
          expect(register).to.be.a("function");
        });
      });
    });

    describe(`##trace`, () => {
      it(`should be defined and is a function`, () => {
        expect(KodingKreators._mblockApiStubs.trace).to.be.a("function");
      });
    });

    describe(`##device`, () => {
      it(`should be initially null`, () => {
        expect(KodingKreators._mblockApiStubs.device).to.be.null;
      });
    });

    describe(`##requestFrame`, () => {
      it(`should initially be equivalent to a specific preset`, () => {
        expect(KodingKreators._mblockApiStubs.requestFrame).to.deep.equal({
                                                                            HEAD: [0xFF, 0x55],
                                                                            LENGTH: [0x00],
                                                                            INDEX: [0x00],
                                                                            ACTION: [0x00],
                                                                            DEVICE: [0x00],
                                                                            PORT: [0x00],
                                                                            SLOT: [0x00],
                                                                            DATA: [0x00]
                                                                          });
      });
    });

    describe(`##responseFrame`, () => {
      it(`should initially be equivalent to a specific preset`, () => {
        expect(KodingKreators._mblockApiStubs.responseFrame).to.deep.equal({
                                                                             HEAD: [0xFF, 0x55],
                                                                             INDEX: [0x00],
                                                                             TYPE: [0x00],
                                                                             DATA: [0x00]
                                                                           });
      });
    });

    describe(`##actionType`, () => {
      it(`should be defined as specific action types`, () => {
        expect(KodingKreators._mblockApiStubs.actionType).to.deep.equal({
                                                                          GET: 0x00,
                                                                          RUN: 0x01,
                                                                          RESET: 0x02,
                                                                          START: 0x03
                                                                        });
      });
    });

    describe(`##deviceType`, () => {
      it(`should be defined as specific device types`, () => {
        expect(KodingKreators._mblockApiStubs.deviceType).to.deep.equal({
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
                                                                        });
      });
    });
  });

  describe(`#_mblockApiHelpers`, () => {
    describe(`##extend`, () => {
      it(`should work with deeply nested complicated objects`, () => {
        let objA = {a: 1, b: 2, c: {d: 3}, g: 6};
        let objB = {
          a: 2,
          b: 2,
          c: {
            d: 4, e: 4
          },
          f: 5
        };

        let expectedObj = {
          a: 2,
          b: 2,
          c: {
            d: 4, e: 4
          },
          f: 5,
          g: 6
        };

        let actualObj = KodingKreators._mblockApiHelpers.extend(objA, objB);

        expect(actualObj).to.deep.equal(expectedObj);

      });

      it(`should work with empty objects`, () => {
        let expectedObj = {};
        let actualObj = {};
        expect(actualObj).to.deep.equal(expectedObj);
      });

      it(`should work with simple objects`, () => {
        let objectA = {
          a: 1
        };

        let objectB = {
          a: 2
        };

        let expectedObj = {};

      });
    });
  });

  describe(`#device`, () => {
    it(`should be defined`, () => {
      expect(KodingKreators.device).to.be.null;
    });
  });

  describe(`#pinState`, () => {
    it(`should define HIGH and LOW`, () => {
      let ps = KodingKreators.pinState;
      expect(ps).to.be.an("object");
      expect(ps).to.deep.equal({HIGH: 1, LOW: 0});
    });
  });

  describe(`#pins`, () => {
    it(`should map names of PIN_0 to PIN_${TOTAL_PINS_COUNT} to their numerical values`, () => {
      for (let n = 0; n < TOTAL_PINS_COUNT; n++) {
        expect(KodingKreators.pins[`PIN_${n}`]).to.equal(n);
      }
    });
  });

  describe(`#analogSensorPins`, () => {
    let pins = KodingKreators.pins;
    let asp = KodingKreators.analogSensorPins;

    it(`should map ANALOG_SENSOR_1 to PIN_0`, () => {
      expect(asp.ANALOG_SENSOR_1).to.equal(pins.PIN_0);
    });

    it(`should map ANALOG_SENSOR_2 to PIN_1`, () => {
      expect(asp.ANALOG_SENSOR_2).to.equal(pins.PIN_1);
    });

    it(`should map ANALOG_SENSOR_3 to PIN_2`, () => {
      expect(asp.ANALOG_SENSOR_3).to.equal(pins.PIN_2);
    });

    it(`should map ANALOG_SENSOR_4 to PIN_3`, () => {
      expect(asp.ANALOG_SENSOR_4).to.equal(pins.PIN_3);
    });
  });

  describe(`#digitalSensorPins`, () => {
    let pins = KodingKreators.pins;
    let dsp = KodingKreators.digitalSensorPins;

    it(`should map DIGITAL_SENSOR_1 to PIN_13`, () => {
      expect(dsp.DIGITAL_SENSOR_1).to.equal(pins.PIN_13);
    });

    it(`should map DIGITAL_SENSOR_2 to PIN_12`, () => {
      expect(dsp.DIGITAL_SENSOR_2).to.equal(pins.PIN_12);
    });

    it(`should map DIGITAL_SENSOR_3 to PIN_5`, () => {
      expect(dsp.DIGITAL_SENSOR_3).to.equal(pins.PIN_5);
    });

    it(`should map DIGITAL_SENSOR_4 to PIN_4`, () => {
      expect(dsp.DIGITAL_SENSOR_4).to.equal(pins.PIN_4);
    });
  });

  describe(`#ledInStripPins`, () => {
    it(`should map names of LED_1 to LED_${LEDS_IN_STRIP} to their numerical values`, () => {
      for (let n = 1; n <= LEDS_IN_STRIP; n++) {
        expect(KodingKreators.ledInStripPins[`LED_${n}`]).to.equal(n);
      }
    });
  });

  describe(`#servoMotorPins`, () => {
    let smp = KodingKreators.servoMotorPins;

    it(`should map SERVO_MOTOR_1 to PIN_11`, () => {
      expect(smp.SERVO_MOTOR_1).to.equal(11);
    });

    it(`should map SERVO_MOTOR_2 to PIN_10`, () => {
      expect(smp.SERVO_MOTOR_2).to.equal(10);
    });
  });

  describe(`#notes`, () => {
    it(`should equal to specific frequencies`, () => {
      expect(KodingKreators.notes).to.deep.equal({
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
                                                 });
    });
  });

  describe(`#beats`, () => {
    it(`should equal to specific values`, () => {
      expect(KodingKreators.beats).to.deep.equal({
                                                   HALF: 500,
                                                   QUARTER: 250,
                                                   EIGHTH: 125,
                                                   WHOLE: 1000,
                                                   DOUBLE: 2000,
                                                   ZERO: 0
                                                 });
    });
  });

  describe(`#resetAll`, () => {
    // TODO
  });
});
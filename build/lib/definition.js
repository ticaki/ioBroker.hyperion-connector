"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var definition_exports = {};
__export(definition_exports, {
  Defaults: () => Defaults,
  controlDefaults: () => controlDefaults,
  defaultChannel: () => defaultChannel,
  descriptionUrlAppendix: () => descriptionUrlAppendix,
  genericStateObjects: () => genericStateObjects,
  statesObjects: () => statesObjects
});
module.exports = __toCommonJS(definition_exports);
const defaultChannel = {
  _id: "",
  type: "channel",
  common: {
    name: "Hey no description... "
  },
  native: {}
};
const genericStateObjects = {
  default: {
    _id: "No_definition",
    type: "state",
    common: {
      name: "",
      type: "string",
      role: "text",
      read: true,
      write: false
    },
    native: {}
  },
  deviceDB: {
    _id: "",
    type: "state",
    common: {
      name: "",
      type: "string",
      role: "json",
      read: true,
      write: false
    },
    native: {}
  },
  authenticationError: {
    _id: "",
    type: "state",
    common: {
      name: "",
      type: "boolean",
      role: "indicator",
      read: true,
      write: false
    },
    native: {}
  },
  customString: {
    _id: "User_State",
    type: "state",
    common: {
      name: "",
      type: "string",
      role: "text",
      read: true,
      write: false
    },
    native: {}
  },
  online: {
    _id: "",
    type: "state",
    common: {
      name: "",
      type: "boolean",
      role: "indicator.connected",
      read: true,
      write: false
    },
    native: {}
  },
  json: {
    _id: "",
    type: "state",
    common: {
      name: "",
      type: "string",
      role: "json",
      read: true,
      write: false
    },
    native: {}
  },
  settings: {
    _id: "",
    type: "folder",
    common: {
      name: ""
    },
    native: {}
  },
  global: {
    _id: "",
    type: "folder",
    common: {
      name: ""
    },
    native: {}
  },
  checkOnline: {
    _id: "",
    type: "state",
    common: {
      name: "",
      type: "boolean",
      role: "switch",
      read: true,
      write: true
    },
    native: {}
  }
};
const controlDefaults = {
  controls: {
    color: {
      color: [0, 0, 0],
      priority: 1,
      origin: "",
      duration: 0,
      activate: false
    },
    action: "",
    componentstate: {
      SMOOTHING: false,
      BLACKBORDER: false,
      FORWARDER: false,
      BOBLIGHTSERVER: false,
      GRABBER: false,
      V4L: false,
      AUDIO: false,
      LEDDEVICE: false,
      ALL: false
    },
    clear: {
      priority: 0
    },
    sourceselect: {
      priority: 1,
      auto: false
    },
    system: {
      suspend: false,
      resume: false,
      toggleSuspend: false,
      idle: false,
      toggleIdle: false,
      restart: false
    },
    adjustment: {
      activate: false,
      red: [0, 0, 0],
      green: [0, 0, 0],
      blue: [0, 0, 0],
      yellow: [0, 0, 0],
      cyan: [0, 0, 0],
      magenta: [0, 0, 0],
      white: [0, 0, 0],
      brightness: 50,
      brightnessGain: 1,
      brightnessCompensation: 0,
      saturationGain: 1,
      temperature: 6500,
      backlightThreshold: 50,
      backlightColored: false,
      gammaRed: 1,
      gammaGreen: 1,
      gammaBlue: 1,
      id: ""
    }
  }
};
const statesObjects = {
  device: {
    _channel: {
      _id: "",
      type: "device",
      common: {
        name: "",
        statusStates: { onlineId: "0.connected", errorId: "hm-rpc.0.AB203424.0.error" }
      },
      native: {}
    },
    controls: {
      _channel: {
        _id: "",
        type: "channel",
        common: {
          name: ""
        },
        native: {}
      },
      adjustment: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        activate: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "button",
            read: false,
            write: true,
            def: false
          },
          native: {}
        },
        red: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "array",
            role: "list",
            read: true,
            write: true,
            def: [0, 0, 0]
          },
          native: {}
        },
        green: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "array",
            role: "list",
            read: true,
            write: true,
            def: [0, 0, 0]
          },
          native: {}
        },
        blue: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "array",
            role: "list",
            read: true,
            write: true,
            def: [0, 0, 0]
          },
          native: {}
        },
        yellow: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "array",
            role: "list",
            read: true,
            write: true,
            def: [0, 0, 0]
          },
          native: {}
        },
        cyan: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "array",
            role: "list",
            read: true,
            write: true,
            def: [0, 0, 0]
          },
          native: {}
        },
        magenta: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "array",
            role: "list",
            read: true,
            write: true,
            def: [0, 0, 0]
          },
          native: {}
        },
        white: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "array",
            role: "list",
            read: true,
            write: true,
            def: [0, 0, 0]
          },
          native: {}
        },
        brightness: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "level",
            read: true,
            write: true,
            min: 0,
            max: 100,
            step: 1,
            def: 100
          },
          native: {}
        },
        brightnessGain: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "level",
            read: true,
            write: true,
            min: 0,
            max: 10,
            step: 0.1,
            def: 0
          },
          native: {}
        },
        brightnessCompensation: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "level",
            read: true,
            write: true,
            min: 0,
            max: 100,
            step: 1,
            def: 0
          },
          native: {}
        },
        saturationGain: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "level",
            read: true,
            write: true,
            min: 0,
            max: 10,
            step: 0.1,
            def: 0
          },
          native: {}
        },
        temperature: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "level",
            read: true,
            write: true,
            min: 1e3,
            max: 4e4,
            def: 6500
          },
          native: {}
        },
        backlightThreshold: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "level",
            read: true,
            write: true,
            min: 0,
            max: 100,
            step: 1,
            def: 50
          },
          native: {}
        },
        backlightColored: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "switch",
            read: true,
            write: true,
            def: false
          },
          native: {}
        },
        gammaRed: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "level",
            read: true,
            write: true,
            min: 0.1,
            max: 5,
            step: 0.1,
            def: 1
          },
          native: {}
        },
        gammaGreen: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "level",
            read: true,
            write: true,
            min: 0.1,
            max: 5,
            step: 0.1,
            def: 1
          },
          native: {}
        },
        gammaBlue: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "level",
            read: true,
            write: true,
            min: 0.1,
            max: 5,
            step: 0.1,
            def: 1
          },
          native: {}
        },
        id: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: true,
            def: ""
          },
          native: {}
        }
      },
      sourceselect: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        priority: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "level",
            read: true,
            write: true,
            min: 0,
            max: 255,
            step: 1,
            def: 1
          },
          native: {}
        },
        auto: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "button",
            read: false,
            write: true,
            def: false
          },
          native: {}
        }
      },
      clear: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        priority: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "level",
            read: true,
            write: true,
            min: -1,
            max: 253,
            step: 1,
            def: -1
          },
          native: {}
        }
      },
      // https://github.com/hyperion-project/hyperion.ng/blob/d75388222a61d8f0587ba276b8949439c23c315d/libsrc/api/JSONRPC_schema/schema-componentstate.json
      componentstate: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        SMOOTHING: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "switch",
            read: false,
            write: true,
            def: false
          },
          native: {}
        },
        BLACKBORDER: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "switch",
            read: false,
            write: true,
            def: false
          },
          native: {}
        },
        FORWARDER: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "switch",
            read: false,
            write: true,
            def: false
          },
          native: {}
        },
        BOBLIGHTSERVER: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "switch",
            read: false,
            write: true,
            def: false
          },
          native: {}
        },
        GRABBER: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "switch",
            read: false,
            write: true,
            def: false
          },
          native: {}
        },
        V4L: {
          _id: "",
          type: "state",
          common: {
            name: "controls.componentstate.V4L",
            type: "boolean",
            role: "switch",
            read: false,
            write: true,
            def: false
          },
          native: {}
        },
        AUDIO: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "switch",
            read: false,
            write: true,
            def: false
          },
          native: {}
        },
        LEDDEVICE: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "switch",
            read: false,
            write: true,
            def: false
          },
          native: {}
        },
        ALL: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "switch",
            read: false,
            write: true,
            def: false
          },
          native: {}
        }
      },
      action: {
        _id: "",
        type: "state",
        common: {
          name: "",
          type: "string",
          role: "JSON",
          read: true,
          write: true,
          def: "{}"
        },
        native: {}
      },
      color: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        // https://github.com/hyperion-project/hyperion.ng/blob/d75388222a61d8f0587ba276b8949439c23c315d/libsrc/api/JSONRPC_schema/schema-color.json
        color: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "array",
            role: "list",
            read: true,
            write: true,
            def: [0, 0, 0]
          },
          native: {}
        },
        priority: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "level",
            read: true,
            write: true,
            min: 1,
            max: 255,
            step: 1,
            def: 1
          },
          native: {}
        },
        origin: {
          _id: "",
          type: "state",
          common: {
            //
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: true,
            def: ""
          },
          native: {}
        },
        duration: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "level",
            read: true,
            write: true,
            def: 0
          },
          native: {}
        },
        activate: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "button",
            read: false,
            write: true
          },
          native: {}
        }
      },
      // https://github.com/hyperion-project/hyperion.ng/blob/d75388222a61d8f0587ba276b8949439c23c315d/libsrc/api/JSONRPC_schema/schema-system.json
      system: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        suspend: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "button",
            read: false,
            write: true,
            def: false
          },
          native: {}
        },
        resume: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "button",
            read: false,
            write: true,
            def: false
          },
          native: {}
        },
        toggleSuspend: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "button",
            read: false,
            write: true,
            def: false
          },
          native: {}
        },
        idle: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "button",
            read: false,
            write: true,
            def: false
          },
          native: {}
        },
        toggleIdle: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "button",
            read: false,
            write: true,
            def: false
          },
          native: {}
        },
        restart: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "button",
            read: false,
            write: true,
            def: false
          },
          native: {}
        }
      }
    },
    description: {
      _channel: {
        _id: "",
        type: "channel",
        common: {
          name: ""
        },
        native: {}
      },
      specVersion: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        minor: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        major: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        }
      },
      URLBase: {
        _id: "",
        type: "state",
        common: {
          name: "",
          type: "string",
          role: "text",
          read: true,
          write: false
        },
        native: {}
      },
      device: {
        _channel: {
          _id: "",
          type: "device",
          common: {
            name: ""
          },
          native: {}
        },
        deviceType: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        presentationURL: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        manufacturer: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        manufacturerURL: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        modelDescription: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        modelName: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        modelNumber: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        modelURL: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        serialNumber: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        UDN: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        ports: {
          _channel: {
            _id: "",
            type: "channel",
            common: {
              name: ""
            },
            native: {}
          },
          jsonServer: {
            _id: "",
            type: "state",
            common: {
              name: "",
              type: "number",
              role: "value",
              read: true,
              write: false
            },
            native: {}
          },
          sslServer: {
            _id: "",
            type: "state",
            common: {
              name: "",
              type: "number",
              role: "value",
              read: true,
              write: false
            },
            native: {}
          },
          protoBuffer: {
            _id: "",
            type: "state",
            common: {
              name: "",
              type: "number",
              role: "value",
              read: true,
              write: false
            },
            native: {}
          },
          flatBuffer: {
            _id: "",
            type: "state",
            common: {
              name: "",
              type: "number",
              role: "value",
              read: true,
              write: false
            },
            native: {}
          }
        },
        iconList: {
          _channel: {
            _id: "",
            type: "channel",
            common: {
              name: ""
            },
            native: {}
          },
          icon: {
            _channel: {
              _id: "",
              type: "channel",
              common: {
                name: ""
              },
              native: {}
            },
            mimetype: {
              _id: "",
              type: "state",
              common: {
                name: "",
                type: "string",
                role: "text",
                read: true,
                write: false
              },
              native: {}
            },
            height: {
              _id: "",
              type: "state",
              common: {
                name: "",
                type: "number",
                role: "value",
                read: true,
                write: false
              },
              native: {}
            },
            width: {
              _id: "",
              type: "state",
              common: {
                name: "",
                type: "number",
                role: "value",
                read: true,
                write: false
              },
              native: {}
            },
            depth: {
              _id: "",
              type: "state",
              common: {
                name: "",
                type: "number",
                role: "value",
                read: true,
                write: false
              },
              native: {}
            },
            url: {
              _id: "",
              type: "state",
              common: {
                name: "",
                type: "string",
                role: "text",
                read: true,
                write: false
              },
              native: {}
            }
          }
        },
        friendlyName: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        }
      }
    },
    serverinfo: {
      _channel: {
        _id: "",
        type: "channel",
        common: {
          name: ""
        },
        native: {}
      },
      activeEffects: {
        _id: "",
        type: "state",
        common: {
          name: "",
          type: "string",
          role: "text",
          read: true,
          write: false
        },
        native: {}
      },
      activeLedColor: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        "HSL Value": {
          _id: "",
          type: "state",
          common: {
            name: "serverinfo.server.info.activeLedColor.HSL Value",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        "RGB Value": {
          _id: "",
          type: "state",
          common: {
            name: "serverinfo.server.info.activeLedColor.RGB Value",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        }
      },
      adjustment: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        backlightColored: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        },
        backlightThreshold: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        blue: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        brightness: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        brightnessCompensation: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        brightnessGain: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        cyan: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        gammaBlue: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        gammaGreen: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        gammaRed: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        green: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        id: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        magenta: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        red: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        saturationGain: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        white: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        yellow: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        }
      },
      cec: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        enabled: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        }
      },
      components: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        enabled: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        },
        name: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        }
      },
      effects: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        args: {
          _channel: {
            _id: "",
            type: "channel",
            common: {
              name: ""
            },
            native: {}
          },
          blobs: {
            _id: "",
            type: "state",
            common: {
              name: "",
              type: "number",
              role: "value",
              read: true,
              write: false
            },
            native: {}
          }
        },
        file: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        name: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        script: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        }
      },
      grabbers: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        audio: {
          _channel: {
            _id: "",
            type: "channel",
            common: {
              name: ""
            },
            native: {}
          },
          active: {
            _id: "",
            type: "state",
            common: {
              name: "",
              type: "mixed",
              role: "text",
              read: true,
              write: false
            },
            native: {}
          },
          available: {
            _id: "",
            type: "state",
            common: {
              name: "",
              type: "string",
              role: "text",
              read: true,
              write: false
            },
            native: {}
          }
        },
        screen: {
          _channel: {
            _id: "",
            type: "channel",
            common: {
              name: ""
            },
            native: {}
          },
          active: {
            _id: "",
            type: "state",
            common: {
              name: "",
              type: "string",
              role: "text",
              read: true,
              write: false
            },
            native: {}
          },
          available: {
            _id: "",
            type: "state",
            common: {
              name: "",
              type: "string",
              role: "text",
              read: true,
              write: false
            },
            native: {}
          }
        },
        video: {
          _channel: {
            _id: "",
            type: "channel",
            common: {
              name: ""
            },
            native: {}
          },
          active: {
            _id: "",
            type: "state",
            common: {
              name: "",
              type: "string",
              role: "text",
              read: true,
              write: false
            },
            native: {}
          },
          available: {
            _id: "",
            type: "state",
            common: {
              name: "",
              type: "string",
              role: "text",
              read: true,
              write: false
            },
            native: {}
          }
        }
      },
      hostname: {
        _id: "",
        type: "state",
        common: {
          name: "",
          type: "string",
          role: "text",
          read: true,
          write: false
        },
        native: {}
      },
      imageToLedMappingType: {
        _id: "",
        type: "state",
        common: {
          name: "",
          type: "string",
          role: "text",
          read: true,
          write: false
        },
        native: {}
      },
      instance: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        friendly_name: {
          _id: "",
          type: "state",
          common: {
            name: "serverinfo.server.info.instance.friendly_name",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        instance: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        running: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        }
      },
      ledDevices: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        available: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        }
      },
      leds: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        hmax: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        hmin: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        vmax: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        vmin: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        }
      },
      priorities: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        active: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        componentId: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        origin: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        owner: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        priority: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        value: {
          _channel: {
            _id: "",
            type: "channel",
            common: {
              name: ""
            },
            native: {}
          },
          HSL: {
            _id: "",
            type: "state",
            common: {
              name: "",
              type: "string",
              role: "text",
              read: true,
              write: false
            },
            native: {}
          },
          RGB: {
            _id: "",
            type: "state",
            common: {
              name: "",
              type: "string",
              role: "text",
              read: true,
              write: false
            },
            native: {}
          }
        },
        visible: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        }
      },
      priorities_autoselect: {
        _id: "",
        type: "state",
        common: {
          name: "serverinfo.server.info.priorities_autoselect",
          type: "boolean",
          role: "indicator",
          read: true,
          write: false
        },
        native: {}
      },
      services: {
        _id: "",
        type: "state",
        common: {
          name: "",
          type: "string",
          role: "text",
          read: true,
          write: false
        },
        native: {}
      },
      transform: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        blacklevel: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        brightnessGain: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        gamma: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        id: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        luminanceGain: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        luminanceMinimum: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        saturationGain: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        saturationLGain: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        threshold: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "number",
            role: "value",
            read: true,
            write: false
          },
          native: {}
        },
        whitelevel: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        }
      },
      videomode: {
        _id: "",
        type: "state",
        common: {
          name: "",
          type: "string",
          role: "text",
          read: true,
          write: false
        },
        native: {}
      }
    },
    sysinfo: {
      _channel: {
        _id: "",
        type: "channel",
        common: {
          name: ""
        },
        native: {}
      },
      hyperion: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        build: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        gitremote: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        id: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        isGuiMode: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        },
        readOnlyMode: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        },
        rootPath: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        time: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        version: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        }
      },
      system: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: ""
          },
          native: {}
        },
        architecture: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        cpuHardware: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        cpuModelName: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        cpuModelType: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        cpuRevision: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        domainName: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        hostName: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        isUserAdmin: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "boolean",
            role: "indicator",
            read: true,
            write: false
          },
          native: {}
        },
        kernelType: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        kernelVersion: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        prettyName: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        productType: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        productVersion: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        pyVersion: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        qtVersion: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        },
        wordSize: {
          _id: "",
          type: "state",
          common: {
            name: "",
            type: "string",
            role: "text",
            read: true,
            write: false
          },
          native: {}
        }
      }
    }
  }
};
const descriptionUrlAppendix = "/description.xml";
const Defaults = {
  state: {
    _id: "No_definition",
    type: "state",
    common: {
      name: "No definition",
      type: "string",
      role: "text",
      read: true,
      write: false
    },
    native: {}
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Defaults,
  controlDefaults,
  defaultChannel,
  descriptionUrlAppendix,
  genericStateObjects,
  statesObjects
});
//# sourceMappingURL=definition.js.map

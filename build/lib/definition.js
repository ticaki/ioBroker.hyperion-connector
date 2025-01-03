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
      name: "genericStateObjects.state",
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
      name: "genericStateObjects.deviceDB",
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
      name: "genericStateObjects.authenticationError",
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
      name: "genericStateObjects.customString",
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
      name: "genericStateObjects.online",
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
      name: "genericStateObjects.json",
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
      name: "settings.folder"
    },
    native: {}
  },
  global: {
    _id: "",
    type: "folder",
    common: {
      name: "settings.global"
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
    }
  }
};
const statesObjects = {
  device: {
    _channel: {
      _id: "",
      type: "device",
      common: {
        name: "room.channel",
        statusStates: { onlineId: "0.connected", errorId: "hm-rpc.0.AB203424.0.error" }
      },
      native: {}
    },
    controls: {
      _channel: {
        _id: "",
        type: "channel",
        common: {
          name: "controls.channel"
        },
        native: {}
      },
      sourceselect: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: "controls.sourceselect"
          },
          native: {}
        },
        priority: {
          _id: "",
          type: "state",
          common: {
            name: "controls.sourceselect.source",
            type: "number",
            role: "value",
            read: true,
            write: true,
            min: 1,
            max: 255,
            step: 1
          },
          native: {}
        },
        auto: {
          _id: "",
          type: "state",
          common: {
            name: "controls.sourceselect.auto",
            type: "boolean",
            role: "button",
            read: false,
            write: true
          },
          native: {}
        }
      },
      clear: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: "controls.clear"
          },
          native: {}
        },
        priority: {
          _id: "",
          type: "state",
          common: {
            name: "controls.clear.priority",
            type: "number",
            role: "value",
            read: true,
            write: true,
            min: -1,
            max: 255,
            step: 1
          },
          native: {}
        }
      },
      componentstate: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: "controls.componentstate"
          },
          native: {}
        },
        SMOOTHING: {
          _id: "",
          type: "state",
          common: {
            name: "controls.componentstate.SMOOTHING",
            type: "boolean",
            role: "switch",
            read: false,
            write: true
          },
          native: {}
        },
        BLACKBORDER: {
          _id: "",
          type: "state",
          common: {
            name: "controls.componentstate.BLACKBORDER",
            type: "boolean",
            role: "switch",
            read: false,
            write: true
          },
          native: {}
        },
        FORWARDER: {
          _id: "",
          type: "state",
          common: {
            name: "controls.componentstate.FORWARDER",
            type: "boolean",
            role: "switch",
            read: false,
            write: true
          },
          native: {}
        },
        BOBLIGHTSERVER: {
          _id: "",
          type: "state",
          common: {
            name: "controls.componentstate.BOBLIGHTSERVER",
            type: "boolean",
            role: "switch",
            read: false,
            write: true
          },
          native: {}
        },
        GRABBER: {
          _id: "",
          type: "state",
          common: {
            name: "controls.componentstate.GRABBER",
            type: "boolean",
            role: "switch",
            read: false,
            write: true
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
            write: true
          },
          native: {}
        },
        AUDIO: {
          _id: "",
          type: "state",
          common: {
            name: "controls.componentstate.AUDIO",
            type: "boolean",
            role: "switch",
            read: false,
            write: true
          },
          native: {}
        },
        LEDDEVICE: {
          _id: "",
          type: "state",
          common: {
            name: "controls.componentstate.LEDDEVICE",
            type: "boolean",
            role: "switch",
            read: false,
            write: true
          },
          native: {}
        },
        ALL: {
          _id: "",
          type: "state",
          common: {
            name: "controls.componentstate.ALL",
            type: "boolean",
            role: "switch",
            read: false,
            write: true
          },
          native: {}
        }
      },
      action: {
        _id: "",
        type: "state",
        common: {
          name: "controls.action",
          type: "string",
          role: "JSON",
          read: true,
          write: true
        },
        native: {}
      },
      color: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: "control.color"
          },
          native: {}
        },
        color: {
          _id: "",
          type: "state",
          common: {
            name: "control.color.color",
            type: "array",
            role: "value",
            read: true,
            write: true
          },
          native: {}
        },
        priority: {
          _id: "",
          type: "state",
          common: {
            name: "control.color.priority",
            type: "number",
            role: "value",
            read: true,
            write: true,
            min: 1,
            max: 255,
            step: 1
          },
          native: {}
        },
        origin: {
          _id: "",
          type: "state",
          common: {
            name: "control.color.origin",
            type: "string",
            role: "text",
            read: true,
            write: true
          },
          native: {}
        },
        duration: {
          _id: "",
          type: "state",
          common: {
            name: "control.color.duration",
            type: "number",
            role: "value",
            read: true,
            write: true
          },
          native: {}
        },
        activate: {
          _id: "",
          type: "state",
          common: {
            name: "control.color.activate",
            type: "boolean",
            role: "button",
            read: false,
            write: true
          },
          native: {}
        }
      },
      system: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: "controls.system"
          },
          native: {}
        },
        suspend: {
          _id: "",
          type: "state",
          common: {
            name: "controls.system.suspend",
            type: "boolean",
            role: "button",
            read: false,
            write: true
          },
          native: {}
        },
        resume: {
          _id: "",
          type: "state",
          common: {
            name: "controls.system.resume",
            type: "boolean",
            role: "button",
            read: false,
            write: true
          },
          native: {}
        },
        toggleSuspend: {
          _id: "",
          type: "state",
          common: {
            name: "controls.system.toggleSuspend",
            type: "boolean",
            role: "button",
            read: false,
            write: true
          },
          native: {}
        },
        idle: {
          _id: "",
          type: "state",
          common: {
            name: "controls.system.idle",
            type: "boolean",
            role: "button",
            read: false,
            write: true
          },
          native: {}
        },
        toggleIdle: {
          _id: "",
          type: "state",
          common: {
            name: "controls.system.toggleIdle",
            type: "boolean",
            role: "button",
            read: false,
            write: true
          },
          native: {}
        },
        restart: {
          _id: "",
          type: "state",
          common: {
            name: "controls.system.restart",
            type: "boolean",
            role: "button",
            read: false,
            write: true
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
          name: "device.description"
        },
        native: {}
      },
      specVersion: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: "device.specVersion"
          },
          native: {}
        },
        minor: {
          _id: "",
          type: "state",
          common: {
            name: "device.specVersion.minor",
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
            name: "device.specVersion.major",
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
          name: "device.URLBase",
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
            name: "room.channel"
          },
          native: {}
        },
        deviceType: {
          _id: "",
          type: "state",
          common: {
            name: "device.ssdp.device",
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
            name: "device.ssdp.presentationURL",
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
            name: "device.ssdp.manufacturer",
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
            name: "device.ssdp.manufacturerURL",
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
            name: "device.ssdp.modelDescription",
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
            name: "device.ssdp.modelName",
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
            name: "device.ssdp.modelNumber",
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
            name: "device.ssdp.modelURL",
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
            name: "device.ssdp.serialNumber",
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
            name: "device.ssdp.UDN",
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
              name: "device.ssdp.ports"
            },
            native: {}
          },
          jsonServer: {
            _id: "",
            type: "state",
            common: {
              name: "device.ssdp.ports.jsonServer",
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
              name: "device.ssdp.ports.sslServer",
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
              name: "device.ssdp.ports.protoBuffer",
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
              name: "device.ssdp.ports.flatBuffer",
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
              name: "device.ssdp.iconList"
            },
            native: {}
          },
          icon: {
            _channel: {
              _id: "",
              type: "channel",
              common: {
                name: "device.ssdp.iconList.icon"
              },
              native: {}
            },
            mimetype: {
              _id: "",
              type: "state",
              common: {
                name: "device.ssdp.iconList.icon.mimetype",
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
                name: "device.ssdp.iconList.icon.height",
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
                name: "device.ssdp.iconList.icon.width",
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
                name: "device.ssdp.iconList.icon.depth",
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
                name: "device.ssdp.iconList.icon.url",
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
            name: "device.ssdp.friendlyName",
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
          name: "serverinfo.channel"
        },
        native: {}
      },
      activeEffects: {
        _id: "",
        type: "state",
        common: {
          name: "serverinfo.server.info.activeEffects",
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
            name: "serverinfo.server.info.activeLedColor"
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
            name: "serverinfo.server.info.adjustment"
          },
          native: {}
        },
        backlightColored: {
          _id: "",
          type: "state",
          common: {
            name: "serverinfo.server.info.adjustment.backlightColored",
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
            name: "serverinfo.server.info.adjustment.backlightThreshold",
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
            name: "serverinfo.server.info.adjustment.blue",
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
            name: "serverinfo.server.info.adjustment.brightness",
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
            name: "serverinfo.server.info.adjustment.brightnessCompensation",
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
            name: "serverinfo.server.info.adjustment.brightnessGain",
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
            name: "serverinfo.server.info.adjustment.cyan",
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
            name: "serverinfo.server.info.adjustment.gammaBlue",
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
            name: "serverinfo.server.info.adjustment.gammaGreen",
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
            name: "serverinfo.server.info.adjustment.gammaRed",
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
            name: "serverinfo.server.info.adjustment.green",
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
            name: "serverinfo.server.info.adjustment.id",
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
            name: "serverinfo.server.info.adjustment.magenta",
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
            name: "serverinfo.server.info.adjustment.red",
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
            name: "serverinfo.server.info.adjustment.saturationGain",
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
            name: "serverinfo.server.info.adjustment.white",
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
            name: "serverinfo.server.info.adjustment.yellow",
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
            name: "serverinfo.server.info.cec"
          },
          native: {}
        },
        enabled: {
          _id: "",
          type: "state",
          common: {
            name: "serverinfo.server.info.cec.enabled",
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
            name: "serverinfo.server.info.components"
          },
          native: {}
        },
        enabled: {
          _id: "",
          type: "state",
          common: {
            name: "serverinfo.server.info.components.enabled",
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
            name: "serverinfo.server.info.components.name",
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
            name: "serverinfo.server.info.effects"
          },
          native: {}
        },
        args: {
          _channel: {
            _id: "",
            type: "channel",
            common: {
              name: "serverinfo.server.info.effects.args"
            },
            native: {}
          },
          blobs: {
            _id: "",
            type: "state",
            common: {
              name: "serverinfo.server.info.effects.args.blobs",
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
            name: "serverinfo.server.info.effects.file",
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
            name: "serverinfo.server.info.effects.name",
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
            name: "serverinfo.server.info.effects.script",
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
            name: "serverinfo.server.info.grabbers"
          },
          native: {}
        },
        audio: {
          _channel: {
            _id: "",
            type: "channel",
            common: {
              name: "serverinfo.server.info.grabbers.audio"
            },
            native: {}
          },
          active: {
            _id: "",
            type: "state",
            common: {
              name: "serverinfo.server.info.grabbers.audio.active",
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
              name: "serverinfo.server.info.grabbers.audio.available",
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
              name: "serverinfo.server.info.grabbers.screen"
            },
            native: {}
          },
          active: {
            _id: "",
            type: "state",
            common: {
              name: "serverinfo.server.info.grabbers.screen.active",
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
              name: "serverinfo.server.info.grabbers.screen.available",
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
              name: "serverinfo.server.info.grabbers.video"
            },
            native: {}
          },
          active: {
            _id: "",
            type: "state",
            common: {
              name: "serverinfo.server.info.grabbers.video.active",
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
              name: "serverinfo.server.info.grabbers.video.available",
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
          name: "serverinfo.server.info.hostname",
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
          name: "serverinfo.server.info.imageToLedMapping",
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
            name: "serverinfo.server.info.instance"
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
            name: "serverinfo.server.info.instance.instance",
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
            name: "serverinfo.server.info.instance.running",
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
            name: "serverinfo.server.info.ledDevices"
          },
          native: {}
        },
        available: {
          _id: "",
          type: "state",
          common: {
            name: "serverinfo.server.info.ledDevices.available",
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
            name: "serverinfo.server.info.leds"
          },
          native: {}
        },
        hmax: {
          _id: "",
          type: "state",
          common: {
            name: "serverinfo.server.info.leds.hmax",
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
            name: "serverinfo.server.info.leds.hmin",
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
            name: "serverinfo.server.info.leds.vmax",
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
            name: "serverinfo.server.info.leds.vmin",
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
            name: "serverinfo.server.info.priorities"
          },
          native: {}
        },
        active: {
          _id: "",
          type: "state",
          common: {
            name: "serverinfo.server.info.priorities.active",
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
            name: "serverinfo.server.info.priorities.componentId",
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
            name: "serverinfo.server.info.priorities.origin",
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
            name: "serverinfo.server.info.priorities.owner",
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
            name: "serverinfo.server.info.priorities.priority",
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
              name: "serverinfo.server.info.priorities.value"
            },
            native: {}
          },
          HSL: {
            _id: "",
            type: "state",
            common: {
              name: "serverinfo.server.info.priorities.value.HSL",
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
              name: "serverinfo.server.info.priorities.value.RGB",
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
            name: "serverinfo.server.info.priorities.visible",
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
          name: "serverinfo.server.info.services",
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
            name: "serverinfo.server.info.transform"
          },
          native: {}
        },
        blacklevel: {
          _id: "",
          type: "state",
          common: {
            name: "serverinfo.server.info.transform.blacklevel",
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
            name: "serverinfo.server.info.transform.brightnessGain",
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
            name: "serverinfo.server.info.transform.gamma",
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
            name: "serverinfo.server.info.transform.id",
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
            name: "serverinfo.server.info.transform.luminanceGain",
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
            name: "serverinfo.server.info.transform.luminanceMinimum",
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
            name: "serverinfo.server.info.transform.saturationGain",
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
            name: "serverinfo.server.info.transform.saturationLGain",
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
            name: "serverinfo.server.info.transform.threshold",
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
            name: "serverinfo.server.info.transform.whitelevel",
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
          name: "serverinfo.server.info.videoMode",
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
          name: "sysinfo.channel"
        },
        native: {}
      },
      hyperion: {
        _channel: {
          _id: "",
          type: "channel",
          common: {
            name: "sysinfo.hyperion"
          },
          native: {}
        },
        build: {
          _id: "",
          type: "state",
          common: {
            name: "sysinfo.hyperion.build",
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
            name: "sysinfo.hyperion.gitRemote",
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
            name: "sysinfo.hyperion.id",
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
            name: "sysinfo.hyperion.isGuiMode",
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
            name: "sysinfo.hyperion.readOnlyMode",
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
            name: "sysinfo.hyperion.rootPath",
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
            name: "sysinfo.hyperion.time",
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
            name: "sysinfo.hyperion.version",
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
            name: "sysinfo.system"
          },
          native: {}
        },
        architecture: {
          _id: "",
          type: "state",
          common: {
            name: "sysinfo.system.arch",
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
            name: "sysinfo.system.cpuHardware",
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
            name: "sysinfo.system.cpuModelName",
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
            name: "sysinfo.system.cpuModelType",
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
            name: "sysinfo.system.cpuRevision",
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
            name: "sysinfo.system.domainName",
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
            name: "sysinfo.system.hostname",
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
            name: "sysinfo.system.isUserAdmin",
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
            name: "sysinfo.system.kernelType",
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
            name: "sysinfo.system.kernelVersion",
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
            name: "sysinfo.system.prettyName",
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
            name: "sysinfo.system.productType",
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
            name: "sysinfo.system.productVersion",
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
            name: "sysinfo.system.pyVersion",
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
            name: "sysinfo.system.qtVersion",
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
            name: "sysinfo.system.wordSize",
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

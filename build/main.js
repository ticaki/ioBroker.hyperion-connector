"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_library = require("./lib/library");
var import_controller = require("./lib/controller");
class HyperionNg2 extends utils.Adapter {
  library;
  controller;
  sendToTimeout = void 0;
  /**
   * Creates an instance of HyperionNg2.
   *
   * @param [options] - The adapter options.
   */
  constructor(options = {}) {
    super({
      ...options,
      name: "hyperion-ng2"
    });
    this.library = new import_library.Library(this);
    this.controller = new import_controller.Controller(this);
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("message", this.onMessage.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    this.config.activateSsdp = true;
    await this.setState("info.connection", false, true);
    setTimeout(async () => {
      await this.library.init();
      await this.library.initStates(await this.getStatesAsync("*"));
      await this.controller.init();
    }, 1e3);
  }
  /**
   * Is called when the adapter shuts down - the callback must be called under any circumstances!
   *
   * @param callback - The callback function that must be called
   */
  onUnload(callback) {
    try {
      if (this.sendToTimeout) {
        clearTimeout(this.sendToTimeout);
      }
      this.controller.onUnload();
      callback();
    } catch {
      callback();
    }
  }
  /**
   * Is called if a subscribed state changes
   *
   * @param id - The ID of the state that changed
   * @param state - The new state value or null/undefined if the state was deleted
   */
  async onStateChange(id, state) {
    if (state && !state.ack) {
      await this.controller.onStateChange(id, state);
    }
  }
  /**
   * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
   * Using this method requires "common.messagebox" property to be set to true in io-package.json
   *
   * @param obj - The message object
   */
  async onMessage(obj) {
    var _a;
    this.log.debug(`Data from configuration received : ${JSON.stringify(obj)}`);
    if (typeof obj === "object" && obj.message) {
      this.log.debug(`with message : ${JSON.stringify(obj.message)}`);
      if (typeof obj.message == "string") {
        this.log.info(`received message ${obj.message}`);
      }
      if (obj.command === "getDevices") {
        const devices = [];
        for (const hyperion of this.controller.hyperions) {
          const index = ((_a = this.config.devices) != null ? _a : []).findIndex((d) => d.UDN === hyperion.UDN);
          if (index >= 0) {
            devices[index] = {
              ...this.config.devices[index],
              name: hyperion.name,
              protocol: hyperion.protocol,
              ip: hyperion.ip,
              port: hyperion.port
            };
          } else {
            devices.push({
              UDN: hyperion.UDN,
              name: hyperion.name,
              protocol: hyperion.protocol,
              ip: hyperion.ip,
              port: hyperion.port,
              enabled: true
            });
          }
        }
        if (obj.callback) {
          if (JSON.stringify(devices) !== JSON.stringify(this.config.devices)) {
            this.sendToTimeout = this.setTimeout(() => {
              this.sendTo(obj.from, obj.command, { native: { devices } }, obj.callback);
            }, 2e3);
          } else {
            this.sendTo(obj.from, obj.command, void 0, obj.callback);
          }
        }
      } else if (obj.callback) {
        this.sendTo(obj.from, obj.command, "Message received", obj.callback);
      }
    } else if (obj.callback) {
      this.sendTo(obj.from, obj.command, "Message received", obj.callback);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new HyperionNg2(options);
} else {
  (() => new HyperionNg2())();
}
module.exports = HyperionNg2;
//# sourceMappingURL=main.js.map

"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var hyperion_exports = {};
__export(hyperion_exports, {
  Hyperion: () => Hyperion
});
module.exports = __toCommonJS(hyperion_exports);
var import_ws = __toESM(require("ws"));
var import_library = require("./library");
var import_definition = require("./definition");
class Hyperion extends import_library.BaseClass {
  description;
  UDN;
  ip = "";
  protocol = "";
  port = 0;
  token = void 0;
  ws;
  delayTimeout;
  aliveTimeout;
  aliveCheckTimeout;
  legacyAliveCheck = true;
  // authorize-tokenRequired // authorize-login
  connectionState = "disconnected";
  /**
   * constructor
   *
   * @param adapter adapter class definition
   * @param UDN unique device name
   * @param config device description
   */
  constructor(adapter, UDN, config) {
    super(adapter, config.name || "Hyperion");
    this.UDN = UDN.replace(/^uuid:/, "");
    this.protocol = config.protocol;
    this.ip = config.ip;
    this.port = config.port;
    this.token = config.token;
  }
  checkHyperionVersion() {
    if (!this.description) {
      return;
    }
    let version = this.description.device.modelNumber;
    if (version) {
      const temp = version.match(/(\d+\.\d+\.\d+)/);
      if (temp) {
        version = temp[1];
        const parts = version.split(".");
        this.log.debug("Hyperion version:", version);
        if (parts.length >= 3) {
          if (parseInt(parts[0]) > 2 || parseInt(parts[1]) > 0 || parseInt(parts[2]) > 16) {
            this.legacyAliveCheck = false;
          } else {
            this.log.warn("Hyperion version is equal or lower than 2.0.16, use legacy alive check");
            this.legacyAliveCheck = true;
          }
        }
      }
    }
  }
  /**
   * init
   *
   * initialize the device
   */
  async init() {
    this.setOnline(false);
    await this.library.writedp(this.UDN, void 0, {
      _id: "",
      type: "device",
      common: {
        name: this.description ? this.description.device.friendlyName : this.name,
        statusStates: { onlineId: "online", errorId: "error" }
      },
      native: {}
    });
    await this.library.writeFromJson(this.UDN, "device", import_definition.statesObjects, import_definition.controlDefaults, false, true);
    await this.library.writedp(`${this.UDN}.authenticationError`, false, import_definition.genericStateObjects.authenticationError);
    this.adapter.subscribeStates(`${this.library.cleandp(`${this.UDN}.controls`)}.*`);
    if (this.token === void 0 || this.token.length < 36) {
      const obj = await this.adapter.getObjectAsync(this.UDN);
      if (obj && obj.native && obj.native.token) {
        this.token = this.adapter.decrypt(this.UDN, obj.native.token);
      }
    }
    await this.reconnect();
  }
  /**
   * setOnline
   *
   * @param isOnline set the online state.
   */
  setOnline(isOnline) {
    if (isOnline && this.connectionState !== "connected") {
      this.connectionState = "connected";
      this.adapter.controller.setOnline().catch(() => {
      });
      this.library.writedp(`${this.UDN}.online`, isOnline, import_definition.genericStateObjects.online).catch(() => {
      });
    } else if (!isOnline && this.connectionState !== "disconnected") {
      this.connectionState = "disconnected";
      this.adapter.controller.setOnline().catch(() => {
      });
      this.library.writedp(`${this.UDN}.online`, isOnline, import_definition.genericStateObjects.online).catch(() => {
      });
    }
  }
  /**
   * createWebsocketConnectionToHyperion
   */
  async reconnect() {
    if (this.ws) {
      this.ws.terminate;
    }
    try {
      this.description = await this.adapter.controller.network.getSsdpDescription(
        this.protocol,
        this.ip,
        this.port
      );
      if (this.description === void 0) {
        throw new Error("Got no description");
      }
      this.checkHyperionVersion();
      this.name = this.description.device.friendlyName;
      await this.library.writedp(this.UDN, void 0, {
        _id: "",
        type: "device",
        common: {
          name: this.description.device.friendlyName
        },
        native: {}
      });
      await this.library.writeFromJson(
        `${this.UDN}.device`,
        "device.description",
        import_definition.statesObjects,
        this.description
      );
      const url = this.description.URLBase.replace("http://", "ws://").replace("https://", "wss://");
      this.log.debug(`Re-/Connect to: ${url}`);
      this.ws = new import_ws.default(url);
      this.ws.addEventListener("open", async () => {
        if (this.description) {
          this.log.info(`Connected to ${this.description.device.friendlyName}`);
        }
        if (this.ws) {
          this.ws.send(
            JSON.stringify({
              command: "authorize",
              subcommand: "tokenRequired"
            })
          );
        }
      });
      this.ws.addEventListener("message", async (event) => {
        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : void 0;
          if (data) {
            if (data.command.startsWith("authorize-")) {
              this.log.debug("Received:", JSON.stringify(data));
              if (data.command === "authorize-login" && data.success === true) {
                this.log.info("Login successful");
                this.setOnline(true);
                this.aliveReset();
                if (this.ws) {
                  this.ws.send(
                    JSON.stringify({
                      command: "sysinfo",
                      tan: 1
                    })
                  );
                  this.ws.send(
                    JSON.stringify({
                      command: "serverinfo",
                      subscribe: ["all"],
                      tan: 1
                    })
                  );
                  return;
                }
              } else if (data.command === "authorize-tokenRequired" && data.info && data.info.required === false) {
                this.log.info("No Login required");
                this.setOnline(true);
                this.aliveReset();
                if (this.ws) {
                  this.ws.send(
                    JSON.stringify({
                      command: "sysinfo",
                      tan: 1
                    })
                  );
                  this.ws.send(
                    JSON.stringify({
                      command: "serverinfo",
                      subscribe: ["all"],
                      tan: 1
                    })
                  );
                  return;
                }
              } else if (data.command === "authorize-tokenRequired") {
                if (data.info && data.info.required === true) {
                  this.connectionState = "authorize";
                  if (this.token !== void 0 && this.token.length >= 36) {
                    if (this.ws) {
                      this.ws.send(
                        JSON.stringify({
                          command: "authorize",
                          subcommand: "login",
                          token: this.token
                        })
                      );
                      return;
                    }
                  } else {
                    this.connectionState = "pendingAuthorize";
                    if (this.ws) {
                      this.log.warn("Requesting token! Please check the Hyperion server webui!");
                      this.ws.send(
                        JSON.stringify({
                          command: "authorize",
                          subcommand: "requestToken",
                          comment: "Iobroker hyperion-ng2",
                          id: "io341"
                        })
                      );
                      return;
                    }
                  }
                }
              } else if (data.command === "authorize-requestToken" && data.success === true) {
                if (data.success === true) {
                  this.connectionState = "authorize";
                  this.log.debug("Token request successful");
                  this.token = data.info.token;
                  if (typeof this.token === "string" && this.token.length >= 36) {
                    await this.adapter.extendObject(this.UDN, {
                      native: {
                        token: this.adapter.encrypt(this.UDN, this.token)
                      }
                    });
                    if (this.ws) {
                      this.ws.send(
                        JSON.stringify({
                          command: "authorize",
                          subcommand: "login",
                          token: this.token
                        })
                      );
                      return;
                    }
                  }
                }
              } else if (data.command === "authorize-requestToken" && data.success === false) {
                this.log.error("Token request timeout or denied");
              } else if (data.command === "authorize-login" && data.success === false) {
                this.log.error(
                  "Login failed - wrong token? Please check the Hyperion server webui and adminpage of this adapter."
                );
                const obj = await this.adapter.getObjectAsync(this.UDN);
                if (obj && obj.native && obj.native.token && obj.native.token.length >= 36) {
                  this.log.error(
                    "An automatically generated token was found for this server, in the course of this error the token was deleted. Restart the adapter and confirm access in the Hyperion webui."
                  );
                  delete obj.native.token;
                  await this.adapter.setObject(obj._id, obj);
                }
              }
              this.log.error("Not authorized");
              this.connectionState = "notAuthorize";
              await this.library.writedp(
                `${this.UDN}.authenticationError`,
                true,
                import_definition.genericStateObjects.online
              );
              this.onUnload();
              return;
            } else if (data.command === "serverinfo") {
              const info = data.info;
              info.components = this.changeArrayToJsonIfName(info.components);
              await this.updateComponentControlsStates(info.components);
              info.effects = this.changeArrayToJsonIfName(info.effects);
              await this.library.writedp(
                `${this.UDN}.priorities.json`,
                JSON.stringify(info.priorities),
                import_definition.genericStateObjects.json
              );
              await this.library.writedp(
                `${this.UDN}.leds.json`,
                JSON.stringify(info.leds),
                import_definition.genericStateObjects.json
              );
              delete info.leds;
              await this.library.writeFromJson(this.UDN, "device.serverinfo", import_definition.statesObjects, info);
              await this.cleanTree();
            } else if (data.command.endsWith === "priorities-update") {
              if (this.ws) {
                this.ws.send(
                  JSON.stringify({
                    command: "serverinfo",
                    tan: 1
                  })
                );
              }
              this.log.debug("Received:", JSON.stringify(data));
            } else if (data.command.endsWith("-update")) {
              const path = data.command.replace("-update", "");
              const info = {};
              if (path == "components") {
                info.components = this.changeArrayToJsonIfName(data.data);
                await this.updateComponentControlsStates(info.components);
              } else if (path == "effects") {
                info.effects = this.changeArrayToJsonIfName(data.data);
              } else if (path == "leds") {
                await this.library.writedp(
                  `${this.UDN}.leds.json`,
                  JSON.stringify(data.data),
                  import_definition.genericStateObjects.json
                );
              } else {
                if (this.ws) {
                  this.ws.send(
                    JSON.stringify({
                      command: "serverinfo",
                      tan: 1
                    })
                  );
                }
                return;
              }
              await this.library.writeFromJson(this.UDN, "device.serverinfo", import_definition.statesObjects, info);
              this.log.debug("Received:", JSON.stringify(data));
            } else if (data.command === "sysinfo") {
              await this.library.writeFromJson(
                this.UDN,
                "device.sysinfo",
                import_definition.statesObjects,
                data.info
              );
            } else {
              await this.updateACKControlsStates(data);
              this.log.debug("Received:", JSON.stringify(data));
            }
            this.aliveReset();
          }
        } catch {
        }
      });
      this.ws.addEventListener("close", () => {
        this.log.info("Connection closed");
        this.ws = void 0;
        if (this.connectionState !== "notAuthorize") {
          this.aliveReset(false);
          this.delayReconnect();
        } else {
          this.setOnline(false);
        }
      });
      this.ws.addEventListener("error", async (error) => {
        this.log.error("Error:", error.message);
        this.delayReconnect();
      });
      this.ws.on("pong", () => {
        this.aliveReset();
      });
    } catch {
      this.log.debug("No connection");
      if (this.ws) {
        this.ws.terminate();
      }
      this.ws = void 0;
      this.delayReconnect();
    }
  }
  async cleanTree() {
    for (const state of ["priorities", "adjustment", "transform", "activeLedColor"]) {
      await this.library.garbageColleting(`${this.UDN}.${state}`);
    }
  }
  /**
   * delayReconnect
   *
   * delay the reconnect to avoid a loop
   */
  delayReconnect() {
    this.setOnline(false);
    if (this.delayTimeout) {
      this.adapter.clearTimeout(this.delayTimeout);
    }
    if (this.aliveTimeout) {
      this.adapter.clearTimeout(this.aliveTimeout);
    }
    this.library.writedp(`${this.UDN}.online`, false, import_definition.genericStateObjects.online).catch(() => {
      this.log.error("Error in writedp");
    });
    this.delayTimeout = this.adapter.setTimeout(() => {
      this.reconnect().catch(() => {
      });
    }, 15e3);
  }
  /**
   * check if the connection is alive
   * if not, terminate the connection
   * and reconnect
   */
  aliveCheck() {
    if (this.aliveTimeout) {
      this.adapter.clearTimeout(this.aliveTimeout);
    }
    this.aliveTimeout = this.adapter.setTimeout(
      async () => {
        if (this.ws) {
          if (this.legacyAliveCheck) {
            this.ws.send(
              JSON.stringify({
                command: "sysinfo",
                tan: 1
              })
            );
          } else {
            this.ws.ping();
          }
        }
        this.aliveCheckTimeout = this.adapter.setTimeout(() => {
          this.log.warn("connection lost!");
          if (this.ws) {
            this.ws.terminate();
          }
          this.ws = void 0;
          this.delayReconnect();
        }, 900);
      },
      this.legacyAliveCheck ? 3e4 : 5e3
    );
  }
  /**
   * reset the alive check
   *
   * @param stop stop the alive check
   */
  aliveReset(stop = false) {
    if (this.aliveCheckTimeout) {
      this.adapter.clearTimeout(this.aliveCheckTimeout);
    }
    if (this.aliveTimeout) {
      this.adapter.clearTimeout(this.aliveTimeout);
    }
    if (!stop) {
      this.aliveCheck();
    }
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  onUnload() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.delayTimeout) {
      this.adapter.clearTimeout(this.delayTimeout);
    }
    if (this.aliveTimeout) {
      this.adapter.clearTimeout(this.aliveTimeout);
    }
    if (this.aliveCheckTimeout) {
      this.adapter.clearTimeout(this.aliveCheckTimeout);
    }
    this.setOnline(false);
    this.log.debug("unload");
  }
  /**
   * changeArrayToJsonIfName
   *
   * @param array array to check
   */
  changeArrayToJsonIfName(array) {
    const result = {};
    let useArray = false;
    if (Array.isArray(array)) {
      for (const a of array) {
        if (a.name) {
          useArray = true;
          result[a.name] = a;
        }
      }
    } else if (array.name) {
      useArray = false;
      for (const a in array) {
        if (a === "name") {
          result[array[a]] = array;
          return result;
        }
      }
    }
    return useArray ? result : array;
  }
  async onStateChange(id, state) {
    if (state) {
      const parts = id.split(".");
      if (parts && parts.length >= 4 && parts[3] === "controls") {
        if (parts.length == 6 && parts[4] === "color" && parts[5] === "activate") {
          if (this.ws) {
            const values = this.library.getStates(`${this.UDN}.controls.color.`);
            const command = {
              command: "color"
            };
            for (const k in values) {
              const v = k;
              const key = k.split(".").pop();
              if (key !== void 0) {
                let val = values[v].val;
                const defaultValue = import_definition.controlDefaults.controls.color[key];
                if (defaultValue !== void 0) {
                  if (typeof defaultValue === "object" && Array.isArray(defaultValue)) {
                    val = val ? JSON.parse(val) : [];
                  }
                }
                if (key !== "activate" && values[k] && values[v].val !== void 0) {
                  command[key] = val;
                }
              }
            }
            this.ws.send(JSON.stringify({ ...command, tan: 100 }));
          }
        } else if (parts.length == 6 && parts[4] === "system") {
          if (this.ws) {
            this.ws.send(
              JSON.stringify({
                command: parts[4],
                subcommand: parts[5],
                tan: 100
              })
            );
          }
        } else if (parts.length == 6 && parts[4] === "sourceselect") {
          if (this.ws) {
            try {
              this.ws.send(
                JSON.stringify(
                  parts[5] === "auto" ? {
                    command: "sourceselect",
                    tan: 100,
                    auto: true
                  } : {
                    command: "sourceselect",
                    tan: 100,
                    priority: state.val
                  }
                )
              );
            } catch {
              this.log.warn(`Invalid command from ${id}`);
            }
          }
        } else if (parts.length == 6 && parts[4] === "clear") {
          if (this.ws) {
            this.ws.send(
              JSON.stringify({
                command: "clear",
                priority: state.val,
                tan: 100
              })
            );
          }
        } else if (parts.length == 6 && parts[4] === "componentstate") {
          if (this.ws) {
            this.ws.send(
              JSON.stringify({
                command: "componentstate",
                componentstate: {
                  component: parts[5],
                  state: state.val
                },
                tan: 90
              })
            );
          }
        } else if (parts.length == 5 && parts[4] === "action") {
          if (this.ws && typeof state.val === "string") {
            try {
              const command = JSON.parse(state.val);
              command.tan = 220;
              this.ws.send(JSON.stringify(command));
            } catch {
              this.log.warn(`Invalid JSON in ${id}`);
            }
          }
        }
      }
    }
  }
  async updateACKControlsStates(data) {
    if (data.success) {
      if (data.tan == 220) {
        this.log.debug(`Command ${data.command} successful - JSON: ${JSON.stringify(data)}`);
        const state = this.library.readdb(`${this.UDN}.controls.action`);
        if (state !== void 0) {
          await this.library.writedp(`${this.UDN}.controls.action`, state.val);
        }
      } else if (data.tan == 100) {
        const commands = data.command.split("-");
        this.log.debug(`Command ${commands[0]} successful - JSON: ${JSON.stringify(data)}`);
        const values = this.library.getStates(`${this.UDN}.controls.${commands[0]}.`);
        for (const k in values) {
          const v = k;
          if (commands[0] == "color" && k.endsWith("activate")) {
            await this.library.writedp(k, false);
          } else if (commands[0] == "sourceselect" && k.endsWith("auto")) {
            await this.library.writedp(k, false);
          } else if (commands[0] == "system") {
            await this.library.writedp(k, false);
          } else {
            await this.library.writedp(k, values[v].val);
          }
        }
      }
    } else if (data.tan >= 100) {
      this.log.warn(`Command ${data.command} failed - JSON: ${JSON.stringify(data)}`);
    }
  }
  async updateComponentControlsStates(data) {
    for (const k in data) {
      const v = k;
      await this.library.writedp(`${this.UDN}.controls.componentstate.${k}`, data[v].enabled);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Hyperion
});
//# sourceMappingURL=hyperion.js.map

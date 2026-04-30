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
  reconnectTime = 3e4;
  fastReconnect = void 0;
  ws;
  delayTimeout;
  aliveTimeout;
  aliveCheckTimeout;
  legacyAliveCheck = true;
  /** ids of hyperion instances last seen in serverinfo / instance-update */
  knownInstanceIds = /* @__PURE__ */ new Set();
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
    this.reconnectTime = this.adapter.config.reconnectTime * 1e3;
    this.log.debug(
      `Create Hyperion instance ${this.UDN} with ${this.ip}:${this.port} and ${this.protocol}. Reconnect time: ${this.reconnectTime / 1e3}s`
    );
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
   * Read a `enable*` toggle from the global adapter config. Defaults to `true`
   * when the value is missing/null so that adapters upgraded from an older
   * version (without these toggles in `native`) keep their full state tree.
   *
   * @param key one of the enable-flags declared in io-package.json `native`
   */
  isSubtreeEnabled(key) {
    const v = this.adapter.config[key];
    return v === void 0 || v === null ? true : Boolean(v);
  }
  /**
   * Remove the per-device subtrees that the user has disabled in admin so
   * that previously-created states don't linger after a toggle is flipped
   * off. Runs once on `init()`; subsequent writes are gated separately.
   */
  async cleanupDisabledSubtrees() {
    const subs = [
      { key: "enableSysinfo", path: `${this.UDN}.device.sysinfo` },
      { key: "enableServerinfo", path: `${this.UDN}.device.serverinfo` },
      { key: "enableDescription", path: `${this.UDN}.device.description` },
      { key: "enableInstances", path: `${this.UDN}.instances` }
    ];
    for (const s of subs) {
      if (this.isSubtreeEnabled(s.key)) {
        continue;
      }
      try {
        await this.adapter.delObjectAsync(s.path, { recursive: true });
        this.log.debug(`cleanup disabled subtree ${s.path}`);
      } catch (e) {
        this.log.debug(`cleanup ${s.path}: ${e instanceof Error ? e.message : String(e)}`);
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
    await this.cleanupDisabledSubtrees();
    this.adapter.subscribeStates(`${this.library.cleandp(`${this.UDN}.controls`)}.*`);
    this.adapter.subscribeStates(`${this.library.cleandp(`${this.UDN}.light`)}.*`);
    if (this.isSubtreeEnabled("enableInstances")) {
      this.adapter.subscribeStates(`${this.library.cleandp(`${this.UDN}.instances`)}.*`);
    }
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
      this.adapter.controller.setOnline().catch((e) => {
        this.log.debug(`setOnline(true): ${e instanceof Error ? e.message : String(e)}`);
      });
      this.library.writedp(`${this.UDN}.online`, isOnline, import_definition.genericStateObjects.online).catch((e) => {
        this.log.debug(`write online=true: ${e instanceof Error ? e.message : String(e)}`);
      });
    } else if (!isOnline && this.connectionState !== "disconnected") {
      this.connectionState = "disconnected";
      this.adapter.controller.setOnline().catch((e) => {
        this.log.debug(`setOnline(false): ${e instanceof Error ? e.message : String(e)}`);
      });
      this.library.writedp(`${this.UDN}.online`, isOnline, import_definition.genericStateObjects.online).catch((e) => {
        this.log.debug(`write online=false: ${e instanceof Error ? e.message : String(e)}`);
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
      if (this.isSubtreeEnabled("enableDescription")) {
        await this.library.writeFromJson(
          `${this.UDN}.device`,
          "device.description",
          import_definition.statesObjects,
          this.description
        );
      }
      const url = this.description.URLBase.replace("http://", "ws://").replace("https://", "wss://");
      this.log.debug(`Re-/Connect to: ${url}`);
      this.ws = new import_ws.default(url);
      this.ws.addEventListener("open", async () => {
        if (this.description) {
          this.log.info(`Connected to ${this.description.device.friendlyName}`);
        }
        this.fastReconnect = void 0;
        await this.library.writedp(`${this.UDN}.controls.checkOnline`, false, import_definition.genericStateObjects.checkOnline);
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
                await this.library.writedp(
                  `${this.UDN}.authenticationError`,
                  false,
                  import_definition.genericStateObjects.authenticationError
                );
                this.setOnline(true);
                this.aliveReset();
                if (this.ws) {
                  this.ws.send(JSON.stringify({ command: "sysinfo", tan: 1 }));
                  this.ws.send(
                    JSON.stringify({
                      command: "serverinfo",
                      subcommand: "subscribe",
                      subscribe: [],
                      tan: 1
                    })
                  );
                }
                return;
              }
              if (data.command === "authorize-tokenRequired" && data.info && data.info.required === false) {
                this.log.info("No Login required");
                await this.library.writedp(
                  `${this.UDN}.authenticationError`,
                  false,
                  import_definition.genericStateObjects.authenticationError
                );
                this.setOnline(true);
                this.aliveReset();
                if (this.ws) {
                  this.ws.send(JSON.stringify({ command: "sysinfo", tan: 1 }));
                  this.ws.send(
                    JSON.stringify({
                      command: "serverinfo",
                      subscribe: [],
                      tan: 1
                    })
                  );
                }
                return;
              }
              if (data.command === "authorize-tokenRequired" && data.info && data.info.required === true) {
                if (this.token !== void 0 && this.token.length >= 36) {
                  this.connectionState = "authorize";
                  if (this.ws) {
                    this.ws.send(
                      JSON.stringify({
                        command: "authorize",
                        subcommand: "login",
                        token: this.token
                      })
                    );
                  }
                  return;
                }
                this.connectionState = "pendingAuthorize";
                if (this.ws) {
                  this.log.warn(
                    "Requesting token! Please confirm the request in the Hyperion webui."
                  );
                  this.ws.send(
                    JSON.stringify({
                      command: "authorize",
                      subcommand: "requestToken",
                      comment: "Iobroker HyperionConnector",
                      id: "io341"
                    })
                  );
                }
                return;
              }
              if (data.command === "authorize-requestToken" && data.success === true) {
                if (this.connectionState !== "pendingAuthorize") {
                  this.log.debug(
                    `Ignoring stale authorize-requestToken success (state=${this.connectionState})`
                  );
                  return;
                }
                const newToken = data.info && data.info.token;
                if (typeof newToken !== "string" || newToken.length < 36) {
                  this.log.warn("Token request returned an invalid token; will retry");
                  this.connectionState = "disconnected";
                  if (this.ws) {
                    this.ws.close();
                  }
                  return;
                }
                this.log.debug("Token request successful");
                this.token = newToken;
                this.connectionState = "authorize";
                try {
                  await this.adapter.extendObject(this.UDN, {
                    native: { token: this.adapter.encrypt(this.UDN, newToken) }
                  });
                } catch (e) {
                  this.log.warn(`persist token: ${e instanceof Error ? e.message : String(e)}`);
                }
                if (this.ws) {
                  this.ws.send(
                    JSON.stringify({
                      command: "authorize",
                      subcommand: "login",
                      token: newToken
                    })
                  );
                }
                return;
              }
              if (data.command === "authorize-requestToken" && data.success === false) {
                if (this.connectionState !== "pendingAuthorize") {
                  this.log.debug(
                    `Ignoring stale authorize-requestToken failure (state=${this.connectionState})`
                  );
                  return;
                }
                this.log.warn(
                  "Token request was denied or timed out. Trigger controls/checkOnline to retry \u2014 the popup must be confirmed in the Hyperion webui."
                );
                this.connectionState = "notAuthorize";
                await this.library.writedp(
                  `${this.UDN}.authenticationError`,
                  true,
                  import_definition.genericStateObjects.authenticationError
                );
                if (this.ws) {
                  this.ws.close();
                }
                return;
              }
              if (data.command === "authorize-login" && data.success === false) {
                if (this.connectionState !== "authorize") {
                  this.log.debug(
                    `Ignoring stale authorize-login failure (state=${this.connectionState})`
                  );
                  return;
                }
                this.log.warn(
                  "Login failed - the saved token was rejected. Requesting a new token automatically; please confirm the request in the Hyperion webui."
                );
                this.token = void 0;
                try {
                  const obj = await this.adapter.getObjectAsync(this.UDN);
                  if (obj && obj.native && obj.native.token) {
                    delete obj.native.token;
                    await this.adapter.setObject(obj._id, obj);
                  }
                } catch (e) {
                  this.log.debug(`clear bad token: ${e instanceof Error ? e.message : String(e)}`);
                }
                this.connectionState = "disconnected";
                if (this.ws) {
                  this.ws.close();
                }
                return;
              }
              this.log.warn(`Unexpected authorize message: ${JSON.stringify(data)}`);
              return;
            } else if (data.command === "serverinfo") {
              const info = data.info;
              info.components = this.changeArrayToJsonIfName(info.components);
              await this.updateComponentControlsStates(info.components);
              await this.updateEffectNameStates(info.effects);
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
              if (Array.isArray(info.instance)) {
                await this.handleInstancesUpdate(info.instance);
              }
              await this.reflectLightBrightness(info.adjustment);
              if (typeof info.videomode === "string") {
                await this.library.writedp(`${this.UDN}.controls.videomode.mode`, info.videomode);
              }
              if (typeof info.imageToLedMappingType === "string") {
                await this.library.writedp(
                  `${this.UDN}.controls.processing.mappingType`,
                  info.imageToLedMappingType
                );
              }
              delete info.leds;
              if (this.isSubtreeEnabled("enableServerinfo")) {
                await this.library.writeFromJson(this.UDN, "device.serverinfo", import_definition.statesObjects, info);
                await this.cleanTree();
              }
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
                await this.updateEffectNameStates(data.data);
                info.effects = this.changeArrayToJsonIfName(data.data);
              } else if (path == "instance") {
                if (Array.isArray(data.data)) {
                  await this.handleInstancesUpdate(data.data);
                }
                this.log.debug("Received:", JSON.stringify(data));
                return;
              } else if (path == "adjustment") {
                await this.reflectLightBrightness(data.data);
                this.log.debug("Received:", JSON.stringify(data));
                return;
              } else if (path == "videomode") {
                if (typeof data.data === "string") {
                  await this.library.writedp(`${this.UDN}.controls.videomode.mode`, data.data);
                }
                this.log.debug("Received:", JSON.stringify(data));
                return;
              } else if (path == "imageToLedMapping") {
                if (typeof data.data === "string") {
                  await this.library.writedp(
                    `${this.UDN}.controls.processing.mappingType`,
                    data.data
                  );
                }
                this.log.debug("Received:", JSON.stringify(data));
                return;
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
              if (this.isSubtreeEnabled("enableServerinfo")) {
                await this.library.writeFromJson(this.UDN, "device.serverinfo", import_definition.statesObjects, info);
              }
              this.log.debug("Received:", JSON.stringify(data));
            } else if (data.command === "sysinfo") {
              if (this.isSubtreeEnabled("enableSysinfo")) {
                await this.library.writeFromJson(
                  this.UDN,
                  "device.sysinfo",
                  import_definition.statesObjects,
                  data.info
                );
              }
            } else {
              await this.updateACKControlsStates(data);
              this.log.debug("Received:", JSON.stringify(data));
            }
            this.aliveReset();
          }
        } catch (e) {
          this.log.debug(`message handler: ${e instanceof Error ? e.message : String(e)}`);
        }
      });
      this.ws.addEventListener("close", () => {
        this.log.info("Connection closed");
        this.ws = void 0;
        if (this.connectionState !== "notAuthorize") {
          this.aliveReset(false);
          this.library.writedp(`${this.UDN}.controls.checkOnline`, false, import_definition.genericStateObjects.checkOnline).catch((e) => {
            this.log.debug(`reset checkOnline on close: ${e instanceof Error ? e.message : String(e)}`);
          });
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
    } catch (e) {
      this.log.debug(`reconnect: ${e instanceof Error ? e.message : String(e)}`);
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
    if (this.fastReconnect !== void 0 && this.fastReconnect <= (/* @__PURE__ */ new Date()).getTime()) {
      this.fastReconnect = void 0;
      this.library.writedp(`${this.UDN}.controls.checkOnline`, false, import_definition.genericStateObjects.checkOnline).catch((e) => {
        this.log.debug(`reset checkOnline on delay: ${e instanceof Error ? e.message : String(e)}`);
      });
    }
    if (this.unload) {
      return;
    }
    this.delayTimeout = this.adapter.setTimeout(
      () => {
        this.reconnect().catch((e) => {
          this.log.warn(`reconnect failed: ${e instanceof Error ? e.message : String(e)}`);
        });
      },
      // fast reconnect if time is not over
      this.fastReconnect !== void 0 && this.fastReconnect > (/* @__PURE__ */ new Date()).getTime() ? 1e3 : this.reconnectTime
    );
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
    if (this.unload) {
      return;
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
        if (this.unload) {
          return;
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
    this.unload = true;
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
  /**
   * Send a JSON command to Hyperion via WebSocket.
   * If `instanceId` is given, the `instance` field is appended so that
   * the command targets a specific Hyperion instance rather than the
   * connection's currently selected default instance.
   *
   * @param payload  command payload (must contain `command` and optionally `tan`)
   * @param instanceId  optional Hyperion instance id to target
   */
  sendWsCommand(payload, instanceId) {
    if (!this.ws) {
      return;
    }
    const full = instanceId !== void 0 ? { ...payload, instance: instanceId } : payload;
    this.ws.send(JSON.stringify(full));
  }
  /**
   * Read controls.<group>.* states with an optional instance prefix.
   *
   * @param group  controls subgroup ('color', 'effect', 'adjustment', …)
   * @param instanceId  optional instance id; if given, reads from instances.<id>.controls.<group>.
   */
  getControlsStates(group, instanceId) {
    const prefix = instanceId !== void 0 ? `${this.UDN}.instances.${instanceId}.controls.${group}.` : `${this.UDN}.controls.${group}.`;
    return this.library.getStates(prefix);
  }
  async onStateChange(id, state) {
    var _a;
    if (!state) {
      return;
    }
    let parts = id.split(".");
    let instanceId;
    if (parts.length >= 6 && parts[3] === "instances" && (parts[5] === "controls" || parts[5] === "light") && /^\d+$/.test(parts[4])) {
      instanceId = parseInt(parts[4], 10);
      parts = [parts[0], parts[1], parts[2], parts[5], ...parts.slice(6)];
    }
    if (parts && parts.length >= 4 && parts[3] === "controls") {
      if (parts.length == 6 && parts[4] === "color" && parts[5] === "activate") {
        if (this.ws) {
          const values = this.getControlsStates("color", instanceId);
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
          this.sendWsCommand({ ...command, tan: 100 }, instanceId);
        }
      } else if (parts.length == 6 && parts[4] === "effect" && parts[5] === "activate") {
        if (this.ws) {
          const values = this.getControlsStates("effect", instanceId);
          const command = { command: "effect" };
          const effect = {};
          for (const k in values) {
            const key = k.split(".").pop();
            if (key === void 0 || key === "activate") {
              continue;
            }
            const val = (_a = values[k]) == null ? void 0 : _a.val;
            if (val === void 0 || val === null) {
              continue;
            }
            if (key === "name") {
              effect.name = val;
            } else if (key === "priority" || key === "duration") {
              command[key] = val;
            } else if (key === "origin") {
              command.origin = val;
            }
          }
          if (!effect.name) {
            this.log.warn(`Cannot start effect: controls.effect.name is empty`);
            return;
          }
          command.effect = effect;
          this.sendWsCommand({ ...command, tan: 100 }, instanceId);
        }
      } else if (parts.length == 6 && parts[4] === "adjustment" && parts[5] === "activate") {
        if (this.ws) {
          const values = this.getControlsStates("adjustment", instanceId);
          const command = {
            command: "adjustment"
          };
          const adjustment = {};
          command.adjustment = adjustment;
          for (const k in values) {
            const v = k;
            const key = k.split(".").pop();
            if (key !== void 0) {
              let val = values[v].val;
              const defaultValue = import_definition.controlDefaults.controls.adjustment[key];
              if (defaultValue !== void 0) {
                if (typeof defaultValue === "object" && Array.isArray(defaultValue)) {
                  val = val ? JSON.parse(val) : [];
                }
              }
              if (key !== "activate" && values[k] && values[v].val !== void 0) {
                adjustment[key] = val;
              }
            }
          }
          this.sendWsCommand({ ...command, tan: 100 }, instanceId);
        }
      } else if (parts.length == 6 && parts[4] === "system") {
        if (this.ws) {
          this.sendWsCommand(
            {
              command: parts[4],
              subcommand: parts[5],
              tan: 100
            },
            instanceId
          );
        }
      } else if (parts.length == 6 && parts[4] === "sourceselect") {
        if (this.ws) {
          try {
            const payload = parts[5] === "auto" ? { command: "sourceselect", tan: 100, auto: true } : { command: "sourceselect", tan: 100, priority: state.val };
            this.sendWsCommand(payload, instanceId);
          } catch (e) {
            this.log.warn(`Invalid command from ${id}: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      } else if (parts.length == 6 && parts[4] === "clear") {
        if (this.ws) {
          this.sendWsCommand(
            {
              command: "clear",
              priority: state.val,
              tan: 100
            },
            instanceId
          );
        }
      } else if (parts.length == 6 && parts[4] === "componentstate") {
        if (this.ws) {
          this.sendWsCommand(
            {
              command: "componentstate",
              componentstate: {
                component: parts[5],
                state: state.val
              },
              tan: 90
            },
            instanceId
          );
        }
      } else if (parts.length == 6 && parts[4] === "videomode" && parts[5] === "mode") {
        if (this.ws && typeof state.val === "string") {
          this.sendWsCommand({ command: "videomode", videoMode: state.val, tan: 90 }, instanceId);
        }
      } else if (parts.length == 6 && parts[4] === "processing" && parts[5] === "mappingType") {
        if (this.ws && typeof state.val === "string") {
          this.sendWsCommand({ command: "processing", mappingType: state.val, tan: 90 }, instanceId);
        }
      } else if (parts.length == 6 && parts[4] === "leddevice" && parts[5] === "identify") {
        if (this.ws) {
          this.sendWsCommand({ command: "leddevice", subcommand: "identify", tan: 90 }, instanceId);
        }
      } else if (parts.length == 6 && parts[4] === "instance") {
        if (this.ws && typeof state.val === "number") {
          const sub = parts[5];
          let payload;
          if (sub === "setinstance") {
            payload = {
              command: "instance",
              subcommand: "setinstance",
              instance: state.val,
              tan: 100
            };
          } else if (sub === "start") {
            payload = {
              command: "instance",
              subcommand: "startInstance",
              instance: state.val,
              tan: 100
            };
          } else if (sub === "stop") {
            payload = {
              command: "instance",
              subcommand: "stopInstance",
              instance: state.val,
              tan: 100
            };
          }
          if (payload) {
            this.ws.send(JSON.stringify(payload));
          }
        }
      } else if (parts.length == 5 && parts[4] === "action") {
        if (this.ws && typeof state.val === "string") {
          try {
            const command = JSON.parse(state.val);
            command.tan = 220;
            this.sendWsCommand(command, instanceId);
          } catch (e) {
            this.log.warn(`Invalid JSON in ${id}: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      } else if (parts.length == 5 && parts[4] === "checkOnline") {
        if (!this.ws && state.val === true && (this.connectionState === "disconnected" || this.connectionState === "notAuthorize")) {
          if (this.connectionState === "notAuthorize") {
            this.connectionState = "disconnected";
            await this.library.writedp(
              `${this.UDN}.authenticationError`,
              false,
              import_definition.genericStateObjects.authenticationError
            );
          }
          this.fastReconnect = (/* @__PURE__ */ new Date()).getTime() + 3e4;
          this.delayReconnect();
          return;
        }
        this.fastReconnect = void 0;
        await this.library.writedp(`${this.UDN}.controls.checkOnline`, false, import_definition.genericStateObjects.checkOnline);
        if (state.val === true) {
          this.log.warn(
            `Dont use this state just for fun :) ${this.ws ? "Server is online must be offline! " : ""}`
          );
        }
      }
    } else if (parts && parts.length === 5 && parts[3] === "light") {
      if (!this.ws) {
        return;
      }
      const sub = parts[4];
      if (sub === "power" && typeof state.val === "boolean") {
        this.sendWsCommand(
          {
            command: "componentstate",
            componentstate: { component: "LEDDEVICE", state: state.val },
            tan: 90
          },
          instanceId
        );
      } else if (sub === "brightness" && typeof state.val === "number") {
        const clamped = Math.max(0, Math.min(100, Math.round(state.val)));
        this.sendWsCommand(
          {
            command: "adjustment",
            adjustment: { brightness: clamped },
            tan: 100
          },
          instanceId
        );
      } else if (sub === "color" && typeof state.val === "string") {
        const hex = state.val.replace(/^#/, "");
        if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
          this.log.warn(`light.color must be #RRGGBB hex; got ${state.val}`);
          return;
        }
        const rgb = [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16)
        ];
        this.sendWsCommand(
          {
            command: "color",
            color: rgb,
            priority: 50,
            duration: 0,
            origin: "ioBroker (light)",
            tan: 100
          },
          instanceId
        );
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
          if ((commands[0] == "color" || commands[0] == "effect") && k.endsWith("activate")) {
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
      if (k === "LEDDEVICE") {
        await this.library.writedp(`${this.UDN}.light.power`, !!data[v].enabled);
      }
    }
  }
  /**
   * Mirror the first adjustment's `brightness` into the convenience `light.brightness` role.
   * Hyperion typically reports a single `default` adjustment bucket; if multiple buckets
   * exist we take the first one — the convenience role does not attempt per-bucket nuance.
   *
   * @param adjustments  array as delivered by serverinfo.adjustment / adjustment-update
   */
  async reflectLightBrightness(adjustments) {
    var _a;
    if (!Array.isArray(adjustments) || adjustments.length === 0) {
      return;
    }
    const brightness = (_a = adjustments[0]) == null ? void 0 : _a.brightness;
    if (typeof brightness === "number") {
      await this.library.writedp(`${this.UDN}.light.brightness`, brightness);
    }
  }
  /**
   * Materialise per-instance state subtrees, persist `instances.json`, and clean up
   * channels for instances that no longer exist on the server.
   *
   * Each running or known instance gets `<UDN>/instances/<id>/` with:
   *   - `_channel` named after `friendly_name`
   *   - `running` (boolean indicator)
   *   - `controls/...` mirroring the global controls (without the `instance` lifecycle channel)
   *
   * Writes from `<UDN>/instances/<id>/controls/...` are routed through
   * `onStateChange` and sent with `instance:<id>` so they target this instance
   * regardless of the connection's currently selected default.
   *
   * @param instances  array as delivered by `serverinfo.instance` / `instance-update`
   */
  async handleInstancesUpdate(instances) {
    if (!this.isSubtreeEnabled("enableInstances")) {
      return;
    }
    await this.library.writedp(`${this.UDN}.instances.json`, JSON.stringify(instances), import_definition.genericStateObjects.json);
    const seen = /* @__PURE__ */ new Set();
    const { instance: _omitLifecycle, ...controlsForInstance } = import_definition.controlDefaults.controls;
    const perInstanceDefaults = { controls: controlsForInstance, light: import_definition.controlDefaults.light };
    for (const inst of instances) {
      const id = typeof (inst == null ? void 0 : inst.instance) === "number" ? inst.instance : void 0;
      if (id === void 0) {
        continue;
      }
      seen.add(id);
      await this.library.writedp(`${this.UDN}.instances.${id}`, void 0, {
        _id: "",
        type: "channel",
        common: { name: inst.friendly_name || `Instance ${id}` },
        native: {}
      });
      await this.library.writedp(`${this.UDN}.instances.${id}.running`, !!inst.running, {
        _id: "",
        type: "state",
        common: {
          name: "instance is running",
          type: "boolean",
          role: "indicator",
          read: true,
          write: false
        },
        native: {}
      });
      await this.library.writeFromJson(
        `${this.UDN}.instances.${id}`,
        "device",
        import_definition.statesObjects,
        perInstanceDefaults,
        false,
        true
      );
    }
    for (const old of this.knownInstanceIds) {
      if (!seen.has(old)) {
        try {
          await this.adapter.delObjectAsync(`${this.UDN}.instances.${old}`, { recursive: true });
        } catch (e) {
          this.log.debug(`delete stale instance ${old}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    }
    this.knownInstanceIds = seen;
  }
  /**
   * Populate `common.states` of `controls/effect/name` with the names of the effects
   * currently available on the server. Lets the admin UI show a dropdown.
   *
   * @param effects array of effect descriptors as delivered by serverinfo / effects-update
   */
  async updateEffectNameStates(effects) {
    if (!Array.isArray(effects)) {
      return;
    }
    const states = {};
    for (const e of effects) {
      if (e && typeof e.name === "string") {
        states[e.name] = e.name;
      }
    }
    try {
      await this.adapter.extendObject(`${this.UDN}.controls.effect.name`, {
        common: { states }
      });
    } catch (e) {
      this.log.debug(`updateEffectNameStates: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Hyperion
});
//# sourceMappingURL=hyperion.js.map

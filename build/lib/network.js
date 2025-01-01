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
var network_exports = {};
__export(network_exports, {
  Network: () => Network
});
module.exports = __toCommonJS(network_exports);
var import_fast_xml_parser = require("fast-xml-parser");
var import_library = require("./library");
var import_node_ssdp = __toESM(require("node-ssdp"));
var http = __toESM(require("http"));
var import_definition = require("./definition");
class Network extends import_library.BaseClass {
  serviceType = "urn:hyperion-project.org:device:basic:1";
  ssdpTimeout = void 0;
  ssdp;
  parser;
  /**
   * deviceList
   * key: device id
   * value: device name
   */
  deviceList = {};
  /**
   * constructor
   *
   * @param adapter adapter class definition
   * @param name name of the object for logging
   */
  constructor(adapter, name = "") {
    super(adapter, name);
    this.ssdp = new import_node_ssdp.default.Client();
    this.parser = new import_fast_xml_parser.XMLParser();
  }
  /**
   *  doDiscovery
   *
   * @param callback
   */
  async doDiscovery(callback) {
    this.log.debug(`Searching for service: ${this.serviceType}`);
    this.ssdp.on("response", async (headers, statusCode, rinfo) => {
      var _a;
      if (headers === void 0 || statusCode !== 200 || headers.USN === void 0 || headers.LOCATION === void 0) {
        return;
      }
      if (rinfo === void 0 || this.deviceList[headers.USN] !== void 0) {
        return;
      }
      this.log.debug(
        `New/Updated service: USN: ${headers.USN}, Status:${statusCode}, Adress:${rinfo.address}, location:${headers.LOCATION}`
      );
      try {
        const url = new URL(headers.LOCATION);
        const ip = url.hostname;
        const port = parseInt((_a = url.port) != null ? _a : -1);
        const protocol = url.protocol;
        if (ip === void 0 || port < 0 || protocol === void 0) {
          this.log.warn("Error getting ip, port or protocol");
          return;
        }
        const description = await this.getSsdpDescription(protocol, ip, port);
        if (description) {
          this.deviceList[headers.USN] = { socket: void 0, url: "", descriptionUrl: description.URLBase };
          await callback(protocol, ip, port, description);
        }
      } catch (error) {
        this.adapter.log.warn(`Error getting description: ${error}`);
      }
    });
    await this.ssdp.search(this.serviceType);
  }
  /**
   * get description from server (ssdp)
   *
   * @param protocol http or https
   * @param ip ip address
   * @param port port
   */
  async getSsdpDescription(protocol, ip, port) {
    return new Promise((resolve, reject) => {
      const location = `${protocol}//${ip}:${port}${import_definition.descriptionUrlAppendix}`;
      http.get(location, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const description = this.parser.parse(data);
            resolve(description.root);
          } catch (error) {
            this.adapter.log.error(`Error parsing description: ${error}`);
            resolve(void 0);
          }
        });
      }).on("error", (error) => {
        reject(error);
      });
    });
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  onUnload() {
    if (this.ssdpTimeout) {
      this.adapter.clearTimeout(this.ssdpTimeout);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Network
});
//# sourceMappingURL=network.js.map

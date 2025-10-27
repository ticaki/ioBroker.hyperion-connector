/*
 * Created with @iobroker/create-adapter v2.6.5
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import { Library } from './lib/library';
import { Controller } from './lib/controller';
import type { configOfHyperionInstance } from './lib/types-d';

// Load your modules here, e.g.:
// import * as fs from "fs";
/**
 * Represents the HyperionController adapter.
 */
class HyperionController extends utils.Adapter {
    library: Library;
    controller: Controller;
    sendToTimeout: ioBroker.Timeout | undefined = undefined;

    /**
     * Creates an instance of HyperionController.
     *
     * @param [options] - The adapter options.
     */
    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'hyperion-connector',
        });
        this.library = new Library(this);
        this.controller = new Controller(this);

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        // this.on('objectChange', this.onObjectChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        // Initialize your adapter here
        this.config.activateSsdp = true;
        let reconnectTimeFailed = false;
        if (this.config.reconnectTime === undefined) {
            reconnectTimeFailed = true;
        } else if (typeof this.config.reconnectTime !== 'number') {
            reconnectTimeFailed = true;
            this.log.warn(`Reconnect interval is not a number, setting to default value 60`);
        } else if (this.config.reconnectTime < 3) {
            reconnectTimeFailed = true;
            this.log.warn(`Reconnect interval is less than 3, setting to default value 60`);
        } else if (this.config.reconnectTime > 3600) {
            this.log.warn(`Reconnect interval is greater than 1h. Are you sure?`);
        }
        if (reconnectTimeFailed) {
            this.config.reconnectTime = 60;
        }
        this.log.info(`Reconnect interval is set to ${this.config.reconnectTime} seconds`);
        // Reset the connection indicator during startup
        await this.setState('info.connection', false, true);
        this.setTimeout(async () => {
            await this.library.init();
            await this.library.initStates(await this.getStatesAsync('*'));
            await this.controller.init();
        }, 1000);
    }

    /**
     * Is called when the adapter shuts down - the callback must be called under any circumstances!
     *
     * @param callback - The callback function that must be called
     */
    private onUnload(callback: () => void): void {
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
    private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
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
    private async onMessage(obj: ioBroker.Message): Promise<void> {
        this.log.debug(`Data from configuration received : ${JSON.stringify(obj)}`);
        if (typeof obj === 'object' && obj.message) {
            this.log.debug(`with message : ${JSON.stringify(obj.message)}`);
            if (typeof obj.message == 'string') {
                this.log.info(`received message ${obj.message}`);
            }
            if (obj.command === 'getDevices') {
                const devices: configOfHyperionInstance[] = [];
                for (const hyperion of this.controller.hyperions) {
                    const index = (this.config.devices ?? []).findIndex(d => d.UDN === hyperion.UDN);
                    if (index >= 0) {
                        devices[index] = {
                            ...this.config.devices[index],
                            name: hyperion.name,
                            protocol: hyperion.protocol,
                            ip: hyperion.ip,
                            port: hyperion.port,
                        };
                    } else {
                        devices.push({
                            UDN: hyperion.UDN,
                            name: hyperion.name,
                            protocol: hyperion.protocol,
                            ip: hyperion.ip,
                            port: hyperion.port,
                            enabled: true,
                        });
                    }
                }
                if (obj.callback) {
                    if (JSON.stringify(devices) !== JSON.stringify(this.config.devices)) {
                        this.sendToTimeout = this.setTimeout(() => {
                            this.sendTo(obj.from, obj.command, { native: { devices: devices } }, obj.callback);
                        }, 2000);
                    } else {
                        this.sendTo(obj.from, obj.command, undefined, obj.callback);
                    }
                }
            } else if (obj.callback) {
                this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
            }
        } else if (obj.callback) {
            this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new HyperionController(options);
} else {
    // otherwise start the instance directly
    (() => new HyperionController())();
}

export = HyperionController;

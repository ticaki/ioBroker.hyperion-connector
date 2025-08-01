import WebSocket from 'ws';
import { BaseClass, type AdapterClassDefinition } from './library';
import type { configOfHyperionInstance, DescriptionType, SysInfoCommand } from './types-d';
import { controlDefaults, genericStateObjects, statesObjects } from './definition';

/**
 * Hyperion class
 * do all then work here
 */
export class Hyperion extends BaseClass {
    description: DescriptionType | undefined;
    UDN: string;
    ip: string = '';
    protocol: string = '';
    port: number = 0;
    token: string | undefined = undefined;

    reconnectTime: number = 30000;
    fastReconnect: number | undefined = undefined;

    ws: WebSocket | undefined;

    delayTimeout: ioBroker.Timeout | undefined;
    aliveTimeout: ioBroker.Timeout | undefined;
    aliveCheckTimeout: ioBroker.Timeout | undefined;

    legacyAliveCheck: boolean = true;

    // authorize-tokenRequired // authorize-login
    connectionState: 'connected' | 'disconnected' | 'authorize' | 'pendingAuthorize' | 'notAuthorize' = 'disconnected';
    /**
     * constructor
     *
     * @param adapter adapter class definition
     * @param UDN unique device name
     * @param config device description
     */
    constructor(adapter: AdapterClassDefinition, UDN: string, config: configOfHyperionInstance) {
        super(adapter, config.name || 'Hyperion');
        this.UDN = UDN.replace(/^uuid:/, '');
        this.protocol = config.protocol;
        this.ip = config.ip;
        this.port = config.port;
        this.token = config.token;
        this.reconnectTime = this.adapter.config.reconnectTime * 1000;
        this.log.debug(
            `Create Hyperion instance ${this.UDN} with ${this.ip}:${this.port} and ${this.protocol}. Reconnect time: ${this.reconnectTime / 1000}s`,
        );
    }

    checkHyperionVersion(): void {
        if (!this.description) {
            return;
        }
        let version = this.description.device.modelNumber;
        if (version) {
            const temp = version.match(/(\d+\.\d+\.\d+)/);
            if (temp) {
                version = temp[1];

                const parts = version.split('.');
                this.log.debug('Hyperion version:', version);
                if (parts.length >= 3) {
                    if (parseInt(parts[0]) > 2 || parseInt(parts[1]) > 0 || parseInt(parts[2]) > 16) {
                        this.legacyAliveCheck = false;
                    } else {
                        this.log.warn('Hyperion version is equal or lower than 2.0.16, use legacy alive check');
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
    async init(): Promise<void> {
        this.setOnline(false);
        await this.library.writedp(this.UDN, undefined, {
            _id: '',
            type: 'device',
            common: {
                name: this.description ? this.description.device.friendlyName : this.name,
                statusStates: { onlineId: 'online', errorId: 'error' },
            },
            native: {},
        });
        await this.library.writeFromJson(this.UDN, 'device', statesObjects, controlDefaults, false, true);
        await this.library.writedp(`${this.UDN}.authenticationError`, false, genericStateObjects.authenticationError);
        this.adapter.subscribeStates(`${this.library.cleandp(`${this.UDN}.controls`)}.*`);

        if (this.token === undefined || this.token.length < 36) {
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
    setOnline(isOnline: boolean): void {
        if (isOnline && this.connectionState !== 'connected') {
            this.connectionState = 'connected';
            this.adapter.controller.setOnline().catch(() => {
                // nothing to do
            });
            this.library.writedp(`${this.UDN}.online`, isOnline, genericStateObjects.online).catch(() => {
                // nothing to do
            });
        } else if (!isOnline && this.connectionState !== 'disconnected') {
            this.connectionState = 'disconnected';
            this.adapter.controller.setOnline().catch(() => {
                // nothing to do
            });
            this.library.writedp(`${this.UDN}.online`, isOnline, genericStateObjects.online).catch(() => {
                // nothing to do
            });
        }
    }

    /**
     * createWebsocketConnectionToHyperion
     */
    async reconnect(): Promise<void> {
        if (this.ws) {
            this.ws.terminate;
        }
        try {
            // get description of hyperion server
            this.description = await this.adapter.controller.network.getSsdpDescription(
                this.protocol,
                this.ip,
                this.port,
            );
            if (this.description === undefined) {
                throw new Error('Got no description');
            }

            this.checkHyperionVersion();

            //update device name
            this.name = this.description.device.friendlyName;
            await this.library.writedp(this.UDN, undefined, {
                _id: '',
                type: 'device',
                common: {
                    name: this.description.device.friendlyName,
                },
                native: {},
            });
            // write description to states
            await this.library.writeFromJson(
                `${this.UDN}.device`,
                'device.description',
                statesObjects,
                this.description,
            );
            //URLBase is the url to connect to the server
            //replace http with ws and https with wss
            const url = this.description.URLBase.replace('http://', 'ws://').replace('https://', 'wss://');
            this.log.debug(`Re-/Connect to: ${url}`);

            // create websocket connection
            this.ws = new WebSocket(url);
            this.ws.addEventListener('open', async () => {
                if (this.description) {
                    this.log.info(`Connected to ${this.description.device.friendlyName}`);
                }
                this.fastReconnect = undefined;
                await this.library.writedp(`${this.UDN}.controls.checkOnline`, false, genericStateObjects.checkOnline);
                if (this.ws) {
                    this.ws.send(
                        JSON.stringify({
                            command: 'authorize',
                            subcommand: 'tokenRequired',
                        }),
                    );
                    /*this.ws.send(
                        JSON.stringify({
                            command: 'sysinfo',
                            tan: 1,
                        }),
                    );
                    this.ws.send(
                        JSON.stringify({
                            command: 'serverinfo',
                            subscribe: ['all'],
                            tan: 1,
                        }),
                    );*/
                }
            });
            this.ws.addEventListener('message', async event => {
                try {
                    const data = typeof event.data === 'string' ? JSON.parse(event.data) : undefined;
                    if (data) {
                        if (data.command.startsWith('authorize-')) {
                            //handle authorize

                            this.log.debug('Received:', JSON.stringify(data));
                            // if authorize-login or authorize-tokenRequired with required false we start the connection
                            if (data.command === 'authorize-login' && data.success === true) {
                                this.log.info('Login successful');
                                this.setOnline(true);
                                this.aliveReset();
                                if (this.ws) {
                                    this.ws.send(
                                        JSON.stringify({
                                            command: 'sysinfo',
                                            tan: 1,
                                        }),
                                    );
                                    this.ws.send(
                                        JSON.stringify({
                                            command: 'serverinfo',
                                            subcommand: 'subscribe',
                                            subscribe: [],
                                            tan: 1,
                                        }),
                                    );
                                    return;
                                }
                            } else if (
                                data.command === 'authorize-tokenRequired' &&
                                data.info &&
                                data.info.required === false
                            ) {
                                this.log.info('No Login required');

                                this.setOnline(true);
                                this.aliveReset();
                                if (this.ws) {
                                    this.ws.send(
                                        JSON.stringify({
                                            command: 'sysinfo',
                                            tan: 1,
                                        }),
                                    );
                                    this.ws.send(
                                        JSON.stringify({
                                            command: 'serverinfo',
                                            subscribe: [],
                                            tan: 1,
                                        }),
                                    );
                                    return;
                                }
                            } else if (data.command === 'authorize-tokenRequired') {
                                if (data.info && data.info.required === true) {
                                    this.connectionState = 'authorize';
                                    if (this.token !== undefined && this.token.length >= 36) {
                                        // we have a token try it
                                        if (this.ws) {
                                            this.ws.send(
                                                JSON.stringify({
                                                    command: 'authorize',
                                                    subcommand: 'login',
                                                    token: this.token,
                                                }),
                                            );
                                            return;
                                        }
                                    } else {
                                        // no token saved so request one
                                        this.connectionState = 'pendingAuthorize';
                                        if (this.ws) {
                                            this.log.warn('Requesting token! Please check the Hyperion server webui!');
                                            this.ws.send(
                                                JSON.stringify({
                                                    command: 'authorize',
                                                    subcommand: 'requestToken',
                                                    comment: 'Iobroker HyperionConnector',
                                                    id: 'io341',
                                                }),
                                            );
                                            return;
                                        }
                                    }
                                }
                            } else if (data.command === 'authorize-requestToken' && data.success === true) {
                                if (data.success === true) {
                                    this.connectionState = 'authorize';
                                    this.log.debug('Token request successful');
                                    this.token = data.info.token;
                                    if (typeof this.token === 'string' && this.token.length >= 36) {
                                        await this.adapter.extendObject(this.UDN, {
                                            native: {
                                                token: this.adapter.encrypt(this.UDN, this.token),
                                            },
                                        });

                                        if (this.ws) {
                                            this.ws.send(
                                                JSON.stringify({
                                                    command: 'authorize',
                                                    subcommand: 'login',
                                                    token: this.token,
                                                }),
                                            );
                                            return;
                                        }
                                    }
                                }
                            } else if (data.command === 'authorize-requestToken' && data.success === false) {
                                this.log.error('Token request timeout or denied');
                            } else if (data.command === 'authorize-login' && data.success === false) {
                                this.log.error(
                                    'Login failed - wrong token? Please check the Hyperion server webui and adminpage of this adapter.',
                                );
                                const obj = await this.adapter.getObjectAsync(this.UDN);
                                if (obj && obj.native && obj.native.token && obj.native.token.length >= 36) {
                                    this.log.error(
                                        'An automatically generated token was found for this server, in the course of this error the token was deleted. Restart the adapter and confirm access in the Hyperion webui.',
                                    );
                                    delete obj.native.token;
                                    await this.adapter.setObject(obj._id, obj);
                                }
                            }
                            this.log.error('Not authorized');
                            this.connectionState = 'notAuthorize';
                            await this.library.writedp(
                                `${this.UDN}.authenticationError`,
                                true,
                                genericStateObjects.online,
                            );
                            this.onUnload();
                            return;
                        } else if (data.command === 'serverinfo') {
                            const info = data.info;
                            info.components = this.changeArrayToJsonIfName(info.components);
                            await this.updateComponentControlsStates(info.components);
                            info.effects = this.changeArrayToJsonIfName(info.effects);
                            await this.library.writedp(
                                `${this.UDN}.priorities.json`,
                                JSON.stringify(info.priorities),
                                genericStateObjects.json,
                            );
                            await this.library.writedp(
                                `${this.UDN}.leds.json`,
                                JSON.stringify(info.leds),
                                genericStateObjects.json,
                            );

                            //delete useless leds states
                            delete info.leds;
                            await this.library.writeFromJson(this.UDN, 'device.serverinfo', statesObjects, info);
                            await this.cleanTree();
                        } else if (data.command.endsWith === 'priorities-update') {
                            if (this.ws) {
                                this.ws.send(
                                    JSON.stringify({
                                        command: 'serverinfo',
                                        tan: 1,
                                    }),
                                );
                            }
                            //maybe this work with 2.0.17
                            /*await this.library.writeFromJson(
                                this.UDN,
                                'device.serverinfo.priorities',
                                statesObjects,
                                (data as PrioritiesUpdateCommand).data.priorities,
                            );
                            await this.library.writedp(
                                `${this.UDN}.priorities.json`,
                                JSON.stringify((data as PrioritiesUpdateCommand).data.priorities),
                                genericStateObjects.json,
                            );*/
                            this.log.debug('Received:', JSON.stringify(data));
                        } else if (data.command.endsWith('-update')) {
                            const path = data.command.replace('-update', '');
                            const info: any = {};
                            if (path == 'components') {
                                info.components = this.changeArrayToJsonIfName(data.data);
                                await this.updateComponentControlsStates(info.components);
                            } else if (path == 'effects') {
                                info.effects = this.changeArrayToJsonIfName(data.data);
                            } else if (path == 'leds') {
                                await this.library.writedp(
                                    `${this.UDN}.leds.json`,
                                    JSON.stringify(data.data),
                                    genericStateObjects.json,
                                );
                            } else {
                                if (this.ws) {
                                    this.ws.send(
                                        JSON.stringify({
                                            command: 'serverinfo',
                                            tan: 1,
                                        }),
                                    );
                                }
                                // We cant handle unknown updates so out here and wait for serverinfo
                                return;
                            }

                            await this.library.writeFromJson(this.UDN, 'device.serverinfo', statesObjects, info);
                            this.log.debug('Received:', JSON.stringify(data));
                        } else if (data.command === 'sysinfo') {
                            await this.library.writeFromJson(
                                this.UDN,
                                'device.sysinfo',
                                statesObjects,
                                (data as SysInfoCommand).info,
                            );
                        } else {
                            await this.updateACKControlsStates(data);
                            this.log.debug('Received:', JSON.stringify(data));
                        }
                        this.aliveReset();
                    }
                } catch {
                    // nothing to do
                }
            });

            this.ws.addEventListener('close', () => {
                this.log.info('Connection closed');
                this.ws = undefined;

                if (this.connectionState !== 'notAuthorize') {
                    this.aliveReset(false);
                    this.library
                        .writedp(`${this.UDN}.controls.checkOnline`, false, genericStateObjects.checkOnline)
                        .catch(() => {
                            // nothing to do
                        });
                    this.delayReconnect();
                } else {
                    this.setOnline(false);
                }
            });

            this.ws.addEventListener('error', async error => {
                this.log.error('Error:', error.message);
                this.delayReconnect();
            });
            this.ws.on('pong', () => {
                //this.log.debug('Pong received');
                this.aliveReset();
            });
        } catch {
            this.log.debug('No connection');
            if (this.ws) {
                this.ws.terminate();
            }
            this.ws = undefined;
            this.delayReconnect();
        }
    }

    async cleanTree(): Promise<void> {
        for (const state of ['priorities', 'adjustment', 'transform', 'activeLedColor']) {
            await this.library.garbageColleting(`${this.UDN}.${state}`);
        }
    }

    /**
     * delayReconnect
     *
     * delay the reconnect to avoid a loop
     */
    delayReconnect(): void {
        this.setOnline(false);
        if (this.delayTimeout) {
            this.adapter.clearTimeout(this.delayTimeout);
        }
        if (this.aliveTimeout) {
            this.adapter.clearTimeout(this.aliveTimeout);
        }
        this.library.writedp(`${this.UDN}.online`, false, genericStateObjects.online).catch(() => {
            this.log.error('Error in writedp');
        });

        // reset fast reconnect if time is over
        if (this.fastReconnect !== undefined && this.fastReconnect <= new Date().getTime()) {
            this.fastReconnect = undefined;
            this.library
                .writedp(`${this.UDN}.controls.checkOnline`, false, genericStateObjects.checkOnline)
                .catch(() => {
                    // nothing to do
                });
        }
        this.delayTimeout = this.adapter.setTimeout(
            () => {
                this.reconnect().catch(() => {
                    // nothing to do
                });
            },
            // fast reconnect if time is not over
            this.fastReconnect !== undefined && this.fastReconnect > new Date().getTime() ? 1000 : this.reconnectTime,
        );
    }

    /**
     * check if the connection is alive
     * if not, terminate the connection
     * and reconnect
     */
    aliveCheck(): void {
        if (this.aliveTimeout) {
            this.adapter.clearTimeout(this.aliveTimeout);
        }
        this.aliveTimeout = this.adapter.setTimeout(
            async () => {
                if (this.ws) {
                    //this.log.debug('Ping');
                    if (this.legacyAliveCheck) {
                        this.ws.send(
                            JSON.stringify({
                                command: 'sysinfo',
                                tan: 1,
                            }),
                        );
                    } else {
                        this.ws.ping();
                    }
                }
                this.aliveCheckTimeout = this.adapter.setTimeout(() => {
                    this.log.warn('connection lost!');
                    if (this.ws) {
                        this.ws.terminate();
                    }
                    this.ws = undefined;
                    this.delayReconnect();
                }, 900);
            },
            this.legacyAliveCheck ? 30000 : 5000,
        );
    }

    /**
     * reset the alive check
     *
     * @param stop stop the alive check
     */
    aliveReset(stop: boolean = false): void {
        //this.log.debug('Reset alive check');
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
    onUnload(): void {
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
        this.log.debug('unload');
    }

    /**
     * changeArrayToJsonIfName
     *
     * @param array array to check
     */
    changeArrayToJsonIfName(array: any): any {
        const result: { [key: string]: any } | undefined = {};
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
                if (a === 'name') {
                    result[array[a]] = array;
                    return result;
                }
            }
        }
        return useArray ? result : array;
    }

    async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
        if (state) {
            const parts = id.split('.');
            if (parts && parts.length >= 4 && parts[3] === 'controls') {
                if (parts.length == 6 && parts[4] === 'color' && parts[5] === 'activate') {
                    if (this.ws) {
                        const values = this.library.getStates(`${this.UDN}.controls.color.`);
                        const command: { [key: string]: boolean | string | number | null | any[] } = {
                            command: 'color',
                        };
                        for (const k in values) {
                            const v = k as keyof typeof values;
                            const key = k.split('.').pop();
                            if (key !== undefined) {
                                let val: any = values[v]!.val;
                                const defaultValue =
                                    controlDefaults.controls.color[key as keyof typeof controlDefaults.controls.color];
                                if (defaultValue !== undefined) {
                                    if (typeof defaultValue === 'object' && Array.isArray(defaultValue)) {
                                        val = val ? JSON.parse(val) : [];
                                    }
                                }
                                if (key !== 'activate' && values[k] && values[v]!.val !== undefined) {
                                    command[key] = val;
                                }
                            }
                        }
                        this.ws.send(JSON.stringify({ ...command, tan: 100 }));
                    }
                } else if (parts.length == 6 && parts[4] === 'system') {
                    if (this.ws) {
                        this.ws.send(
                            JSON.stringify({
                                command: parts[4],
                                subcommand: parts[5],
                                tan: 100,
                            }),
                        );
                    }
                } else if (parts.length == 6 && parts[4] === 'sourceselect') {
                    if (this.ws) {
                        try {
                            this.ws.send(
                                JSON.stringify(
                                    parts[5] === 'auto'
                                        ? {
                                              command: 'sourceselect',
                                              tan: 100,
                                              auto: true,
                                          }
                                        : {
                                              command: 'sourceselect',
                                              tan: 100,
                                              priority: state.val,
                                          },
                                ),
                            );
                        } catch {
                            this.log.warn(`Invalid command from ${id}`);
                        }
                    }
                } else if (parts.length == 6 && parts[4] === 'clear') {
                    if (this.ws) {
                        this.ws.send(
                            JSON.stringify({
                                command: 'clear',
                                priority: state.val,
                                tan: 100,
                            }),
                        );
                    }
                } else if (parts.length == 6 && parts[4] === 'componentstate') {
                    if (this.ws) {
                        this.ws.send(
                            JSON.stringify({
                                command: 'componentstate',
                                componentstate: {
                                    component: parts[5],
                                    state: state.val,
                                },
                                tan: 90,
                            }),
                        );
                    }
                } else if (parts.length == 5 && parts[4] === 'action') {
                    if (this.ws && typeof state.val === 'string') {
                        try {
                            const command = JSON.parse(state.val);
                            command.tan = 220;
                            this.ws.send(JSON.stringify(command));
                        } catch {
                            this.log.warn(`Invalid JSON in ${id}`);
                        }
                    }
                } else if (parts.length == 5 && parts[4] === 'checkOnline') {
                    if (!this.ws && this.connectionState === 'disconnected' && state.val === true) {
                        this.fastReconnect = new Date().getTime() + 30000;
                        this.delayReconnect();
                        return;
                    }
                    this.fastReconnect = undefined;
                    await this.library.writedp(
                        `${this.UDN}.controls.checkOnline`,
                        false,
                        genericStateObjects.checkOnline,
                    );
                    if (state.val === true) {
                        this.log.warn(
                            `Dont use this state just for fun :) ${
                                this.ws
                                    ? 'Server is online must be offline! '
                                    : this.connectionState === 'notAuthorize'
                                      ? 'The reason for being offline is a failed login, a faster reconnection is not possible!'
                                      : ''
                            }`,
                        );
                    }
                }
            }
        }
    }

    async updateACKControlsStates(data: any): Promise<void> {
        if (data.success) {
            if (data.tan == 220) {
                this.log.debug(`Command ${data.command} successful - JSON: ${JSON.stringify(data)}`);
                const state = this.library.readdb(`${this.UDN}.controls.action`);
                if (state !== undefined) {
                    await this.library.writedp(`${this.UDN}.controls.action`, state.val);
                }
            } else if (data.tan == 100) {
                const commands = data.command.split('-');
                this.log.debug(`Command ${commands[0]} successful - JSON: ${JSON.stringify(data)}`);
                const values = this.library.getStates(`${this.UDN}.controls.${commands[0]}.`);
                for (const k in values) {
                    const v = k as keyof typeof values;
                    if (commands[0] == 'color' && k.endsWith('activate')) {
                        await this.library.writedp(k, false);
                    } else if (commands[0] == 'sourceselect' && k.endsWith('auto')) {
                        await this.library.writedp(k, false);
                    } else if (commands[0] == 'system') {
                        await this.library.writedp(k, false);
                    } else {
                        await this.library.writedp(k, values[v]!.val);
                    }
                }
            }
        } else if (data.tan >= 100) {
            this.log.warn(`Command ${data.command} failed - JSON: ${JSON.stringify(data)}`);
        }
    }
    async updateComponentControlsStates(data: any): Promise<void> {
        for (const k in data) {
            const v = k as keyof typeof data;
            await this.library.writedp(`${this.UDN}.controls.componentstate.${k}`, data[v].enabled);
        }
    }
}

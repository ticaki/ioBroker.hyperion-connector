export type ssdpResponseType = {
    /**
     * Unique Service Name
     */
    USN: string;
    /**
     * ip address of the device
     */
    ip: string;
};

export type DescriptionDeviceType = {
    deviceType: string;
    friendlyName: string;
    manufacturer: string;
    manufacturerURL: string;
    modelDescription: string;
    modelName: string;
    modelNumber: string;
    modelURL: string;
    serialNumber: string;
    UDN: string;
    ports: {
        jsonServer: number;
        sslServer: number;
        protoBuffer: number;
        flatBuffer: number;
    };
    presentationURL: string;
    iconList: {
        icon: {
            mimetype: string;
            height: number;
            width: number;
            depth: number;
            url: string;
        };
    };
};
export type DescriptionTypeRoot = {
    '?xml': string;
    root: DescriptionType;
};

export type DescriptionType = {
    /**
     * deviceType
     */
    specVersion: {
        /**
         * major
         */
        major: number;
        /**
         * minor
         */
        minor: number;
    };
    URLBase: string;
    /**
     * deviceType
     */
    device: DescriptionDeviceType;
};

export type DeviceType = {
    deviceType: string;
    friendlyName: string;
    manufacturer: string;
    manufacturerURL: string;
    modelDescription: string;
    modelName: string;
    modelNumber: string;
    modelURL: string;
    serialNumber: string;
    UDN: string;
    ports: {
        jsonServer: number;
        sslServer: number;
        protoBuffer: number;
        flatBuffer: number;
    };
    presentationURL: string;
    iconList: {
        icon: {
            mimetype: string;
            height: number;
            width: number;
            depth: number;
            url: string;
        };
    };
};

export type ServerInfoType = {
    command: string;
    info: {
        activeEffects: string[];
        activeLedColor: Array<{
            'HSL Value': [number, number, number];
            'RGB Value': [number, number, number];
        }>;
        adjustment: Array<{
            backlightColored: boolean;
            backlightThreshold: number;
            blue: [number, number, number];
            brightness: number;
            brightnessCompensation: number;
            brightnessGain: number;
            cyan: [number, number, number];
            gammaBlue: number;
            gammaGreen: number;
            gammaRed: number;
            green: [number, number, number];
            id: string;
            magenta: [number, number, number];
            red: [number, number, number];
            saturationGain: number;
            white: [number, number, number];
            yellow: [number, number, number];
        }>;
        cec: {
            enabled: boolean;
        };
        components: Array<{
            enabled: boolean;
            name: string;
        }>;
        effects: Array<{
            args: any;
            file: string;
            name: string;
            script: string;
        }>;
        grabbers: {
            audio: {
                active: any[];
                available: string[];
            };
            screen: {
                active: string[];
                available: string[];
            };
            video: {
                active: string[];
                available: string[];
            };
        };
        hostname: string;
        imageToLedMappingType: string;
        instance: Array<{
            friendly_name: string;
            instance: number;
            running: boolean;
        }>;
        ledDevices: {
            available: string[];
        };
        leds: Array<{
            hmax: number;
            hmin: number;
            vmax: number;
            vmin: number;
        }>;
        priorities: Array<{
            active: boolean;
            componentId: string;
            origin: string;
            owner?: string;
            priority: number;
            value: {
                HSL: [number, number, number];
                RGB: [number, number, number];
            };
            visible: boolean;
        }>;
        priorities_autoselect: boolean;
        services: string[];
        transform: Array<{
            blacklevel: [number, number, number];
            brightnessGain: number;
            gamma: [number, number, number];
            id: string;
            luminanceGain: number;
            luminanceMinimum: number;
            saturationGain: number;
            saturationLGain: number;
            threshold: [number, number, number];
            whitelevel: [number, number, number];
        }>;
        videomode: string;
    };
    instance: number;
    success: boolean;
    tan: number;
};

export type AdjustmentControlsType = {
    id?: string;
    red?: [number, number, number];
    green?: [number, number, number];
    blue?: [number, number, number];
    cyan?: [number, number, number];
    magenta?: [number, number, number];
    yellow?: [number, number, number];
    white?: [number, number, number];
    gammaRed?: number;
    gammaGreen?: number;
    gammaBlue?: number;
    backlightThreshold?: number;
    backlightColored?: boolean;
    brightness?: number;
    brightnessGain?: number;
    brightnessCompensation?: number;
    saturationGain?: number;
    temperature?: number;
};

export type ServerInfoForStatesType = {
    activeEffects: string;

    activeLedColor: {
        'HSL Value': string;
        'RGB Value': string;
    };

    adjustment: {
        backlightColored: boolean;
        backlightThreshold: number;
        blue: string;
        brightness: number;
        brightnessCompensation: number;
        brightnessGain: number;
        cyan: string;
        gammaBlue: number;
        gammaGreen: number;
        gammaRed: number;
        green: string;
        id: string;
        magenta: string;
        red: string;
        saturationGain: number;
        white: string;
        yellow: string;
    };

    cec: {
        enabled: boolean;
    };

    components: {
        enabled: boolean;
        name: string;
    };
    effects: {
        args: { blobs?: number };
        file: string;
        name: string;
        script: string;
    };
    grabbers: {
        audio: {
            active: any;
            available: string;
        };
        screen: {
            active: string;
            available: string;
        };
        video: {
            active: string;
            available: string;
        };
    };

    hostname: string;
    imageToLedMappingType: string;

    instance: {
        friendly_name: string;
        instance: number;
        running: boolean;
    };
    ledDevices: {
        available: string;
    };
    leds: {
        hmax: number;
        hmin: number;
        vmax: number;
        vmin: number;
    };
    priorities: {
        active: boolean;
        componentId: string;
        origin: string;
        owner?: string;
        priority: number;
        value: {
            HSL: string;
            RGB: string;
        };
        visible: boolean;
    };
    priorities_autoselect: boolean;

    services: string;

    transform: {
        blacklevel: string;
        brightnessGain: number;
        gamma: string;
        id: string;
        luminanceGain: number;
        luminanceMinimum: number;
        saturationGain: number;
        saturationLGain: number;
        threshold: string;
        whitelevel: string;
    };
    videomode: string;
};

type PriorityValue = {
    HSL: [number, number, number];
    RGB: [number, number, number];
};

type Priority = {
    active: boolean;
    componentId: string;
    origin: string;
    owner?: string;
    priority: number;
    value?: PriorityValue;
    visible: boolean;
};

export type PrioritiesUpdateData = {
    priorities: Priority[];
    priorities_autoselect: boolean;
};
export type PrioritiesUpdateDataStatesType = {
    priorities: Priority;
    priorities_autoselect: boolean;
};
export type PrioritiesUpdateCommand = {
    command: 'priorities-update';
    data: PrioritiesUpdateData;
    instance: number;
};

interface HyperionInfo {
    build: string;
    gitremote: string;
    id: string;
    isGuiMode: boolean;
    readOnlyMode: boolean;
    rootPath: string;
    time: string;
    version: string;
}

interface SystemInfo {
    architecture: string;
    cpuHardware: string;
    cpuModelName: string;
    cpuModelType: string;
    cpuRevision: string;
    domainName: string;
    hostName: string;
    isUserAdmin: boolean;
    kernelType: string;
    kernelVersion: string;
    prettyName: string;
    productType: string;
    productVersion: string;
    pyVersion: string;
    qtVersion: string;
    wordSize: string;
}
export interface SysInfoInfo {
    hyperion: HyperionInfo;
    system: SystemInfo;
}

export interface SysInfoCommand {
    command: string;
    info: SysInfoInfo;
    success: boolean;
    tan: number;
}

export type configOfHyperionInstance = {
    name?: string;
    UDN: string;
    ip: string;
    token?: string;
    enabled: boolean;
    protocol: string;
    port: number;
    URLBase?: string;
};

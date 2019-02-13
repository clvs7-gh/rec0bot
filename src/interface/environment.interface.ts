export interface Environment {
    version: string;
    isProduction: boolean;
    slack: {
        token: string,
        useMock: boolean,
    };
    plugin: {
        rootDir: string,
        disabledPluginNames: string[]
    };
}

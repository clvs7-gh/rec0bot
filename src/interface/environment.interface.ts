export interface Environment {
    version: string;
    isProduction: boolean;
    slack: {
        token: { [key: string]: string };
        useMock: boolean;
    };
    plugin: {
        rootDir: string;
        disabledPluginNames: string[];
    };
}

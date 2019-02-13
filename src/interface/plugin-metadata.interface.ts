export interface PluginMetadata {
    name: string;
    description: string;
    version: number;
    filter_prefixes?: string[];
    scheduled_events?: { time: string, event: string }[];
}

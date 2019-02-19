export interface MessageContext {
    channelId: string;
    userId: string;
    isMentioned: boolean;
    mentions: string[];
}

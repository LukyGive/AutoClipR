import WebSocket from "ws";

import { parseTwitchPrivmsg, type TwitchChatMessage } from "@/features/chat/irc-parser";

const TWITCH_IRC_URL = "wss://irc-ws.chat.twitch.tv:443";

type TwitchIrcClientOptions = {
  accessToken: string;
  nick: string;
  channels: string[];
  onMessage: (message: TwitchChatMessage) => Promise<void>;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  onLog?: (message: string) => void;
};

export class TwitchIrcClient {
  private socket?: WebSocket;
  private desiredChannels = new Set<string>();
  private joinedChannels = new Set<string>();
  private closedIntentionally = false;

  constructor(private readonly options: TwitchIrcClientOptions) {
    for (const channel of options.channels) {
      this.desiredChannels.add(channel.toLowerCase());
    }
  }

  connect() {
    this.closedIntentionally = false;
    this.socket = new WebSocket(TWITCH_IRC_URL);

    this.socket.on("open", () => {
      this.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
      this.send(`PASS oauth:${this.options.accessToken}`);
      this.send(`NICK ${this.options.nick}`);

      this.flushChannelJoins();

      this.options.onLog?.(
        `Connected to Twitch IRC as ${this.options.nick} for ${this.options.channels.length} channel(s).`
      );
      this.options.onOpen?.();
    });

    this.socket.on("message", (data) => {
      const payload = data.toString();
      const lines = payload.split("\r\n").filter(Boolean);

      for (const line of lines) {
        this.handleLine(line).catch((error) => {
          this.options.onLog?.(`Chat line failed: ${String(error)}`);
        });
      }
    });

    this.socket.on("close", () => {
      this.options.onLog?.(`Twitch IRC connection closed for ${this.options.nick}.`);
      this.socket = undefined;

      if (!this.closedIntentionally) {
        this.options.onClose?.();
      }
    });

    this.socket.on("error", (error) => {
      this.options.onLog?.(`Twitch IRC error for ${this.options.nick}: ${error.message}`);
      this.options.onError?.(error);
    });
  }

  close() {
    this.closedIntentionally = true;
    this.socket?.close();
  }

  joinChannels(channels: string[]) {
    for (const channel of channels) {
      const normalizedChannel = channel.toLowerCase();
      this.desiredChannels.add(normalizedChannel);
    }

    this.flushChannelJoins();
  }

  syncChannels(channels: string[]) {
    const nextChannels = new Set(channels.map((channel) => channel.toLowerCase()));

    for (const joinedChannel of this.joinedChannels) {
      if (nextChannels.has(joinedChannel)) {
        continue;
      }

      this.send(`PART #${joinedChannel}`);
      this.joinedChannels.delete(joinedChannel);
      this.options.onLog?.(`Left #${joinedChannel}.`);
    }

    this.desiredChannels = nextChannels;
    this.flushChannelJoins();
  }

  private flushChannelJoins() {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    for (const normalizedChannel of this.desiredChannels) {
      if (this.joinedChannels.has(normalizedChannel)) {
        continue;
      }

      this.send(`JOIN #${normalizedChannel}`);
      this.joinedChannels.add(normalizedChannel);
      this.options.onLog?.(`Joined #${normalizedChannel}.`);
    }
  }

  private async handleLine(line: string) {
    if (line.startsWith("PING")) {
      this.send("PONG :tmi.twitch.tv");
      return;
    }

    const chatMessage = parseTwitchPrivmsg(line);

    if (chatMessage) {
      await this.options.onMessage(chatMessage);
    }
  }

  private send(message: string) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(`${message}\r\n`);
  }
}

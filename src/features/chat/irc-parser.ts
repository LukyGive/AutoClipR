export type TwitchChatMessage = {
  channel: string;
  username: string;
  message: string;
  badges: Record<string, string>;
  raw: string;
};

export function parseTwitchPrivmsg(rawLine: string): TwitchChatMessage | null {
  if (!rawLine.includes(" PRIVMSG #")) {
    return null;
  }

  const privmsgMatch = rawLine.match(
    /^(?:@(?<tags>[^ ]+) )?:(?<username>[^!]+)![^ ]+ PRIVMSG #(?<channel>[^ ]+) :(?<message>.*)$/
  );

  if (!privmsgMatch?.groups) {
    return null;
  }

  return {
    channel: privmsgMatch.groups.channel.toLowerCase(),
    username: privmsgMatch.groups.username.toLowerCase(),
    message: privmsgMatch.groups.message.trim(),
    badges: parseBadges(privmsgMatch.groups.tags),
    raw: rawLine
  };
}

function parseBadges(tags?: string) {
  const badgesTag = tags
    ?.split(";")
    .find((tag) => tag.startsWith("badges="))
    ?.replace("badges=", "");

  if (!badgesTag) {
    return {};
  }

  return Object.fromEntries(
    badgesTag
      .split(",")
      .filter(Boolean)
      .map((badge) => {
        const [name, value] = badge.split("/");
        return [name, value ?? ""];
      })
  );
}

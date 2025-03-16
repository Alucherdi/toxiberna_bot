const { config } = require('seyfert');

export default config.bot({
    token: Bun.env.BOT_TOKEN,
    intents: [
        "Guilds", "GuildMembers", "GuildMessages", "GuildPresences", "MessageContent"
    ],
    locations: {
        base: "src",
        output: "src",
        commands: "commands",
        events: "events",
    }
});

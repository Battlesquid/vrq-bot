require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Collection, Client } = require('discord.js-light');

const bot = new Client({
    cacheGuilds: false,
    cacheChannels: false,
    cacheOverwrites: false,
    cacheRoles: false,
    cacheEmojis: false,
    cachePresences: false
});

bot.commands = new Collection();

const loadDirectory = dir => {
    const directoryPath = path.resolve(__dirname, dir);
    const files = fs.readdirSync(directoryPath);

    const validFiles = files
        .filter(file => fs.lstatSync(`${directoryPath}/${file}`).isFile())
        .filter(file => file.endsWith(".js"))
        .map(command => command.split(".")[0])

    return validFiles;
}

const loadCommands = dir => {
    const validCommands = loadDirectory(dir);
    for (const command of validCommands) {
        bot.commands.set(command, require(`${directoryPath}/${command}`))
    }
}

const loadEvents = dir => {
    const validEvents = loadDirectory(dir);

    for (const eventName of validEvents) {
        const eventPath = path.resolve(__dirname, dir, eventName);
        bot.on(eventName, require(eventPath).bind(null, bot));
        delete require.cache[require.resolve(eventPath)];
    }
}

bot.on('ready', () => {
    loadCommands("./commands");
    loadEvents("./events");
})

bot.login(process.env.TOKEN);

//https://discord.com/api/oauth2/authorize?client_id=758188376947032074&permissions=50334720&scope=bot
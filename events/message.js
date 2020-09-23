module.exports = async (bot, message) => {

    if (message.author.bot) return;
    if (message.guild.id === undefined) return;
    if(!message.content.startsWith(process.env.PREFIX)) return;

    const [commandName, ...args] = message.content
        .slice(process.env.PREFIX.length)
        .trim()
        .split(/\s/g);

    const command = bot.commands.get(commandName);
    if (!command) return;

    command.run(message, args);

}
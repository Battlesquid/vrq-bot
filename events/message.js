module.exports = async (bot, message) => {

    if (message.author.bot) return;
    if (!message.guild.available) return;
    if (!message.content.startsWith(process.env.PREFIX)) return;

    const [commandName, ...args] = message.content
        .slice(process.env.PREFIX.length)
        .trim()
        .split(/\s/g);

    const command = bot.commands.get(commandName);
    if (!command) return;
    if(!command.meetsRequirements(message, args)) return console.log('unmet'); 
    try {
        command.run(message, args);
    } catch (e) { console.log(e); }


}
module.exports = async (bot, message) => {
    if(message.author.bot) return;
    message.reply(message.content);
}
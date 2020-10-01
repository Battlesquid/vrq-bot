// ]registerQueueCategory [category] [type]

const { Permissions, MessageEmbed } = require('discord.js-light');

module.exports.run = (message, [queueType, program, matchType]) => {
    console.log(program, queueType, matchType);

    const category = message.guild.channels.cache
        .filter(channel => channel.type === "category")
        .filter(channel =>
            channel.name.toLowerCase().split(/[- |]/).includes(queueType) &&
            channel.name.toLowerCase().split(/[- |]/).includes(program) &&
            channel.name.toLowerCase().split(/[- |]/).includes(matchType))
        .first();

    if (!category) return message.reply(`Could not find a ${queueType} ${program} ${matchType} queue.`);

    const memberCount = category.children
        .filter(channel => channel.type === "voice")
        .reduce((acc, channel) => acc + channel.members.size, 0)
    message.reply(`there are currently ${memberCount} members in the ${queueType} ${program} ${matchType} queue.`);
}

module.exports.meetsRequirements = (message, args) => {
    const conditions = [
        /random|casual/.test(args[0].toLowerCase()),
        /vrc|vexu/.test(args[1].toLowerCase()),
        /1v1|2v2/.test(args[2].toLowerCase())
    ]
    return conditions.every(Boolean);
}

module.exports.permissions = Permissions.FLAGS.MANAGE_GUILD;
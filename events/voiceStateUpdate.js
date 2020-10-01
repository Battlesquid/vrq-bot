const parseQueueType = state => {
    return state.channel.parent.name.split(/[ |-]/)
        .filter(Boolean)
        .map(e => e.toLowerCase())
        .find(e => /random|casual/.test(e))
}

const parseMatchNum = matchString => matchString.toLowerCase().replace(/[ -]|red|blue/g, "")

const updateQueueView = (user, state, accessState) => {
    const randomQueue = state.channel.parent.children.find(child => child.name === "Random Queue");
    if (!randomQueue) return;

    if (accessState) {
        if (randomQueue.permissionOverwrites && randomQueue.permissionOverwrites.get(state.id))
            randomQueue.permissionOverwrites.get(user.id).delete();
    } else {
        randomQueue.updateOverwrite(user, { VIEW_CHANNEL: false })
    }
}

const updateViewOverwrites = async (user, state, accessState) => {
    const matchChannel = state.channel.name.match(/\d+/);
    if (!matchChannel) return;
    const matchNum = matchChannel[0];

    const channels = state.channel.parent.children
        .filter(child => parseMatchNum(child.name).match(RegExp(`match${matchNum}$`, "ig")))

    if (accessState) {
        for (const channel of channels.array()) {
            await channel.updateOverwrite(user, { VIEW_CHANNEL: true })
        }
        updateQueueView(user, state, false);
    }

    else {
        for (const channel of channels.array()) {
            if (channel.permissionOverwrites && channel.permissionOverwrites.get(state.id))
                channel.permissionOverwrites.get(state.id).delete();
        }
        updateQueueView(user, state, true);
    }
}

module.exports = async (bot, oldState, newState) => {

    if (oldState) {
        if (!parseQueueType(oldState)) return;

        if (newState && parseMatchNum(newState.channel.name) === parseMatchNum(oldState.channel.name)) return;
        const user = await bot.users.fetch(oldState.id);

        await updateViewOverwrites(user, oldState, false);
    }

    if (newState) {

        const queueType = parseQueueType(newState);
        if (!queueType) return;

        if (queueType === "random") {
            if (newState.channel.name !== "Random Queue") return;

            const vacantVoiceChannel = newState.channel.parent.children
                .filter(channel => channel.type === "voice" && channel.id !== newState.channel.id && !channel.full)
                .sort((vc1, vc2) => vc1.position - vc2.position)
                .first();
            if (!vacantVoiceChannel) return;

            await newState.setChannel(vacantVoiceChannel);
        }

        const user = await bot.users.fetch(newState.id);
        await updateViewOverwrites(user, newState, true);
    }
}
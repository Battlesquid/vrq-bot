const parseQueueType = state => {
    return state.channel.parent.name.split(/[ |-]/)
        .filter(Boolean)
        .map(e => e.toLowerCase())
        .find(e => /random|casual/.test(e))
}

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

    const matchNum = state.channel.name.match(/\d+/)[0];
    const channels = state.channel.parent.children
        .filter(child => child.name.match(RegExp(`match.${matchNum}$`, "ig")))

    if (accessState) {
        for (const channel of channels.array()) {
            await channel.updateOverwrite(user, { VIEW_CHANNEL: true })
        }
        updateQueueView(user, state, false);

    } else {
        for (const channel of channels.array()) {
            if (channel.permissionOverwrites && channel.permissionOverwrites.get(state.id))
                channel.permissionOverwrites.get(state.id).delete();
        }
        updateQueueView(user, state, true);
    }
}


module.exports = async (bot, oldState, newState) => {

    if (newState) {
        console.log('joined ', newState.channel.name)
        const queueType = parseQueueType(newState);
        if (!queueType) return;

        const user = await bot.users.fetch(newState.id);

        if (queueType === "random") {
            if (newState.channel.name !== "Random Queue") return;

            const vacantVoiceChannel = newState.channel.parent.children
                .filter(channel => channel.type === "voice" && channel.id !== newState.channel.id && !channel.full)
                .sort((vc1, vc2) => vc1.position - vc2.position)
                .first();
            if (!vacantVoiceChannel) return;

            await newState.setChannel(vacantVoiceChannel);
        }

        await updateViewOverwrites(user, newState, true);
    }

    if (oldState) {
        if (!parseQueueType(oldState)) return;

        const user = await bot.users.fetch(oldState.id);
        await updateViewOverwrites(user, oldState, false);

        console.log('left ', oldState.channel.name);
    }
}
const parseQueueType = state => {
    return state.channel.parent.name.split(/[ |-]/)
        .filter(Boolean)
        .map(e => e.toLowerCase())
        .find(e => /random|casual/.test(e))
}


const updateViewOverwrites = async (client, state, accessState) => {
    const user = await client.users.fetch(state.id);

    const matchNum = state.channel.name.match(/\d+/)[0];
    const channels = state.channel.parent.children
        .filter(child => child.name.match(RegExp(`match.${matchNum}`, "ig")))

    if (accessState) {
        for (const channel of channels.array()) {
            await channel.updateOverwrite(user, { VIEW_CHANNEL: true })
        }

    } else {
        for (const channel of channels.array()) {
            if (channel.permissionOverwrites && channel.permissionOverwrites.get(state.id))
                channel.permissionOverwrites.get(state.id).delete();
        }
    }
}

module.exports = async (bot, oldState, newState) => {

    if (newState) {
        const queueType = parseQueueType(newState);
        if (!queueType) return;

        switch (queueType) {
            case "random":
                if (newState.channel.name !== "Random Queue") return;

                const vacantVoiceChannel = newState.channel.parent.children
                    .filter(channel => channel.type === "voice" && channel.id !== newState.channel.id && !channel.full)
                    .sort((vc1, vc2) => vc1.position - vc2.position)
                    .first();
                if (!vacantVoiceChannel) return;

                await newState.setChannel(vacantVoiceChannel);
                updateViewOverwrites(bot, newState, true)
                break;

            case "casual":
                updateViewOverwrites(bot, newState, true);
                break;
        }
    }

    if (oldState)
        updateViewOverwrites(bot, oldState, false)
}
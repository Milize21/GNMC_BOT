const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = async (client) => {
    const createAdminRow = () => new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId('accept')
            .setLabel('Accept')
            .setStyle('SUCCESS'),
        new MessageButton()
            .setCustomId('reject')
            .setLabel('Reject')
            .setStyle('DANGER')
    );

    const whitelistRow = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId('whitelist-request')
            .setLabel('Request Whitelist')
            .setStyle('PRIMARY')
    );
    const disabledWhitelistRow = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId('whitelist-request')
            .setLabel('Request Whitelist')
            .setStyle('PRIMARY')
            .setDisabled(true)
    );
    let discordId;
    on('playerConnecting', async (name, setKickReason, deferrals) => {
        const player = global.source;
        const identifiers = getPlayerIdentifiers(player);
        discordId = identifiers.find(id => id.startsWith('discord:'))?.split(':')[1];

        deferrals.defer();

        if (!config.Whitelist) {
            deferrals.done();
            return;
        }

        if (!discordId) {
            deferrals.done('❌ You must be connected to Discord to join this server.');
            return;
        }

        deferrals.update(`🔍 Verifying Discord connection for ${name}...`);

        try {
            const guild = await client.guilds.fetch(config.discordServerID);
            const member = await guild.members.fetch(discordId).catch(() => null);

            if (!member) {
                deferrals.done(
                    `❌ You are not a member of our Discord server. Please join the server to proceed. Discord: ${config.Whitelist.DiscordLink}`
                );
                return;
            }

            const hasWhitelistRole = member.roles.cache.has(config.Whitelist.WhitelistRoleID);
            const hasBlacklistRole = member.roles.cache.has(config.Whitelist.BlacklistRoleID);

            if (hasBlacklistRole) {
                deferrals.done(config.Whitelist.BlacklistMessage);
                return;
            }

            if (hasWhitelistRole) {
                deferrals.done();
                return;
            }

            const embed = {
                color: 0x0099ff,
                title: '🛡️ Whitelist Request',
                description: "You are not whitelisted on the server. Click the button below to request whitelisting.",
                footer: { text: 'DFA DEVELOPMENTS', icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png' },
                timestamp: new Date(),
            };

            await member.send({ content: `<@${discordId}>`, embeds: [embed], components: [whitelistRow] });
            deferrals.done('📩 Check your Discord DMs to request whitelisting.');
        } catch (error) {
            console.error(`[Connection Error] ${error}`);
            deferrals.done('❌ An error occurred while processing your connection. Please try again later.');
        }
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        const { customId, user } = interaction;

        if (customId === 'whitelist-request') {
            if (config.Whitelist.AutoApproval) {
                const guild = await client.guilds.fetch(config.discordServerID);
                const member = await guild.members.fetch(user.id);
                await member.roles.add(config.Whitelist.WhitelistRoleID);
                await interaction.update({ content: `✅ ${member}, Your request has been automatically approved by the bot. You may now join the server.`, components: [disabledWhitelistRow] });

                const adminChannel = await client.channels.fetch(config.Whitelist.WhitelistChannel);
                await adminChannel.send(`✅ User ${member} has been auto-approved and granted the whitelist role.`);
                return;
            }
            const adminEmbed = {
                color: 0xffa500,
                title: 'Whitelist Request Received',
                description: `A whitelist request has been submitted by Discord ID: **${user.id}**. Admins, please review and take action.`,
                fields: [
                    { name: 'Requested BY', value: `<@${user.id}>`, inline: true },
                ],
                footer: { text: 'DFA DEVELOPMENTS', icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png' },
                timestamp: new Date(),
            };

            const adminChannel = await client.channels.fetch(config.Whitelist.WhitelistChannel);
            const adminRow = createAdminRow();
            await adminChannel.send({ embeds: [adminEmbed], components: [adminRow] });

            await interaction.update({ content: `✅ <@${user.id}>, Your request has been sent to the admin team.`, components: [disabledWhitelistRow] });
        }

        if (customId === 'accept' || customId === 'reject') {
            const guild = await client.guilds.fetch(config.discordServerID);
            const member = await guild.members.fetch(discordId);
            const AdminMember = await guild.members.fetch(interaction.user.id);
            if (!AdminMember.roles.cache.has(config.Whitelist.SupportRole)) {
                await interaction.reply({ content: `❌ You do not have permission to perform this action. Only <@&${config.Whitelist.SupportRole}> can perform this action!`, ephemeral: true });
                return;
            }
            try {
                const updatedAdminRow = new MessageActionRow().addComponents(
                    createAdminRow().components.map(button => button.setDisabled(true))
                );

                if (customId === 'accept') {
                    await member.roles.add(config.Whitelist.WhitelistRoleID);

                    const acceptEmbed = {
                        color: 0x00ff00,
                        title: '✅ Whitelist Approved',
                        description: 'Congratulations! You have been whitelisted and can now join the server.',
                        fields: [
                            { name: 'Approved BY', value: `<@${user.id}>`, inline: true },
                        ],
                        footer: { text: 'DFA DEVELOPMENTS', icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png' },
                    };

                    await member.send({ embeds: [acceptEmbed] });
                    await interaction.update({
                        content: `✅ <@${member.id}>, Discord ID ${member.id} has been whitelisted.`,
                        components: [updatedAdminRow],
                    });
                } else {
                    const rejectEmbed = {
                        color: 0xff0000,
                        title: '❌ Whitelist Request Rejected',
                        description: 'Your whitelist request has been rejected. Please contact staff for details.',
                        fields: [
                            { name: 'Rejected BY', value: `<@${user.id}>`, inline: true },
                        ],
                        footer: { text: 'DFA DEVELOPMENTS', icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png' },
                    };

                    await member.send({ embeds: [rejectEmbed] });
                    await interaction.update({
                        content: `❌ <@${member.id}>, Discord ID ${member.id} has been rejected.`,
                        components: [updatedAdminRow],
                    });
                }
            } catch (err) {
                console.error(`[Role Management Error] ${err}`);
                await interaction.reply({
                    content: '❌ Failed to process the action. Please try again.',
                    ephemeral: true,
                });
            }
        }
    });

};

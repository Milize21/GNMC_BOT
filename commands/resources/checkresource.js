const { MessageActionRow, MessageButton } = require('discord.js');
const { sendLog } = require('../../Events/logFunction');

module.exports = {
    name: 'checkresource',
    description: 'Check the status of a specific resource on the server and interact with it',
    adminOnly: true,
    async execute(message, args) {
        if (!args[0]) {
            return message.reply(
                `❓ **Usage:** \`${config.prefix}checkresource [Resource Name]\`\n**Example:** \`${config.prefix}checkresource dfa-starterpack\``
            );
        }

        const resourceName = args[0];
        const resourceState = GetResourceState(resourceName);

        const embed = {
            color: 0x0099ff,
            timestamp: new Date(),
            footer: {
                text: 'DFA DEVELOPMENTS',
                icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
            },
        };

        if (resourceState === 'missing') {
            embed.color = 0xf02c2c;
            embed.title = '❌ Resource Not Found';
            embed.description = `The resource \`${resourceName}\` is **missing**. Please ensure it exists in the server files.`;
            return message.channel.send({ embeds: [embed] });
        }

        if (resourceState === 'started') {
            embed.color = 0x00ff00;
            embed.title = '✅ Resource Running';
            embed.description = `The resource \`${resourceName}\` is currently **running**.`;
        } else if (resourceState === 'stopped') {
            embed.color = 0xffcc00;
            embed.title = '⚠️ Resource Stopped';
            embed.description = `The resource \`${resourceName}\` is currently **stopped**.`;
        }

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('start')
                .setLabel('Start')
                .setStyle('SUCCESS')
                .setEmoji('🟢')
                .setDisabled(resourceState === 'started'),
            new MessageButton()
                .setCustomId('stop')
                .setLabel('Stop')
                .setStyle('DANGER')
                .setEmoji('🔴')
                .setDisabled(resourceState === 'stopped' || resourceState === 'missing'),
            new MessageButton()
                .setCustomId('restart')
                .setLabel('Restart')
                .setStyle('PRIMARY')
                .setEmoji('🔄')
                .setDisabled(resourceState === 'missing')
        );


        const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

        const collector = sentMessage.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: 'You are not allowed to use these buttons!', ephemeral: true });
            }

            if (interaction.customId === 'start') {
                StartResource(resourceName);
                embed.color = 0x00ff00;
                embed.title = '✅ Resource Started';
                embed.description = `The resource \`${resourceName}\` has been successfully started.`;
                row.components.forEach((button) => button.setDisabled(true));
                await interaction.update({ embeds: [embed], components: [row] });
            } else if (interaction.customId === 'stop') {
                StopResource(resourceName);
                embed.color = 0xffcc00;
                embed.title = '⚠️ Resource Stopped';
                embed.description = `The resource \`${resourceName}\` has been successfully stopped.`;
                row.components.forEach((button) => button.setDisabled(true));
                await interaction.update({ embeds: [embed], components: [row] });
            } else if (interaction.customId === 'restart') {
                StopResource(resourceName);
                StartResource(resourceName);
                embed.color = 0x00ff00;
                embed.title = '🔄 Resource Restarted';
                embed.description = `The resource \`${resourceName}\` has been successfully restarted.`;
                row.components.forEach((button) => button.setDisabled(true));
                await interaction.update({ embeds: [embed], components: [row] });
            }
        });

        collector.on('end', () => {
            row.components.forEach((button) => button.setDisabled(true));
            sentMessage.edit({ components: [row] });
        });
    },
};

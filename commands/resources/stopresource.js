const { sendLog } = require('../../Events/logFunction');

module.exports = {
    name: 'stopresource',
    description: 'Stop a server script!',
    adminOnly: true,
    execute(message, args) {
        if (!args[0]) {
            return message.reply(
                `❓ **Usage:** \`${config.prefix}stopresource [Resource Name]\`\n**Example:** \`${config.prefix}stopresource dfa-banking\``
            );
        }

        const embed = {
            color: 0x0099ff,
            timestamp: new Date(),
            footer: {
                text: 'DFA DEVELOPMENTS',
                icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
            },
        };

        const resourceState = GetResourceState(args[0]);

        if (resourceState === 'missing') {
            embed.color = 0xf02c2c; // Red color for error
            embed.title = '❌ Resource Not Found';
            embed.description = `The resource \`${args[0]}\` is **missing**. Please ensure it exists in the server files.`;
            return message.channel.send({ embeds: [embed] });
        } else if (resourceState === 'stopped') {
            embed.color = 0xffcc00; // Yellow color for warning
            embed.title = '⚠️ Resource Already Stopped';
            embed.description = `The resource \`${args[0]}\` is already **stopped**!`;
            return message.channel.send({ embeds: [embed] });
        }

        StopResource(args[0]);
        embed.color = 0x00ff00; // Green color for success
        embed.title = '✅ Resource Stopped';
        embed.description = `The resource \`${args[0]}\` has been successfully **stopped**!`;
        message.channel.send({ embeds: [embed] });
        const fields = [
            { name: 'Stopped', value: `\`${args[0]}\``, inline: true },
            { name: 'Stopped BY', value: `<@${message.author.id}>`, inline: true },
        ];
        sendLog(client, '🚨 Resource Stopped', `The resource \`${args[0]}\` has been successfully **stopped**!`, 0xff0000, fields);

    },
};

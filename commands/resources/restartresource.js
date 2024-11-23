const { sendLog } = require('../../Events/logFunction');
module.exports = {
    name: 'restartresource',
    description: 'Restarts a specific script on the server',
    adminOnly: true,
    execute(message, args) {
        if (!args[0]) {
            return message.reply(
                `❓ **Usage:** \`${config.prefix}restartresource [Resource Name]\`\n**Example:** \`${config.prefix}restartresource dfa-starterpack\``
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
            embed.color = 0xf02c2c; // Red for missing resource
            embed.title = '❌ Resource Not Found';
            embed.description = `The resource \`${args[0]}\` is **missing**. Please ensure it exists in the server files.`;
            return message.channel.send({ embeds: [embed] });
        }

        if (resourceState !== 'started') {
            embed.color = 0xffcc00; // Yellow for resource not running
            embed.title = '⚠️ Resource Not Running';
            embed.description = `The resource \`${args[0]}\` is currently **stopped**. Starting it instead.`;
            StartResource(args[0]);
            embed.color = 0x00ff00; // Green for success
            embed.title = '✅ Resource Started';
            embed.description = `The resource \`${args[0]}\` has been successfully **started**!`;
            return message.channel.send({ embeds: [embed] });
        }

        // Stop and restart the resource
        StopResource(args[0]);
        setTimeout(() => {
            StartResource(args[0]);
            const restartState = GetResourceState(args[0]);

            if (restartState === 'started') {
                embed.color = 0x00ff00; // Green for success
                embed.title = '✅ Resource Restarted';
                embed.description = `The resource \`${args[0]}\` has been successfully **restarted**!`;
            } else {
                embed.color = 0xf02c2c; // Red for failure
                embed.title = '❌ Restart Failed';
                embed.description = `The resource \`${args[0]}\` could not be restarted. Please check for errors.`;
            }
            const fields = [
                { name: 'Restarted', value: `\`${args[0]}\``, inline: true },
                { name: 'Restarted BY', value: `<@${message.author.id}>`, inline: true },
            ];
            sendLog(client, '🚨 Resource Restarted', `The resource \`${args[0]}\` has been successfully **restarted**!`, 0xff0000, fields);

            message.channel.send({ embeds: [embed] });
        }, 2000); // Delay to allow StopResource to process
    },
};

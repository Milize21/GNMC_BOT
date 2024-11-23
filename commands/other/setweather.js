
const { sendLog } = require('../../Events/logFunction');
module.exports = {
    name: 'setweather',
    description: 'Set the server weather with customizable options.',
    adminOnly: true,
    execute(message, args) {
        if (!args[0] || !args[1] || !args[2] || !args[3]) {
            return message.reply(
                `❓ **Usage:** \`${config.prefix}setweather <weather_type> <transition_time> <freeze=1/0> <permanentSnow=1/0>\`\n\n` +
                `* 0 = false, 1 = true` +
                `Example: \`${config.prefix}setweather RAIN 5000 1 0\`\n\n` +
                `Valid weather types: \n` +
                `${config.validWeathers.map(w => `\`${w}\``).join(', ')}`
            );
        }

        const weather = args[0];
        if (!weather || !config.validWeathers.includes(weather)) {
            return message.reply(
                `Invalid weather type! Please use one of the following:\n${config.validWeathers.map(w => `\`${w}\``).join(', ')}`
            );
        }

        const transition = parseFloat(args[1]) || 1.0;
        const freeze = args[2] === '1';
        const permanentSnow = args[3] === '1';

        emit('weathersync:setWeather', weather, transition, freeze, permanentSnow);

        const embed = {
            color: 0x00ff00,
            title: 'Weather Updated',
            description: `The weather has been set successfully with the following details:\n\n` +
                `🌤 **Weather:** ${weather}\n` +
                `⏳ **Transition Time:** ${transition}s\n` +
                `❄️ **Freeze:** ${freeze ? 'Enabled' : 'Disabled'}\n` +
                `🌨 **Permanent Snow:** ${permanentSnow ? 'Enabled' : 'Disabled'}`,
            timestamp: new Date(),
            footer: {
                text: 'DFA DEVELOPMENTS',
                icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
            },
        };

        message.channel.send({ embeds: [embed] });
        const fields = [
            { name: 'Weather Type', value: `\`${weather}\``, inline: true },
            { name: 'Transition Time', value: `\`${transition}s\``, inline: true },
            { name: 'Freeze', value: `${freeze ? '✅ Enabled' : '❌ Disabled'}`, inline: true },
            { name: 'Permanent Snow', value: `${permanentSnow ? '✅ Enabled' : '❌ Disabled'}`, inline: true },
            { name: 'Command Issued By', value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
        ];

        sendLog(
            message.client, // Pass the bot client instance
            '🌤 Weather Change Log',
            `A weather update was performed by ${message.author.tag}.`,
            0x00ff00, // Green color for success
            fields
        );
    },
};

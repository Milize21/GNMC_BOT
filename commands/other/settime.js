const { sendLog } = require('../../Events/logFunction');
module.exports = {
    name: 'settime',
    description: 'Set the server time with customizable options.',
    adminOnly: true,
    execute(message, args) {
        if (args.length < 6) {
            return message.reply(
                `❓ **Usage:** \`${config.prefix}settime <day> <hour> <minute> <second> <transition_time> <freeze>\`\n\n` +
                `Valid time arguments:\n` +
                `- Day: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat\n` +
                `- Hour: 0-23\n` +
                `- Minute: 0-59\n` +
                `- Second: 0-59\n` +
                `- Transition Time: Positive number (in milliseconds)\n` +
                `- Freeze: 0 (false) or 1 (true)\n` +
                `Example: \`${config.prefix}settime 1 14 30 0 5000 1\``
            );
        }

        const day = parseInt(args[0]);
        const hour = parseInt(args[1]);
        const minute = parseInt(args[2]);
        const second = parseInt(args[3]);
        const transition = parseFloat(args[4]);
        const freeze = args[5] === '1' ? true : false;

        emit('weathersync:setTime', day, hour, minute, second, transition, freeze);

        const embed = {
            color: 0x00ff00,
            title: 'Time Updated',
            description: `The server time has been set successfully with the following details:\n\n` +
                `🕒 **Day:** ${day} (0 = Sun, 1 = Mon, ... 6 = Sat)\n` +
                `🕰 **Time:** ${hour}:${minute}:${second}\n` +
                `⏳ **Transition Time:** ${transition}ms\n` +
                `❄️ **Freeze:** ${freeze ? 'Enabled' : 'Disabled'}`,
            timestamp: new Date(),
            footer: {
                text: 'DFA DEVELOPMENTS',
                icon_url: 'https://i.ibb.co/NKmkMg0/DFA-REBRAND.png'
            },
        };

        message.channel.send({ embeds: [embed] });

        const fields = [
            { name: 'Day', value: `\`${day}\` (0 = Sun, ... 6 = Sat)`, inline: true },
            { name: 'Time', value: `\`${hour}:${minute}:${second}\``, inline: true },
            { name: 'Transition Time', value: `\`${transition}ms\``, inline: true },
            { name: 'Freeze', value: `${freeze ? '✅ Enabled' : '❌ Disabled'}`, inline: true },
            { name: 'Command Issued By', value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
        ];

        sendLog(
            message.client,
            '🕒 Time Change Log',
            `A server time update was performed by ${message.author.tag}.`,
            0x00ff00,
            fields
        );
    }
};

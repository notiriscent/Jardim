const { SlashCommandBuilder } = require('discord.js');
const pool = require('../../poolConnection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.reply(`Pong! Hi, I'm ${interaction.client.user.tag}!`);

        pool.getConnection((err, connection) => {
            if(err) {
                connection.release();
                throw err;
            }

            // Insert the user in the database if it's not saved already.
            connection.query(`INSERT INTO users (id, username)
            SELECT * FROM (SELECT ? AS id, ? AS username) AS temp
            WHERE NOT EXISTS (
                SELECT username FROM users WHERE id = ?
            ) LIMIT 1;`, [interaction.user.id, interaction.user.username, interaction.user.id], async (err, results) => {
                if(err) {
                    connection.release();
                    throw err;
                }
                
                if(results.affectedRows > 0) {
                    await interaction.followUp({ content: 'Added you to our database!', ephemeral: true });
                }
            });
        });
    },
};
// Deconstructed the constants we need in this file.

const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const UserModel = require('../../../models/user');

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("leaderboard")
		.setDescription(
			"View the top ten highest level players."
		),

        async execute(interaction) {

            /**
             * @type {EmbedBuilder}
             * @description Water command's embed
             */
            const leaderboardEmbed = new EmbedBuilder().setColor("#adda21");
            const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
            
            const userId = interactionUser.id;
    
            UserModel.findOne({ userId: userId })
            .then(async foundUser => {
              if (foundUser) {

                // Retrieve the top ten users sorted by level in descending order
                const topUsers = await UserModel.find({})
                    .sort({ 'garden.level': -1 })
                    .limit(10);

                // Create a Discord embed for the leaderboard
                leaderboardEmbed
                    .setTitle('Leaderboard')
                    .setDescription('Top 10 Players by Level');

                for (let i = 0; i < topUsers.length; i++) {
                    leaderboardEmbed.addFields({ name: `#${i + 1} ${topUsers[i].username}`, value: `Level ${topUsers[i].garden.level}` });
                }
    
                // Replies to the interaction!
                await interaction.reply({
                  ephemeral: true,
                    embeds: [leaderboardEmbed],
                });
              } else {
                // Tell the user to create a garden
                leaderboardEmbed
                    .setDescription(
                        "Please create a garden with `/creategarden`"
                );
    
                // Replies to the interaction!
                await interaction.reply({
                  ephemeral: true,
                    embeds: [leaderboardEmbed],
                });
              }
            })
            .catch(error => {
              console.error('Error searching for user:', error);
            });
        },
};

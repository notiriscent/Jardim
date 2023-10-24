// Deconstructed the constants we need in this file.

const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const UserModel = require('../../../models/user');

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("creategarden")
		.setDescription(
			"Create your garden."
		)
        .addStringOption((option) =>
			option
				.setRequired(true)
				.setName("name")
				.setDescription("Name your garden.")
		),

	async execute(interaction) {
		/**
		 * @type {string}
		 * @description The "command" argument
		 */
        let gardenName = interaction.options.getString("name");

		/**
		 * @type {EmbedBuilder}
		 * @description Garden command's embed
		 */
		const gardenEmbed = new EmbedBuilder().setColor("#adda21");
		const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
		
		const userId = interactionUser.id;
        const nickName = await interactionUser.user.username;
		console.log(nickName)

		UserModel.findOne({ userId: userId })
		.then(async foundUser => {
		  if (foundUser) {
			// The user already has a garden, let them know that.
			gardenEmbed
				.setDescription(
					'You already have a garden. use `/garden`, to view it.'
			);

			// Replies to the interaction!
			await interaction.reply({
				ephemeral: true,
				embeds: [gardenEmbed],
			});
		  } else {

			// Create the user garden
            const newUser = new UserModel({
                username: nickName,
                userId: userId,
                garden: {
                    name: gardenName,
					creds: 30,
                    level: 1,
					xpNeeded: 100,
					remainingXP: 0,
                    plants: {
                        plant: {
							name: 'Wheat',
							emoji: '🌾',
							rarityEmoji: "<:graycircle:1150567437251649576>",
							growth: 0,
							rarity: 1
						}
                    }
                }
            });
            
            // Save the new user to the database
            newUser.save()
                .then(savedUser => {
                console.log('New user created:', savedUser);
                })
                .catch(error => {
                console.error('Error creating user:', error);
                });

			gardenEmbed
				.setDescription(
					`Created your garden, named: **${gardenName}.**`
			);

			// Replies to the interaction!
			await interaction.reply({
				ephemeral: true,
				embeds: [gardenEmbed],
			});
		  }
		})
		.catch(error => {
		  console.error('Error searching for user:', error);
		});

	},
};

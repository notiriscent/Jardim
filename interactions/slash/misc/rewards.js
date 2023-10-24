// Deconstructed the constants we need in this file.

const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const UserModel = require('../../../models/user');

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("rewards")
		.setDescription(
			"View all the level rewards."
		),

	async execute(interaction) {

		/**
		 * @type {EmbedBuilder}
		 * @description Rewards command's embed
		 */
		const rewardEmbed = new EmbedBuilder().setColor("#adda21");

        rewardEmbed
				.setTitle(`Level Rewards`)
				.setDescription(
					`You can obtain these rewards by reaching the level that is associated with each reward.`
				)
				.addFields(
					{ name: 'Trading/Gifting', value: 'Level 10' },
					{ name: 'Auto Water', value: 'Level 30' },
                    { name: 'Auto Harvest', value: 'Level 50' },
                    { name: '50 Plant Slots\n"Uncommon" Qualifier', value: 'Level 100' },
                    { name: '75 Plant Slots\n"Rare" Qualifier', value: 'Level 300' },
                    { name: '100 Plant Slots\n"Epic" Qualifier', value: 'Level 500' },
                    { name: '"Legendary" Qualifier', value: 'Level 1000' },
                    { name: '"Mythic" Qualifier', value: 'Level 10,000' },
				)

			// Replies to the interaction!
			await interaction.reply({
				ephemeral: true,
				embeds: [rewardEmbed],
			});

	},
};

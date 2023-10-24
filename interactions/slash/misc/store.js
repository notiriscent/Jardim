// Deconstructed the constants we need in this file.

const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const UserModel = require('../../../models/user');

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("store")
		.setDescription(
			"View the garden store."
		),

	async execute(interaction) {

		/**
		 * @type {EmbedBuilder}
		 * @description Store command's embed
		 */
		const storeEmbed = new EmbedBuilder().setColor("#adda21");

        storeEmbed
				.setTitle(`The Garden Store`)
				.setDescription(
					`Buy seeds here at the garden store.
                    Use **/buy** to buy seeds you see here.`
				)
				.addFields(
					{ name: 'Wheat Seeds\nPrice: 10$', value: '🌾', inline: true },
					{ name: 'Potato Seeds\nPrice: 30$', value: '🥔', inline: true },
                    { name: 'Carrot Seeds\nPrice: 100$', value: '🥕', inline: true },
                    { name: 'Watermelon Seeds\nPrice: 500$', value: '🍉', inline: true },
                    { name: 'Pumkin Seeds\nPrice: 3,000$', value: '🎃', inline: true },
                    { name: 'Corn Seeds\nPrice: 10,000$', value: '🌽', inline: true },
                    { name: 'Egg Plant Seeds\nPrice: 30,000$', value: '🍆', inline: true },
                    { name: 'Tomato Seeds\nPrice: 100,000$', value: '🍅', inline: true },
                    { name: 'Pineapple Seeds\nPrice: 500,000$', value: '🍍', inline: true },
				)

			// Replies to the interaction!
			await interaction.reply({
				ephemeral: true,
				embeds: [storeEmbed],
			});

	},
};

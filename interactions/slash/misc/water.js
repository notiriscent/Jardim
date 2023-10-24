// Deconstructed the constants we need in this file.

const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const UserModel = require('../../../models/user');

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("water")
		.setDescription(
			"Water your plants."
		),

	async execute(interaction) {

		/**
		 * @type {EmbedBuilder}
		 * @description Water command's embed
		 */
		const waterEmbed = new EmbedBuilder().setColor("#adda21");
		const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
		
		const userId = interactionUser.id;

		UserModel.findOne({ userId: userId })
		.then(async foundUser => {
		  if (foundUser) {
			// Increment growth of all plants
			const updatedPlants = [];
			for (const plantName in foundUser.garden.plants.plant) {
				if (foundUser.garden.plants.plant[plantName].growth >= 4) {
					updatedPlants[plantName] = {
						...foundUser.garden.plants.plant[plantName],
						growth: foundUser.garden.plants.plant[plantName].growth,
					  };
				} else if (foundUser.garden.plants.plant[plantName].growth < 4) {
					updatedPlants[plantName] = {
						...foundUser.garden.plants.plant[plantName],
						growth: foundUser.garden.plants.plant[plantName].growth + 1,
					  };
				}
			}
	  
			// Update the user's plant data with the updated plants
			foundUser.garden.plants.plant = updatedPlants;
	  
			// Save the updated user with incremented plant growth
			await foundUser.save();

			waterEmbed
				.setDescription(
					`Watered your plants!`
				)

			// Replies to the interaction!
			await interaction.reply({
				ephemeral: true,
				embeds: [waterEmbed],
			});
		  } else {
			// Tell the user to create a garden
			waterEmbed
				.setDescription(
					"Please create a garden with `/creategarden`"
			);

			// Replies to the interaction!
			await interaction.reply({
				ephemeral: true,
				embeds: [waterEmbed],
			});
		  }
		})
		.catch(error => {
		  console.error('Error searching for user:', error);
		});
	},
};

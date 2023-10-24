// Deconstructed the constants we need in this file.

const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const UserModel = require('../../../models/user');

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("rename")
		.setDescription(
			"Rename your garden."
		)
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("The new name of your garden.")
		),

	async execute(interaction) {

		/**
		 * @type {EmbedBuilder}
		 * @description Harvest command's embed
		 */
		const harvestEmbed = new EmbedBuilder().setColor("#adda21");
		const interactionUser = await interaction.guild.members.fetch(interaction.user.id);

		const userId = interactionUser.id;

		UserModel.findOne({ userId: userId })
			.then(async foundUser => {
				if (foundUser) {
                    let newName = interaction.options.getString("name");
                    foundUser.garden.name = newName
                    foundUser.save()

                    harvestEmbed
                    .setDescription(
                        `Renamed your garden to: **${newName}**`
                    );

                    // Replies to the interaction!
                    await interaction.reply({
                        ephemeral: true,
                        embeds: [harvestEmbed],
                    });


				} else {
					// Tell the user to create a garden
					harvestEmbed
						.setDescription(
							"Please create a garden with `/creategarden`"
						);

					// Replies to the interaction!
					await interaction.reply({
						ephemeral: true,
						embeds: [harvestEmbed],
					});
				}
			})
			.catch(error => {
				console.error('Error searching for user:', error);
			});

	},
};

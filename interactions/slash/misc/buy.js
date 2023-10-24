// Deconstructed the constants we need in this file.

const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const UserModel = require('../../../models/user');

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("buy")
		.setDescription(
			"Buy a seed from the garden store."
		)
        .addStringOption((option) =>
        option
            .setName("seed")
            .setDescription("Which seed you want to buy.")
            .setRequired(true)
            .addChoices(
				{ name: 'Wheat', value: '10$' },
				{ name: 'Potato', value: '30$' },
				{ name: 'Carrot', value: '100$' },
                { name: 'Watermelon', value: '500$' },
				{ name: 'Pumkin', value: '3,000$' },
				{ name: 'Corn', value: '10,000$' },
                { name: 'Egg Plant', value: '30,000$' },
				{ name: 'Tomato', value: '100,000$' },
				{ name: 'Pineapple', value: '500,000$' },
			)
        )
		.addStringOption((option) =>
        option
            .setName("quantity")
            .setDescription("How many seeds you want to buy.")
            .setRequired(true)
        ),

	async execute(interaction) {

		/**
		 * @type {EmbedBuilder}
		 * @description Garden command's embed
		 */
		const buyEmbed = new EmbedBuilder().setColor("#adda21");
		const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
		
		const userId = interactionUser.id;
		let chosenSeed = interaction.options.getString('seed');
		let seedQuantity = interaction.options.getString('quantity');

		UserModel.findOne({ userId: userId })
		.then(async foundUser => {
		  if (foundUser) {
			let seedName;

			if (chosenSeed === '10$') {
				seedName = 'Wheat';
			} else if (chosenSeed === '30$') {
				seedName = 'Potato';
			} else if (chosenSeed === '100$') {
				seedName = 'Carrot';
			} else if (chosenSeed === '500$') {
				seedName = 'Watermelon';
			} else if (chosenSeed === '3,000$') {
				seedName = 'Pumkin';
			} else if (chosenSeed === '10,000$') {
				seedName = 'Corn';
			} else if (chosenSeed === '30,000$') {
				seedName = 'Egg Plant';
			} else if (chosenSeed === '100,000$') {
				seedName = 'Tomato';
			} else if (chosenSeed === '500,000$') {
				seedName = 'Pineapple';
			} else {
				// Handle cases where the chosen value doesn't match any known seed
				console.log('Unknown seed value:', chosenSeed);
				return;
			}

			let emojis = {
				'Wheat': '🌾',
				'Potato': '🥔',
				'Carrot': '🥕',
				'Watermelon': '🍉',
				'Pumkin': '🎃',
				'Corn': '🌽',
				'Egg Plant': '🍆',
				'Tomato': '🍅',
				'Pineapple': '🍍',
				
			}

			let plantEmoji = emojis.seedName

			let seedPrice = chosenSeed.replace('$', '')
			let seedPrice2 = chosenSeed.replace(',', '')
			let intSeedPrice = parseInt(seedPrice2)

			if (foundUser.garden.creds >= intSeedPrice*seedQuantity) {

				foundUser.garden.creds -= intSeedPrice*seedQuantity

				// Add the purchased seed to the user's inventory
				const newSeed = {
					name: seedName+' Seeds',
					emoji: plantEmoji,
					quantity: seedQuantity
				};
				foundUser.garden.inventory.push(newSeed);
			
				// Save the updated user data to the database
				await foundUser.save();

				buyEmbed
					.setDescription(
						`You purchased **${seedQuantity} ${seedName}** seeds for **${intSeedPrice*seedQuantity}$**. View it with **/inventory**, or plant it with **/plant**!`
					)

				// Replies to the interaction!
				await interaction.reply({
					ephemeral: true,
					embeds: [buyEmbed],
				});
			} else {
				buyEmbed
					.setDescription(
						`You cannot afford **${seedQuantity} ${seedName}** seeds for **${intSeedPrice*seedQuantity}$**. You only have **${foundUser.garden.creds}!**`
					)

				// Replies to the interaction!
				await interaction.reply({
					ephemeral: true,
					embeds: [buyEmbed],
				});
			}
			
		  } else {
			// Tell the user to create a garden
			buyEmbed
				.setDescription(
					"Please create a garden with `/creategarden`"
			);

			// Replies to the interaction!
			await interaction.reply({
				ephemeral: true,
				embeds: [buyEmbed],
			});
		  }
		})
		.catch(error => {
		  console.error('Error searching for user:', error);
		});

	},
};

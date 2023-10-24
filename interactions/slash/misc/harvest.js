// Deconstructed the constants we need in this file.

const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const UserModel = require('../../../models/user');

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("harvest")
		.setDescription(
			"Harvest your plants."
		),

	async execute(interaction) {

		/**
		 * @type {EmbedBuilder}
		 * @description Harvest command's embed
		 */
		const harvestEmbed = new EmbedBuilder().setColor("#adda21");
		const interactionUser = await interaction.guild.members.fetch(interaction.user.id);

		const userId = interactionUser.id;
		const XP_PER_LEVEL = 100; // Amount of XP required to level up

		UserModel.findOne({ userId: userId })
			.then(async foundUser => {
				if (foundUser) {
					let levelFourPlants = 0;

					const plantStats = {
						'wheat': {
							'xp': 50,
							'creds': 10,
						},
						'potato': {
							'xp': 150,
							'creds': 30,
						},
						'carrot': {
							'xp': 500,
							'creds': 100,
						},
						'watermelon': {
							'xp': 2500,
							'creds': 500,
						},
						'pumkin': {
							'xp': 15000,
							'creds': 3000,
						},
						'corn': {
							'xp': 50000,
							'creds': 10000,
						},
						'egg plant': {
							'xp': 150000,
							'creds': 30000,
						},
						'tomato': {
							'xp': 500000,
							'creds': 100000,
						},
						'pineapple': {
							'xp': 2500000,
							'creds': 500000,
						}
					}

					let rarityMultiplyer = {
						'1': {
							'multiplyer': 1
						},
						'2': {
							'multiplyer': 2
						},
						'3': {
							'multiplyer': 3
						},
						'4': {
							'multiplyer': 4
						},
						'5': {
							'multiplyer': 5
						},
						'6': {
							'multiplyer': 6
						},
					}

					let gainedXP = 0;
					let gainedCreds = 0;

					// Reset all lvl 4 growth plants
					for (const plantName in foundUser.garden.plants.plant) {
						const plant = foundUser.garden.plants.plant[plantName];
						if (plant.growth >= 4) {
							
							let cropName = plant.name.toLowerCase()
							let rarityLvl = plant.rarity

							gainedXP += plantStats[cropName].xp
							gainedCreds += plantStats[cropName].creds

							if (rarityLvl) {
								gainedXP = gainedXP*rarityMultiplyer[rarityLvl].multiplyer
								gainedCreds = gainedCreds*rarityMultiplyer[rarityLvl].multiplyer
							}
							
							levelFourPlants++;
							plant.growth = 0;
						}
					}

					if (levelFourPlants === 0) {
						await interaction.reply({
							ephemeral: true,
							content: 'You have no plants to harvest yet! Plants are harvestable at level 4.',
						});
						return;
					}

					// Update user data with accumulated XP
					foundUser.garden.remainingXP += gainedXP;
					foundUser.garden.creds += gainedCreds

					// Calculate XP needed for next level
					const xpNeeded = XP_PER_LEVEL * foundUser.garden.level;

					// Check if the user has gained enough XP to level up
					if (foundUser.garden.remainingXP >= xpNeeded) {
						// Calculate how many levels to increase
						const levelsToIncrease = Math.floor(foundUser.garden.remainingXP / xpNeeded);

						// Level up and distribute excess XP to the new levels
						foundUser.garden.level += levelsToIncrease;
						foundUser.garden.remainingXP -= levelsToIncrease * xpNeeded;
					}

					// Save the updated user with increased plant growth, level, and remainingXP
					await foundUser.save();

					// Function to generate a progress bar
					function generateProgressBar(currentXP, requiredXP) {
						const progressBarLength = 20;
						const progress = Math.min(currentXP / requiredXP, 1);
						const progressBar = '█'.repeat(Math.floor(progressBarLength * progress)) + '░'.repeat(progressBarLength - Math.floor(progressBarLength * progress));
						return `▣ ${progressBar} ▢ (${currentXP}/${requiredXP})`;
					}

					const progressBar = generateProgressBar(foundUser.garden.remainingXP, xpNeeded);

					harvestEmbed.setTitle('Harvested your plants!')
						.setDescription(
							`You harvested ${levelFourPlants} plants and gained ${gainedXP} XP. You also got ${gainedCreds}$ creds.\n` +
							`You are now level ${foundUser.garden.level} with ${foundUser.garden.remainingXP} XP towards the next level.\n` +
							`${progressBar}`
						);

					// Replies to the interaction
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

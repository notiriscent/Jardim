// Deconstructed the constants we need in this file.

const { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const UserModel = require('../../../models/user');

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("view")
		.setDescription(
			"View someones garden."
		)
		.addStringOption((option) =>
        option
            .setName("user")
            .setDescription("The users garden you want to see.")
        ),

	async execute(interaction) {

		/**
		 * @type {EmbedBuilder}
		 * @description Garden command's embed
		 */
		const gardenEmbed = new EmbedBuilder().setColor("#adda21");
		const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
	
		const userId = interactionUser.id;
        let selectedUser = interaction.options.getString("user");

        UserModel.findOne({ userId: userId })
        .then(foundUser => {
            foundUser.garden.viewing = selectedUser
            foundUser.save()
        })

		UserModel.findOne({ username: selectedUser })
		.then(async foundUser => {
			if (foundUser) {
			  // xpNeeded
			  const xpNeeded = 100 * foundUser.garden.level;
		  
			  // Function to generate a progress bar
			  function generateProgressBar(currentXP, requiredXP) {
				const progressBarLength = 20;
				const progress = Math.min(currentXP / requiredXP, 1);
				const progressBar = '█'.repeat(Math.floor(progressBarLength * progress)) + '░'.repeat(progressBarLength - Math.floor(progressBarLength * progress));
				return `▣ ${progressBar} ▢ (${currentXP}/${requiredXP})`;
			  }
		  
			  const progressBar = generateProgressBar(foundUser.garden.remainingXP, xpNeeded);

			  foundUser.garden.page = 1
			  foundUser.save()
		  
			  // Extract plant information directly from the nested "plant" object
			  const plants = foundUser.garden.plants.plant
			  let plantLength;

			  if (plants.length < 26) {
				plantLength = plants.length;
			  } else if (plants.length > 25) {
				plantLength = 25
			  }
		  
			  const plantFields = [];
			  for (let i = 0; i < plantLength; i++) {
			  	const plant = plants[i]
				  let rarityString;
				  if (plant.rarity == 1) {
					  rarityString = 'Common'
				  } else if (plant.rarity == 2) {
					  rarityString = 'Uncommon'
				  } else if (plant.rarity == 3) {
					  rarityString = 'Rare'
				  } else if (plant.rarity == 4) {
					  rarityString = 'Epic'
				  } else if (plant.rarity == 5) {
					  rarityString = 'Legendary'
				  } else if (plant.rarity == 6) {
					  rarityString = 'Mythic'
				  }
				  if (plant.rarity) {
					  plantFields.push({ name: `${plant.name} ${plant.emoji}`, value: `Growth: ${plant.growth}\nRarity: ${rarityString}`, inline: true });
				  } else {
					  plantFields.push({ name: `${plant.name} ${plant.emoji}`, value: `Growth: ${plant.growth}`, inline: true });
				  }
			  }

			let qualifierRarity;
			let colorRarity;

			if (foundUser.garden.level > 10000) {
				qualifierRarity = `${foundUser.garden.name} **(MYTHIC)**`;
				colorRarity = `#FF69B4`
			} else if (foundUser.garden.level > 1000) {
				qualifierRarity = `${foundUser.garden.name} **(LEGENDARY)**`;
				colorRarity = `#FFFF00`
			} else if (foundUser.garden.level > 500) {
				qualifierRarity = `${foundUser.garden.name} **(EPIC)**`;
				colorRarity = `#800080`
			} else if (foundUser.garden.level > 300) {
				qualifierRarity = `${foundUser.garden.name} **(RARE)**`;
				colorRarity = `#0000FF`
			} else if (foundUser.garden.level > 100) {
				qualifierRarity = `${foundUser.garden.name} **(UNCOMMON)**`;
				colorRarity = `#00FF00`
			} else {
				qualifierRarity = `${foundUser.garden.name}`
				colorRarity = `#B2BEB5`
			}

			let pages;

			if (plants.length >= 75) {
				pages = 4
			} else if (plants.length >= 50) {
				pages = 3
			} else if (plants.length >= 25) {
				pages = 2
			} else {
				pages = 1
			}
		  
				// Show the user's garden
				gardenEmbed
					.setTitle(`${qualifierRarity}`)
					.setColor(colorRarity)
					.setDescription(
					`Grow your plants by using **/water**! Harvest your plants once they reach growth level **4**! Level up and get new perks by harvesting your plants! Buy seeds from the store by using **/store** and **/buy**! Plant them with **/plant**!\n` +
					`\nLevel: **${foundUser.garden.level}** ${progressBar}` +
					`\nCreds: **${foundUser.garden.creds}$**
					\nPage 1/${pages}
					\n**Your plants:**`
				);
		  
				// Add plant field only if there's a plant
				if (plants) {
					gardenEmbed.addFields(plantFields);
				}

				const right = new ButtonBuilder()
					.setCustomId('view_right_arrow') // Custom ID for the button
					.setLabel('▶')
					.setStyle(2)
				
				const left = new ButtonBuilder()
					.setCustomId('view_left_arrow') // Custom ID for the button
					.setLabel('◀')
					.setStyle(2)


				const row = new ActionRowBuilder()
					.addComponents(right);
			  
		  
			  // Replies to the interaction!
			  if (foundUser.garden.level >= 100) {
				if (plantLength < 25) {
					await interaction.reply({
						ephemeral: true,
						embeds: [gardenEmbed],
					});
				  } else if (plantLength >= 25) {
					await interaction.reply({
						ephemeral: true,
						embeds: [gardenEmbed],
						components: [row]
					});
				  }
			  } else {
				await interaction.reply({
					ephemeral: true,
					embeds: [gardenEmbed],
				});
			  }
			  
			} else {
				// Tell the user to create a garden
				gardenEmbed
					.setDescription(
						"That user does not have a garden."
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

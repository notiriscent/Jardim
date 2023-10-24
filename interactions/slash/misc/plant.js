// Deconstructed the constants we need in this file.

const { EmbedBuilder, SlashCommandBuilder, CommandInteractionOptionResolver, ConnectionVisibility } = require("discord.js");
const UserModel = require('../../../models/user');

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("plant")
        .setDescription("Plant a seed in your garden."),

    async execute(interaction) {
        const plantEmbed = new EmbedBuilder().setColor("#adda21");
        const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
        const userId = interactionUser.id;

        const foundUser = await UserModel.findOne({ userId: userId });

		

        if (foundUser) {

			// Create an object and arr to aggregate item quantities
			const mergedInventory = {};
			const mergedInventoryArray = [];
					
			// Loop through each item in the inventory and aggregate quantities
			for (const item of foundUser.garden.inventory) {
				const itemNameKey = item.name;
				if (mergedInventory[itemNameKey]) {
					mergedInventory[itemNameKey].quantity += item.quantity;
				} else {
					mergedInventory[itemNameKey] = {
						name: itemNameKey,
						quantity: item.quantity
					};
				}
			}
			
			// Loop through each item in the inventory and merge quantities
			for (const item of foundUser.garden.inventory) {
				const existingItemIndex = mergedInventoryArray.findIndex(
					mergedItem => mergedItem.name === item.name
				);
			
				if (existingItemIndex !== -1) {
					// If the item already exists, update its quantity
					mergedInventoryArray[existingItemIndex].quantity += item.quantity;
				} else {
					// If the item doesn't exist, add a new entry
					mergedInventoryArray.push({
						name: item.name,
						quantity: item.quantity
					});
				}
			}
			foundUser.garden.inventory = mergedInventoryArray
			
			await foundUser.save()

			let seedOptions = foundUser.garden.inventory
			.filter(item => item.name.includes("Seeds")) // Filter items with "seeds" in the name
			.map(item => ({
			  label: item.name,
			  value: item.name
			}));

			if (seedOptions.length === 0) {
				await interaction.reply({
					ephemeral: true,
					content: "You have no seeds to plant!"
				});
				return;
			}

			const quantityOptions = foundUser.garden.inventory.map(item => ({
				label: item.quantity.toString(),
				value: item.quantity.toString()
			}));

			console.log(seedOptions)
		
			await interaction.reply({
				ephemeral: true,
				content: "Choose a seed to plant:",
				components: [
					{
						type: 1,
						components: [
							{
								type: 3,
								custom_id: "seed_selection",
								options: seedOptions
							}
						]
					}
				]
			});

			try {
				const filterSeed = response => response.author.id === userId; // Change to response.author.id

				const totalSeeds = quantityOptions[0].value

				const collectedSeed = await interaction.channel.awaitMessageComponent({ filterSeed });

				const selectedSeed = collectedSeed.values[0];
			
				await interaction.editReply({
					ephemeral: true,
					content: `You selected: ${selectedSeed}`,
					components: [] // Remove the dropdown menu
				});
			
				// Now ask for the quantity
				await interaction.followUp({
					ephemeral: true,
					content: `How many seeds do you want to plant:`
				});
			

				try {

					const filterQuantity = response => response.author.id === userId;

					const collectedQuantity = await interaction.channel.awaitMessages({ filter: filterQuantity, max: 1, });
				
					const seedQuantity = parseInt(collectedQuantity.first().content);

					const plantName = selectedSeed.replace(' Seeds', '')

					const seedIndex = foundUser.garden.inventory.findIndex(item => item.name === selectedSeed);

					let plantSlots;

					if (foundUser.garden.level >= 500) {
						plantSlots = 100
					} else if (foundUser.garden.level >= 300) {
						plantSlots = 75
					} else if (foundUser.garden.level >= 100) {
						plantSlots = 50
					} else if (foundUser.garden.level < 100) {
						plantSlots = 25
					}

					let totalPlantsAfterPlanted = seedQuantity + foundUser.garden.plants.plant.length

					if (plantSlots >= totalPlantsAfterPlanted) {

						if (seedIndex !== -1 && foundUser.garden.inventory[seedIndex].quantity >= seedQuantity) {
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
							};
							let plantEmoji = emojis[plantName]; // Access the emoji based on the selectedSeed
		
							const newPlantEntries = [];
		
							for (let i = 0; i < seedQuantity; i++) {
								const newPlant = {
									name: plantName,
									rarityEmoji: '<:graycircle:1150567437251649576>',
									emoji: plantEmoji,
									rarity: 1,
									growth: 0,
								};
								newPlantEntries.push(newPlant);
							}
		
							// Add the new plant entries to the user's garden
							foundUser.garden.plants.plant.push(...newPlantEntries);
		
							// Deduct the planted seeds from the inventory
							foundUser.garden.inventory[seedIndex].quantity -= seedQuantity;
							
							if (foundUser.garden.inventory[seedIndex].quantity === 0) {
								foundUser.garden.inventory.splice(seedIndex, 1);
							}
		
							// Save the updated user data to the database
							await foundUser.save();
		
							plantEmbed.setDescription(`Planted ${seedQuantity} ${selectedSeed}`);
		
							await interaction.followUp({
								ephemeral: true,
								embeds: [plantEmbed],
								components: [], // Remove the dropdown menu after selecting
							});
						} else {
							plantEmbed.setDescription("You don't have enough of that seed.");
							await interaction.followUp({
								ephemeral: true,
								embeds: [plantEmbed],
								components: [] // Remove the dropdown menu after interaction
							});
						}

					} else if (plantSlots < totalPlantsAfterPlanted) {

						plantEmbed.setDescription(`You don't have enough plant slots.`);
		
						await interaction.followUp({
							ephemeral: true,
							embeds: [plantEmbed],
							components: [], // Remove the dropdown menu after selecting
						});

					}

					

				} catch (error) {
					console.error('Error while awaiting seed selection:', error);
				}
			
			} catch (error) {
				console.error('Error while awaiting user input:', error);
			}

        } else {
            plantEmbed.setDescription("Please create a garden with `/creategarden`");
            await interaction.reply({
				ephemeral: true,
                embeds: [plantEmbed],
            });
        }
    }
};
// Deconstructed the constants we need in this file.

const { EmbedBuilder, SlashCommandBuilder, CommandInteractionOptionResolver, ConnectionVisibility } = require("discord.js");
const UserModel = require('../../../models/user');

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("digup")
        .setDescription("Dig up a plant in your garden."),

    async execute(interaction) {
        const plantEmbed = new EmbedBuilder().setColor("#adda21");
        const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
        const userId = interactionUser.id;

        const foundUser = await UserModel.findOne({ userId: userId });

        if (foundUser) {
            const plantSet = new Set();
            const plantCounts = {};
            const plantMap = new Map();

            foundUser.garden.plants.plant.forEach(item => {
                const { name, rarity } = item;

                let string;

                if (rarity == 1) {
                    string = 'Common'
                } else if (rarity == 2) {
                    string = 'Uncommon'
                } else if (rarity == 3) {
                    string = 'Rare'
                } else if (rarity == 4) {
                    string = 'Epic'
                } else if (rarity == 5) {
                    string = 'Legendary'
                } else if (rarity == 6) {
                    string = 'Mythic'
                }

                const label = rarity ? `${name} (${string})` : name;

                // Add the plant to the Set
                plantSet.add(label);

                // If the plant name is not in the dictionary, add it with a count of 1.
                if (!plantCounts.hasOwnProperty(name)) {
                    plantCounts[name] = { total: 1, rarities: [rarity] };
                } else {
                    // Otherwise, increment the count and add the rarity to the rarities array.
                    plantCounts[name].total++;
                    if (rarity) {
                        plantCounts[name].rarities.push(rarity);
                    }
                }

                // Create separate options for each rarity
                if (rarity) {
                    if (!plantMap.has(label)) {
                        plantMap.set(label, {
                            label: label,
                            value: label,
                            rarity: rarity
                        });
                    }
                }
            });

            // Create options for plants without rarity
            plantCounts[Symbol.iterator] = function* () {
                for (let key in this) {
                    if (this[key].rarities.length === 0) {
                        yield key;
                    }
                }
            };

            for (let plant of plantCounts) {
                if (!plantMap.has(plant)) {
                    plantMap.set(plant, {
                        label: plant,
                        value: plant
                    });
                }
            }

            const seedOptions = Array.from(plantMap.values());

            if (seedOptions.length === 0) {
                await interaction.reply({
                    ephemeral: true,
                    content: "You have no plants to dig up!"
                });
                return;
            }

            const itemCounts = {};

            foundUser.garden.plants.plant.forEach(item => {

            const name = item.name;

            if (itemCounts[name]) {
                itemCounts[name]++;
            } else {
                itemCounts[name] = 1;
            }
            });

            const quantityOptions = Object.entries(itemCounts).map(([name, count]) => ({
                label: name,
                value: count,
            }));

			await interaction.reply({
				content: "Choose a plant to digup:",
                ephemeral: true,
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

				const collectedSeed = await interaction.channel.awaitMessageComponent({ filterSeed });

				const selectedPlant = collectedSeed.values[0];
			
				await interaction.editReply({
                    ephemeral: true,
					content: `You selected: ${selectedPlant}`,
					components: [] // Remove the dropdown menu
				});
			
				// Now ask for the quantity
				await interaction.followUp({
                    ephemeral: true,
					content: `How many plants do you want to dig up:`
				});
			

				try {

					const filterQuantity = response => response.author.id === userId;

					const collectedQuantity = await interaction.channel.awaitMessages({ filter: filterQuantity, max: 1, });
				
					const digQuantity = parseInt(collectedQuantity.first().content);

                    // Regular expression to match a word outside parentheses
                    const regex1 = /^([^(]+)(?:\s+\([^)]+\))?/;

                    // Use the match() method to find the word outside parentheses
                    const match1 = selectedPlant.match(regex1);

                    // Extracted word is stored in match[1]
                    const selectedPlantFirstWord = match1[1].trim(); // Use trim() to remove leading/trailing spaces

					const plantIndex = foundUser.garden.plants.plant.findIndex(item => item.name === selectedPlantFirstWord);

                    // Regular expression to match a word inside parentheses
                    const regex2 = /\((\w+)\)/;

                    // Use the match() method to find the word inside parentheses
                    const match2 = selectedPlant.match(regex2);

                    // Extracted word is stored in match[1]
                    const rarityString = match2[1];

                    // Create an object to store the count of each rarity
                    const rarityCounts = {
                        Common: 0,
                        Uncommon: 0,
                        Rare: 0,
                        Epic: 0,
                        Legendary: 0,
                        Mythic: 0,
                    };

                    foundUser.garden.plants.plant.forEach(item => {
                        const rarity = item.rarity;

                        if (rarity === 1) {
                            rarityCounts.Common++;
                        } else if (rarity === 2) {
                            rarityCounts.Uncommon++;
                        } else if (rarity === 3) {
                            rarityCounts.Rare++;
                        } else if (rarity === 4) {
                            rarityCounts.Epic++;
                        } else if (rarity === 5) {
                            rarityCounts.Legendary++;
                        } else if (rarity === 6) {
                            rarityCounts.Mythic++;
                        }
                    });

                    const realDigQuantity = rarityCounts[rarityString];

					if (plantIndex !== -1 && realDigQuantity >= digQuantity) {
	
						const removedPlantEntries = [];
	
						for (let i = 0; i < digQuantity; i++) {
							const removedPlant = {
								name: selectedPlantFirstWord
							};
							removedPlantEntries.push(removedPlant);
						}

                        const removedPlantNames = removedPlantEntries.map(entry => entry.name);

                        // Create a new array to store the plants after removal
                        const newPlantArray = [];

                        // Track the number of plants removed
                        let plantsRemoved = 0;

                        // Iterate through the existing plants and add them to the new array
                        for (const plant of foundUser.garden.plants.plant) {

                            let rarityInt;

                            if (rarityString == 'Common') {
                                rarityInt = 1
                            } else if (rarityString == 'Uncommon') {
                                rarityInt = 2
                            } else if (rarityString == 'Rare') {
                                rarityInt = 3
                            } else if (rarityString == 'Epic') {
                                rarityInt = 4
                            } else if (rarityString == 'Legendary') {
                                rarityInt = 5
                            } else if (rarityString == 'Mythic') {
                                rarityInt = 6
                            }

                            if (removedPlantNames.includes(plant.name) && rarityInt == plant.rarity && plantsRemoved < digQuantity) {
                            // Skip the plant if it's in the removal list and we haven't removed enough yet
                            plantsRemoved++;
                            continue;
                            }
                            // Add the plant to the new array
                            newPlantArray.push(plant);
                        }

                        // Update the user's plant array with the new array
                        foundUser.garden.plants.plant = newPlantArray;

                        // Save the updated user data to the database
                        await foundUser.save();
	
						plantEmbed.setDescription(`Dug up ${digQuantity} ${selectedPlant}`);
	
						await interaction.followUp({
                            ephemeral: true,
							embeds: [plantEmbed],
							components: [], // Remove the dropdown menu after selecting
						});
					} else {
						plantEmbed.setDescription("You don't have enough plants.");
						await interaction.followUp({
                            ephemeral: true,
							embeds: [plantEmbed],
							components: [] // Remove the dropdown menu after interaction
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
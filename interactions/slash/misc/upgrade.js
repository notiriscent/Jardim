// Deconstructed the constants we need in this file.
const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const UserModel = require('../../../models/user');

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("upgrade")
        .setDescription("Upgrade your plant's rarity."),

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
                    content: "You have no plants to upgrade!"
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
                content: "Choose a plant to upgrade:",
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
                    content: "It costs **10** plants for **1** plant upgraded. How many plants do you want upgraded:"
                });

                try {
                    const filterQuantity = response => response.author.id === userId;

                    const collectedQuantity = await interaction.channel.awaitMessages({ filter: filterQuantity, max: 1 });
                    const regex1 = /\(([^)]+)\)/;
                    const match1 = selectedPlant.match(regex1);

                    const rarityString = match1[1];

                    const regex2 = /^([^(]+)\s*\(/;
                    const match2 = selectedPlant.match(regex2);

                    const selectedPlantFirstWord = match2[1].trim();

                    let rarityNumber;

                    if (rarityString == 'Common') {
                        rarityNumber = 1
                    } else if (rarityString == 'Uncommon') {
                        rarityNumber = 2
                    } else if (rarityString == 'Rare') {
                        rarityNumber = 3
                    } else if (rarityString == 'Epic') {
                        rarityNumber = 4
                    } else if (rarityString == 'Legendary') {
                        rarityNumber = 5
                    } else if (rarityString == 'Mythic') {
                        rarityNumber = 6
                    }

                    const digQuantity = parseInt(collectedQuantity.first().content) * 10;     

                    const newPlants = parseInt(collectedQuantity.first().content);

                    const plantIndex = foundUser.garden.plants.plant.findIndex(item => item.name === selectedPlantFirstWord);

                    const plantsWithSelectedRarity = foundUser.garden.plants.plant.filter(plant => plant.rarity === rarityNumber);
                    const digRealQuantity = plantsWithSelectedRarity.length;

                    if (plantIndex !== -1 && digRealQuantity >= digQuantity) {
                        const existingPlants = foundUser.garden.plants.plant;
                        
                        // Filter the existing plants to get only the ones with the selected rarity
                        const plantsToUpgrade = existingPlants.filter(plant => plant.rarity === rarityNumber);
                        
                        if (plantsToUpgrade.length >= digQuantity) {
                          // Remove the specified number of plants with the selected rarity
                            let removedPlantsCount = 0;
                            foundUser.garden.plants.plant = existingPlants.filter(plant => {
                                if (plant.rarity === rarityNumber && plant.name === selectedPlantFirstWord && removedPlantsCount < digQuantity) {
                                    removedPlantsCount++;
                                    return false; // Remove the plant
                                }
                            return true; // Keep other plants
                        });
                          
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
                      
                          let plantEmoji = emojis[selectedPlantFirstWord]; // Access the emoji based on the selectedSeed
                      
                          // Define the new rarity and emoji based on your logic
                          let newRarity = rarityNumber + 1; // Example: Increase the rarity by 1
                          let newEmoji;
                      
                          if (newRarity === 2) {
                            newEmoji = '<:greencircle:1150567466943123486>';
                          } else if (newRarity === 3) {
                            newEmoji = '<:bluecircle:1150567495435030528>';
                          } else if (newRarity === 4) {
                            newEmoji = '<:purplecircle:1150567521993375865>';
                          } else if (newRarity === 5) {
                            newEmoji = '<:yellowcircle:1150567549721907222>';
                          } else if (newRarity === 6) {
                            newEmoji = '<:pinkcircle:1150567574992584755>';
                          }

                          let newRarityString
                          
                            if (newRarity == 1) {
                                newRarityString = 'Common'
                            } else if (newRarity == 2) {
                                newRarityString = 'Uncommon'
                            } else if (newRarity == 3) {
                                newRarityString = 'Rare'
                            } else if (newRarity == 4) {
                                newRarityString = 'Epic'
                            } else if (newRarity == 5) {
                                newRarityString = 'Legendary'
                            } else if (newRarity == 6) {
                                newRarityString = 'Mythic'
                            }
                      
                          // Create the upgraded plant entries
                          const newPlantEntries = [];
                          for (let i = 0; i < digQuantity/10; i++) {
                            const newPlant = {
                              name: selectedPlantFirstWord,
                              emoji: plantEmoji,
                              rarityEmoji: newEmoji,
                              rarity: newRarity,
                              growth: 0,
                            };
                            newPlantEntries.push(newPlant);
                          }
                      
                          // Add the upgraded plant entries back to the user's garden
                          foundUser.garden.plants.plant.push(...newPlantEntries);
                      
                          // Save the updated user data to the database
                          await foundUser.save();
                      
                          plantEmbed.setDescription(`Upgraded ${digQuantity/10} ${selectedPlant} to rarity ${newRarityString}`);
                          
                          await interaction.followUp({
                            ephemeral: true,
                            embeds: [plantEmbed],
                            components: [], // Remove the dropdown menu after selecting
                          });
                        } else {
                          plantEmbed.setDescription(`You don't have enough plants with rarity ${selectedRarity} to upgrade.`);
                          
                          await interaction.followUp({
                            ephemeral: true,
                            embeds: [plantEmbed],
                          });
                        }
                      } else {
                        plantEmbed.setDescription("You don't have enough of that plant!");
                        await interaction.followUp({
                          ephemeral: true,
                          embeds: [plantEmbed],
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

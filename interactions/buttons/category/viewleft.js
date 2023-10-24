/**
 * @file Sample button interaction
 * @author Naman Vrati
 * @since 3.0.0
 * @version 3.2.2
 */

const { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, User } = require("discord.js");

/**
 * @type {import('../../../typings').ButtonInteractionCommand}
 */

module.exports = {
	id: "view_left_arrow",

	async execute(interaction) {
		const UserModel = require('../../../models/user');

		const gardenEmbed = new EmbedBuilder().setColor("#adda21");

		const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
				
		const userId = interactionUser.id;

        UserModel.findOne({ userId: userId })
        .then(async foundMainUser => {
            if (foundMainUser) {
                let selectedUser = foundMainUser.garden.viewing

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

                    let currentPageIndex = foundUser.garden.page;

                    if (currentPageIndex === undefined) {
                        currentPageIndex = 1
                    }

                    currentPageIndex--
                    foundUser.garden.page = currentPageIndex

                    foundUser.save()

                    let startingIndex;
                    if (currentPageIndex == 1) {
                        startingIndex = 0
                    } else if (currentPageIndex == 2) {
                        startingIndex = 25
                    } else if (currentPageIndex == 3) {
                        startingIndex = 50
                    } else if (currentPageIndex == 4) {
                        startingIndex = 75
                    }
                
                    // Extract plant information directly from the nested "plant" object
                    const plants = foundUser.garden.plants.plant
                    let plantLength;

                    if (plants.length < startingIndex+26) {
                        plantLength = plants.length;
                    } else if (plants.length > startingIndex+25) {
                        plantLength = startingIndex+25
                    }

                    const plantFields = [];
                    for (let i = startingIndex; i < plantLength; i++) {
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
                          plantFields.push({ name: `${plant.rarityEmoji} ${plant.name} ${plant.emoji}`, value: `Growth: ${plant.growth}\nRarity: ${rarityString}`, inline: true });
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
                            \nPage ${currentPageIndex}/${pages}
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
                    
                            if (currentPageIndex == 4) {

                                const row = new ActionRowBuilder()
                                    .addComponents(left);

                                await interaction.reply({
                                    ephemeral: true,
                                    embeds: [gardenEmbed],
                                    components: [row]
                                });

                            } else if (currentPageIndex == 3) {

                                const row = new ActionRowBuilder()
                                    .addComponents(left, right);

                                await interaction.reply({
                                    ephemeral: true,
                                    embeds: [gardenEmbed],
                                    components: [row]
                                });

                            } else if (currentPageIndex == 2) {

                                const row = new ActionRowBuilder()
                                    .addComponents(left, right);

                                await interaction.reply({
                                    ephemeral: true,
                                    embeds: [gardenEmbed],
                                    components: [row]
                                });

                            } else if (currentPageIndex == 1) {

                                const row = new ActionRowBuilder()
                                    .addComponents(right);

                                await interaction.reply({
                                    ephemeral: true,
                                    embeds: [gardenEmbed],
                                    components: [row]
                                });

                            }
                    } else {
                        // Tell the user to create a garden
                        gardenEmbed
                            .setDescription(
                                "Please create a garden with `/creategarden`"
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

            } else {
				// Tell the user to create a garden
				gardenEmbed
					.setDescription(
						"Please create a garden with `/creategarden`"
					);

				// Replies to the interaction!
				await interaction.reply({
					ephemeral: true,
					embeds: [gardenEmbed],
				});
			}
        })

	},
};

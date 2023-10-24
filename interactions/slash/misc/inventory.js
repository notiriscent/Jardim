// Deconstructed the constants we need in this file.

const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const UserModel = require('../../../models/user');

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("inventory")
		.setDescription(
			"View your inventory."
		),

		async execute(interaction) {
			const inventoryEmbed = new EmbedBuilder().setColor("#adda21");
			const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
			const userId = interactionUser.id;
		
			UserModel.findOne({ userId: userId })
			.then(async foundUser => {
				if (foundUser) {
					if (foundUser.garden && foundUser.garden.inventory) {
						inventoryEmbed.setTitle("Your Inventory");
						inventoryEmbed.setDescription("View your inventory! You can use /plant to plant seeds you see here in your garden!");
		
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
		
						// Create an array to store the fields
						const inventoryFields = [];
		
						// Loop through merged items and add them as fields
						for (const mergedItemName in mergedInventory) {
							const mergedItem = mergedInventory[mergedItemName];
							inventoryFields.push({
								name: mergedItem.name,
								value: `Quantity: ${mergedItem.quantity}`,
								inline: true,
							});
						}
		
						// Add all fields to the embed using addFields method
						inventoryEmbed.addFields(...inventoryFields);
					} else {
						inventoryEmbed.setDescription("Your inventory is empty.");
					}
		
					await interaction.reply({
						ephemeral: true,
						embeds: [inventoryEmbed],
					});
				} else {
					inventoryEmbed.setDescription("Please create a garden with `/creategarden`");
		
					await interaction.reply({
						ephemeral: true,
						embeds: [inventoryEmbed],
					});
				}
			})
			.catch(error => {
				console.error('Error searching for/updating user:', error);
			});
		}
};

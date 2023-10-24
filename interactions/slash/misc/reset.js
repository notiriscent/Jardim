const UserModel = require('../../../models/user');
const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deletegarden")
    .setDescription("Deletes your garden."),
  
  async execute(interaction) {
    const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
    const userId = interactionUser.id;

    UserModel.deleteOne({ userId: userId })
      .then(() => {
        // Notify the user that their garden has been deleted.
        interaction.reply({
          content: "Your garden has been deleted.",
          ephemeral: true, // Make the reply visible only to the command author
        });
      })
      .catch(error => {
        console.error('Error deleting user garden:', error);
        interaction.reply({
          content: "An error occurred while deleting your garden.",
          ephemeral: true,
        });
      });
  },
};
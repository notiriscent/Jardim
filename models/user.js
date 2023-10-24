const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: String,
  username: String,
  garden: {
    name: String,
    creds: Number,
    level: Number,
    page: Number,
    viewing: String,
    xpNeeded: Number,
    remainingXP: Number,
    plants: {
        plant: [
          {
          name: String,
          emoji: String,
          rarityEmoji: String,
          growth: Number,
          rarity: Number,
        }
      ]
    },
    inventory: [
      {
        name: String,
        quantity: Number,
    }
    ]
  }
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;

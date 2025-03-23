const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    socialId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 100 },
    isVerified: { type: Boolean, default: false }, // ❗️ Konto musi być potwierdzone e-mailem
    verificationToken: { type: String }  // Token weryfikacyjny
});


// Zapobiega błędom związanym z unikalnymi polami w przypadku ponownych prób zapisu
userSchema.index({ email: 1, socialId: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
module.exports = User;

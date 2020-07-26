const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	pokeCollection: [
		{type: mongoose.Schema.Types.ObjectId,
			ref: "Pokemon"

		}
	],
	avatar:String

});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
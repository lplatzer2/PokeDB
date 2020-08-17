const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	userSince: {type: Date, default: Date.now},
	pokeCollection: [
		{type: mongoose.Schema.Types.ObjectId,
			ref: "Pokemon"

		}
	],
	badges:[{
		name:String,
		image:String,
		gym:String,
		date:{type:Date,default:Date.now}
	}],
	avatar:String

});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
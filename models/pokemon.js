const mongoose = require("mongoose");

const pokeSchema = new mongoose.Schema({
	name: String,
	level: Number,
	species: String,
	image: String,
	owner:{
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	}

});




module.exports = mongoose.model("Pokemon", pokeSchema);
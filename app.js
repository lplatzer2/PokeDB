const 	express 		= require("express"),
		app				= express()
		mongoose 		= require("mongoose"),
		bodyParser 		= require("body-parser"),
		axios 			= require("axios"),
		methodOverride 	= require("method-override"),
		flash			= require("connect-flash"),
		cookieParser	= require("cookie-parser"),
		passport        = require("passport"),
		LocalStrategy   = require("passport-local"),
		Pokemon         = require("./models/pokemon"),
		User            = require("./models/user");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));
mongoose.connect('mongodb://localhost/pokemon', {useNewUrlParser: true, useUnifiedTopology:true});
app.use(methodOverride('_method'));

app.use(cookieParser());

app.use(require("express-session")({
	secret: "No secrets between us",
	resave:false,
	saveUninitialized: false
}));



app.use(flash());



//PASSPORT CONFIG
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//global vars
app.use((req,res,next)=>{
	res.locals.currentUser = req.user;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	// console.log(res.locals.error);
	next();
})



app.get("/", (req,res)=>{
	res.render("index");
})

//INDEX
app.get("/pokemon", isLoggedIn,(req,res)=>{
	Pokemon.find((err, foundPoke)=>{
		if(err){
			res.send("Whoops,an error");
		}else{
			// console.log(foundPoke);
			res.render("pokemon", {pokemon:foundPoke, page:"view"});
		}
	})
	
})
//get pokemon names and images for autocomplete in new form
const pokeNames = [];
axios.get(`https://pokeapi.co/api/v2/pokemon?limit=1000`)
	.then(res=>{
		let startId = 1;
		let counter = 0;
		 res.data.results.forEach((poke,i)=>{
		 	if(i===807){
				startId = 10001;
				counter =0;
			}
		 	pokeNames.push({name:poke.name, index: counter+startId, image:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${counter+startId}.png`});
			counter++;
		 })
		 //another method
		// let mainPokeNames = res.data.results.slice(0,807);
		// let altPokeNames = res.data.results.slice(807);
		// // console.log("main are:", mainPokeNames);
		// // console.log("alts are:", altPokeNames);
		// mainPokeNames.forEach((poke,i)=>{
		// 	pokeNames.push({name:poke.name, index: i+1, image:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i+1}.png`});
		// })
		// altPokeNames.forEach((poke,i)=>{
		// 	pokeNames.push({name:poke.name, index: i+10001, image:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i+10001}.png`});
		// })

		pokeNamesAZ = pokeNames.sort((a,b)=>a.name>b.name? 1:-1);
		console.log("Done w/name call");
		  // console.log(pokeNames);
	});

//NEW
app.get("/pokemon/new", (req, res)=>{
	res.render("new", {pokeNames:pokeNamesAZ, page: "add"});
})


//CREATE
app.post("/pokemon", isLoggedIn, (req,res)=>{
	User.findById(req.user._id, (err,foundUser)=>{
		if(err || !foundUser){
			req.flash("error", "User not found.");
			res.redirect("back");
		}else{

			const reqBody = req.body.entry;

			axios.get(`https://pokeapi.co/api/v2/pokemon-form/${reqBody.species.toLowerCase()}/`).then(resp=> {
			reqBody.image = resp.data.sprites.front_default;
		// console.log(reqBody);
		
				Pokemon.create(reqBody, (err,newPoke)=>{
					if(err){
						res.render("new", {page: "add"});
					}else{
						// console.log(reqBody);
						// console.log("new poke :", newPoke);
						newPoke.owner.id = req.user._id;
						newPoke.owner.username = req.user.username;
						newPoke.save();
						foundUser.pokeCollection.push(newPoke);
						foundUser.save();
						res.redirect("/pokemon");
					}
				})
			});
		}
	})		
})

//SHOW
app.get("/pokemon/:id", isLoggedIn, (req,res)=>{
	// console.log(req.params.id);
	Pokemon.findById(req.params.id, (err,foundPoke)=>{
		if(err || !foundPoke){
			req.flash("error", "Pokemon not found.");
			res.redirect("/pokemon")
		}else{
			// console.log(foundPoke);
			 res.render("show", {pokemon:foundPoke});
		}
	})
	
})

//EDIT
app.get("/pokemon/:id/edit", isLoggedIn, isPokeOwner, (req,res)=>{
	Pokemon.findById(req.params.id, (err,foundPoke)=>{
		if(err || !foundPoke){
			req.flash("error", "Pokemon not found.");
			res.redirect("/pokemon/:id")
		}else{
			// console.log(foundPoke);
			 res.render("edit", {pokemon:foundPoke, pokeNames:pokeNames});
		}
	})

})

//UPDATE
app.put("/pokemon/:id", isLoggedIn, isPokeOwner, (req,res)=>{
	const reqBody = req.body.entry;

	axios.get(`https://pokeapi.co/api/v2/pokemon-form/${reqBody.species.toLowerCase()}/`).then(resp=> {
		reqBody.image = resp.data.sprites.front_default;
		Pokemon.findByIdAndUpdate(req.params.id, reqBody, (err,updatedPoke)=>{
			if(err){
				res.redirect("/pokemon/:id/edit");
			}else{
				res.redirect(`/pokemon/${req.params.id}`);
			}
		})
	})
})

//DELETE
app.delete("/pokemon/:id", isLoggedIn, isPokeOwner, (req,res)=>{
	Pokemon.findByIdAndRemove(req.params.id,(err)=>{
		if(err){
			res.send("error in deleting");
		}else{
			res.redirect("/pokemon");
		}
	})
})

// REGISTER
app.get("/register", (req,res)=>{
	res.render("register", {page: "register"});
})

app.post("/register", (req,res)=>{
	User.register(new User({username:req.body.username, avatar:req.body.avatar}), req.body.password, (err,user)=>{
		if(err){
			// console.log(err);
			return res.render("register", {"error": err.message, page: "register"});
		}
		passport.authenticate("local")(req,res,()=>{

			req.flash("success", `Welcome, ${user.username}!`);
			// console.log(res.locals.success);
			res.redirect(`/users/${user.username}`);
		});
	})
})

//LOGIN
app.get("/login", (req,res)=>{
	if(req.isAuthenticated()){
		res.redirect(`/users/${req.user.username}`);
	}else{
		res.render("login", {page: "login"});
	}
	
})

app.post("/login", passport.authenticate("local", {
		failureFlash:true,
		
		failureRedirect: "/login"
}),(req,res)=>{
	console.log(`current user is `,req.user.username);
	res.redirect(`users/${req.user.username}`);
})

//USER INDEX
app.get("/users/:id", isLoggedIn, (req,res)=>{
	User.findOne({username: req.params.id}).populate("pokeCollection").exec((err, foundUser)=>{
		if(err || !foundUser){
			req.flash("error", "User not found.");
			res.redirect("back");
		}else{
			// console.log(foundUser.populated("pokeCollection"));
			res.render("user",{user:foundUser, page:"profile"});
		}
	})
	

})


function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Please log in first.");
	res.redirect("/login");
}

function isPokeOwner(req,res,next){
	Pokemon.findById(req.params.id, (err, foundPoke)=>{
		if(err || !foundPoke){
			req.flash("error", "Pokemon not found.");
			res.redirect("back");
		}else{
			if(foundPoke.owner.id.equals(req.user._id)){
				return next();
			}else{
				req.flash("error", "Only the owner can modify.");
				res.redirect("back");
			}
		}
	})
}

app.get("/logout", (req,res)=>{
	req.logout();
	req.flash("success", "Successfully logged out.")
	res.redirect("/");
})




app.listen(3000, ()=>console.log("server up"));
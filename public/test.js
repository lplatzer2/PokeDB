const genMenu = document.getElementById("generation");
const nameMenu = document.getElementById("species");
const allGens = document.querySelectorAll("#species option");
const preview = document.getElementById("preview");
const pokeNames = JSON.parse(document.getElementById("data").textContent);
const previewErr = `<div class="ui icon message">
						<i class="file image outline icon"></i>
						<div class="content header">Preview image not available.</div>
					</div>`;
	console.log(  pokeNames);




// console.log(allGens);


// get all the names - done in app.js

// get list of each generation's pokemon -- DRY IT UP 

const baseURL = "https://pokeapi.co/api/v2/generation";

function getGen(genNum){
	return axios.get(`${baseURL}/${genNum}`);
}



async function getGenerations(){
	try{
		//fetch and sort generation names
		const promises = await Promise.all([getGen(1), getGen(2), getGen(3), getGen(4), getGen(5), getGen(6), getGen(7)]);
		const genSpecies = promises.map(res=>res.data.pokemon_species);
		// console.log(genSpecies);

		genSpecies.forEach(gen=>{
			gen.sort((a,b)=>a.name>b.name ? 1 : -1);
		});

		//update selection options based on generation selected
		genMenu.addEventListener("change", ()=>{
			nameMenu.textContent=""; //reset menu
		
			
			if(genMenu.value==="all"){
				
				//repopulate menu using the saved default options
				allGens.forEach(option=>nameMenu.appendChild(option));
				setPreview(allGens[0].value);
				
			}else{
				//populate menu using generation lists
				genSpecies[genMenu.value].forEach(pokemon=>{
					let option = document.createElement("option"); 
					option.setAttribute("value", `${pokemon.name}`);
					// console.log(option);
					option.textContent=`${pokemon.name.charAt(0).toUpperCase()+pokemon.name.slice(1)}`;
					nameMenu.appendChild(option);
				});

				//set default preview as first item in a generation
				//console.log(genSpecies[genMenu.value][0].name);
				setPreview(genSpecies[genMenu.value][0].name);
				

			}
	
		})

	
		//update preview when selected name changes
		nameMenu.addEventListener("change", ()=> setPreview(nameMenu.value));

		


	}catch(error){
		console.log(error);
	}

}

getGenerations();




function setPreview(target){
	const foundPoke = pokeNames.find(pokemon=>pokemon.name ===target);
	console.log(foundPoke);
	if(typeof foundPoke === "undefined"){
		preview.innerHTML=previewErr;
	}else{
		preview.innerHTML=`<img class="preview-img" src="${foundPoke.image}">`;
		document.querySelector(".preview-img").addEventListener("error", ()=>{
				preview.innerHTML=previewErr;
			});
	}
}
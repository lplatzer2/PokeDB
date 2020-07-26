const genMenu = document.getElementById("generation");
const nameMenu = document.getElementById("species");
const allGens = document.querySelectorAll("#species option");

console.log(allGens);


// get all the names - done in app.js

// get list of each generation's pokemon -- DRY IT UP 

const baseURL = "https://pokeapi.co/api/v2/generation";

function getGen1(){
	return axios.get(`${baseURL}/1`);
}
function getGen2(){
	return axios.get(`${baseURL}/2`);
}
function getGen3(){
	return axios.get(`${baseURL}/3`);
}
function getGen4(){
	return axios.get(`${baseURL}/4`);
}
function getGen5(){
	return axios.get(`${baseURL}/5`);
}
function getGen6(){
	return axios.get(`${baseURL}/6`);
}
function getGen7(){
	return axios.get(`${baseURL}/7`);
}


async function getGenerations(){
	try{
		const promises = await Promise.all([getGen1(), getGen2(), getGen3(), getGen4(), getGen5(), getGen6(), getGen7()]);
		const genSpecies = promises.map(res=>res.data.pokemon_species);

		console.log(genSpecies);

		 genSpecies.forEach(gen=>{
		 	gen.sort((a,b)=>a.name>b.name ? 1 : -1);
		 });

		genMenu.addEventListener("change", ()=>{
			nameMenu.textContent=""; //reset menu

			
			if(genMenu.value==="all"){
				//repopulate menu using the saved default options
				allGens.forEach(option=>nameMenu.appendChild(option));
			}

			//populate menu using generation lists
			genSpecies[genMenu.value].forEach(pokemon=>{
				let option = document.createElement("option"); 
				option.setAttribute("value", `${pokemon.name}`);
				// console.log(option);
				option.textContent=`${pokemon.name}`;
				nameMenu.appendChild(option);
			})
		})

	}catch(error){
		console.log(error);
	}

}

getGenerations();


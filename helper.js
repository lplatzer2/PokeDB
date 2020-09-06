const helper = {};

helper.isActive= function(currPage, target){
	if(typeof currPage !== 'undefined' && currPage === target){
		return 'active';
	}
	return '';
}

helper.chunkArr = function(arr, chunkLength){
	const chunk = [];
	let index = 0;
	while(index<arr.length){
		chunk.push(arr.slice(index,chunkLength + index));
		index +=chunkLength;
	}
	return chunk;
}



module.exports = helper;
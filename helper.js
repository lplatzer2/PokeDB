const helper = {};

helper.isActive= function(currPage, target){
	if(typeof currPage !== 'undefined' && currPage === target){
		return 'active';
	}
	return '';
}

module.exports = helper;
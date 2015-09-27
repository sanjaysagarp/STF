window.addEventListener('load', function() {

	var proposalId = document.getElementById('proposalId').value;

	if (document.getElementById('partial') !== null) {
		document.getElementById('partial').onchange = changeItems;
	}


	function changeItems() {
		var partial = document.getElementById('partial').options[document.getElementById('partial').selectedIndex].id
		console.log(partial);
		var all = document.getElementsByClassName('items-js');
		for (item in all) {
			if (all[item].classList !== undefined) {
				all[item].classList.add('hidden')
			}
		}
		var rows = document.getElementsByClassName(' ' + partial);
		for (row in rows) {
			console.log(rows[row])
			if (rows[row].classList !== undefined){
				rows[row].classList.remove('hidden');
			}
		}

		changeLink(partial);

	}
	

	function changeLink(partial) {		
		var partialLink = document.getElementById('partialLink');
		if (partialLink) {	
			if (partial == 0) {
				partialLink.href = '/partials/new/' + proposalId;
				partialLink.innerHTML = 'Create Partial';
			} else {
				partialLink.href = '/partial/' + partial + '/0';
				partialLink.innerHTML = 'Edit Partial';
			}
		}


	}


});
//adds interactivity to change the item list to the correct partial's list

window.addEventListener('load', function() {

	var proposalId = document.getElementById('proposalId').value;

	if (document.getElementById('partial') !== null) {
		document.getElementById('partial').onchange = changePartialItems;
		changePartialItems();
	}

	if (document.getElementById('supplemental') !== null) {
		document.getElementById('supplemental').onchange = changeSupplementalItems;
		changeSupplementalItems();
	}

	//changeItems();


	function changePartialItems() {
		var partial = document.getElementById('partial').options[document.getElementById('partial').selectedIndex].id
		var all = document.getElementsByClassName('items');
		for (item in all) {
			if (all[item].classList !== undefined) {
				all[item].classList.add('hidden')
			}
		}
		var rows = document.getElementsByClassName(' ' + partial);
		for (row in rows) {
			if (rows[row].classList !== undefined){
				rows[row].classList.remove('hidden');
			}
		}

		changePartialLink(partial);

	}
	

	function changePartialLink(partial) {		
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

	function changeSupplementalItems() {
		var supplemental = document.getElementById('supplemental').options[document.getElementById('supplemental').selectedIndex].id
		var all = document.getElementsByClassName('items');
		for (item in all) {
			if (all[item].classList !== undefined) {
				all[item].classList.add('hidden')
			}
		}
		var rows = document.getElementsByClassName(' ' + supplemental);
		for (row in rows) {
			if (rows[row].classList !== undefined){
				rows[row].classList.remove('hidden');
			}
		}

		changeSupplementalLink(supplemental);

	}
	

	function changeSupplementalLink(supplemental) {		
		var supplementalLink = document.getElementById('supplementalLink');
		if (supplementalLink && supplemental != 0) {	
			supplementalLink.href = '/supplemental/view/' + supplemental;
			supplementalLink.innerHTML = 'View Supplemental';
			supplementalLink.style.display = "block";
		} else {
			supplementalLink.style.display = "none";
		}
	}
});
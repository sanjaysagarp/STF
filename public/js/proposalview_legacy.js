//adds interactivity to change the item list to the correct partial's list

window.addEventListener('load', function() {

	var proposalId = document.getElementById('proposalId').value;

	if (document.getElementById('supplemental') !== null) {
		document.getElementById('supplemental').onchange = changeSupplementalItems;
		changeSupplementalItems();
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
//METRICS VOTING WOOOO!!!

//adds the interactivity for the metrics voting page

window.addEventListener('load', function() {

	//for identification
	var regId = document.getElementById('user').value;

	//set options for toast notifications
	toastr.options = {
	  "closeButton": false,
	  "debug": false,
	  "newestOnTop": true,
	  "progressBar": true,
	  "positionClass": "toast-special-voting",
	  "preventDuplicates": false,
	  "onclick": null,
	  "showDuration": "1",
	  "hideDuration": "1",
	  "timeOut": '0',
	  "extendedTimeOut": "0",
	  "showEasing": "swing",
	  "hideEasing": "linear",
	  "showMethod": "fadeIn",
	  "hideMethod": "fadeOut",
	  'timeout': '8000'
	}

	//starts the socket connection
	var socket = io();
	bindStuff();

	//binds all the interactivity to the objects
	function bindStuff() {
		var buttons = document.getElementsByClassName('vote-button');
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].onclick = sendVote;
		}
		document.getElementById('clearToasts').onclick = clearAllToasts;

		document.getElementById('removeTimer').onclick = toggleTimer;

		var inputs = document.getElementsByClassName('admin-data');
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].addEventListener('keydown', function(e) {
				if (!e) {
					var e = window.event;
				}

				if (e.keyCode == 13) {
					changeOpenAndDisplay();
				}

			}, false);
		}

		var adminButton = document.getElementById('adminButton');
		if (adminButton) {
			adminButton.onclick = changeOpenAndDisplay;
		}
	}

	//clears the toasts
	function clearAllToasts() {
		toastr.clear();
	}

	//toggle wether the toasts should auto-hide after a time period or not
	function toggleTimer() {
		var timer = document.getElementById('removeTimer').checked;
		if (timer) {
			toastr.options['timeOut'] = '8000';
			toastr.options['extendedTimeOut'] = '8000';
		} else {
			toastr.options['timeOut'] = '0';
			toastr.options['ExtendedTimeOut'] = '0';
		}
	}

	//send all the changes for proposal viewing and voting
	function changeOpenAndDisplay() {

		//takes a space seperated list of id's and breaks them by space,
		//or returns a null value for no entry
		function prepare(arr) {
			if (arr && arr.value) {
				arr = arr.value.split(' ');
				for (val in arr) {
					arr[val] = arr[val].trim();
				}
				return arr;	
			} else {
				return null;
			}
		}

		var open = prepare(document.getElementById('open'));
		var close = prepare(document.getElementById('close'));
		var display = prepare(document.getElementById('display'));
		var hide = prepare(document.getElementById('hide'));
		var clear = prepare(document.getElementById('clear'));
		
		//send relevant socket signals
		if (open || close) {
			socket.emit('changeOpen', {
				regId: regId,
				open: open,
				close: close
			});
		} if (display || hide) {
			socket.emit('changeDisplay', {
				regId: regId,
				display: display,
				hide: hide
			});
		} if (clear) {
			socket.emit('clearVotes', {
				regId: regId,
				clear: clear
			});
		}

		//clear the entries
		document.getElementById('open').value = '';
		document.getElementById('close').value = '';
		document.getElementById('display').value = '';
		document.getElementById('hide').value = '';
		document.getElementById('clear').value = '';
	}


	//send a vote on a proposal
	function sendVote() {
		proposal = this.id.substring(0, this.id.indexOf('but'));
		var value = document.getElementById(proposal).value;
		socket.emit('vote', {
			regId: regId,
			value: value,
			proposal: proposal
		});
	}


	//refresh the data on the page to reflect changes
	function refreshData() {
		var ajax = new XMLHttpRequest();
		ajax.onload = postData;
		ajax.open('POST', '/metrics/votingpartial', true);
		ajax.send();
	}


	//change the data on the page to match the received page
	function postData() {
		document.getElementById('content').innerHTML = this.responseText;
		bindStuff();
	}


	//socket responses and toasts for voting
	socket.on('response', function(data) {
		if (data.status == 'true') {
			toastr["success"]("Your vote for ID " + proposal + " was successfuly registered", "Vote Accepted")
		} else if (data.status == 'notOpen') {
			toastr["warning"]("That proposal is not open for voting", "Vote Refused")
		} else if (data.status == 'alreadyVoted') {
			toastr["warning"]('You\'ve already voted on that proposal', 'Vote Refused')
		} else if (data.status == 'notMember') {
			toastr['warning']('You are not a member of the STFC!', 'Vote Refused')
		} else {
			toastr['warning']('An unknown error has occurred', 'Unknown Error')
		}
		refreshData();
	})

	//socket data for a change in open proposals
	socket.on('openChange', function(data) {
		if (data.status == 'voteOpen') {
			toastr['info']('Proposal ' + data.proposal + ' has been opened for voting', 'Vote Opened')
		} else if (data.status == 'voteClosed') {
			if (data.value == 1) {
				toastr['info']('Proposal ' + data.proposal + ' has been closed with no votes registered.', 'Proposal Closed')
			} else {
				
				var voteCount = "";
				voteCount += data.votes[-1] + ' yay, ';
				delete data.votes[-1];
				voteCount += data.votes[-2] + ' nay';
				delete data.votes[-2];
				for (vote in data.votes) {
					voteCount += ', ' +  data.votes[vote] + ' for partial ' + vote;
				}

				if (data.value == 3) {
					toastr['info']('Proposal ' + data.proposal + ' ended in a Tie. ' + voteCount, 'Proposal Tied')
				} else if (data.value == 4) {
					toastr['success']('Proposal ' + data.proposal + ' has been Funded. ' + voteCount, 'Proposal Funded')
				} else if (data.value == 5) {
					toastr['info']('Proposal ' + data.proposal + ' has been Partially Funded under Partial ' + data.partial + '. ' + voteCount, 'Proposal Partially Funded')	
				} else if (data.value == 6) {
					toastr['error']('Proposal ' + data.proposal + ' has been Rejected. ' + voteCount, 'Proposal Not Funded')				
				}
			}
		} else if (data == 'notAdmin') {
			toastr['warning']('You are not an admin, and may not make this change', 'Change Refused')
		}
		refreshData();
	})

	//socket data for a change in display
	socket.on('displayChange', function(data) {
		if (data.status == 'displayed') {
			toastr['info']('Proposal(s) ' + data.proposals.join(', ') + ' are up for discussion', 'New Displayed Proposal(s)')
		} else if (data.status == 'hidden') {
			toastr['info']('Proposal(s) ' + data.proposals.join(', ') + ' have been hidden', 'Proposal(s) Hidden')
		}
		refreshData();
	})

	//socket data for cleared votes
	socket.on('votesClear', function(data) {
		toastr['warning']('Proposal(s) ' + data.proposals.join(', ') + ' have had their votes reset', 'Votes Cleared')
		refreshData();
	})

});




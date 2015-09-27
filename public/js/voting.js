//sidelined due to time constraints

window.addEventListener('load', function() {

	var regId = document.getElementById('user').value;

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
	  //"timeOut": "8000",
	  "timeOut": '0',
	  "extendedTimeOut": "0",
	  "showEasing": "swing",
	  "hideEasing": "linear",
	  "showMethod": "fadeIn",
	  "hideMethod": "fadeOut"
	}

	toastr.options['timeout'] = '8000';

	//starts teh socket connection
	var socket = io();
	bindStuff();

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

	function clearAllToasts() {
		toastr.clear();
	}

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

	function changeOpenAndDisplay() {

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
		document.getElementById('open').value = '';
		document.getElementById('close').value = '';
		document.getElementById('display').value = '';
		document.getElementById('hide').value = '';
		document.getElementById('clear').value = '';
	}

	function sendVote() {
		proposal = this.id.substring(0, this.id.indexOf('but'));
		var value = document.getElementById(proposal).value;
		console.log(document.getElementById('user').value)
		socket.emit('vote', {
			regId: regId,
			value: value,
			proposal: proposal
		});
	}

	function refreshData() {
		var ajax = new XMLHttpRequest();
		ajax.onload = postData;
		ajax.open('POST', '/metrics/votingpartial', true);
		ajax.send();
	}

	function postData() {
		document.getElementById('content').innerHTML = this.responseText;
		bindStuff();
	}

	socket.on('response', function(data) {
		console.log(data)
		if (data.status == 'true') {
			toastr["success"]("Vote Accepted", "Your vote for ID " + proposal + " was successfuly registered" )
		} else if (data.status == 'notOpen') {
			toastr["warning"]("Vote Refused", "That proposal is not open for voting" )
		} else if (data.status == 'alreadyVoted') {
			toastr["warning"]('Vote Refused', 'You\'ve already voted on that proposal')
		} else if (data.status == 'notMember') {
			toastr['warning']('Vote Refused', 'You are not a member of the STFC!')
		} else {
			toastr['warning']('Unknown Error', 'An unknown error has occurred')
		}
		refreshData();
	})

	socket.on('openChange', function(data) {
		console.log(data)
		if (data.status == 'voteOpen') {
			toastr['info']('Vote Opened', 'Proposal ID ' + data.proposal + ' has been opened for voting')
		} else if (data.status == 'voteClosed') {
			if (data.value == 1) {
				toastr['success']('Proposal Funded', 'Proposal ID ' + data.proposal + ' has been closed. Final Result: Funded, ' + data.yey + ' yey, ' + data.nay + ' nay, ' + data.count + ' total.')
			} else if (data.value == 0) {
				toastr['error']('Proposal Not Funded', 'Proposal ID ' + data.proposal + ' has been closed. Final Result: Not Funded, ' + data.yey + ' yey, ' + data.nay + ' nay, ' + data.count + ' total.')				
			} else if (data.value == 2) {
				toastr['info']('Proposal Tied', 'Proposal ID ' + data.proposal + ' has been closed. Final Result: Tied, ' + data.yey + ' yey, ' + data.nay + ' nay, ' + data.count + ' total.')				
			} else {
				toastr['info']('Proposal Closed', 'Proposal ID ' + data.proposal + ' has been closed with no votes registered.')
			}
		} else if (data.status == 'notAdmin') {
			toastr['warning']('Change Refused', 'You are anot an admin, and may not make this change')
		}
		refreshData();
	})

	socket.on('displayChange', function(data) {
		console.log(data)
		if (data.status == 'displayed') {
			toastr['info']('New Displayed Proposal(s)', 'Proposal(s) ' + data.proposals.join(', ') + ' are up for discussion');
		} else if (data.status == 'hidden') {
			toastr['info']('Proposal(s) Hidden', 'Proposal(s) ' + data.proposals.join(', ') + ' have been hidden')
		}
		refreshData();
	})

	socket.on('votesClear', function(data) {
		console.log(data)
		toastr['warning']('Votes Cleared', 'Proposal(s) ' + data.proposals.join(', ') + ' have had their votes reset')
		refreshData();
	})

});




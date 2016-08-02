$(document).ready(function(){

	$('#addChangeButton').on('click', function(e) {
		e.preventDefault();
		$.ajax({
				method: 'POST',
				url: "/admin/addChange",
				data: {
					permissions: $('[name="permissions"]').val(),
					netIdAddChange: $('[name="netIdAddChange"]').val()
				},
				dataType: 'json',
				success: function(data) {
					if(data) {
						if(data.message == "NetID permissions updated") {
							$("#memberNotification").css("display", "block");
							$("#memberNotification").addClass("alert alert-success");
							$("#memberNotification").html($('[name="netIdAddChange"]').val() + " permissions has been changed!");
							$("#memberNotification").fadeOut( 3000 );
						} else if (data.message == "NetID added and permissions updated") {
							$("#memberNotification").css("display", "block");
							$("#memberNotification").addClass("alert alert-success");
							$("#memberNotification").html($('[name="netIdAddChange"]').val() + " has been added with current permissions");
							$("#memberNotification").fadeOut( 3000 );
						} else if (data.message == "Enter a valid NetID") {
							$("#memberNotification").css("display", "block");
							$("#memberNotification").addClass("alert alert-danger");
							$("#memberNotification").html("Please fill out the NetID box");
							$("#memberNotification").fadeOut( 3000 );
						}
					} else {
						$("#memberNotification").css("display", "block");
						$("#memberNotification").addClass("alert alert-danger");
						$("#memberNotification").html("Something went wrong");
						$("#memberNotification").fadeOut( 3000 );
					}
					
				},
				failure: function(err) {
					console.log(err);
				}
		});
	});

	$('#changeQuarterButton').on('click', function(e) {
		e.preventDefault();
		$.ajax({
				method: 'POST',
				url: "/admin/changeQuarter",
				data: {
					quarter: $('[name="quarter"]').val()
				},
				dataType: 'json',
				success: function(data) {
					if(data) {
						$("#quarterNotification").css("display", "block");
						$("#quarterNotification").addClass("alert alert-success");
						$("#quarterNotification").html(data.message);
						$("#quarterNotification").fadeOut( 3000 );
					} else {
						$("#quarterNotification").css("display", "block");
						$("#quarterNotification").addClass("alert alert-danger");
						$("#quarterNotification").html("Something went wrong");
						$("#quarterNotification").fadeOut( 3000 );
					}
					
				},
				failure: function(err) {
					console.log(err);
				}
		});
	});

	$('#proposalChangeButton').on('click', function(e) {
		e.preventDefault();
		$.ajax({
				method: 'POST',
				url: "/admin/proposalChange",
				data: {
					proposalStatus: $('[name="proposalStatus"]').val(),
					proposalChangeYear: $('[name="proposalChangeYear"]').val(),
					proposalChangeNumber: $('[name="proposalChangeNumber"]').val()
				},
				dataType: 'json',
				success: function(data) {
					if(data) {
						if(data.message == "Proposal does not exist!") {
							$("#proposalNotification").css("display", "block");
							$("#proposalNotification").addClass("alert alert-danger");
							$("#proposalNotification").html(data.message);
							$("#proposalNotification").fadeOut( 3000 );
						} else if (data.message == "Enter a valid ProposalID") {
							$("#proposalNotification").css("display", "block");
							$("#proposalNotification").addClass("alert alert-danger");
							$("#proposalNotification").html("Enter a valid proposal year and number");
							$("#proposalNotification").fadeOut( 3000 );
						} else {
							$("#proposalNotification").css("display", "block");
							$("#proposalNotification").addClass("alert alert-success");
							$("#proposalNotification").html(data.message);
							$("#proposalNotification").fadeOut( 3000 );
						}
					} else {
						$("#proposalNotification").css("display", "block");
						$("#proposalNotification").addClass("alert alert-danger");
						$("#proposalNotification").html("Something went wrong");
						$("#proposalNotification").fadeOut( 3000 );
					}
					
				},
				failure: function(err) {
					console.log(err);
				}
		});
	});
	
	$('#userRemoveButton').on('click', function(e) {
		e.preventDefault();
		$.ajax({
				method: 'POST',
				url: "/admin/userRemove",
				data: {
					sure: $("input[type='radio'][name='sure']:checked").val(),
					netIdUserRemove: $('[name="netIdUserRemove"]').val()
				},
				dataType: 'json',
				success: function(data) {
					if(data) {
						if(data.message == "User deleted") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-success");
							$("#notification").html($('[name="netIdUserRemove"]').val() + " and relevant data has been deleted!");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Invalid NetID") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html($('[name="netIdUserRemove"]').val() + " cannot be found");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Confirm deletion") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-warning");
							$("#notification").html("Please confirm deletion");
							$("#notification").fadeOut( 3000 );
						}
					} else {
						$("#notification").css("display", "block");
						$("#notification").addClass("alert alert-danger");
						$("#notification").html("Something went wrong");
						$("#notification").fadeOut( 3000 );
					}
					
				},
				failure: function(err) {
					console.log(err);
				}
		});
	});
	
	$('#editProposalButton').on('click', function(e) {
		e.preventDefault();
		$.ajax({
				method: 'GET',
				url: "/admin/editProposal",
				data: {
					proposalEditYear: $('[name="proposalEditYear"]').val(),
					proposalEditNumber: $('[name="proposalEditNumber"]').val()
				},
				dataType: 'json',
				success: function(data) {
					if(data) {
						if(data.message == "redirect") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-success");
							$("#notification").html("redirecting...");
							$("#notification").fadeOut( 3000 );
							window.location.href = '/proposals/update/' + $('[name="proposalEditYear"]').val() + '/' + $('[name="proposalEditNumber"]').val();
						} else if (data.message == "proposal number invalid") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-warning");
							$("#notification").html("Proposal " + $('[name="proposalEditYear"]').val() + '-' + $('[name="proposalEditNumber"]').val() + " not found!");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "empty box") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-warning");
							$("#notification").html("Please enter a proposal year and number");
							$("#notification").fadeOut( 3000 );
						}
					} else {
						$("#notification").css("display", "block");
						$("#notification").addClass("alert alert-danger");
						$("#notification").html("Something went wrong");
						$("#notification").fadeOut( 3000 );
					}
					
				},
				failure: function(err) {
					console.log(err);
				}
		});
	});
	
	$('#updateSettingsButton').on('click', function(e) {
		e.preventDefault();
		$.ajax({
				method: 'POST',
				url: "/admin/updateSettings",
				data: {
					submissions: $('[name="submissions"]').prop('checked')
				},
				dataType: 'json',
				success: function(data) {
					if(data) {
						if(data.message == "updated") {
							$("#submissionNotification").css("display", "block");
							$("#submissionNotification").addClass("alert alert-success");
							$("#submissionNotification").html("Proposal settings have been updated!");
							$("#submissionNotification").fadeOut( 3000 );
						} else {
							$("#submissionNotification").css("display", "block");
							$("#submissionNotification").addClass("alert alert-danger");
							$("#submissionNotification").html("Somethings went wrong, try again.");
							$("#submissionNotification").fadeOut( 3000 );
						}
					} else {
						$("#submissionNotification").css("display", "block");
						$("#submissionNotification").addClass("alert alert-danger");
						$("#submissionNotification").html("Something went wrong");
						$("#submissionNotification").fadeOut( 3000 );
					}
					
				},
				failure: function(err) {
					console.log(err);
				}
		});
	});
	
	$('#resetYearButton').on('click', function(e) {
		e.preventDefault();
		$.ajax({
				method: 'POST',
				url: "/admin/resetYear",
				data: {
					sure: $("input[type='radio'][name='confirm']:checked").val()
				},
				dataType: 'json',
				success: function(data) {
					if(data) {
						if(data.message == "updated") {
							$("#resetNotification").css("display", "block");
							$("#resetNotification").addClass("alert alert-success");
							$("#resetNotification").html("Number has been reset to 1. Year has been set to next year");
							$("#resetNotification").fadeOut( 3000 );
							window.location.href = '/admin';
						} else {
							$("#resetNotification").css("display", "block");
							$("#resetNotification").addClass("alert alert-danger");
							$("#resetNotification").html("Please confirm the reset");
							$("#resetNotification").fadeOut( 3000 );
						}
					} else {
						$("#resetNotification").css("display", "block");
						$("#resetNotification").addClass("alert alert-danger");
						$("#resetNotification").html("Something went wrong");
						$("#resetNotification").fadeOut( 3000 );
					}
					
				},
				failure: function(err) {
					console.log(err);
				}
		});
	});
});
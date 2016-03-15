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
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-success");
							$("#notification").html($('[name="netIdAddChange"]').val() + " permissions has been changed!");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "NetID added and permissions updated") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-success");
							$("#notification").html($('[name="netIdAddChange"]').val() + " has been added with current permissions");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Enter a vald NetID") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Please fill out the NetID box");
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
					proposalId: $('[name="proposalId"]').val()
				},
				dataType: 'json',
				success: function(data) {
					if(data) {
						if(data.message == "redirect") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-success");
							$("#notification").html("redirecting...");
							$("#notification").fadeOut( 3000 );
							window.location.href = '/proposals/update/' + $('[name="proposalId"]').val();
						} else if (data.message == "proposal number invalid") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-warning");
							$("#notification").html("Proposal " + $('[name="proposalId"]').val() + " not found!");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "empty box") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-warning");
							$("#notification").html("Please enter a ProposalID");
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
});
$(document).ready(function(){

	$('#submitAwardButton').on('click', function(e) {
		e.preventDefault();
		$.ajax({
				method: 'POST',
				url: "/admin/award",
				data: {
					awardProposalId: $('[name="awardProposalId"]').val(),
					awardNotes: $('[name="awardNotes"]').val()
				},
				dataType: 'json',
				success: function(data) {
					if(data) {
						if(data.message == "Success") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-success");
							$("#notification").html("Award letter successfully created for " + $('[name="proposalId"]').val() + "!");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Proposal status is invalid") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Proposal " + $('[name="awardProposalId"]').val() + " has not been submitted / voted on");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Duplicate") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Proposal " + $('[name="awardProposalId"]').val() + " already has an award letter!");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Denial exists") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Proposal " + $('[name="awardProposalId"]').val() + " already has a denial letter!");
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
	
	$('#submitDenialButton').on('click', function(e) {
		e.preventDefault();
		$.ajax({
				method: 'POST',
				url: "/admin/denial",
				data: {
					denialProposalId: $('[name="denialProposalId"]').val(),
					denialNotes: $('[name="denialNotes"]').val()
				},
				dataType: 'json',
				success: function(data) {
					if(data) {
						if(data.message == "Success") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-success");
							$("#notification").html("Denial letter successfully created for " + $('[name="denialProposalId"]').val() + "!");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Award exists") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Proposal " + $('[name="denialProposalId"]').val() + " has an award letter!");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Duplicate") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Proposal " + $('[name="denialProposalId"]').val() + " already has a denial letter!");
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
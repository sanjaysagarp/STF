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
							$("#notification").html("Award letter successfully created for " + $('[name="awardProposalId"]').val() + "!");
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
						} else if (data.message == "Rejection exists") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Proposal " + $('[name="awardProposalId"]').val() + " already has a rejection letter!");
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
	
	$('#submitRejectionButton').on('click', function(e) {
		e.preventDefault();
		$.ajax({
				method: 'POST',
				url: "/admin/rejection",
				data: {
					rejectionProposalId: $('[name="rejectionProposalId"]').val(),
					rejectionNotes: $('[name="rejectionNotes"]').val()
				},
				dataType: 'json',
				success: function(data) {
					if(data) {
						if(data.message == "Success") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-success");
							$("#notification").html("Rejection letter successfully created for " + $('[name="rejectionProposalId"]').val() + "!");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Award exists") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Proposal " + $('[name="rejectionProposalId"]').val() + " has an award letter!");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Duplicate") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Proposal " + $('[name="rejectionProposalId"]').val() + " already has a rejection letter!");
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
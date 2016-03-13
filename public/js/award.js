$(document).ready(function(){

	$('#submitButton').on('click', function(e) {
		e.preventDefault();
		$.ajax({
				method: 'POST',
				url: "/admin/award",
				data: {
					proposalId: $('[name="proposalId"]').val()
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
							$("#notification").html("Proposal " + $('[name="proposalId"]').val() + " has not been submitted / voted on");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Duplicate") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Proposal " + $('[name="proposalId"]').val() + " already has an award letter!");
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
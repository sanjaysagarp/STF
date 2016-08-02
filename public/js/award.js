$(document).ready(function(){
	Date.prototype.toDateInputValue = (function() {
		var local = new Date(this);
		local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
		return local.toJSON().slice(0,10);
	});

	$('#qDate1').val(new Date().toDateInputValue());
	$('#qDate2').val(new Date().toDateInputValue());
	$('#qDate3').val(new Date().toDateInputValue());
	$('#aDate').val(new Date().toDateInputValue());
	$('#bDate').val(new Date().toDateInputValue());

	$("#qDate1").change(function() {
		refreshDates();
	});
	$("#qDate2").change(function() {
		refreshDates();
	});
	$("#qDate3").change(function() {
		refreshDates();
	});
	$("#aDate").change(function() {
		refreshDates();
	});
	$("#bDate").change(function() {
		refreshDates();
	});


	$('.dates').html('<li>Quarterly - ' + moment().utc().format('MMMM D[,] YYYY') + '</li><li>Quarterly - ' + moment().utc().format('MMMM D[,] YYYY') + '</li><li>Quarterly - ' + moment().utc().format('MMMM D[,] YYYY') + '</li>');

	$('.budget').html('<p>STF will create a unique budget number for this proposal upon the request of your budget coordinator in early <strong>' + moment().utc().format('MMMM YYYY') + '</strong>. Funds must be spent from this account only on items indicated in your proposal and all purchases must be made using this unique budget number. Budgets must be ready to close by May 10th of the following year.</p>')

	$('#submitAwardButton').on('click', function(e) {
		e.preventDefault();
		$.ajax({
				method: 'POST',
				url: "/admin/award",
				data: {
					awardProposalNumber: $('[name="awardProposalNumber"]').val(),
					awardProposalYear: $('[name="awardProposalYear"]').val(),
					reportType: $('[name="reportType"]').val(),
					quarterlyDate1: $('[name="quarterlyDate1"]').val(),
					quarterlyDate2: $('[name="quarterlyDate2"]').val(),
					quarterlyDate3: $('[name="quarterlyDate3"]').val(),
					annualDate: $('[name="annualDate"]').val(),
					budgetDate: $('[name="budgetDate"]').val(),
					awardNotes: $('[name="awardNotes"]').val()
				},
				dataType: 'json',
				success: function(data) {
					if(data) {
						if(data.message == "Success") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-success");
							$("#notification").html("Award letter successfully created for " +$('[name="awardProposalYear"]').val() + '-' + $('[name="awardProposalNumber"]').val() + "!");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Proposal status is invalid") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Proposal " + $('[name="awardProposalYear"]').val() + '-' + $('[name="awardProposalNumber"]').val() + " has not been submitted / voted on");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Duplicate") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Proposal " + $('[name="awardProposalYear"]').val() + '-' + $('[name="awardProposalNumber"]').val() + " already has an award letter!");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Rejection exists") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Proposal " + $('[name="awardProposalYear"]').val() + '-' + $('[name="awardProposalNumber"]').val() + " already has a rejection letter!");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Proposal not found") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Proposal not found");
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
					rejectionProposalNumber: $('[name="rejectionProposalNumber"]').val(),
					rejectionProposalYear: $('[name="rejectionProposalYear"]').val(),
					rejectionNotes: $('[name="rejectionNotes"]').val()
				},
				dataType: 'json',
				success: function(data) {
					if(data) {
						if(data.message == "Success") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-success");
							$("#notification").html("Rejection letter successfully created for " + $('[name="rejectionProposalNumber"]').val() + '-' + $('[name="rejectionProposalNumber"]').val() + "!");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Award exists") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Proposal " + $('[name="rejectionProposalNumber"]').val() + '-' + $('[name="rejectionProposalNumber"]').val() + " has an award letter!");
							$("#notification").fadeOut( 3000 );
						} else if (data.message == "Duplicate") {
							$("#notification").css("display", "block");
							$("#notification").addClass("alert alert-danger");
							$("#notification").html("Proposal " + $('[name="rejectionProposalNumber"]').val() + '-' + $('[name="rejectionProposalNumber"]').val() + " already has a rejection letter!");
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

	$('#reportType').change(function() {
		refreshDates();
	});

	function refreshDates() {
		var val = $("#reportType").val();

		if(val == 0) {
			$('.dates').html('<li>Quarterly - ' + moment($('#qDate1').val()).format('MMMM D[,] YYYY') + '</li><li>Quarterly - ' + moment($('#qDate2').val()).format('MMMM D[,] YYYY') + '</li><li>Quarterly - ' + moment($('#qDate3').val()).format('MMMM D[,] YYYY') + '</li>');
		} else if(val == 1) {
			$('.dates').html('<li>Annually - ' + moment($('#aDate').val()).format('MMMM D[,] YYYY') + '</li>');
		} else {
			$('.dates').html('<li>Quarterly - ' + moment($('#qDate1').val()).format('MMMM D[,] YYYY') + '</li><li>Quarterly - ' + moment($('#qDate2').val()).format('MMMM D[,] YYYY') + '</li><li>Quarterly - ' + moment($('#qDate3').val()).format('MMMM D[,] YYYY') + '</li><li>Annually - ' + moment($('#aDate').val()).format('MMMM D[,] YYYY'));
		}

		$('.budget').html('<p>STF will create a unique budget number for this proposal upon the request of your budget coordinator in early <strong>' + moment($('#bDate').val()).format('MMMM YYYY') + '</strong>. Funds must be spent from this account only on items indicated in your proposal and all purchases must be made using this unique budget number. Budgets must be ready to close by May 10th of the following year.</p>');
	}
});
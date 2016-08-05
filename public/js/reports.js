$(document).ready(function() {

	toastr.options = {
		"closeButton": true,
		"debug": false,
		"newestOnTop": false,
		"progressBar": false,
		"positionClass": "toast-bottom-right",
		"preventDuplicates": false,
		"onclick": null,
		"showDuration": "300",
		"hideDuration": "1000",
		"timeOut": "5000",
		"extendedTimeOut": "1000",
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "fadeIn",
		"hideMethod": "fadeOut"
	}

	$('#saveButton').click(function(e) {
		console.log("saved");
		e.preventDefault();
		var receipt = "";
		if($('input[id="receipt"]').length > 0) {
			receipt = $('input[id="receipt"]')[0].files[0];
		}
		var formData = new FormData();
		formData.append('timeline', $('[name="timeline"]').val());
		formData.append('modification', $('[name="modification"]').val());
		formData.append('risks', $('[name="risks"]').val());
		formData.append('studentUse', $('[name="studentUse"]').val());
		formData.append('budgetUse', $('[name="budgetUse"]').val());
		formData.append('financial', $('[name="financial"]').val());
		formData.append('outreach', $('[name="outreach"]').val());
		formData.append('impact', $('[name="impact"]').val());
		formData.append('sustainability', $('[name="sustainability"]').val());
		formData.append('additionalNotes', $('[name="additionalNotes"]').val());
		if($('input[id="receipt"]')[0] != undefined) {
			formData.append('receipt', $('input[id="receipt"]')[0].files[0]);
		}
		
		$.ajax({
			data: formData,
			contentType: false,
			processData: false,
			cache: false,
			method: 'POST',
			url: "/reports/update/" + $('input[name="ReportId"]').val(),
			success: function(data) {
				toastr["success"]("Successfully Updated..");
			}
		});
	});
	
	$('#submitButton').click(function(e) {
		e.preventDefault();
		var receipt = "";
		console.log("clicked");
		if($('input[id="receipt"]').length > 0) {
			receipt = $('input[id="receipt"]')[0].files[0];
		}
		var formData = new FormData();
		formData.append('timeline', $('[name="timeline"]').val());
		formData.append('modification', $('[name="modification"]').val());
		formData.append('risks', $('[name="risks"]').val());
		formData.append('studentUse', $('[name="studentUse"]').val());
		formData.append('budgetUse', $('[name="budgetUse"]').val());
		formData.append('financial', $('[name="financial"]').val());
		formData.append('outreach', $('[name="outreach"]').val());
		formData.append('impact', $('[name="impact"]').val());
		formData.append('sustainability', $('[name="sustainability"]').val());
		if($('input[id="receipt"]')[0] != undefined) {
			formData.append('receipt', $('input[id="receipt"]')[0].files[0]);
		}
		formData.append('additionalNotes', $('[name="additionalNotes"]').val());
		
		formData.append('primary-name', $('[name="primary-name"]').val());
		formData.append('primary-title', $('[name="primary-title"]').val());
		formData.append('primary-netId', $('[name="primary-netId"]').val());
		formData.append('primary-phone', $('[name="primary-phone"]').val());
		formData.append('primary-mail', $('[name="primary-mail"]').val());
		
		formData.append('budget-name', $('[name="budget-name"]').val());
		formData.append('budget-title', $('[name="budget-title"]').val());
		formData.append('budget-netId', $('[name="budget-netId"]').val());
		formData.append('budget-phone', $('[name="budget-phone"]').val());
		formData.append('budget-mail', $('[name="budget-mail"]').val());
		
		$.ajax({
			data: formData,
			contentType: false,
			processData: false,
			cache: false,
			method: 'POST',
			url: "/reports/submit/" + $('input[name="ReportId"]').val(),
			success: function(data) {
				window.location.href = '/reports/'+ $('input[name="ReportId"]').val();
			}
		});
	});
});

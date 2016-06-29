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

	$('#updateReport').on('submit', function(e) {
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
		formData.append('receipt', $('input[id="receipt"]')[0].files[0]);
		
		$.ajax({
			data: formData,
			contentType: false,
			processData: false,
			cache: false,
			method: 'POST',
			url: $('#updateReport').attr('action'),
			success: function(data) {
				toastr["success"]("Successfully Updated..");
			}
		});
	});

});

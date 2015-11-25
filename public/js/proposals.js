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

		var navListItems = $('ul.setup-panel li a');
		var allWells = $('.setup-content');

		allWells.hide();

		navListItems.click(function(e) {
				e.preventDefault();
				window.location.hash = $(this).attr('href');
				var $target = $($(this).attr('href')),
						$item = $(this).closest('li');

				if (!$item.hasClass('disabled')) {
						navListItems.closest('li').removeClass('active');
						$item.addClass('active');
						allWells.hide();
						$target.show();
				}
		});

		//brings us to the right location in the document
		//if there is no hash in the url, brings us to the itnro
		if (window.location.hash) {
			$('ul.setup-panel li a.' + window.location.hash.substring(1)).trigger('click');
		} else {
			$('ul.setup-panel li a.step-1').trigger('click');
		}


		$(".sliderMetric").on('change',function(e){
				var total = 0;
				var i=0;
				$(".sliderMetric").each(function() {
				total += parseFloat($(this).val());
				i += 1;
		});
		var average = total / i
				$("#totalScore").val(average)
		})

		//only used during the create page
		$('#title').keypress(function(e) {
			if ($(this).val().length < 10) {
				$('#create').addClass("disabled");
				$('.form-button').addClass("disabled");
			} else {
				$('#create').removeClass("disabled");
				$('.form-button').removeClass("disabled");
			}
		})


		$('#updateProposal').on('submit', function(e) {
				e.preventDefault();
				$.ajax({
						data: $('#updateProposal').serialize(),
						method: 'POST',
						url: $('#updateProposal').attr('action'),
						success: function(data) {
								toastr["success"]("Successfully Updated..");
						}
				});
		})

		$('#createItem').on('submit', function(e){
				e.preventDefault();
				$.ajax({
						data: $('#createItem').serialize(),
						method: 'POST',
						url: $('#createItem').attr('action'),
						success: function(data) {
								$('#itemsList ol').append('<li><a href="/item/' + data.item.id+'">'+
										$('#ItemName').val() + '</a></li>');
								//a(href='item/#{item.ProposalId}/#{item.ItemName}') #{item.ItemName}
								toastr["success"]("Item created Successfully.." );
								//+ JSON.stringify(data));
								$('ul.setup-panel li a[href="#step-7"]').trigger('click');
								$('#createItem')[0].reset();
						}
				});
		});

		$('.sign-btn').on('click', function(e) {
			var elem = this;
			var proposal = window.location.href;
			proposal = proposal.substring(proposal.lastIndexOf('/') + 1, proposal.indexOf('#'));
			$.ajax({
				data: {id: proposal},
				method: 'POST',
				url: '/proposal/sign',
				success: function(data) {
					if (data.message == 'SignSuccess') {
						toastr['success']('Signature Successful!');
						var par = elem.parentNode;
						elem.parentNode.innerHTML = '<span class="signed"> Signed </span> ';
						if (data.finished) {
							document.getElementById('submitProposal').classList.remove('disabled');
						}
					} else {
						toastr['warning']('Signature Failure');
					}
					
				}
			})
		})

		$('#newDepartment').on('click', function(e) {
			e.preventDefault();
			var input = document.createElement('input');
			input.type = 'text';
			input.className = 'form-control input-md';
			input.id = 'newDepartment';
			var parent = this.parentNode;
			$(this).remove();
			parent.appendChild(input);
			input.onkeydown = changeDepartment;
			input.onkeyup = changeDepartment;
		})

		function changeDepartment() {
			var option = document.getElementById('customDepartment')
			if (!option) {
				option = document.createElement('option');
				option.id = 'customDepartment';
				$('#department').prepend(option);
			}
			var custom = document.getElementById('newDepartment')
			option.setAttribute('selected', 'selected');
			option.value = custom.value
			option.innerHTML = custom.value


		}


});

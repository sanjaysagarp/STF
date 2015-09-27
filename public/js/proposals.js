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
				//console.log(e);
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
			console.log("hash noted");
			console.log('ul.setup-panel li.active a.' + window.location.hash.substring(1));
			$('ul.setup-panel li a.' + window.location.hash.substring(1)).trigger('click');
		} else {
			$('ul.setup-panel li a.step-1').trigger('click');
		}


		$(".sliderMetric").on('change',function(e){
				console.log("on Change")
				var total = 0;
				var i=0;
				$(".sliderMetric").each(function() {
						console.log("This value:" + $(this).val() )
				total += parseFloat($(this).val());
				i += 1;
		});
		console.log("total: "+total);
		console.log("i: "+i);
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


		$('#ItemName').keypress(function(e) {
			if ($(this).val().length < 6) {
				$('#addItem').addClass("disabled");
			} else {
				$('#addItem').removeClass("disabled");
			}
		});


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
								console.log("data: " );
								console.log(data);
								console.log(data.item.id);
								$('#itemsList ol').append('<li><a href="/item/' + data.item.id+'">'+
										$('#ItemName').val() + '</a></li>');
								//a(href='item/#{item.ProposalId}/#{item.ItemName}') #{item.ItemName}
								toastr["success"]("Item created Successfully.." );
								//+ JSON.stringify(data));
								$('ul.setup-panel li a[href="#step-4"]').trigger('click');
								$('#createItem')[0].reset();
								console.log("reset");
						}
				});
		});


});

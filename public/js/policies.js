$(document).ready(function() {

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
			$('ul.setup-panel li a.wi-fi').trigger('click');
		}

});


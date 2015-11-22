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
		})
});


//adds interactivity to the metrics page to drop down
//the question when the question marker is clicked

window.addEventListener('load', function() {

	var selectors = document.getElementsByClassName("selectors");

	for (var i = 0; i < selectors.length; i++) {
		selectors[i].onclick = showQuestion;
	}
/*
	//Table Row and Column Highlighting on Mouseover
	$('td').mouseover(function () {
    $(this).siblings().css('background-color', '#EEEEEE');
    var ind = $(this).index();
    $('td:nth-child(' + (ind + 1) + ')').css('background-color', '#EEEEEE');
	});
	$('td').mouseleave(function () {
    $(this).siblings().css('background-color', '');
    var ind = $(this).index();
    $('td:nth-child(' + (ind + 1) + ')').css('background-color', '');
	});
*/
	function showQuestion() {
		//hideAll();
		var qId = this.innerHTML;
		var q = document.getElementById(qId);
		if (q.className != 'selected') {
			//console.log(q.className);
			//var q = document.getElementById(qId);
			hideAll()
			q.className = "selected";
			this.style.backgroundColor = '#D9D9D9';
		} else {
			hideAll();
		}
	}

	function hideAll() {
		var questions = document.getElementsByClassName("selected");
		var selectors = document.getElementsByClassName("selectors");
		for (var i = 0; i < questions.length; i++) {
			questions[i].className = "hidden";
		} for (var i = 0; i < selectors.length; i++) {
			selectors[i].style.backgroundColor = "";
		}
	}
});
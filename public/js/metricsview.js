//adds interactivity to the metrics page to drop down
//the question when the question marker is clicked

window.addEventListener('load', function() {

	var selectors = document.getElementsByClassName("selectors");

	for (var i = 0; i < selectors.length; i++) {
		selectors[i].onclick = showQuestion;
	}

	function showQuestion() {
		hideAll();
		var qId = this.innerHTML;
		if (this.style.backgroundColor != '#EEEEEE') {
			var q = document.getElementById(qId);
			q.className = "selected";
			this.style.backgroundColor = '#EEEEEE';
		}
	}

	//TODO add column shading and double click close


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
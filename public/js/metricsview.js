window.addEventListener('load', function() {

	var selectors = document.getElementsByClassName("selectors");

	for (var i = 0; i < selectors.length; i++) {
		selectors[i].onclick = showQuestion;
	}
	console.log(selectors);

	function showQuestion() {
		hideAll();
		console.log("hello");
		var qId = this.innerHTML;
		if (this.style.backgroundColor != '#EEEEEE') {
			console.log(qId);
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
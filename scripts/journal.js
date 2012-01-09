function commentSubmit () {
	var u = $("#commname").val();
	var c = $("#commcont").val();
	var d = new Date();
	var dStr = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " ";
	dStr += d.toTimeString().substr(0,8);
	
	var params = "u=" + u + "&d=" + dStr + "&c=" + escape(c);
	Request = null;
	if (window.XMLHttpRequest)
		Request = new XMLHttpRequest();
	else if (window.ActiveXObject)
		Request = new ActiveXObject("Microsoft.XMLHTTP");
	else
		return -2;
	
	Request.open("POST", "/journal/comment/" + $(".comment input[name=entry]").val() + "/", true);
	Request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	Request.setRequestHeader("Content-length", params.length);
	Request.setRequestHeader("Connection", "close");
	Request.onreadystatechange = function () {
		if (Request.readyState == 4) {
			if (Request.status == 200) {
				Result = eval("( " + Request.responseText + " )");
				var comment = $(document.createElement("div"));
				comment.addClass("comment");
				var auth = document.createElement("h5");
				auth.innerHTML = Result.author;
				comment.append(auth);
				var time = document.createElement("span");
				time.innerHTML = Result.time;
				comment.append(time);
				var cont = document.createElement("div");
				cont.innerHTML = Result.content;
				comment.append(cont);
				
				comment.insertBefore(".comment:last");
				$("#commname").val("");
				$("#commcont").val("");
			}
		}
	};
	
	Request.send(params);
}

$("body").load( function () {
	$(".comment input[type=text], .comment textarea").focus( function (e) {
		$(e.target).css({ "background": "url(/style/img/70wt_mnt.png)", "color": "#331807" });
	}).blur( function (e) {
		$(e.target).css({ "background": "url(/style/img/40wt_mnt.png)", "color": "#BAA77F" });
	}).mouseenter( function (e) {
		$(e.target).css({ });
	}).mouseleave( function (e) {
		$(e.target).css({ });
	});
	$(".comment a").click( function (e) {
		commentSubmit();
	} );
});

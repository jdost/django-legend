var per = 25;
var sort = 1; // 1=date, 2=views
var albumURL = "";
var images = -1;

function imgSort (a, b) {
   if (sort == 1)
      return a.index - b.index;
   else if (sort == 2)
      return b.views - a.views;
}

function generatePages () {
   var num = Math.ceil(images.length/per);
   var holder = $("#pageSelect");
   holder.html("");
   for (var i = 1; i <= num; i++) {
      var l1 = document.createElement("a");
      l1.innerHTML = i.toString();
      l1.href = "javascript:;";
      $(l1).click( function () {
         fillImages(parseInt(this.innerHTML));
      } );
      holder.append(l1);
   }
   
   images = images.sort(imgSort);
}

function fillImages (page) {
   var start = per * (page-1);
   var end = per * (page);
   if (end > images.length)
      end = images.length;
   
   $("#imageField").html("");
   for (var i = start; i < end; i++) {
      var cont = document.createElement("a");
      cont.setAttribute("class", "imgContainer nyroModal");
      cont.href = images[i].main;
      cont.setAttribute("alt", images[i].caption);
      
      var sp = document.createElement("span");
      sp.innerHTML = "&nbsp;";
      $(cont).append(sp);
      
      var i1 = document.createElement("img");
      i1.src = images[i].thumb;
      
      $(cont).append(i1).nyroModal({closeButton: '<a href="#" class="nyroModalClose" id="closeBut" title="close">Close</a>'});
      $("#imageField").append(cont);
   }
}

$(document).ready( function () {
   var temp = location.pathname;
   temp = temp.split("/");
   albumURL = temp[temp.length-2];
   
   // Set up page count
   $("#albumPageCnt a").click( function () {
      per = this.innerHTML;
      $("#albumPageCnt .sel").removeClass("sel");
      $(this).addClass("sel");
      generatePages();
      fillImages(1);
   } );
   $("#albumPageCnt a:contains('" + per.toString() + "')").addClass("sel");
   
   // Set up sorting
   $("#albumSort a").click( function () {
      if (this.innerHTML == "Date")
         sort = 1;
      else if (this.innerHTML == "Views")
         sort = 2;
      else
         sort = 0;
      
      $("#albumSort .sel").removeClass("sel");
      $(this).addClass("sel");
      generatePages();
      fillImages(1);
   } );
   $("#albumSort a:contains('Date')").addClass("sel");
   
   // Call for image json
   Request = null;
   if (window.XMLHttpRequest)
      Request = new XMLHttpRequest();
   else if (window.ActiveXObject)
      Request = new ActiveXObject("Microsoft.XMLHTTP");
   else
      return -2;
   
   Request.open("GET", "/gallery/json/" + albumURL + "/", false);   
   Request.send(null);
         
   if (Request.status == 200) {
      var Result = eval("(" + Request.responseText + ")");
      images = Result.images;
   } else
      return;
   
   generatePages();
   fillImages(1);
} );

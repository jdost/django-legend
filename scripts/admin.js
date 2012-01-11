var tags = -1;
var entries = -1;
var comments = -1;

var albums = -1;
var curr = -1;
var images = -1;

function pageInit() {
   $("#adminLoginName").val("Username");
   $("#adminLoginName").focus( function () {
      $(this).css("color", "black");
      $(this).val("");
   } );
   
   $("#adminLoginPass").val("Password");
   $("#adminLoginPass").focus( function () {
      $(this).css("color", "black");
      $(this).val("");
   } ).keypress( function (e) {
      if (e.which == 13) {
         login();
         return false;
      }
   } );
   
   $("#adminLoginSubmit").click( function () {
      login();
   } );
}

function buildAdmin() {
   var i1 = document.createElement("li");
   i1.innerHTML = "journal";
   $("#nav").append(i1);
   $(i1).click( function () {
      buildJournal();
   } );
   
   var i2 = document.createElement("li");
   i2.innerHTML = "gallery";
   $("#nav").append(i2);
   $(i2).click( function () {
      buildGallery();
   } );
   
   $("#body").html("&nbsp;");
}

function buildJournal() {
   $("#sub-nav").html("");
   var d1 = document.createElement("li");
   d1.innerHTML = "new entry";
   $("#sub-nav").append(d1);
   $(d1).click( function () {
      $("#status").html("");
   
      $("#body").html("");
      
      if (tags == -1) {
         Request = null;
         if (window.XMLHttpRequest)
            Request = new XMLHttpRequest();
         else if (window.ActiveXObject)
            Request = new ActiveXObject("Microsoft.XMLHTTP");
         else
            return -2;
   
         Request.open("GET", "/admin/tags/", false);   
         Request.send(null);
         
         if (Request.status == 200) {
            var Result = eval("(" + Request.responseText + ")");
            tags = Result.tags;
         } else
            return -1;
      }
      
      var f1 = document.createElement("input");
      f1.type = "text";
      f1.value = "Entry Title";
      f1.setAttribute("id", "journalEntryTitle");
      $(f1).focus( function () {
         $(this).css("color", "black");
         if ($(this).val() == "Entry Title")
            $(this).val("");
      } );
      $("#body").append(f1);
      
      var f2 = document.createElement("input");
      f2.type = "text";
      f2.value = "tags";
      f2.setAttribute("id", "journalEntryTags");
      $(f2).focus( function () {
         if ($(this).val() == "tags")
            $(this).css("color", "black").val("");
         var s1 = document.createElement("div");
         s1.setAttribute("id", "journalTagSuggest");
         var pos = $("#journalEntryTags").offset();
         $(s1).css({top: pos.top + $("#journalEntryTags").outerHeight(),
            left: pos.left});
         $("body").append(s1);
         for (var i = 0; i < tags.length; i++) {
            var l1 = document.createElement("a");
            l1.innerHTML = tags[i];
            l1.href = "javascript:;";
            $("#journalTagSuggest").append(l1);
         }
      } ).blur( function () {
         $("#journalTagSuggest").remove();
      } ).keyup( function (e) {
         if (e.which == 13)
            $("#journalEntryTags").val($("#journalEntryTags").val() + ", ");
            
         var c = $("#journalEntryTags").val();
         if (c.lastIndexOf(",") > -1)
            c = c.slice(c.lastIndexOf(",")+2);
         $("#journalTagSuggest > a").show();
         $("#journalTagSuggest > a:not(:contains('" + c + "'))").hide();
         
         if (e.which == 13)
            return false;
      } );
      $("#body").append(f2);
      
      var f3 = document.createElement("div");
      f3.setAttribute("id", "entryEditBar");
         var e1 = document.createElement("a");
         e1.innerHTML = "B";
         $(e1).css("font-weight", "bold");
         e1.href = "javascript:;";
         $(f3).append(e1);
                  
         var e2 = document.createElement("a");
         e2.innerHTML = "I";
         $(e2).css("font-style", "italic");
         e2.href = "javascript:;";
         $(f3).append(e2);
      $("#body").append(f3);
      
      var f4 = document.createElement("textarea");
      f4.innerHTML = "Entry Content";
      f4.setAttribute("id", "journalEntry");
      $(f4).focus( function () {
         $(this).css("color", "black");
         if ($(this).html() == "Entry Content")
            $(this).html("");
      } );
      $("#body").append(f4);
      
      var f5 = document.createElement("a");
      f5.innerHTML = "Submit";
      f5.href = "javascript:;";
      f5.setAttribute("id", "journalEntrySubmit");
      $(f5).click( function () {
         $("#status").html("Submitting entry...").css("color", "yellow");
      
         Request = null;
         if (window.XMLHttpRequest)
            Request = new XMLHttpRequest();
         else if (window.ActiveXObject)
            Request = new ActiveXObject("Microsoft.XMLHTTP");
         else
            return -2;
         
         var d = new Date();
         var dStr = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " ";
         dStr += d.toTimeString().substr(0,8);
         var params = "title=" + $("#journalEntryTitle").val() + "&tags=" + $("#journalEntryTags").val() +
            "&e=" + escape($("#journalEntry").val()) + "&d=" + dStr;
   
         Request.open("POST", "/admin/submit/journal/", true);
         Request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
         Request.setRequestHeader("Content-length", params.length);
         Request.setRequestHeader("Connection", "close");
         Request.onreadystatechange = function () {
            if (Request.readyState == 4) {
               if (Request.status == 200) {
                  Result = eval("( " + Request.responseText + " )");
                  $("#status").html("Submission Successful!").css("color", "lime");
               } else {
                  $("#status").html("Submission Failed!").css("color", "red");
               }
            }
         };
   
         Request.send(params);
      } );
      $("#body").append(f5);
   } );
   
   var d2 = document.createElement("li");
   d2.innerHTML = "edit entries";
   $("#sub-nav").append(d2);
   $(d2).click( function () {
      // Get entry json
      $("#status").html("Getting entries...").css("color", "yellow");
      $("#body").html("");
      $("#body").append(loading());
      
      if (entries == -1) {
         Request = null;
         if (window.XMLHttpRequest)
            Request = new XMLHttpRequest();
         else if (window.ActiveXObject)
            Request = new ActiveXObject("Microsoft.XMLHTTP");
         else
            return -2;
   
         Request.open("GET", "/admin/entries/", false);   
         Request.send(null);
         
         if (Request.status == 200) {
            var Result = eval("(" + Request.responseText + ")");
            entries = Result.entries;
         } else {
            $("#status").html("Entries Failed!").css("color", "red");
            return -1;
         }
      }
      
      $("#status").html("Entries received!").css("color", "lime");
      
      $("#body").html("&nbsp;");
      
      var t = document.createElement("table");
      t.cellSpacing = 0;
      for (var i = 0; i < entries.length; i ++) {
         var l1 = document.createElement("tr");
         l1.setAttribute("class", (entries[i].id).toString());
            var c1 = document.createElement("td");
            c1.innerHTML = entries[i].title;
            l1.appendChild(c1);
            
            var c2 = document.createElement("td");
            c2.innerHTML = "edit";
            $(c2).click( function () {
               makeEntryEdit(parseInt($(this).parent().attr("class")));
               
            } ).css("cursor", "pointer");
            l1.appendChild(c2);
         t.appendChild(l1);
      }
      $("#body").append(t);
   } );
   
   var d3 = document.createElement("li");
   d3.innerHTML = "manage comments";
   $("#sub-nav").append(d3);
   $(d3).click( function () {
      // Get comments json
      $("#status").html("Getting comments...");
      $("#status").html("Comments received!");
      
      $("#body").html("");
      $("#body").html("Manage current comments");
   } );
}

function buildGallery() {
   $("#sub-nav").html("");
   var d1 = document.createElement("li");
   d1.innerHTML = "create album";
   $("#sub-nav").append(d1);
   $(d1).click( function () {
      $("#status").html("");

      $("#body").html("");
      
      i1 = document.createElement("input");
      i1.type = "text";
      i1.setAttribute("id", "newAlbumTitle");
      i1.value = "Album Title";
      $(i1).focus( function () {
         $(this).css("color", "black").val("");
      } );
      $("#body").append(i1);
      
      i2 = document.createElement("textarea");
      i2.setAttribute("id", "newAlbumDesc");
      i2.innerHTML = "Album Description";
      $(i2).focus( function () {
         $(this).css("color", "black").val("");
      } );
      $("#body").append(i2);
      
      i3 = document.createElement("a");
      i3.href = "javascript:;";
      i3.setAttribute("id", "newAlbumSubmit");
      i3.innerHTML = "Submit";
      $(i3).click( function () {
         $("#status").html("Submitting album...").css("color", "yellow");
      
         Request = null;
         if (window.XMLHttpRequest)
            Request = new XMLHttpRequest();
         else if (window.ActiveXObject)
            Request = new ActiveXObject("Microsoft.XMLHTTP");
         else
            return -2;
         
         var params = "title=" + $("#newAlbumTitle").val() + "&description=" + escape($("#newAlbumDesc").val());
   
         Request.open("POST", "/admin/submit/gallery/", true);
         Request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
         Request.setRequestHeader("Content-length", params.length);
         Request.setRequestHeader("Connection", "close");
         Request.onreadystatechange = function () {
            if (Request.readyState == 4) {
               if (Request.status == 200) {
                  Result = eval("( " + Request.responseText + " )");
                  $("#status").html("Submission Successful!").css("color", "lime");
               } else {
                  $("#status").html("Submission Failed!").css("color", "red");
               }
            }
         };
   
         Request.send(params);
      } );
      $("#body").append(i3);
   } );
   
   var d2 = document.createElement("li");
   d2.innerHTML = "extend album";
   $("#sub-nav").append(d2);
   $(d2).click( function () {
      // Get albums json
      $("#status").html("Getting albums...");
      
      if (albums == -1) {
         Request = null;
         if (window.XMLHttpRequest)
            Request = new XMLHttpRequest();
         else if (window.ActiveXObject)
            Request = new ActiveXObject("Microsoft.XMLHTTP");
         else
            return -2;
   
         Request.open("GET", "/admin/albums/", false);   
         Request.send(null);
         
         if (Request.status == 200) {
            var Result = eval("(" + Request.responseText + ")");
            albums = Result.albums;
         } else {
            $("#status").html("Albums Failed!").css("color", "red");
            return -1;
         }
      }
      
      $("#status").html("Albums received!").css("color", "lime");
      
      $("#body").html("&nbsp;");
      var t = document.createElement("table");
      t.cellSpacing = 0;
      t.border = 1;
      t.borderColor = "black";
      for (var i = 0; i < albums.length; i++) {
         var r = document.createElement("tr");
         r.setAttribute("class", i.toString());
            var c1 = document.createElement("td");
            c1.innerHTML = albums[i].title;
            r.appendChild(c1);
            
            var c2 = document.createElement("td");
            c2.innerHTML = "Edit Info";
            $(c2).click( function () {
               makeAlbumEdit(parseInt($(this).parent().attr("class")));
            } ).css("cursor", "pointer");
            r.appendChild(c2);
            
            var c3 = document.createElement("td");
            c3.innerHTML = "Select Cover";
            $(c3).click( function () {
               makeAlbumCover(parseInt($(this).parent().attr("class")));
            } ).css("cursor", "pointer");
            r.appendChild(c3);
            
            var c4 = document.createElement("td");
            c4.innerHTML = "Upload Images";
            $(c4).click( function () {
               makeAlbumUpload(parseInt($(this).parent().attr("class")));
            } ).css("cursor", "pointer");
            r.appendChild(c4);
         t.appendChild(r);
      }
      
      $("#body").append(t);
   } );
   
   var d3 = document.createElement("li");
   d3.innerHTML = "edit captions";
   $("#sub-nav").append(d3);
   $(d3).click( function () {
      // Get album image json
      $("#status").html("Getting albums...");
      
      if (albums == -1) {
         Request = null;
         if (window.XMLHttpRequest)
            Request = new XMLHttpRequest();
         else if (window.ActiveXObject)
            Request = new ActiveXObject("Microsoft.XMLHTTP");
         else
            return -2;
   
         Request.open("GET", "/admin/albums/", false);   
         Request.send(null);
         
         if (Request.status == 200) {
            var Result = eval("(" + Request.responseText + ")");
            albums = Result.albums;
         } else {
            $("#status").html("Albums Failed!").css("color", "red");
            return -1;
         }
      }
      
      $("#status").html("Albums received!").css("color", "lime");
            
      $("#body").html("&nbsp;");
      curr = -1;
      
      var l = document.createElement("ul");
      l.setAttribute("id", "captHead");
      for (i = 0; i < albums.length; i++) {
         var li = document.createElement("li");
         li.innerHTML = albums[i].title;
         li.alt = i.toString();
         $(li).click( function () {
            curr = parseInt(this.alt);
            populateCTable(albums[curr]);
            $(".captHigh").removeClass("captHigh");
            $(this).addClass("captHigh");
         } );
         l.appendChild(li);
      }
      $("#body").append(l);
      
      var t = document.createElement("table");
      t.setAttribute("id", "captTable");
      t.cellSpacing = 0;
      $("#body").append(t);
      
      var a = document.createElement("a");
      a.innerHTML = "Update Captions";
      a.setAttribute("id", "captUpdate");
      a.href = "javascript:;";
      $(a).click( function () {
         if (curr == -1)
            return -1;
         
         $("#status").html("Submitting new Captions...").css("color", "yellow");
         
         Request = null;
         if (window.XMLHttpRequest)
            Request = new XMLHttpRequest();
         else if (window.ActiveXObject)
            Request = new ActiveXObject("Microsoft.XMLHTTP");
         else
            return -2;
   
         var params = "id=" + (curr+1).toString();;
         var capts = $("#captTable textarea");
         for (var i = 0; i < capts.length; i++) {
            var c = $(capts.get(i));
            if (c.val() != "")
               params += "&" + c.attr("name") + "&caption=" + escape(c.val());
         }
   
         Request.open("POST", "/admin/submit/gallery/", false);
         Request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
         Request.setRequestHeader("Content-length", params.length);
         Request.setRequestHeader("Connection", "close");   
         
         Request.send(params);
         
         if (Request.status == 200) {
            var Result = eval("(" + Request.responseText + ")");
         } else {
            $("#status").html("Captions Failed!").css("color", "red");
            return -1;
         }
         
         $("#status").html("Captions Succeeded!").css("color", "lime");
      } );
      $("#body").append(a);
   } );
}

function makeEntryEdit (eNum) {
   $("#status").html("Getting Entry...").css("color", "yellow");
   
   var Request = null;
   if (window.XMLHttpRequest)
      Request = new XMLHttpRequest();
   else if (window.ActiveXObject)
      Request = new ActiveXObject("Microsoft.XMLHTTP");
   else
      return -2;

   Request.open("GET", "/admin/entry/" + eNum.toString(), false);
   Request.send(null);

   if (Request.status == 200) {
      var Result = eval("(" + Request.responseText + ")");
      entry = Result;
   } else {
      $("#status").html("Entry Failed!").css("color", "red");
      return -1;
   }
   
   $("#status").html("Entry Succeeded!").css("color", "lime");
   
   var bg = document.createElement("div");
   bg.innerHTML = "&nbsp;";
   bg.setAttribute("id", "modalBG");
   $("body").append(bg);
   
   scroll(0,0);
   $("body").css("overflow", "hidden");
   
   var holder = document.createElement("div");
   holder.setAttribute("id", "modalMain");
   $(bg).append(holder);
      
   var close = document.createElement("a");
   close.innerHTML = "&times;";
   close.setAttribute("id", "modalClose");
   $(close).click( function () {
      $("body").css("overflow", "visible");
      $("#modalBG").remove();
   } );
   $(holder).append(close);

      if (tags == -1) {
         Request = null;
         if (window.XMLHttpRequest)
            Request = new XMLHttpRequest();
         else if (window.ActiveXObject)
            Request = new ActiveXObject("Microsoft.XMLHTTP");
         else
            return -2;
   
         Request.open("GET", "/admin/tags/", false);   
         Request.send(null);
         
         if (Request.status == 200) {
            var Result = eval("(" + Request.responseText + ")");
            tags = Result.tags;
         } else
            return -1;
      }
      
      var f1 = document.createElement("input");
      f1.type = "text";
      f1.value = entry.title;
      f1.setAttribute("id", "journalEntryTitle");
      $(f1).focus( function () {
         $(this).css("color", "black").val("");
      } );
      $("#modalMain").append(f1);
      
      var f2 = document.createElement("input");
      f2.type = "text";
      f2.value = "";
      for (var i = 0; i < entry.tags.length; i++)
         f2.value += entry.tags[i] + ", ";
      f2.setAttribute("id", "journalEntryTags");
      $(f2).focus( function () {
         if ($(this).val() == "tags")
            $(this).css("color", "black").val("");
         var s1 = document.createElement("div");
         s1.setAttribute("id", "journalTagSuggestModal");
         var pos = $("#journalEntryTags").offset();
         $(s1).css({top: pos.top + $("#journalEntryTags").outerHeight(),
            left: pos.left});
         $("body").append(s1);
         for (var i = 0; i < tags.length; i++) {
            var l1 = document.createElement("a");
            l1.innerHTML = tags[i];
            l1.href = "javascript:;";
            $("#journalTagSuggestModal").append(l1);
         }
      } ).blur( function () {
         $("#journalTagSuggestModal").remove();
      } ).keyup( function (e) {
         if (e.which == 13)
            $("#journalEntryTags").val($("#journalEntryTags").val() + ", ");
            
         var c = $("#journalEntryTags").val();
         if (c.lastIndexOf(",") > -1)
            c = c.slice(c.lastIndexOf(",")+2);
         $("#journalTagSuggestModal > a").show();
         $("#journalTagSuggestModal > a:not(:contains('" + c + "'))").hide();
         
         if (e.which == 13)
            return false;
            return false;
      } );
      $("#modalMain").append(f2);
      
      var f3 = document.createElement("div");
      f3.setAttribute("id", "entryEditBar");
         var e1 = document.createElement("a");
         e1.innerHTML = "B";
         $(e1).css("font-weight", "bold");
         e1.href = "javascript:;";
         $(f3).append(e1);
                  
         var e2 = document.createElement("a");
         e2.innerHTML = "I";
         $(e2).css("font-style", "italic");
         e2.href = "javascript:;";
         $(f3).append(e2);
      $("#modalMain").append(f3);
      
      var f4 = document.createElement("textarea");
      f4.innerHTML = entry.content;
      f4.setAttribute("id", "journalEntry");
      $("#modalMain").append(f4);
      
      var f5 = document.createElement("a");
      f5.innerHTML = "Submit";
      f5.href = "javascript:;";
      f5.setAttribute("id", "journalEntrySubmit");
      f5.setAttribute("class", eNum.toString());
      $(f5).click( function () {
         $("#status").html("Submitting entry...").css("color", "yellow");
      
         Request = null;
         if (window.XMLHttpRequest)
            Request = new XMLHttpRequest();
         else if (window.ActiveXObject)
            Request = new ActiveXObject("Microsoft.XMLHTTP");
         else
            return -2;
         
         var params = "title=" + $("#journalEntryTitle").val() + "&tags=" + $("#journalEntryTags").val() +
            "&e=" + escape($("#journalEntry").val());
   
         Request.open("POST", "/admin/submit/journal/" + this.getAttribute("class"), true);
         Request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
         Request.setRequestHeader("Content-length", params.length);
         Request.setRequestHeader("Connection", "close");
         Request.onreadystatechange = function () {
            if (Request.readyState == 4) {
               if (Request.status == 200) {
                  Result = eval("( " + Request.responseText + " )");
                  $("#status").html("Submission Successful!").css("color", "lime");
                  $("#modalBG").remove();
               } else {
                  $("#status").html("Submission Failed!").css("color", "red");
               }
            }
         };
   
         Request.send(params);
      } );
      $("#modalMain").append(f5);
   
}

function makeAlbumEdit (aNum) {
   var tgt = albums[aNum];
   
   var bg = document.createElement("div");
   bg.innerHTML = "&nbsp;";
   bg.setAttribute("id", "modalBG");
   $("body").append(bg);
   
   var holder = document.createElement("div");
   holder.setAttribute("id", "modalMain");
   $(bg).append(holder);
      
   var close = document.createElement("a");
   close.innerHTML = "&times;";
   close.setAttribute("id", "modalClose");
   $(close).click( function () {
      $("#modalBG").remove();
   } );
   $(holder).append(close);
   
      var i1 = document.createElement("input");
      i1.type = "text";
      i1.setAttribute("id", "editAlbumTitle");
      i1.value = tgt.title;
      $(holder).append(i1);
      
      var i2 = document.createElement("textarea");
      i2.setAttribute("id", "editAlbumDesc");
      i2.innerHTML = tgt.description;
      $(holder).append(i2);
      
      var i3 = document.createElement("a");
      i3.innerHTML = "Submit";
      i3.setAttribute("id", "editAlbumSubmit");
      $(i3).click( function () {
         $("#status").html("Submitting album...").css("color", "yellow");
      
         Request = null;
         if (window.XMLHttpRequest)
            Request = new XMLHttpRequest();
         else if (window.ActiveXObject)
            Request = new ActiveXObject("Microsoft.XMLHTTP");
         else
            return -2;
         
         var params = "id=" + (aNum+1) + "&title=" + $("#editAlbumTitle").val() + "&description=" + escape($("#editAlbumDesc").val());
   
         Request.open("POST", "/admin/submit/gallery/", true);
         Request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
         Request.setRequestHeader("Content-length", params.length);
         Request.setRequestHeader("Connection", "close");
         Request.onreadystatechange = function () {
            if (Request.readyState == 4) {
               if (Request.status == 200) {
                  Result = eval("( " + Request.responseText + " )");
                  $("#status").html("Submission Successful!").css("color", "lime");
               } else {
                  $("#status").html("Submission Failed!").css("color", "red");
               }
            }
         };
   
         Request.send(params);
      } );
      $(holder).append(i3);
}

function makeAlbumCover (aNum) {
   var tgt = albums[aNum];
      
   var bg = document.createElement("div");
   bg.innerHTML = "&nbsp;";
   bg.setAttribute("id", "modalBG");
   $("body").append(bg);
      
   var holder = document.createElement("div");
   holder.setAttribute("id", "modalMain");
   $(bg).append(holder);
      
   var close = document.createElement("a");
   close.innerHTML = "&times;";
   close.setAttribute("id", "modalClose");
   $(close).click( function () {
      $("#modalBG").remove();
      images = -1;
   } );
   $(holder).append(close);
   
   Request = null;
   if (window.XMLHttpRequest)
      Request = new XMLHttpRequest();
   else if (window.ActiveXObject)
      Request = new ActiveXObject("Microsoft.XMLHTTP");
   else
      return -2;
   
   Request.open("GET", "/admin/album/" + tgt.url, false);   
   Request.send(null);
   
   if (Request.status == 200) {
      var Result = eval("(" + Request.responseText + ")");
      images = Result.imgs;
   } else {
      $("#modalBG").remove();
      $("#status").html("Error Occurred!").css("color", "red");
      return -1;
   }
   
   var sel = document.createElement("select");
   sel.setAttribute("id", "chooseSrcAlbum");
   sel.size = 20;
   for (var i = 0; i < images.length; i++) {
      var opt = document.createElement("option");
      opt.innerHTML = images[i].url.split(">")[0];
      sel.appendChild(opt);
   }
   $(sel).click( function () {
      var srcImg = images[this.selectedIndex];
      document.getElementById("preview").src = srcImg.loc + srcImg.url;
   } );
   $("#modalMain").append(sel);
   
   var a = document.createElement("a");
   a.innerHTML = "Crop";
   a.setAttribute("id", "cropImg");
   $(a).click( function () {
      //
   } );
   $("#modalMain").append(a);
   
   var pvw = document.createElement("img");
   pvw.setAttribute("id", "preview");
   $("#modalMain").append(pvw);
}

function makeAlbumUpload (aNum) {
   var tgt = albums[aNum];
   
   var bg = document.createElement("div");
   bg.innerHTML = "&nbsp;";
   bg.setAttribute("id", "modalBG");
   $("body").append(bg);
   
   var holder = document.createElement("div");
   holder.setAttribute("id", "modalMain");
   $(bg).append(holder);
      
   var close = document.createElement("a");
   close.innerHTML = "&times;";
   close.setAttribute("id", "modalClose");
   $(close).click( function () {
      $("#modalBG").remove();
   } );
   $(holder).append(close);
   
      var frame = document.createElement("iframe");
      frame.setAttribute("id", "uploadIframe");
      frame.setAttribute("name", "uploadIframe");
      $(frame).css({ visibility: "hidden", width: "0px", height: "0px", border: "0px solid white" })
      $("#modalMain").append(frame);
   
      var f = document.createElement("form");
      f.setAttribute("id", "editAlbumSend");
      f.method = "post";
      f.enctype = "multipart/form-data";
      f.action = "/admin/submit/gallery/";
      f.target = "uploadIframe";
   
      var i1 = document.createElement("input");
      i1.type = "file";
      i1.name = "upload";
      i1.setAttribute("id", "editAlbumUpload");
      $(f).append(i1);
      
      var i2 = document.createElement("input");
      i2.type = "hidden";
      i2.name = "id";
      i2.value = aNum;
      $(f).append(i2);
      
      $(holder).append(f);
      
      var i3 = document.createElement("a");
      i3.innerHTML = "Submit";
      i3.setAttribute("id", "editAlbumSubmit");
      $(i3).click( function () {
         document.getElementById("editAlbumSend").submit();
      } );
      $(holder).append(i3);
}

function populateCTable (srcAlbum) {
   $("#status").html("Getting images...").css("color", "yellow");
   
   Request = null;
   if (window.XMLHttpRequest)
      Request = new XMLHttpRequest();
   else if (window.ActiveXObject)
      Request = new ActiveXObject("Microsoft.XMLHTTP");
   else
      return -2;
   
   Request.open("GET", "/admin/album/" + srcAlbum.url, false);   
   Request.send(null);
   
   if (Request.status == 200) {
      var Result = eval("(" + Request.responseText + ")");
      images = Result.imgs;
   } else {
      $("#modalBG").remove();
      $("#status").html("Images failed!").css("color", "red");
      return -1;
   }
   
   $("#status").html("Images received!").css("color", "lime");
   
   var t = $("#captTable");
   t.html("");
   var tr1 = document.createElement("tr");      var cnt1 = 0;
   var tr2 = document.createElement("tr");
   for (var i = 0; i < images.length; i ++) {
      var td1 = document.createElement("td");
      var td2 = document.createElement("td");
      
      var thumb = document.createElement("img");
      thumb.src = images[i].loc + "thumbs/" + images[i].url;
      td1.appendChild(thumb);
      
      var capt = document.createElement("textarea");
      capt.innerHTML = images[i].caption;
      capt.name = "img=" + (i+1).toString();
      td2.appendChild(capt);
      
      tr1.appendChild(td1);
      tr2.appendChild(td2);
      
      cnt1++;
      if (cnt1 == 5) {
         t.append(tr1);
         t.append(tr2);
         
         var tr1 = document.createElement("tr");
         var tr2 = document.createElement("tr");
         
         cnt1 = 0;
      }
   }
   if (tr1.innerHTML.length > 0) {
      t.append(tr1);
      t.append(tr2);
   }
}

function login() {
   $("#status").html("Logging in...").css("color", "yellow");
   Request = null;
   if (window.XMLHttpRequest)
      Request = new XMLHttpRequest();
   else if (window.ActiveXObject)
      Request = new ActiveXObject("Microsoft.XMLHTTP");
   else
      return -2;
   
   var params = "name=" + $("#adminLoginName").val() + "&pass=" + $("#adminLoginPass").val();
   
   Request.open("POST", "/admin/login/", true);
   Request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   Request.setRequestHeader("Content-length", params.length);
   Request.setRequestHeader("Connection", "close");
   Request.onreadystatechange = function () {
      if (Request.readyState == 4) {
         if (Request.status == 200) {
            Result = eval("( " + Request.responseText + " )");
            if (Result.login) {
               buildAdmin();
               $("#status").html("Login Successful!").css("color", "lime");
            } else {
               $("#status").html("Login Failed!").css("color", "red");
            }
         }
      }
   };
   
   Request.send(params);
}

function loading () {
   var e = document.createElement("img");
   e.src = "/style/img/ajax-loader.gif";
   e.setAttribute("id", "adminLoading");
   return e;
}

$(document).ready(function () {
   pageInit();
});

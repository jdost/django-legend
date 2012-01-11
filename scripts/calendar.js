var months = new Array("jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec");

function grabMonth(m, y) {
   if (y <= 2007 && m <= 12)
      return new Array();   
   // Make XML call, eval JSON into buildTable()
   var URL = "/data/cal/" + m.toString() + "/" + y.toString() + "/";
    
    Request = null;
   if (window.XMLHttpRequest)
      Request = new XMLHttpRequest();
   else if (window.ActiveXObject)
      Request = new ActiveXObject("Microsoft.XMLHTTP");
   else
      return new Array();
   
   Request.onreadystatechange = function () {
      if (Request.readyState == 4) {
         if (Request.status == 200) {
                var data = eval("(" + Request.responseText + ")");
            cal.genGrid(data.Dates);
         } else
            return new Array();
      } else
         return new Array();
   };
   
   Request.open("GET", URL, true);
   Request.send(null);
}

function Calendar () {
    this.obj = -1;
    this.month = -1;
    this.year = -1;
    this.controls = new Array();
    this.grid = -1;
    
    this.init= function (obj) {
        var d = new Date();
        this.month = d.getMonth();
        this.year = d.getFullYear();
        
        this.obj = obj;
        this.obj.attr("cellspacing", "0").attr("cellpadding", "0");
        
        var ctrls = document.createElement("table");
        $(ctrls).addClass("controls").attr("cellspacing", "0").attr("cellpadding", "0");
        
        var t = document.createElement("tr");
        var c = document.createElement("td");
        c.innerHTML = "&Lambda;";
        t.appendChild(c);
        $(c).click( function () {
            cal.year -= 1;
            cal.month = 11;
            cal.reqGrid();
            
            $(".controls td:last").attr("title", (cal.year+1).toString());
            $(".controls td:first").attr("title", (cal.year-1).toString());
        } ).attr("title", (this.year -1).toString());
        ctrls.appendChild(t);
        
        for (var i = 0; i < 12; i++) {
            var t = document.createElement("tr");
            var c = document.createElement("td");
            c.innerHTML = months[i];
            t.appendChild(c);
            ctrls.appendChild(t);
            
            this.controls.push($(c));
            this.controls[i].click( function () {
                var n = this.innerHTML;
                for (var i = 0; i < 12; i++) {
                    if (n == months[i])
                        break;
                }
                cal.month = i;
                cal.reqGrid();
            } ).addClass("month-jump");
        }
        
        var t = document.createElement("tr");
        var c = document.createElement("td");
        c.innerHTML = "V";
        t.appendChild(c);
        $(c).click( function () {
            cal.year += 1;
            cal.month = 0;
            cal.reqGrid();
            
            $(".controls td:last").attr("title", (cal.year+1).toString());
            $(".controls td:first").attr("title", (cal.year-1).toString());
        } ).attr("title", (this.year+1).toString());
        ctrls.appendChild(t);
        this.controls[this.month].addClass("current");
        
        var t = document.createElement("tr");
        var c = document.createElement("td");
        t.appendChild(c);
        c.appendChild(ctrls);
        
        var c = document.createElement("td");
        $(c).css({"width": "100%", "height": "100%"});
        var g = document.createElement("table");
        c.appendChild(g);
        
        this.grid = $(g);
        t.appendChild(c);
        
        this.obj.append(t);
        
        this.grid.addClass("cal-grid");
        this.reqGrid();
    }
    
    this.reqGrid = function (data) {
        var t = new Date();
        if (this.year > t.getFullYear() || (this.year == t.getFullYear() && this.month > t.getMonth())) {
            this.year = t.getFullYear();
            this.month = t.getMonth();
        }
        
        grabMonth(this.month, this.year);
    }
    
    this.genGrid = function (data) {
        this.grid.empty();
        $(".month-jump.current-month").removeClass("current-month");
        this.controls[this.month].addClass("current-month");
        
        var d = new Date(this.year, this.month, 1, 0, 0, 0, 0);
        
        while(d.getDay() > 0) {
            d.setTime(d.getTime() - 24*60*60*1000);
        }
        
        var data_pos = 0;
        
        if (data.length == 0)
            data_pos = -1;
        
        while (1) {
            if (d.getDay() == 0) {
                var r = document.createElement("tr");
            }
            
            var c = document.createElement("td");
            if (d.getMonth() != this.month)
                $(c).addClass("off-month");
            if (data_pos >= 0) {
                if (d.getDate() == data[data_pos].Date && d.getMonth() == this.month) {
                    $(c).addClass("cal-entry");
                    var e = document.createElement("a");
                    $(e).attr("href", "/journal/" + data[data_pos].URL)
                     .attr("title", data[data_pos].Title).text(d.getDate().toString());
                    c.appendChild(e);
                    
                    data_pos += 1;
                    if (data_pos == data.length)
                        data_pos = -1;
                } else
                    c.innerHTML = d.getDate();
            } else
                c.innerHTML = d.getDate();
            
            r.appendChild(c);
            
            if (d.getDay() == 6) {
                this.grid.append(r);
                if (d.getMonth() > this.month)
                    break;
                if (d.getFullYear() > this.year)
                    break;
            }
            
            d.setTime(d.getTime() + 24*60*60*1000);
            if (d.getMonth() > this.month && d.getDay() == 0)
                break;
            if (d.getFullYear() > this.year && d.getDay() == 0)
                break;
        }
        
        this.grid.css("height", $(".controls").height() + "px");
    }
}

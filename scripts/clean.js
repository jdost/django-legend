var img_timer = -1;
var t_timer = -1;
var cal;

$(window).load( function () {
    $(".img-caption").hide();
    $("#h-img > img").hover(
        function () {
            img_timer = setTimeout(
                function () { 
                    if ($("#h-img").width() > $("#h-img > img").width())
                        var r = $("#h-img").width() - $("#h-img > img").width() - $("#h-img > img").offset().left;
                    else
                        var r = 0;
                    $("#h-img > .img-caption").css("right", r + "px");
                    
                    $("#h-img > .img-caption").fadeIn(1200);  img_timer = -1; },
                900 );
        }, function () {
            if (img_timer >= 0) {
                clearTimeout(img_timer);
                img_timer = -1;
            } else
                $("#h-img > .img-caption").fadeOut(700);
        } );
    $("#header > a:not(.spacer)").hover(
        function () {
            if (!$(this).hasClass("current"))
                $("a.current").css({ "border-bottom-width": "0px", "padding": "0 5px 8px 0"});
        }, function () {
            if (!$(this).hasClass("current"))
                $("a.current").css({ "border-bottom-width": "6px", "padding": "0 5px 2px 0"});
        } );
    
    $(".day").each( function (i) {
        if (this.innerHTML[0] == "0")
            this.innerHTML = "<em>0</em>" + this.innerHTML[1];
    } );
    
    cal = new Calendar();
    cal.init($("#cal-table"));
} );

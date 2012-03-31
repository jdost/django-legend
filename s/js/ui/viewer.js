(function () {
   if (utils.isUndef(window.ui)) {
      return;
   } else if (!utils.isUndef(window.ui.viewer)) {
      return;
   }

   var GROWTH_SPEED = 750
     , CLOSE_SPEED = 500
     ;

   var self = {}
     , setup = function () {
      utils.loaded({ name : "ui.viewer" });
   }
     , makeImage = function (url, caption, loadFunc) {
      return $(utils.make("div"))
         .addClass("Image")
         .append($(utils.make("img"))
            .attr("src",url)
            .load(loadFunc)
         )
         .append(caption.length ? $(utils.make("div"))
            .addClass("caption")
            .html(caption) : ""
         );
   }
     ;

   $(document).ready(setup);

   window.ui.viewer = def({
      "name"      : ""
   ,  "img"       : ""
   ,  "caption"   : ""
   ,  "classes"   : ""
   ,  "backer"    : true
   ,  "close"     : null
   ,  "iter"      : null
   }, function (settings) {
      if (!settings.img.length) {
         return;
      }
      var $win = $(window)
        , $body = $(utils.make("div"))
            .addClass("imageViewer")
            .appendTo(document.body)
        , content = makeImage(settings.img,
         settings.caption,
         function () {
            var t = ($win.height()-content.outerHeight(true))/2
              , l = ($win.width()-content.outerWidth(true))/2
              ;
            content.css( "width", content.outerWidth());
            node.animate({
               height : content.outerHeight(true)
            ,  width  : content.outerWidth(true)
            ,  top    : t < 0 ? 0 : t
            ,  left   : l < 0 ? 0 : l
            }, {
               duration : GROWTH_SPEED
            ,  complete : function () {
                  content.fadeIn();
               }
            }).append(content);
            content.hide();
         }
      )
        , node = $(utils.make("div"))
         .addClass("viewer")
         .css({
            top   : $win.height()/2
         ,  left  : $win.width()/2
         })
        , backer
        , close = function () {
         if (!utils.isNull(settings.close)) {
            settings.close();
         }
         if (!utils.isUndef(backer)) {
            backer.fadeOut(CLOSE_SPEED, function () { backer.remove(); });
         }

         node.fadeOut(CLOSE_SPEED, function () { node.remove(); });
      }
        , left = []
        , right = []
        , transBack = function () {
         var i = settings.iter.prev();
         if (right.length === 0) {
            var content = makeImage(i.url, i.caption, function () {
               var l = ($win.width() - content.outerWidth(true))/2;

               node.animate({"left" : $win.width()*-1});
               viewer.animate({"left" : l});
               left.push(node);
               node = viewer;
            });
            var viewer = $(utils.make("div"))
               .addClass("viewer")
               .append(content)
               .css("left", $win.width());
            node.after(viewer);
         } else {
            var viewer = right.pop();
            var l = ($win.width() - viewer.outerWidth(true))/2;

            node.animate({"left" : $win.width()*-1});
            viewer.animate({"left" : l});
            left.push(node);
            node = viewer;
         }
      }
        , transForward = function () {
         var i = settings.iter.next();
         if (left.length === 0) {
            var viewer = makeImage(i.img, i.caption, function () {}).css("left", $win.width()*-1);
            current.before(viewer);
         } else {
            var viewer = left.pop();
         }
         var l = ($win.width() - viewer.outerWidth(true))/2;

         current.animate("left", $win.width());
         viewer.animate("left", l);
         right.push(current);
         current = viewer;
      }
        ;

      $body.append(content);
      if (settings.classes.length) {
         node.addClass(settings.classes);
      }

      $body.append(node);
      if (settings.backer) {
         var backer = $(utils.make("a"))
            .attr("href", "javascript:;")
            .addClass("viewerBacker")
            .html("&nbsp;")
            .click(close);
         $body.append(backer);
      }
      if (!utils.isNull(settings.iter)) {
         var backButton = $(utils.make("a"))
            .text("<")
            .addClass("back")
            .click(transBack)
            //.insertBefore(node);
         if (settings.iter.isFirst()) { backButton.hide(); }
         var forwardButton = $(utils.make("a"))
            .text(">")
            .addClass("forward")
            .click(transForward)
            //.insertAfter(node);
         if (settings.iter.isLast()) { forwardButton.hide(); }
      }

      return {
         close : close
      };

   });
})();

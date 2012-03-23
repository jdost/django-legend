$(document).ready(function () {
   var RBUFF = 10
     , navbuttons = $("#header li")
     , hr = $("#header hr")
     , norm
     , setNorm = function (node) {
      norm = {
         size: getLength(node)
      ,  color: node.css("border-bottom-color")
      }

      applyBorder(norm.size, norm.color);
      $("#footer").css("border-top-color", norm.color);
   }
     , current
     , findCurrent = function () {
      if (utils.isUndef(current)) {
         current = $("#header li.active");
         if (current.length) {
            return current;
         } else {
            current = $("#header h1");
         }
      }

      return current;
   }

     , applyBorder = function (size, color) {
      hr.css({
         width: size
      ,  background: color
      });
   }
     , getLength = function (node) {
      return node.position().left + node.outerWidth(true) + RBUFF;
   };

   navbuttons.hover( function (evt) {
      var tgt = $(this);
      applyBorder(getLength(tgt), tgt.css('border-bottom-color'));
   }, function (evt) {
      applyBorder(norm.size, norm.color);
   });

   setNorm(findCurrent());

   var header = $("#header")
     , schmidtVal = 32
     , stat = false
     , holder = $(document.createElement("div")).addClass("header-holder")
     , checkScroll = function (evt) {
      var pos = $(window).scrollTop();
      if (stat && pos < schmidtVal) {
         header.removeClass("snap");
         holder.removeClass("snap");
         stat = false;

         setNorm(findCurrent());
      } else if (!stat && pos >= schmidtVal) {
         header.addClass("snap");
         holder.addClass("snap");
         stat = true;

         setNorm(findCurrent());
      }
   };

   holder.insertAfter(header);

   $(window).scroll(checkScroll);
});

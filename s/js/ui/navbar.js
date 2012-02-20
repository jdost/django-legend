$(document).ready(function () {
   var RBUFF = 10
     , navbuttons = $("#header li")
     , hr = $("#header hr")
     , norm
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

   var current = $("#header li.active");
   if (current.length) {
      norm = {
         size: getLength(current)
      ,  color: current.css('border-bottom-color')
      };
      applyBorder(norm.size, norm.color);
      $("#footer").css("border-top-color", norm.color);
   } else {
      norm = { size: 0, color: 'transparent' };
   }

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
      } else if (!stat && pos >= schmidtVal) {
         header.addClass("snap");
         holder.addClass("snap");
         stat = true;
      }
   };

   holder.insertAfter(header);

   $(window).scroll(checkScroll);
});

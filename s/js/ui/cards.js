(function () {
   // constants
   var POS = {
         RIGHT  : 1
      ,  CENTER : 0
      ,  LEFT   : -1
   }
     , MOVING = "moving"
     , POS_CLASS = {
         RIGHT  : "right"
      ,  CENTER : "focused"
      ,  LEFT   : "left"
   }
     , PLACEHOLDER = "placeholder"
     , CARD = 50
     , PAGE = 60
     , CLASS = {
         CARD : "card"
      ,  PAGE : "page"
   }
     , SLIDE_SPEED = 900
     , PH_SPEED = 200
     , CONTAINER_SPEED = 800
     ;

   var cards
     , pages
     , stack = {}
     , sets = {}
     , make = def({
      name     : "item"
   ,  content  : ""
   ,  position : POS.RIGHT
   ,  type     : CARD
   }, function (settings) {
      var card = {}
        , wrapper = $(utils.make("div"))
            .addClass(settings.type === CARD ? CLASS.CARD : CLASS.PAGE)
            .addClass(settings.postion === POS.RIGHT ? POS_CLASS.RIGHT :
               (settings.position === POS.LEFT ? POS_CLASS.LEFT : POS_CLASS.CENTER))
            .addClass(settings.position === POS.CENTER ? "" : MOVING)
            .append(settings.content)
        , side = settings.position
        ;

      card.node = wrapper;
      card.name = settings.name;
      card.getPosition = function () { return side; }
      card.right = function (animate) { slideRight(card, animate); side = POS.RIGHT; };
      card.center = function (animate) { slideCenter(card, animate); side = POS.CENTER; };
      card.left = function (animate) { slideLeft(card, animate); side = POS.LEFT; };
      card.close = function () { card.node.fadeOut(PH_SPEED, function () { card.node.remove(); }); };
      card.controls = [];

      if (settings.position === POS.LEFT) {
         wrapper.css({ left : $(window).width()*-1 });
      } else if (settings.position === POS.RIGHT) {
         wrapper.css({ left : $(window).width() });
      }

      return card;
   })
     , forwardControl = function (dest) {
      if (utils.isUndef(dest)) {
         dest = "#";
      }

      return $(utils.make("a"))
         .addClass("forwardControl")
         .attr("href", dest)
         .append("<span>&nbsp;</span>")
         .append("<div>&#9654;</div>");
   }
     , backControl = function (dest) {
      if (utils.isUndef(dest)) {
         dest = "#";
      }

      return $(utils.make("a"))
         .addClass("backControl")
         .attr("href", dest)
         .append("<span>&nbsp;</span>")
         .append("<div>&#9664;</div>");
   }

     , placeHolder = null
     , makePlaceHolder = function (template) {
      if (placeHolder === null) {
         placeHolder = $(utils.make("div"))
            .addClass(PLACEHOLDER)
            .html("&nbsp;")
            .insertAfter(template);
      } else if (placeHolder.outerHeight() > template.outerHeight()) {
         return;
      }
      placeHolder.css({ "height": template.outerHeight() });
      return;
   }
     , clearPlaceHolder = function (height) {
      if (placeHolder === null) {
         return;
      }

      var finish = function () {
         placeHolder.remove();
         placeHolder = null;
      };

      if (utils.isUndef(height)) {
         finish();
      } else if (placeHolder.outerHeight(true) <= height) {
         finish();
      } else {
         finish();
         return;
         /*placeHolder.animate({
            "height" : height
         }, {
            duration : PH_SPEED
         ,  complete : finish
         });*/
      }
      return;
   }
     , slideRight = function (unit, animate) {
      var endPos = $(window).width()
        , endClass = POS_CLASS.RIGHT
        ;

      if (unit.getPosition() === POS.RIGHT) {
         // cannot slide if already right
         return;
      } else if (unit.getPosition() === POS.LEFT) {
         // just teleport to the right
         unit.node.removeClass(POS_CLASS.LEFT)
            .addClass(endClass)
            .css({ "left" : endPos });
         return;
      }

      makePlaceHolder(unit.node);
      unit.node.removeClass(POS_CLASS.CENTER)
         .addClass(MOVING)
         .animate({
            left : endPos
         }, {
            duration : animate ? SLIDE_SPEED : 0
         ,  complete : function () {
               unit.node.addClass(endClass);
            }
         });
      for (var i = 0, l = unit.controls.length; i < l; i++) {
         unit.controls[i].fadeOut(animate ? SLIDE_SPEED : 0);
      }
   }
     , slideLeft = function (unit, animate) {
      var endPos = $(window).width()*-1
        , endClass = POS_CLASS.LEFT
        ;

      if (unit.getPosition() === POS.LEFT) {
         // cannot slide if already left
         return;
      } else if (unit.getPosition() === POS.RIGHT) {
         // just teleport to the left
         unit.node.removeClass(POS_CLASS.RIGHT)
            .addClass(endClass)
            .css({ "left" : endPos });
         return;
      }

      makePlaceHolder(unit.node);
      unit.node.removeClass(POS_CLASS.CENTER)
         .addClass(MOVING)
         .animate({
            left : endPos
         }, {
            duration : animate ? SLIDE_SPEED : 0
         ,  complete : function () {
               unit.node.addClass(endClass);
            }
         });
      for (var i = 0, l = unit.controls.length; i < l; i++) {
         unit.controls[i].fadeOut(animate ? SLIDE_SPEED : 0);
      }
   }
     , slideCenter = function (unit, animate) {
      var endPos = 0
        , endClass = POS_CLASS.CENTER
        ;

      makePlaceHolder(unit.node);
      unit.node.removeClass(POS_CLASS.RIGHT)
         .removeClass(POS_CLASS.LEFT)
         .animate({
            left : endPos
         }, {
            duration : animate ? SLIDE_SPEED : 0
         ,  complete : function () {
               clearPlaceHolder(unit.node.outerHeight(true));
               unit.node.removeClass(MOVING)
                  .addClass(endClass);
            }
         });
      for (var i = 0, l = unit.controls.length; i < l; i++) {
         unit.controls[i].fadeIn(animate ? SLIDE_SPEED : 0);
      }
   }
     ;

   cards = def({
      name      : "cardStack"
   ,  container : $("body")
   ,  initial   : null
   ,  shifter   : null
   }, function (settings) {
      var stack = []
        , container = settings.container
        , shifter = settings.shifter
        , lookup = {}
        , index = 0
        , current = -1
        , insertCard = function (settings) {
         var card = make(settings)
           , pubCard = {}
           , cardIndex = index;
           ;

         pubCard.focus = function () { focus(settings.name) };
         pubCard.close = function () {
            if (cardIndex === current) { shiftRight(); }
            delete stack[cardIndex];
            delete lookup[settings.name];
            card.close();
            index--;
            stack[cardIndex-1].controls.forward.remove();
         }
         container.append(card.node);
         card.controls = {};
         if (index > 0) {
            card.controls.back = backControl("javascript:;");
            card.controls.back.click(shiftRight);
            card.node.append(card.controls.back);
            stack[index-1].controls.forward = forwardControl("javascript:;");
            stack[index-1].controls.forward.click(shiftLeft);
            stack[index-1].node.append(card.controls.forward);
         }

         stack[index] = card;
         stack[index].pub = pubCard;
         lookup[settings.name] = index;
         index++;
         if (card.getPosition() === POS.RIGHT) {
            shiftLeft();
         } else if (card.getPosition() === POS.LEFT) {
            shiftRight();
         }

         return pubCard;
      }
        , shiftRight = function () {
         if (current <= 0) {
            // cannot shift right when rightmost
            return;
         }

         stack[current].right(true);
         current--;
         stack[current].center(true);
         (utils.isNull(shifter)) ? null : shifter(stack[current].name);
      }
        , shiftLeft = function () {
         if (current >= (index-1)) {
            // cannot shift left when leftmost
            return;
         }

         if (!utils.isUndef(stack[current])) { stack[current].left(true); }
         current++;
         stack[current].center(true);
         (utils.isNull(shifter)) ? null : shifter(stack[current].name);
      }
        , focus = function (name) {
         if (utils.isUndef(lookup[name])) {
            // cannot focus if the name is not in the lookup
            return;
         } else if (lookup[name] === current) {
            // return if the card is already focused
            return;
         }

         var dir = (lookup[name] > current) ? 1 : -1
           , target = lookup[name]
           ;

         for (current; current !== target; current += dir) {
            stack[current][(dir > 0) ? "left" : "right"]();
         }
         stack[current].center();
         (utils.isNull(shifter)) ? null : shifter(name);
      }
        ;

      if (!utils.isNull(settings.initial)) {
         settings.initial.position = POS.CENTER;
         current = 0;
         var initial = insertCard(settings.initial);
      }


      return {
         make    : insertCard
      ,  focus   : focus
      ,  current : function () { return stack[current].pub; }
      ,  close   : function () {
            for (var i = 0, l = stack.length; i < l; i++) {
               stack[i].node.remove();
            }
            stack = [];
            lookup = {};
            index = 0;
            current = -1;
         }
      };
   });

   pages = def({
      name      : "pages"
   ,  container : $("body")
   ,  initial   : 0
   ,  shifter   : null
   ,  urls      : []
   ,  hidden    : false
   }, function (settings) {
      if (settings.urls.length <= 0) {
         // cannot make pages if there are none
         return;
      }

      var stack = []
        , container = $(utils.make("div")).addClass("pages")
        , index = 0
        , current = settings.initial
        , shifter = settings.shifter
        , urls = settings.urls
        , hidden = false
        , insertPage = def({
         page_number : null
      ,  contents    : $(utils.make("div"))
      }, function (settings) {
         if (utils.isNull(settings.page_number)) {
            return;
         }

         var page
           , page_number = settings.page_number
           , pubPage = {}
           ;

         page = make({
            name      : page_number.toString()
         ,  content   : settings.contents
         ,  position  : (page_number < current) ? POS.LEFT :
            (page_number > current) ? POS.RIGHT : POS.CENTER
         ,  type      : PAGE
         });
         if (page_number > 0) {
            var bCtrl = backControl(urls[page_number-1]);
            page.controls.push(bCtrl);
            page.node.append(bCtrl);
         }
         if (page_number < urls.length-1) {
            var fCtrl = forwardControl(urls[page_number+1])
            page.controls.push(fCtrl);
            page.node.append(fCtrl);
         }

         pubPage.focus = function () { focus({ page: page_number }); };
         pubPage.close = page.close;
         container.append(page.node);

         /*creater({
            page      : pubPage
         ,  container : contents
         ,  number    : page_number
         });*/

         stack[page_number] = page;
         stack[page_number].pub = pubPage;
         //focus(page_number);
      })
        , shiftRight = function () {
         if (current <= 0) {
            return;
         }

         if (utils.isNull(stack[current-1])) {
            insertPage(current-1);
         }

         stack[current].right(!hidden);
         current--;
         stack[current].center(!hidden);
         (utils.isNull(shifter)) ? null : shifter(current);
      }
        , shiftLeft = function () {
         if (current >= stack.length) {
            return;
         }

         if (utils.isNull(stack[current+1])) {
            insertPage(current+1);
         }

         stack[current].left(!hidden);
         current++;
         stack[current].center(!hidden);
         (utils.isNull(shifter)) ? null : shifter(current);
      }
        , focus = def({
         contents : $(utils.make("div"))
      ,  page     : null
      }, function (settings) {
         if (utils.isNull(settings.page)) {
            return;
         } else if (settings.page < 0 || settings.page >= stack.length) {
            return;
         }

         var dir = (settings.page > current) ? 1 : -1
           ;

         if (utils.isNull(stack[settings.page])) {
            insertPage({
               page_number : settings.page
            ,  contents    : settings.contents
            });
         }

         if (settings.page === current) {
            return stack[current].pub;
         }

         for (current; current !== settings.page; current += dir) {
            stack[current][(dir > 0) ? "left" : "right"](!hidden);
         }
         stack[current].center(!hidden);
         (utils.isNull(shifter)) ? null : shifter(current);

         return stack[current].pub;
      })
        ;

      settings.container.append(container);

      for (var i = 0; i < urls.length; i++) {
         stack.push(null);
      }

      if (settings.hidden) {
         hidden = true;
         container.hide();
      }

      return {
         focus   : focus
      ,  current : function () { return stack[current].pub; }
      ,  left    : shiftLeft
      ,  right   : shiftRight
      ,  hide    : function () { hidden = true; container.slideUp(CONTAINER_SPEED); }
      ,  show    : function () { hidden = false; container.slideDown(CONTAINER_SPEED); }
      };
   });

   if (!utils.isObj(window.ui)) {
      return;
   } else if (utils.isUndef(window.ui.cards)) {
      window.ui.cards = cards;
   }

   if (!utils.isObj(window.ui)) {
      return;
   } else if (utils.isUndef(window.ui.pages)) {
      window.ui.pages = pages;
   }
})();

/**
ui.cards // ui.pages

This is a pretty heavy UI factory.  The Cards/Pages module is a system to handle
the sliding 'pages' or 'cards' of a site.  It is a replacement for normal browsing,
where each section of a regular site is now a page or card.  The 'page' system
uses a predefined array of the pages that it entails whereas the 'card' system
is much more fluid (although it requires more from the handling code) in the
hierarchy of what it can display.  Basically, you give a starting state for a set
or stack of pages.  The starter is currently displayed inside of a container, this
container is the 'viewport' of the stack and shows the active member.  Navigating
through the stack will have the current one slide right or left (depending on the
direction of navigation on the stack) with the new one sliding into place.  A lot of
this is just for handling the animation of the DOM nodes.  There is also a lot of
catching code to take some of the random issues out of the main code's hands, things
like if you try to display a page stack that you have previously created or try
to slide past the end of the provided page set.
**/
(function () {
   // constants
   var POS = { // Enum definition of where the card lives
      RIGHT: 1,
      CENTER: 0,
      LEFT: -1
   },
      MOVING = "moving", // class given to a card being moved
      POS_CLASS = { // class given to the card based on position
         RIGHT: "right",
         CENTER: "focused",
         LEFT: "left"
   },
      PLACEHOLDER = "placeholder", // class given to the element sitting in place of a moving card
      CARD = 50, // Enum defining a card
      PAGE = 60, // Enum defining a page
      CLASS = { // class given to the type
         CARD: "card",
         PAGE: "page"
   },
      SLIDE_SPEED = 900, // Animation speed for the l/r sliding
      PH_SPEED = 200, // Animation speed for the placeholder resizing
      CONTAINER_SPEED = 800;

   var cards,
      pages,
      stack = {},
      sets = {},
   /**
   make: This is a generic builder for a 'card'.  It build a content node and fill it
   with the specified markup.  It will return a card object that provides the description
   of the overall interaction on this card.  Things like telling the card to slide a direction,
   the name of the card, and closing the card.
   **/
      make = def({
      name: "item",
      content: "",
      position: POS.RIGHT,
      type: CARD
   }, function (settings) {
      var card = {},
         wrapper = $(utils.make("div"))
            .addClass(settings.type === CARD ? CLASS.CARD : CLASS.PAGE)
            .addClass(settings.postion === POS.RIGHT ? POS_CLASS.RIGHT :
               (settings.position === POS.LEFT ? POS_CLASS.LEFT : POS_CLASS.CENTER))
            .addClass(settings.position === POS.CENTER ? "" : MOVING)
            .append(settings.content),
         side = settings.position;

      card.node = wrapper;
      card.name = settings.name;
      card.getPosition = function () { return side; };
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
   }),
   /**
   forwardControl: simple builder for the right side margin control to move
   'forward' in the card stack
   **/
      forwardControl = function (dest) {
      if (utils.isUndef(dest)) {
         dest = "#";
      }

      return $(utils.make("a"))
         .addClass("forwardControl")
         .attr("href", dest)
         .append("<span>&nbsp;</span>")
         .append("<div>&#9654;</div>");
   },
   /**
   backControl: simple builder for the left side margin control to move
   'back' in the card stack
   **/
      backControl = function (dest) {
      if (utils.isUndef(dest)) {
         dest = "#";
      }

      return $(utils.make("a"))
         .addClass("backControl")
         .attr("href", dest)
         .append("<span>&nbsp;</span>")
         .append("<div>&#9664;</div>");
   },

   /**
   The placeholder system is a transition bit.  When a card that is not the same height
   as the active card, the bottom margin would jump (either up or down) and I did not
   like the behavior, so the placeholder is put into place when a slide begins.  It will
   begin at the height of the active card and animate to the height of the card that is
   being focused.
   **/
      placeHolder = null,
   /**
   makePlaceHolder: This will build a new placeholder if one doesn't exist, otherwise
   it will animate the change in height.
   **/
      makePlaceHolder = function (template) {
      if (placeHolder === null) {
         placeHolder = $(utils.make("div"))
            .addClass(PLACEHOLDER)
            .html("&nbsp;")
            .css("height", template.outerHeight())
            .insertAfter(template);
      } else if (placeHolder.outerHeight() <= template.outerHeight()) {
         placeHolder.animate({ "height": template.outerHeight() }, PH_SPEED);
      }
      return;
   },
   /**
   clearPlaceHolder: removes the placeHolder element and nulls out the variable
   **/
      clearPlaceHolder = function (height) {
      if (placeHolder === null) { return; }

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
            "height": height
         }, {
            duration: PH_SPEED,
            complete: finish
         });*/
      }
      return;
   },
   /**
   slideRight, slideLeft, slideCenter: A set of functions that do what the name
   says.  It will move the card (as specified in the <unit> param) the given
   direction.  If the <animate> param is true, the move will be animated.  This
   will also update the <unit> properties to reflect the new position.
   **/
      slideRight = function (unit, animate) {
      var endPos = $(window).width(),
         endClass = POS_CLASS.RIGHT,
         i;

      if (unit.getPosition() === POS.RIGHT) {
         // cannot slide if already right
         return;
      }

      if (unit.getPosition() === POS.LEFT) {
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
            left: endPos
         }, {
            duration: animate ? SLIDE_SPEED : 0,
            complete: function () {
               unit.node.addClass(endClass);
            }
         });
      for (i = 0, l = unit.controls.length; i < l; i++) {
         unit.controls[i].fadeOut(animate ? SLIDE_SPEED : 0);
      }
   },
      slideLeft = function (unit, animate) {
      var endPos = $(window).width()*-1,
         endClass = POS_CLASS.LEFT,
         i;

      if (unit.getPosition() === POS.LEFT) {
         // cannot slide if already left
         return;
      }

      if (unit.getPosition() === POS.RIGHT) {
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
            duration : animate ? SLIDE_SPEED : 0,
            complete : function () {
               unit.node.addClass(endClass);
            }
         });
      for (i = 0, l = unit.controls.length; i < l; i++) {
         unit.controls[i].fadeOut(animate ? SLIDE_SPEED : 0);
      }
   },
      slideCenter = function (unit, animate) {
      var endPos = 0,
         endClass = POS_CLASS.CENTER,
         i;

      makePlaceHolder(unit.node);
      unit.node.removeClass(POS_CLASS.RIGHT)
         .removeClass(POS_CLASS.LEFT)
         .animate({
            left: endPos
         }, {
            duration: animate ? SLIDE_SPEED : 0,
            complete: function () {
               clearPlaceHolder(unit.node.outerHeight(true));
               unit.node.removeClass(MOVING)
                  .addClass(endClass);
            }
         });
      for (i = 0, l = unit.controls.length; i < l; i++) {
         unit.controls[i].fadeIn(animate ? SLIDE_SPEED : 0);
      }
   };

   /**
   ui.cards:
   As described initially, the <cards> module is for an ondemand paging system,
   you first need to create your <card> handler, which will take over controlling
   the majority of the navigation through the card stack.  You then add and remove
   as needed based on actions or events.
   **/
   cards = def({
      name: "cardStack",
      container: $("body"),
      initial: null,
      shifter: null
   }, function (settings) {
      var stack = [],
         container = settings.container,
         shifter = settings.shifter,
         lookup = {},
         index = 0,
         current = -1,
         insertCard = function (settings) {
         var card = make(settings),
            pubCard = {},
            cardIndex = index;

         if (!utils.isUndef(lookup[settings.name])) {
            //lookup[settings.name].focus();
            focus(settings.name);
            return;
         }

         pubCard.focus = function () { focus(settings.name); };
         pubCard.close = function () {
            if (cardIndex === current) { shiftRight(); }
            delete stack[cardIndex];
            delete lookup[settings.name];
            card.close();
            index--;
            stack[cardIndex-1].controls.forward.remove();
         };
         container.append(card.node);
         card.controls = {};
         if (index > 0) {
            card.controls.back = backControl("#");
            card.controls.back.click(shiftRight);
            card.node.append(card.controls.back);
            stack[index-1].controls.forward = forwardControl("#");
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
      },
      /**
      shiftRight, shiftLeft: wrap some additional stack logic around the generic
      <shiftRight> and <shiftLeft> events described above.
      **/
         shiftRight = function () {
         if (current <= 0) {
            // cannot shift right when rightmost
            return;
         }

         stack[current].right(true);
         current--;
         stack[current].center(true);
         if (!utils.isNull(shifter)) { shifter(stack[current].name); }
      },
         shiftLeft = function () {
         if (current >= (index-1)) {
            // cannot shift left when leftmost
            return;
         }

         if (!utils.isUndef(stack[current])) { stack[current].left(true); }
         current++;
         stack[current].center(true);
         if (!utils.isNull(shifter)) { shifter(stack[current].name); }
      },
      /**
      focus: finds a given key in the stack and moves either right or left to bring
      the associated card into the center or focus.
      **/
         focus = function (name) {
         if (utils.isUndef(lookup[name])) {
            // cannot focus if the name is not in the lookup
            return;
         }
         if (lookup[name] === current) {
            // return if the card is already focused
            return;
         }

         var dir = (lookup[name] > current) ? 1 : -1,
            target = lookup[name];

         for (current; current !== target; current += dir) {
            stack[current][(dir > 0) ? "left" : "right"](true);
         }
         stack[current].center(true);
         if (!utils.isNull(shifter)) { shifter(name); }
      };

      if (!utils.isNull(settings.initial)) {
         settings.initial.position = POS.CENTER;
         current = 0;
         var initial = insertCard(settings.initial);
      }


      return {
         make: insertCard,
         focus: focus,
         current: function () { return stack[current].pub; },
         close: function () {
            var i;

            for (i = 0, l = stack.length; i < l; i++) {
               stack[i].node.remove();
            }
            stack = [];
            lookup = {};
            index = 0;
            current = -1;
         }
      };
   });

   /**
   **/
   pages = def({
      name: "pages",
      container: $("body"),
      initial: 0,
      shifter: null,
      urls: [],
      hidden: false
   }, function (settings) {
      if (settings.urls.length <= 0) {
         // cannot make pages if there are none
         return;
      }

      var stack = [],
         container = $(utils.make("div")).addClass("pages"),
         index = 0,
         current = settings.initial,
         shifter = settings.shifter,
         urls = settings.urls,
         hidden = false,
         insertPage = def({
         page_number: null,
         contents: $(utils.make("div"))
      }, function (settings) {
         if (utils.isNull(settings.page_number)) {
            return;
         }

         var page,
            page_number = settings.page_number,
            pubPage = {};

         page = make({
            name: page_number.toString(),
            content: settings.contents,
            position: (page_number < current) ? POS.LEFT :
               (page_number > current) ? POS.RIGHT : POS.CENTER,
            type: PAGE
         });
         if (page_number > 0) {
            var bCtrl = backControl(urls[page_number-1]);
            page.controls.push(bCtrl);
            page.node.append(bCtrl);
         }
         if (page_number < urls.length-1) {
            var fCtrl = forwardControl(urls[page_number+1]);
            page.controls.push(fCtrl);
            page.node.append(fCtrl);
         }

         pubPage.focus = function () { focus({ page: page_number }); };
         pubPage.close = page.close;
         container.append(page.node);

         /*creater({
            page: pubPage,
            container: contents,
            number: page_number
         });*/

         stack[page_number] = page;
         stack[page_number].pub = pubPage;
         //focus(page_number);
      }),
         shiftRight = function () {
         if (current <= 0) { return; }

         if (utils.isNull(stack[current-1])) {
            insertPage(current-1);
         }

         stack[current].right(!hidden);
         current--;
         stack[current].center(!hidden);
         if (!utils.isNull(shifter)) { shifter(current); }
      },
         shiftLeft = function () {
         if (current >= stack.length) { return; }

         if (utils.isNull(stack[current+1])) {
            insertPage(current+1);
         }

         stack[current].left(!hidden);
         current++;
         stack[current].center(!hidden);
         if (!utils.isNull(shifter)) { shifter(current); }
      },
         focus = def({
         contents: $(utils.make("div")),
         page: null
      }, function (settings) {
         if (utils.isNull(settings.page)) { return; }
         if (settings.page < 0 || settings.page >= stack.length) { return; }

         var dir = (settings.page > current) ? 1 : -1;

         if (utils.isNull(stack[settings.page])) {
            insertPage({
               page_number: settings.page,
               contents: settings.contents
            });
         }

         if (settings.page === current) { return stack[current].pub; }

         for (current; current !== settings.page; current += dir) {
            stack[current][(dir > 0) ? "left" : "right"](!hidden);
         }
         stack[current].center(!hidden);
         if (!utils.isNull(shifter)) { shifter(current); }

         return stack[current].pub;
      });

      settings.container.append(container);

      var i;
      for (i = 0; i < urls.length; i++) {
         stack.push(null);
      }

      if (settings.hidden) {
         hidden = true;
         container.hide();
      }

      return {
         focus: focus,
         current: function () { return stack[current].pub; },
         left: shiftLeft,
         right: shiftRight,
         hide: function () { hidden = true; container.slideUp(CONTAINER_SPEED); },
         show: function () { hidden = false; container.slideDown(CONTAINER_SPEED); }
      };
   });

   if (!utils.isObj(window.ui)) { return; }

   if (utils.isUndef(window.ui.cards)) {
      window.ui.cards = cards;
   }

   if (!utils.isObj(window.ui)) { return; }

   if (utils.isUndef(window.ui.pages)) {
      window.ui.pages = pages;
   }
}());

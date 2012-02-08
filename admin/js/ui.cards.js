(function () {
   if (typeof window.ui !== 'object') {
      return;
   } else if (typeof window.ui.cards !== 'undefined') {
      return;
   }

   var
       cards = []
     , level = -1
     , lookup = {}
     , base
     , tree = { name: "" }
     , setup = function () {
      base = $("#body");
      utils.loadStyle({ name: "cards", path: "cards" });

      utils.loaded({ name: "ui.cards" });
   }
     , CARD_SPEED = 700
     , buildCard = def({
      contents : null
   ,  tree     : "default"
   ,  name     : ""
   }, function (options) {
      if (tree.name !== options.tree) {
         for (var i = level; i >= 0; i--) {
            (function (c) {
               c.card.fadeOut(function() {
                  c.card.remove();
                  delete c;
               })
            })(cards[i]);
         }
         level = -1;
         tree.name = options.tree;
         tree.cards = {};
      } else if (options.name.length > 0 &&
         typeof tree.cards[options.name] === 'object') {
         if (tree.cards[options.name].level < level) {
            tree.cards[options.name].focus();
            return tree.cards[options.name];
         } else if (tree.cards[options.name].level === level) {
            return tree.cards[options.name];
         }
      }
      var cardHolder = $(utils.make("div"))
         .addClass("card")
        , side = 1 // -1:left, 0:center, 1:right
        , last = level >= cards.length
        , ctrls = {
         forward : forwardCtrl()
      ,  back    : backCtrl()
      }
        , closed = false
        ;

      if (cards[level+1]) {
         cards[level+1].card.remove();
         cards.splice(level+1);
      }

      cards[level+1] = {
         card: cardHolder
      ,  goRight : function () {
            side = 1;
            cardHolder.children(".backControl").fadeOut();
            cardHolder.animate({ left: $(window).width() },
            {
               duration : CARD_SPEED
            ,  complete : function () { cardHolder.hide(); if (closed) { cardHolder.remove(); } }
            });
         }
      ,  goLeft  : function () {
            side = -1;
            cardHolder.children(".forwardControl").fadeOut();
            cardHolder.animate({ left: $(window).width()*-1 },
            {
               duration : CARD_SPEED
            ,  complete : function () { cardHolder.hide(); }
            });
         }
      ,  center  : function () {
            var temp = side;
            cardHolder.css({ left: side === 1 ? $(window).width() : $(window).width()*-1 }).show();
            cardHolder.animate({ left: 0 },
            {
               duration: CARD_SPEED
            ,  complete: function () {
                  if (temp === -1 && level !== (cards.length-1)) {
                     cardHolder.children(".forwardControl").fadeIn();
                  }
                  cardHolder.children(".backControl").fadeIn();
               }
            });
            side = 0;
         }
      ,  focus   : function () {
            for (; level > this.level;) {
               cards[level].close();
            }
         }
      ,  level   : level+1
      ,  close   : function () {
            closed = true;
            cards.splice(level);
            this.goRight();
            back();
         }
      };

      tree.cards[options.name] = cards[level+1];

      (level >= 0) ? cardHolder.append(ctrls.back) : null;
      cardHolder.append(options.contents);
      cardHolder.append(ctrls.forward);
      base.append(cardHolder);

      forward();
      return cards[level];
   })
     , backCtrl = function () {
      var holder = $(utils.make("div"))
         .addClass("backControl")
         .html("<div>&#9664;</div>")
         .click(back);
      return holder;
   }
     , forwardCtrl = function () {
      var holder = $(utils.make("div"))
         .addClass("forwardControl")
         .html("<div>&#9654;</div>")
         .click(forward)
         .hide();
      return holder;
   }
     , back = function () {
      if (level === 0) {
         return;
      }
      if (level < cards.length) {
         cards[level].goRight();
      }
      level--;
      cards[level].center();
   }
     , forward = function () {
      if (level === cards.length) {
         return;
      }
      if (level >= 0) {
         cards[level].goLeft();
      }
      level++;
      cards[level].center();
   }
     ;

   $(document).ready(setup);
   window.ui.cards = {
      build : buildCard
   };
}) ();

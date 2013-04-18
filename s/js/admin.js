var ui = {
   nav: (function(node) {
      var self = {},
         shown = true;
      var holder = $(document.createElement("div"))
         .html("&nbsp;")
         .addClass("navHolder holder")
         .insertAfter(node);

      self.show = function () {
         if (shown) { return self; }
         shown = true;
         node.animate({ top: 0 });
         holder.slideDown();

         return self;
      };
      self.hide = function () {
         if (!shown) { return self; }
         shown = false;
         node.animate({ top: node.outerHeight(true)*-1 });
         holder.slideUp();

         return self;
      };

      self.add = function (opts) {
         if (typeof opts !== 'object') {
            return;
         }

         var i, l;
         var hideSubs = function () {
            subsShown = false;
            subs.animate({ width: 0 }, function () { subs.hide(); });
         },
            showSubs = function () {
            subsShown = true;
            subs.show().animate({ width: natWidth });
         };

         var button = $(document.createElement("a"))
            .click(function () {
               if (opts.sublabels) {
                  if (subsShown) {
                     hideSubs();
                  } else {
                     showSubs();
                  }
               } else {
                  opts.handler.msg(opts.label);
               }
            })
            .text(opts.label)
            .insertBefore(header);

         var subsShown = false;
         if (!opts.sublabels || opts.sublabels.length === 0) {
            return;
         }

         var subs = $(document.createElement("ul"))
            .addClass("subs")
            .insertAfter(button);
         _.each(opts.sublabels, function (sub) {
            subs.append($(document.createElement("li"))
               .append($(document.createElement("a"))
                  .text(sub)
                  .click(function () {
                     opts.handler.msg(sub);
                     hideSubs();
                  })
               )
            );
         });

         var natWidth = subs.css("width");
         subs.css("width", 0).hide();

         return self;
      };

      var header = $(document.createElement("h1"))
         .addClass("header")
         .appendTo(node)
         .text("admin");

      self.title = function (title) {
         var headerOpacity = header.css("opacity");

         header.animate({ opacity: 0 }, {
            duration: 100,
            complete: function () {
               header.text(title).animate({
                  opacity: headerOpacity
               }, {
                  duration: 100
               });
            }
         });

         return self;
      };

      return self;
   }($("#nav"))),

   body: (function (node) {
      var self = {},
         onChange = null;

      self.set = function (contents, closer) {
         if (typeof onChange === 'function') {
            onChange();
         }
         onChange = closer;

         node.contents().fadeOut('fast', function () {
            node.empty().append(contents).contents().hide().fadeIn('fast');
         });

         return self;
      };

      return self;
   }($("#body"))),

   footer: (function(node) {
      var self = {},
         shown = false,
         contents;
      var holder = $(document.createElement("div"))
         .html("&nbsp;")
         .addClass("footerHolder holder")
         .insertAfter(node);

      self.show = function () {
         if (shown) { return self; }

         shown = true;
         node.animate({ bottom: 0 });
         holder.slideUp();

         return self;
      };
      self.hide = function () {
         if (!shown) { return self; }

         shown = false;
         node.animate({ bottom: node.outerHeight(true)*-1 });
         holder.slideDown();

         return self;
      };

      self.set = function (contents_) {
         if (contents) {
            contents.fadeOut('fast', function () {
               contents.remove();
               node.append(contents_);
               contents = contents_;
            });
         } else {
            node.append(contents_);
            contents = contents_;
         }

         return self;
      };

      return self;
   }($("#footer")))
};

var auth = (function () {
   var AUTH_URL = WS_PREFIX + '/verify/';

   var make = function (t) { return $(document.createElement(t)); };
   var authenticated = false;

   var body = function () {
      var node = make("div");

      return node;
   };

   // test
   jQuery.ajax({
      async: false,
      url: AUTH_URL,
      success: function (data, status, XHR) {
         authenticated = true;
      }
   });

   return function () {
      if (authenticated) {
         return;
      }

      ui.nav.hide();
      ui.footer.hide();
   };
}());

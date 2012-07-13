/**
this is just tracking the URL with push states or
hash/bangs, not actually tracking the user
**/
(function () {
   if (typeof window.utils !== 'object') { return; }
   if (typeof window.utils.tracker !== 'undefined') { return; }

   var self = {},
      pusher,
      reqs = {},
      handler,
      current = 0,
      stack = [],
      initial,
     setup = function () {
      utils.loaded({ name: "utils.tracker" });
      // test for type support
      if (utils.isUndef(window.history.pushState)) {
         // dunno
      } else {
         pusher = window.history;
         window.addEventListener('popstate', popHandler);
      }
   },
     popHandler = function (event) {
      var state = event.state || initial;
      if (current > 0 && state === stack[current-1]) {
         current--;
      } else if (state === stack[current+1]) {
         current++;
      } else {
         return;
      }
      var key = state || window.location.pathname;
      handler(translate(key), reqs[translate(key)] || null);
   },
     init = self.initialize = def({
      context: $("body"),
      handler: null,
      initial: {}
   }, function (settings) {
      if (!utils.isFunc(settings.handler)) {
         return;
      }
      if (!utils.isJq(settings.context)) {
         return;
      }
      handler = settings.handler;
      settings.context.on("click", "a", handleChange);
      reqs[translate(stack[current])] = settings.initial;
   }),
     convertLinks = self.convert = def({
      context: $("body"),
      handler: null
   }, function (settings) {
      if (!utils.isJq(settings.context)) {
         settings.context = $(settings.context);
      }
      if (utils.isUndef(handler["initial"])) {
         handler["initial"] = settings.handler;
      }

      var convert = function (i, link) {
         if (utils.isNode(link)) {
            link = $(link);
         }

         var target = link.attr("href");
         link.click(function (event) {
            event.preventDefault();
            jQuery.ajax({
               data: { 'JSON': '' },
               dataType: 'json',
               url: target,
               success: function (data, status, XHR) {
                  var name = translate(target);
                  dataHistory[name] = data;
                  handler[name] = settings.handler;
                  pusher.pushState(name, name, target);

                  if (!utils.isFunc(settings.handler)) { return; }
                  settings.handler(name, data);
               }
            });
         });
      };
      var handle = function (event) {
         event.preventDefault();
         var target = $(this).attr("href");
         var name = translate(target);
         if (target === stack[stack.length-2]) {
            pusher.back();
            return;
         } else {
            stack.push(target);
            if (!utils.isUndef(handler[name])) {
               handler[name](name, dataHistory[name]);
               return;
            }
         }
         jQuery.ajax({
               data: { 'JSON': '' },
               dataType: 'json',
               url: target,
               success: function (data, status, XHR) {
                  dataHistory[name] = data;
                  handler[name] = settings.handler;
                  pusher.pushState(name, name, target);

                  if (!utils.isFunc(settings.handler)) { return; }
                  settings.handler(name, data);
               }
            });
      };


      settings.context.on("click", "a", handle);
      return;
/*    if (settings.context.get(0).nodeName === "A") {
         convert(0, settings.context);
      } else {
         settings.context.find("a").each(convert);
      }
*/
   }),
     handleChange = function (event) {
      var target = $(this).attr("href");
      if (target.match(/^http:\/\//)) { return; }

      event.preventDefault();
      // check if back
      if (current > 0 && stack[current-1] === target) {
         pusher.back();
         return;
      } else if (stack.length > current && stack[current+1] === target) {
         pusher.forward();
         return;
      }
      current++;
      stack[current] = target;

      var name = translate(target);
      if (!utils.isUndef(reqs[target])) {
         handler(name, reqs[target]);
         return;
      }

      jQuery.ajax({
         data: { 'JSON': '' },
         dataType: 'json',
         url: target,
         success: function (data, status, XHR) {
            reqs[name] = data;
            pusher.pushState(target, name, target);
            handler(name, data);
         }
      });
   },
     translate = self.translate = function (base) {
      return base.substr(1,base.length-2).replace(/\//g,":");
   }
     ;
   initial = window.location.pathname;
   stack.push(initial);

   $(document).ready(setup);

   window.utils.tracker = self;
}());

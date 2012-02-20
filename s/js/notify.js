(function () { // {{{
   if (typeof window.notify === 'object') {
      return;
   }

   var self
     , node
     , setup = function () { // {{{
      node = $(utils.make("div"))
         .attr({
            "id" : "notifyArea"
         });
      $(document.body).append(node);
      utils.loadStyle({ name: "notify", path: "notification" });

      utils.loaded({ name: "notify" });
   } // }}}
     , msgs = {}
     , postMsg = def({
      "name"    : "Unnamed"
   ,  "message" : "Nothing to report"
   ,  "classes" : ""
   ,  "time"    : 2000 // in seconds
   }, function (settings) { // {{{
      if (typeof msgs[settings.name] === 'object') {
         return;
      }

      var current = {
         node: $(utils.make("div"))
            .addClass("message " + settings.classes)
            .text(settings.message)
      };
      node.append(current.node);
      current.node.slideDown('fast');
      current.timer = setTimeout(function () {
         window.notify.close({ "name": settings.name });
      }, settings.time);

      msgs[settings.name] = current;

      return self;
   }) // }}}
     , removeMsg = def({
      "name" : "Unnamed"
   }, function (settings) { // {{{
      if (typeof msgs[settings.name] !== 'object') {
         return;
      }

      msgs[settings.name].node.fadeOut('fast',
         function () {
            msgs[settings.name].node.remove();
            delete msgs[settings.name];
         }
      );

      return self;
   }) // }}}
     ;

   $(document).ready(setup);
   self = window.notify = {
      add   : postMsg
   ,  close : removeMsg
   };
})(); // }}}


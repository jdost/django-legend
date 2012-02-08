(function () {
   if (typeof window.gallery === 'object') {
      return;
   }

   var self = this
     , handler
     , container
     , setup = function () {
      utils.require({
         name     : "admin",
         path     : "admin",
         callback : function () {
            admin.navigation.add({
               name   : "gallery"
            ,  label  : "Gallery"
            ,  module : window.gallery
            ,  subs   : [{
                  name   : "default"
               ,  option : "gallery"
               }]
            });
         },
      });

      utils.loaded({name: "gallery"});
   }
     , load = def({
      "container" : null
   ,  "handler"   : null
   }, function (settings) {
      if (settings.container === null || settings.handler === null) {
         return;
      }

      handler = settings.handler;
      container = settings.container;

      utils.require({
         name     : "notify",
         path     : "notify",
         callback : function () {
            notify.add({name: "galleryLoaded", message: "Gallery has been loaded"});
         },
      });
   })
     ;

   $(document).ready(setup);
   window.gallery = {
      load : load,
   };
})();

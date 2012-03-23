(function () {
   if (typeof window.gallery === 'object') {
      return;
   }

   var self = {}
     , LOC = {
      GALLERY   : "/ws/gallery/"
   }
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

      utils.require({ name: "gallery.browser", path: "admin/gallery/browser" });
      utils.loadStyle({ name: "gallery", path: "gallery" });

      utils.loaded({name: "gallery"});
   }
     , load = self.load = def({
      "container" : null
   ,  "handler"   : null
   }, function (settings) {
      if (settings.container === null || settings.handler === null) {
         return;
      }

      handler = settings.handler;
      container = settings.container;
      container.close();

      gallery.browser.build({
         container : container
      ,  handler   : hInterface
      });

      return self;
   })

     , LOCS = {
      ALBUMS : "/ws/album/"
   ,  IMAGES : "/ws/images/"
   }
     , hInterface = {
         albumList : def({
         "callback" : null
      }, function (settings) {
         var parseData = function (response) {
            if (response.status === 'error') {
               notify.add({
                  name    : "albumError"
               ,  message : "Retrieving Albums Error: " + response.error
               ,  classes : "error"
               });
               return;
            }
            var dataSet = response.data.album_set
              ;

            settings.callback(dataSet);
         };

         handler.request({
            target     : LOCS.ALBUMS
         ,  callback   : utils.isNull(settings.callback) ? null : parseData
         });
      })
      ,  getAlbum : def({
         "id"       : null
      ,  "callback" : null
      }, function (settings) {
         if (utils.isNull(settings.id)) {
            return;
         }
         var parseData = function (response) {
            if (response.status === 'error') {
               notify.add({
                  name    : "albumError"
               ,  message : "Retrieving Album #" + settings.id
                     + " Failed: " + response.error
               ,  classes : "error"
               });
               return;
            }
            var dataSet = response.data.album
              ;

            settings.callback(dataSet);
         };

         handler.request({
            target      : LOCS.ALBUMS + settings.id.toString() + "/"
         ,  callback    : utils.isNull(settings.callback) ? null : parseData
         });
      })
      ,  submitAlbum : def({
         "id"       : null
      ,  "data"     : null
      }, function (settings) {
         var notifier = function (response) {
            if (response.status === "error") {
               notify.add({
                  name    : "albumError"
               ,  message : "Submitting Album Failed: " + response.error
               ,  classes : "error"
               });
            } else {
               notify.add({
                  name    : "albumSubmission"
               ,  message : "Album Info Submitted"
               });
            }
         };

         handler.request({
            target   : LOCS.ALBUMS + (utils.isNull(settings.id) ? "" : settings.id + "/")
         ,  data     : settings.data
         ,  type     : 'POST'
         ,  callback : notifier
         });
      })
      ,  deleteAlbum : def({
         "id"  : null
      }, function (settings) {
         if (utils.isNull(settings.id)) {
            return;
         }

         var notifier = function (response) {
            if (response.status === "error") {
               notify.add({
                  name     : "albumError"
               ,  message  : "Deleting Album #" + settings.id.toString()
                     + " Failed: " + settings.error
               ,  classes  : "error"
               });
            } else {
               notify.add({
                  name     : "albumDeletion"
               ,  message  : "Album #" + settings.id.toString() + " Deleted."
               });
            }
         };

         handler.request({
            target   : LOCS.ALBUMS + settings.id.toString() + "/"
         ,  type     : 'DELETE'
         ,  callback : notifier
         });
      })
      , getImages : def({
         "id"        : null
      ,  "callback"  : null
      }, function (settings) {
         if (utils.isNull(settings.id)) {
            return;
         }
         var parseData = function (response) {
            if (response.status === 'error') {
               notify.add({
                  name     : "imageError"
               ,  message  : "Retrieving Images for Album #" + settings.id
                     + " Failed: " + response.error
               ,  classes  : "error"
               });
               return;
            }
            var dataSet = response.data
              ;

            settings.callback(dataSet);
         };

         handler.request({
            target   : LOCS.IMAGES + settings.id.toString() + "/"
         ,  callback : utils.isNull(settings.callback) ? null : parseData
         });
      })
      , submitImage : def({
         "id"     : null
      ,  "data"   : null
      }, function (settings) {
         if (utils.isNull(settings.id) || utils.isNull(settings.data)) {
            return;
         }

         var notifier = function (response) {
            if (response.status === "error") {
               notify.add({
                  name     : "imageError"
               ,  message  : "Submitting Image #" + settings.id.toString() + " Failed: " + response.error
               ,  classes  : "error"
               });
            } else {
               notify.add({
                  name     : "imageSubmission"
               ,  message  : "Image #" + settings.id.toString() + " Updated"
               });
            }
         };

         handler.request({
            target   : LOCS.IMAGES + settings.id.toString() + "/"
         ,  data     : settings.data
         ,  type     : 'POST'
         ,  callback : notifier
         });
      })
      , UPLOAD_URL : LOCS.ALBUMS
   }
     ;

   $(document).ready(setup);
   window.gallery = self;
})();

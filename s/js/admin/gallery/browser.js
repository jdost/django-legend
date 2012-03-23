(function () {
   if (!utils.isObj(window.gallery)) {
      return;
   } else if (!utils.isUndef(window.gallery.browser)) {
      return;
   }

   var self = {}
     , container
     , handler
     , card
     , table
     , setup = function () {
      utils.loaded({ name: "gallery.browser" });
   }
     , build = self.build = def({
      "container" : null
   ,  "handler"   : null
   }, function (settings) {
      if (utils.isNull(settings.container) || utils.isNull(settings.handler)) {
         return;
      }

      container = settings.container;
      handler = settings.handler;

      drawWindow();
      loadAlbums();
   })
     , drawWindow = function () {
      node = $(utils.make("div"))
         .addClass("gallery browser window")
         .append($(utils.make("h3"))
            .addClass("title")
            .text("album browser")
         ).append($(utils.make("button"))
            .addClass("newAlbum")
            .text("+create new album")
            .click(function () { editAlbum({ "album": { id : null } }); })
         );
      table = $(utils.make("div"))
         .addClass("table")
         .append(utils.makeLoader({}));
      node.append(table);

      card = container.make({
         name    : "browser"
      ,  content : node
      });

      card.focus();

      return;
   }
     , loadAlbums = function () {
      table.empty();
      handler.albumList({
         "callback" : function (data) {
            albums = data;
            for (var i = 0, l = albums.length; i < l; i++) {
               var album = albums[i];
               table.append(makeAlbumRow(album));
            }
         }
      });
   }
     , makeAlbumRow = function (album) {
      var wrapper = $(utils.make("div"))
         .addClass("album")
        , makeEditButton = function () {
         return $(utils.make("button"))
            .addClass("edit")
            .html("edit info")
            .click(function (event) {
               editAlbum({ "album": album.id });
            });
      }
        , makeCaptionButton = function () {
         return $(utils.make("button"))
            .addClass("caption")
            .html("edit images")
            .click(function (event) {
               editCaptions({ "album": album.id });
            });
      }
        , makeDeleteButton = function () {
         return $(utils.make("button"))
            .addClass("delete")
            .html("delete")
            .click(function (event) {
               handler.deleteAlbum({ "id" : album.id });
            });
      }
        ;

      wrapper.append($(utils.make("span"))
            .addClass("title")
            .text(album.name)
         )
         .append(makeDeleteButton())
         .append(makeCaptionButton())
         .append(makeEditButton());

      return wrapper;
   }
     , editAlbum = def({
   }, function (settings) {
      if (!settings.album) {
         return;
      }

      utils.require({
         name     : "gallery.editor"
      ,  path     : "admin/gallery/editor"
      ,  callback : function () {
            gallery.editor.build({
               "album"     : (settings.album.id === null ? null : settings.album)
            ,  "container" : container
            ,  "handler"   : handler
            });
         }
      });
   })
     , editCaptions = def({
   }, function (settings) {
      if (!settings.album) {
         return;
      }

      utils.require({
         name     : "gallery.captioner"
      ,  path     : "admin/gallery/captioner"
      ,  callback : function () {
            gallery.captioner.build({
               "album"     : settings.album
            ,  "container" : container
            ,  "handler"   : handler
            });
         }
      })
   })
     ;

   window.gallery.browser = self;

   $(document).ready(setup);
})();

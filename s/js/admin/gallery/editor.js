(function () {
   if (utils.isUndef(window.gallery)) {
      return;
   } else if (!utils.isUndef(window.gallery.editor)) {
      return;
   }

   var self = {}
     , node
     , card
     , container
     , handler
     , album
     , setup = function () {
      utils.loaded({ name: "gallery.editor" });
   }
     , build = self.build = def({
      "album"     : null
   ,  "container" : null
   ,  "handler"   : null
   }, function (settings) {
      if (utils.isNull(settings.container) || utils.isNull(settings.handler)) {
         return;
      }

      container = settings.container;
      handler = settings.handler;

      if (utils.isNull(settings.album)) {
         album = { "name": "", "description": "" , "id": null };
         drawWindow();
         return;
      }
      grabAlbumInfo(settings.album);
   })
     , grabAlbumInfo = function (id) {
      handler.getAlbum({
         "id"       : id
      ,  "callback" : function (data) {
            album = data;
            drawWindow();
         }
      });
   }
     , forms = {}
     , drawWindow = function () {
      var makeNameForm = function () {
         forms.name = $(utils.make("input"))
            .addClass("name")
            .attr("name", "name")
            .attr("type", "text")
            .attr("placeholder", "album name")
            .val(album.name);
         return forms.name;
      }
        , makeDescForm = function () {
         forms.description = $(utils.make("textarea"))
            .addClass("description")
            .attr("name", "description")
            .attr("placeholder", "album description")
            .text(album.description);
         return forms.description;
      }
        ;
      node = $(utils.make("div"))
         .addClass("gallery editor window")
         .append($(utils.make("h3"))
            .addClass("title")
            .text("album editor: " + (album.name.length ? album.name :  "new album" ))
         ).append(makeNameForm())
         .append(makeDescForm());
      if (album.name.length) {
         node.append(makeUploader());
      }
      node.append(makeButtons());

      card = container.make({
         content : node
      ,  name    : "editor"
      });
   }
     , makeUploader = function () {
      var wrapper = $(utils.make("div"))
         .addClass("uploader")
        , asyncForm = $(utils.make("form"))
         .attr({
            "method"  : "POST"
         ,  "enctype" : "multipart/form-data"
         ,  "action"  : handler.UPLOAD_URL + album.id + "/"
         ,  "target"  : "imageUploadiFrame"
         })
        , uploadIFrame = $(utils.make("iframe"))
         .css({ display: "none", height: 0, width: 0, border: 0 })
         .attr("id", "imageUploadiFrame")
        ;

      forms.file = $(utils.make("input"))
         .attr({
            "type": "file"
         ,  "name": "images"
         })
         .change(function (event) {
            asyncForm.submit();
         });

      asyncForm.append(forms.file);

      return wrapper.append(asyncForm)
         .append(uploadIFrame);
   }
     , makeButtons = function () {
      var wrapper = $(utils.make("div"))
         .addClass("buttons");

      wrapper.append($(utils.make("button"))
         .addClass("apply")
         .text("Apply")
         .click(submitAlbum)
      );

      wrapper.append($(utils.make("button"))
         .addClass("cancel")
         .text("Cancel")
         .click(function () { card.close(); })
      );

      return wrapper;
   }
     , submitAlbum = function (event) {
      var data = {
         name        : forms.name.val()
      ,  description : forms.description.val()
      };

      handler.submitAlbum({
         "id"   : album.id
      ,  "data" : data
      });

      card.close();
   }
     ;

   window.gallery.editor = self;

   $(document).ready(setup);
})();

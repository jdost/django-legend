(function () {
   if (utils.isUndef(window.gallery)) {
      return;
   } else if (!utils.isUndef(window.gallery.captioner)) {
      return;
   }

   var self = {}
     , node
     , card
     , container
     , handler
     , album
     , images
     , setup = function () {
      utils.loaded({ name: "gallery.captioner" });
   }
     , build = self.build = def({
      "album"     : null
   ,  "container" : null
   ,  "handler"   : null
   }, function (settings) {
      if (utils.isNull(settings.container) || utils.isNull(settings.handler)) {
         return;
      }
      if (utils.isNull(settings.album)) {
         return;
      }

      container = settings.container;
      handler = settings.handler;

      grabImages(settings.album);
   })
     , grabImages = function (id) {
      handler.getImages({
         "id"        : id
      ,  "callback"  : function (data) {
            album = data.album;
            album.id = id;
            images = data.images;

            drawWindow();
         }
      });
   }
     , main = {}
     , current
     , drawWindow = function () {
      var thumbViewer = $(utils.make("div"))
         .addClass("thumbViewer")
        ;
      main.container = $(utils.make("div"))
         .addClass("imageViewer")
      main.img = $(utils.make("img"))
         .addClass("current");
      main.caption = $(utils.make("textarea"))
         .addClass("caption");
      main.container.append(main.img)
         .append(main.caption)
         .append($(utils.make("button"))
            .addClass("cover")
            .text("set as cover")
            .click(setCover)
         ).append($(utils.make("button"))
            .addClass("delete")
            .text("delete")
            .click(deleteImage)
         );
      node = $(utils.make("div"))
         .addClass("gallery captioner window")
         .append($(utils.make("h3"))
            .addClass("title")
            .text("caption editor: " + album.name)
         ).append(thumbViewer)
         .append(main.container);

      for (var i = 0, l = images.length; i < l; i++) {
         var image = images[i];
         thumbViewer.append(makeThumb(image));
      }

      card = container.make({
         content  : node
      ,  name     : "captioner"
      });

      card.focus();
   }
     , setCover = function () {
      if (utils.isUndef(current)) {
        return;
      }

      var cover = current.thumbnail.split("/");
      cover = cover[cover.length-1];
      handler.submitAlbum({
         "id"     : album.id
      ,  "data"   : { cover : cover }
      });
   }
     , deleteImage = function () {
      handler.deleteImage({
         id : current.id
      });
   }
     , makeCaptionIcon = function () {
      return $(utils.make("span"))
         .addClass("capIcon")
         .text("C");
   }
     , makeThumb = function (img) {
      img.thumb = $(utils.make("div"))
         .addClass("thumb")
            .append($(utils.make("img"))
               .attr("src", img.thumbnail)
            )
            .append(img.caption.length ? makeCaptionIcon() : "")
            .click(function () { populateMain(img); });
      return img.thumb;
   }
     , populateMain = function (img) {
      if (!utils.isUndef(current)) {
         if (main.caption.val() !== current.caption) {
            handler.submitImage({
               "id"     : current.id
            ,  "data"   : { "caption" : main.caption.val() }
            });
            if (current.caption.length === 0) {
               current.thumb.append(makeCaptionIcon());
            }
            current.caption = main.caption.val();
         }
      }
      main.container.addClass("active");
      main.img.attr("src", img.url);
      main.caption.val(img.caption);
      current = img;
   }
     ;

   window.gallery.captioner = self;

   $(document).ready(setup);
})();

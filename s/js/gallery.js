(function () {
   var self = {}
     , $win = $(window)
     , card
     , album
     , images
     , sets = []
     , current
     , hist
     , setup = function () {
      if (!utils.isUndef(window.history)) {
         hist = window.history;
      }
      if (server.pages.current === 1) {
         setupRoot();
      } else {
         setupAlbum();
      }
   }
     , setupRoot = function () {
      var card = $(".albumList");
   }
     , setupAlbum = function () {
      album = server.pages.album;
      images = server.pages.images;
      current = album.current;

      card = $(".album");
      card.find(".nav").remove();
      sets[album.current] = {
         node   : makeSet(current).css("height", 0)
      ,  images : server.pages.images
      ,  isFilled : true
      };
      card.prepend(sets[current].node);

      imageNodes = card.find(".thumbnail");
      for (var i = 0, l = imageNodes.length; i < l; i++) {
         displayImage($(imageNodes[i]), images[i]);
      }

      if (current < album.pages.length-1) { getImageInfo(current+1); }
      if (current > 0) { getImageInfo(current-1); }
      $win.bind("scroll", scrollWatch);
   }
     , displayImage = function (node, image) {
      node.click(function (event) {
         event.stopPropagation();
         event.preventDefault();
         ui.viewer({
            img     : image.url
         ,  caption : image.caption
         ,  close   : function () { hist.back(); }
         ,  iter    : makeIter(current, sets[current].images.indexOf(image))
         });
         hist.pushState(image, "", image.url);
      });
   }
     , makeSet = function (index) {
      return $(utils.make("a"))
         .attr("name", index.toString())
         .addClass("page");
   }
     , getImageInfo = function (page) {
      if (page < 0) {
         return;
      } else if (!utils.isUndef(sets[page])) {
         return;
      }

      var insertInfo = function (data, status, XHR) {
         var newSet = data.image_list;
         sets[page].images = newSet;
         sets[page].isFilled = false;

         if (page < current) {
            images = newSet.concat(images);
            card.prepend(sets[page].node);
         } else {
            images = images.concat(newSet);
            card.append(sets[page].node);
         }
      };

      sets[page] = {
         node : makeSet(page)
      };
      if (page < current) {
         card.prepend(sets[page].node);
         $win.scrollTop($win.scrollTop() + sets[page].node.outerHeight(true));
      } else {
         card.append(sets[page].node);
      }

      $.ajax({
         url   : album.pages[page]
      ,  data  : { "JSON": "" }
      ,  success  : insertInfo
      });
   }
     , loadSet = function (index) {
      var set = sets[index];
      if (set.isFilled) {
         return;
      } else if (utils.isUndef(set.images)) {
         return;
      }

      set.node.css("height", 0);

      var makeThumb = function (img) {
         var node = $(utils.make("a"))
            .addClass("image")
            .attr("href", img.url)
            .append($(utils.make("img"))
               .addClass("thumbnail")
               .attr("src", img.thumbnail)
            );
         displayImage(node, img);
         return node;
      };

      for (var i = set.images.length-1; i >= 0; i--) {
         var image = set.images[i];
         set.node.after(makeThumb(image));
      }
      set.isFilled = true;
   }
     , scrollWatch = function (event) {
      var top = $win.scrollTop()
        , height = $win.height()
        , line = top + height/2
        , bottom = top + height
        ;
      if (sets[current].node.position().top > top-100 && current > 0) {
         loadSet(current-1);
      } else if (!utils.isUndef(sets[current+1]) && sets[current+1].node.position().top < bottom+100) {
         loadSet(current+1);
      }

      if (sets[current].node.position().top > line && current > 0) {
         current--;
         hist.replaceState(current, "", album.pages[current]);
         if (current > 0) {
            getImageInfo(current-1);
         }
      } else if (!utils.isUndef(sets[current+1]) && sets[current+1].node.position().top < line) {
         current++;
         hist.replaceState(current, "", album.pages[current]);
         if (current < album.pages.length-1) {
            getImageInfo(current+1);
         }
      }
   }
     , makeIter = function (targetSet, targetImage) {
      return (function () {
         var current = {
            img : targetImage
         ,  set : targetSet
         };

         var getNext = function () {
            current.img++;
            if (current.img+1 >= sets[current.set].images.length && current.set < album.pages.length-1) {
               getImageInfo(current.set+1);
            }
            if (current.img === sets[current.set].images.length) {
               if (isLast()) {
                  return null;
               }
               current.set++;
               current.img = 0;
            }
            return sets[current.set].images[current.img];
         }
           , getPrev = function () {
            current.img--;
            if (current.img <= 1 && current.set > 0) {
               getImageInfo(current.set-1);
            }
            if (current.img === sets[current.set].images.length) {
               if (isFirst()) {
                  return null;
               }
               current.set--;
               current.img = sets[current.set].images.length-1;
            }
            return sets[current.set].images[current.img];
         }
           , isLast = function () {
            return current.img === sets[current.set].images.length && current.set === album.pages.length-1;
         }
           , isFirst = function () {
            return current.img === 0 && current.set === 0;
         }
           ;

         if (current.img === 0 && !isFirst()) {
            getImageInfo(current.set-1);
         }
         if (current.img === sets[current.set].images.length-1 && !isLast()) {
            getImageInfo(current.set+1);
         }

         return {
            next    : getNext
         ,  prev    : getPrev
         ,  isFirst : isFirst
         ,  isLast  : isLast
         };
      })();
   }
     ;

   $(document).ready(setup);
})();

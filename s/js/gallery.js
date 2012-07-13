/**
Gallery:
   This is the set of javascript functionality used to drive the gallery pages,
   it includes the code to generate the album views and handle the on demand
   thumbnail loading, it creates the imagebox popup when an image is requested,
   and it deals with handling the URL tracking

   This requires the ui.cards and ui.viewer modules.
**/
(function () {
   var self = {},
      $win = $(window),
      card,
      cards,
      album,
      images,
      sets = [],
      current,
      hist,
   /**
   setup:
   **/
     setup = function () {
      if (!utils.isUndef(window.history)) {
         hist = window.history;
         $("#gallery").on("click", "a", handleChange);
         window.addEventListener('popstate', popHandler);
      }
      if (server.pages.current === 1) {
         setupRoot();
      } else {
         setupAlbum();
      }
   },
      initial = window.location.pathname,
      stack = [initial],
      stackLoc = 0,
   /**
   popHandler:
   **/
     popHandler = function (event) {
      var state = event.state || initial;
      if (stackLoc > 0 && state === stack[stackLoc-1]) {
         stackLoc--;
      } else if (state === stack[stackLoc+1]) {
         stackLoc++;
      } else {
         return;
      }
   },
   /**
   handleChange:
   **/
     handleChange = function (event) {
      event.preventDefault();
      var node = $(this);

      if (node.hasClass("image")) {
         var image = node.data("image");
         ui.viewer({
            img: image.url,
            caption: image.caption,
            close: function () { hist.back(); },
            iter: makeIter(current, sets[current].images.indexOf(image))
         });
         hist.pushState(image, "", image.url);
         stack.push(image.url);
      } else if (node.hasClass("album")) {
         var target = node.attr("href");
         jQuery.ajax({
            data: { 'JSON' : '' },
            dataType: 'json',
            url: target,
            success: function (data, status, XHR) {
               buildAlbum(data);
               stack.push(target);
            }
         });
      }
   },
   /**
   setupRoot:
   **/
     setupRoot = function () {
      var card = $(".albumList");
      cards = ui.cards({
         name: "gallery",
         container: $("#gallery"),
         initial: {
            name: "list",
            tree: "gallery",
            content: card
         },
         shifter: function (name) { if (name === "list") { hist.back(); }}
      });
   },
   /**
   setupAlbum:
   **/
     setupAlbum = function () {
      var i;

      album = server.pages.album;
      images = server.pages.images;
      current = album.current;

      card = $(".album");
      card.find(".nav").remove();
      sets[album.current] = {
         node: makeSet(current).css("height", 0),
         images: server.pages.images,
         isFilled: true
      };
      card.prepend(sets[current].node);

      imageNodes = card.find(".image");
      for (i = 0, l = imageNodes.length; i < l; i++) {
         (function (node, img) {
            node.data("image", img);
         }($(imageNodes[i]), images[i]));
      }

      if (current < album.pages.length-1) { getImageInfo(current+1); }
      if (current > 0) { getImageInfo(current-1); }
      $win.bind("scroll", scrollWatch);
   },
   /**
   buildAlbum:
   **/
     buildAlbum = function (alb) {
      var node = $(utils.make("div"))
         .addClass("album"),
         i;

      card = node;
      album = alb.nav;
      images = alb.image_list;

      current = album.current;
      for (i = 0, l = alb.image_list.length; i < l; i++) {
         var img = alb.image_list[i];
         node.append(makeThumb(img));
      }
      cards.make({
         content: node,
         tree: "gallery",
         name: alb.name
      });

      sets[current] = {
         node: makeSet(current).css("height", 0),
         images: alb.image_list,
         isFilled: true
      };
      node.prepend(sets[current].node);

      getImageInfo(current+1);
      $win.bind("scroll", scrollWatch);
      hist.pushState(alb.album.url, alb.album.name, alb.album.url);
   },
   /**
   displayImage: handler function, this attachs the event listener to the image display that
   will pop up a ui.viewer object displaying the main image.  This also adds nice URL rewriting
   on the click
   **/
     displayImage = function (node, image) {
      node.click(function (event) {
         event.preventDefault();
         ui.viewer({
            img: image.url,
            caption: image.caption,
            close: function () { hist.back(); },
            iter: makeIter(current, sets[current].images.indexOf(image))
         });
         hist.pushState(image, "", image.url);
      });
   },
   /**
   makeSet: DOM builder function, generates the basic markup that wraps each set of images
   on the page
   **/
     makeSet = function (index) {
      return $(utils.make("a"))
         .attr("name", index.toString())
         .addClass("page");
   },
   /**
   getImageInfo: this is an AJAX wrapper, it will make an AJAX request for the image set
   and take the returned information and adds it to the overall image set information, to
   be eventually added to the DOM
   **/
     getImageInfo = function (page) {
      if (page < 0) { return; }
      if (!utils.isUndef(sets[page])) { return; }

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
         url: album.pages[page],
         data: { "JSON": "" },
         success: insertInfo
      });
   },
   /**
   makeThumb: DOM builder function, generates the basic markup for the thumbnail images that are
   used in the DOM
   **/
     makeThumb = function (img) {
      var node = $(utils.make("a"))
         .addClass("image")
         .attr("href", img.url)
         .append($(utils.make("img"))
            .addClass("thumbnail")
            .attr("src", img.thumbnail)
         ).data("image", img);
      return node;
   },
   /**
   loadSet: wrapper function that will loop over the subset of images for the provided index and
   generate the thumbnails and insert them into the DOM
   **/
     loadSet = function (index) {
      var set = sets[index],
         i;
      if (set.isFilled) { return; }
      if (utils.isUndef(set.images)) { return; }

      set.node.css("height", 0);

      for (i = set.images.length-1; i >= 0; i--) {
         var image = set.images[i];
         set.node.after(makeThumb(image));
      }
      set.isFilled = true;
   },
   /**
   scrollWatch: event handler, called on a page scroll, checks to see when a threshold has been hit and
   will try to load the next (or previous if going up) subset of the album, and then draw the set when
   closer to the edge.
   **/
     LOAD_OFFSET = 100,
     scrollWatch = function (event) {
      var top = $win.scrollTop(),
         height = $win.height(),
         line = top + height/2,
         bottom = top + height
        ;
      // checks to see if the position has passed the LOAD_OFFSET and there is an image set that can
      //    loaded, then loads it into the DOM
      if (sets[current].node.position().top > top-LOAD_OFFSET && current > 0) {
         loadSet(current-1);
      } else if (!utils.isUndef(sets[current+1])
            && sets[current+1].node.position().top < bottom+LOAD_OFFSET) {
         loadSet(current+1);
      }
      // checks to see if the position has passed the threshold into the next subset of images, if it
      //    has, the URL gets updated to reflect this and the next (or previous) set of images get
      //    requested
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
   },
   /**
   makeIter: creates a custom iterator for the image set of the album.  It will return an anonymous
   object that provides basic iterator functionality over the album's image set, while properly
   grabbing the subsets of the album images as it iterates over them and provides the next or
   previous images in the set (and status functions to determine when a bookend has been hit).
   **/
     makeIter = function (targetSet, targetImage) {
      return (function () {
         var current = {
            img: targetImage,
            set: targetSet
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
         },
            getPrev = function () {
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
         },
            isLast = function () {
            return current.img === sets[current.set].images.length && current.set === album.pages.length-1;
         },
            isFirst = function () {
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
            next: getNext,
            prev: getPrev,
            isFirst: isFirst,
            isLast: isLast
         };
      }());
   }
     ;

   $(document).ready(setup);
}());

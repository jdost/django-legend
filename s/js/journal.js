/**
Journal:
   This is the set of javascript functionality used on the journal template pages,
   it encompasses various behaviors and functionality on the page.  Things included
   are a wrapper to handle the URL History feature (this allows different URLs to be
   used while not reloading the page and delegating the action handling to an AJAX
   call) and the nice paging behavior.

   This requires the utils.tracker and ui.pages modules.
**/
(function () {
   var self = {},
     book = {},
      // a 'book' is a set of pages for different entry filters, i.e. a tag, overall, etc.
     current,
   /**
   setup: simple init function, called on the document ready event (via jQ), initializes
   the pages, URL tracker, and cleans up various fallback UI elements (for no JS support
   in browsers).
    **/
     setup = function () {
      pages[server.pages.focused] = $(".page");

      current = server.pages.tree;
      initialPage = {
         current_set: current
      };
      // sets up the initial page set and stores it in the book lookup
      book[current] = ui.pages({
         container: $("#journal"),
         name: server.pages.tree,
         urls: server.pages.urls,
         initial: server.pages.focused
      });

      var pg = $(".page");
      pages[utils.tracker.translate(window.location.pathname)] = book[current].focus({
         contents: pg.contents(),
         page: server.pages.focused
      });
      pg.remove();
      // sets up the tracker system, this will allow nice rewriting of URLs while still using
      //    AJAX
      utils.tracker.initialize({
         context: $("#journal"),
         handler: buildPage,
         initial: {
            current_set: current
         }
      });
      $(".pageControls").remove();
   },
     pages = {},
     initialPage,
   /**
   pageChange: deprecated?
     pageChange = function (pageData) {
      if (utils.isJq(pages[pageData.number])) {
         pageData.container.append(pages[pageData.number].children()).addClass("journalPage");
         pages[pageData.number].remove();
         pages[pageData.number] = pageData;
         return;
      } else if (!utils.isUndef(pages[pageData.number])) {
         return;
      }

      pages[pageData.number] = pageData;
      utils.tracker.go({
         url: '/journal/' + pageData.number
      });
   },
   **/

   /**
   buildPage: event handler given to the URL tracker, this is called in place of the actual
   page change, it handles the logic of what to do with the link (i.e. if it requires a
   new book, it is looking for an existing page, etc.).  It deals with generating the new
   book if you change the book scope (going from /@tag1/ to /@tag2/ would be a basic example).
   It then deals with generating the DOM markup for the page based on the information returned,
   the AJAX request is handled by the URL tracker.  Mostly this generates the same form of
   markup as the journal.html template.
   **/
     buildPage = function (name, data) {
      if (utils.isNull(data)) {
         data = initialPage;
      }
      if (utils.isUndef(book[data.current_set])) {
         // If the page is not an existing bookset, create a new one
         book[data.current_set] = ui.pages({
            container: $("#journal"),
            name: data.current_set,
            urls: data.url_set,
            initial: data.current_page,
            hidden: true
         });
      }
      if (utils.isUndef(pages[name])) {
         // If this is a new page (not already built) generate the new markup generation
         //    functions
         if (utils.isNull(data)) { return; }

         var entries = data.entry_list;
         var makeTitle = function (title, url) {
            var link = $(utils.make('a'))
               //.attr("href", url)
               .text(title);
            return $(utils.make('h3'))
               .append(link);
         },
             makeDate = function (date) {
            return $(utils.make('div'))
               .addClass('date')
               .text(date);
         },
            makeContent = function (content) {
            return $(utils.make('div'))
               .addClass('content')
               .html(content);
         },
            makeTags = function (tag_set) {
            var holder = $(utils.make("ul"))
               .addClass("tags")
               .append("tagged with"),
               l = tag_set.length,
               i
              ;
            if (l === 0) {
               holder.append($(utils.make("li")).text("none"));
            }
            for (i = 0; i < l; i++) {
               if (i) { holder.append(","); }
               holder.append($(utils.make("a"))
                     .attr("href", tag_set[i].url)
                     .append($(utils.make("li"))
                        .text(tag_set[i].name)
                     )
                  );
            }
            return holder;
         }
           ;

         var page = $(utils.make('div')),
             i
            ;
         // This is a nice utility function that changes the <title> tag in the <head> section
         changeTitle(data.title);

         // Loops over the entry set in the data and builds each into the new markup set
         for (i=0, l=entries.length; i < l; i++) {
            var entry = entries[i];
            var node = $(utils.make('div'))
               .addClass("entry")
               .append(makeTitle(entry.title, entry.url))
               .append(makeTags(entry.tags))
               .append(makeDate(entry.date))
               .append(makeContent(entry.content));

            page.append(node);
         }

         // Adds the new page into book and brings it into focus
         pages[name] = book[data.current_set].focus({
            contents: page.contents(),
            page: data.current_page
         });
         // The <page> element is just a container, its contents were given to the book, now it
         //    can be cleaned and tossed.
         page.remove();
      } else {
         // If the page already exists, just focus back to it
         pages[name].focus();
      }
      // If this is for an existing book, transition between books
      if (data.current_set !== current) {
         book[data.current_set].show();
         book[current].hide();
         current = data.current_set;
      }
   },
   /**
   changeTitle: utility function that 'animates' the change in the page title, the text that is used
   by the browser to title the tab/window.  How the animation works is that the new title is built
   (right now using a static setup) and loops over the current title and the new one until it
   finds a difference, then changes that character and leaves, next iteration does the same, getting
   one character further, until the whole title is changed.
   **/
     changeTitle = function (text) {
      text = "Jeff | " + text;
      var length = (text.length > document.title.length) ? text.length : document.title.length;

      var timer = setInterval(function () {
         var title_text = document.title,
            i;
         for (i = 0; i < length; i++) {
            if (text[i] !== title_text[i]) {
               break;
            }
         }
         i++;

         var output = text.substr(0,i) + title_text.substr(i);
         document.title = output;
         if (i >= length) {
            clearInterval(timer);
         }
      }, 100);
   }
     ;

   $(document).ready(setup);
}());

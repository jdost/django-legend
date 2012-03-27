(function () {
   var self = {}
     , book = {}
     , current
     , setup = function () {
      pages[server.pages.focused] = $(".page");

      current = server.pages.tree;
      initialPage = {
         current_set : current
      };
      book[current] = ui.pages({
         container  : $("#journal")
      ,  name       : server.pages.tree
      ,  urls       : server.pages.urls
      ,  initial    : server.pages.focused
      });

      pages[utils.tracker.translate(window.location.pathname)] = book[current].focus({
         contents : $(".page")
      ,  page     : server.pages.focused
      });

      utils.tracker.initialize({
         context : $("#journal")
      ,  handler : buildPage
      ,  initial : {
            current_set : current
         }
      });
      $(".pageControls").remove();
   }
     , pages = {}
     , initialPage
     , pageChange = function (pageData) {
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
         url : '/journal/' + pageData.number
      });
   }
     , buildPage = function (name, data) {
      if (utils.isNull(data)) {
         data = initialPage;
      }
      if (utils.isUndef(book[data.current_set])) {
         book[data.current_set] = ui.pages({
            container  : $("#journal")
         ,  name       : data.current_set
         ,  urls       : data.url_set
         ,  initial    : data.current_page
         ,  hidden     : true
         });
      }
      if (utils.isUndef(pages[name])) {
         if (utils.isNull(data)) {
            return;
         }
         var entries = data.entry_list;
         var makeTitle = function (title, url) {
            var link = $(utils.make('a'))
               //.attr("href", url)
               .text(title);
            return $(utils.make('h3'))
               .append(link);
         }
            , makeDate = function (date) {
            return $(utils.make('div'))
               .addClass('date')
               .text(date);
         }
           , makeContent = function (content) {
            return $(utils.make('div'))
               .addClass('content')
               .html(content);
         }
           , makeTags = function (tag_set) {
            var holder = $(utils.make("ul"))
               .addClass("tags")
               .append("tagged with")
              , l = tag_set.length
              ;
            if (l === 0) {
               holder.append($(utils.make("li")).text("none"));
            }
            for (var i = 0; i < l; i++) {
               if (i) { holder.append(",") }
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
         var page = $(utils.make('div'))
            .addClass("page");

         changeTitle(data.title);

         for (var i=0, l=entries.length; i < l; i++) {
            var entry = entries[i];
            var node = $(utils.make('div'))
               .addClass("entry")
               .append(makeTitle(entry.title, entry.url))
               .append(makeTags(entry.tags))
               .append(makeDate(entry.date))
               .append(makeContent(entry.content));

            page.append(node);
         }

         pages[name] = book[data.current_set].focus({
            contents : page
         ,  page     : data.current_page
         });
      } else {
         pages[name].focus();
      }
      if (data.current_set !== current) {
         book[data.current_set].show();
         book[current].hide();
         current = data.current_set;
      }
   }
     , changeTitle = function (text) {
      text = "Jeff | " + text;
      var length = (text.length > document.title.length) ? text.length : document.title.length;

      var timer = setInterval(function () {
         var title_text = document.title;
         for (var i = 0; i < length; i++) {
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
}) ();

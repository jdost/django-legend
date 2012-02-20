(function () {
   if (typeof window.journal !== 'object') {
      return;
   } else if (typeof window.journal.browser !== 'undefined') {
      return;
   }

   var self
     , container
     , handler
     , node
     , card
     , entries = []
     , table
     , setup = function () {
      utils.loaded({ name: "journal.browser" });
   }
     , build = def({
      "container" : null
   ,  "handler"   : null
   }, function (settings) {
      if (typeof settings.handler !== 'object') {
         return;
      }

      container = settings.container;
      handler = settings.handler;

      drawWindow();
      loadEntries();

      return self;
   })
     , loadEntries = function () {
      var entriesLoaded = function (data) {
         entries = data;
         for (var i = 0, l = entries.length; i < l; i++) {
            addEntry({ entry: entries[i] });
         }
      };
      handler.loadEntries({ callback: entriesLoaded });

      return self;
   }
     , loader
     , drawWindow = function () {
      node = $(utils.make("div"))
         .addClass("journal browser window");
      table = $(utils.make("div"))
            .addClass("table");
      node.append($(utils.make("h3"))
            .addClass("title")
            .text("entry browser")
         );

      node.append($(utils.make("button"))
            .addClass("newEntry")
            .text("+create new entry")
            .click(function () { editEntry({ "entry": { id : null } }); })
         );

      node.append(makeFilter());

      node.append(table);
      if (entries.length > 0) {
         for (e in entries) {
            addEntry(entries[e]);
         }
      } else {
         loader = utils.makeLoader({});
         node.append(loader);
      }

      card = ui.cards.build({
         contents : node
      ,  tree     : "entries"
      ,  name     : "browser"
      });

      return;
   }
     , hideWindow = function () {
      table.slideUp();
      return self;
   }
     , showWindow = function () {
      table.slideDown();
      return self;
   }
     , makeFilter = function () {
      var
          visible = false
        , options = $(utils.make("div"))
         .addClass("options");

      var node = $(utils.make("div"))
         .addClass("filter")
         .append(options)
         .append($(utils.make("div"))
            .addClass("label")
            .html("<span>&#9662;</span>filter<span>&#9662;</span>")
            .click(function () {
               var label = $(this);
               options[(visible ? "slideUp" : "slideDown")](500, function () {
                  if (visible) {
                     label.children("span").html("&#9662;");
                  } else {
                     label.children("span").html("&#9652;");
                  }
                  visible = !visible;
               });
            })
         );

      var recent = {
         state  : false
      ,  button : $(utils.make("button"))
            .addClass("recent")
            .html("recent")
            .click(function () {
               recent.state = !recent.state;
               if (recent.state) {
                  options.children(".active").removeClass("active");
                  $(this).addClass("active");
               } else {
                  $(this).removeClass("active");
               }

               var dLimit = (new Date()) - 1000*60*60*24*365;
               for (var i = 0, l = entries.length; i < l; i++) {
                  var entry = entries[i];
                  if (!recent.state) {
                     entry.node.slideDown(500);
                  } else if (entry.date > dLimit) {
                     entry.node.slideDown(500);
                  } else {
                     entry.node.slideUp(500);
                  }
               }
            })
      };
      options.append(recent.button);

      var sbDate = {
         state  : 1 // 1 = ascending, 0 = none, -1 = descending
      ,  button : $(utils.make("button"))
            .addClass("dateSort")
            .html("&#9652; Sort by: Date")
            .click(function () {
               if (sorter !== sbDate) {
                  sorter.reset();
                  sorter = sbDate;
               }
               sbDate.state = sbDate.state === -1 ? 1 : -1;
               sbDate.button.html("&#" + (sbDate.state === 1 ? "9652" : "9662") + " Sort by: Date");
               var sort = function (a, b) {
                  return (a.date.valueOf() - b.date.valueOf()) * sbDate.state;
               };

               entries.sort(sort);
               for (var i = 0, l = entries.length; i < l; i++) {
                  table.append(entries[i].node);
               }
            })
      ,  reset  : function () {
            sbDate.state = 0;
            sbDate.button.html("&nbsp; Sort by: Date");
         }
      };
      options.append(sbDate.button);

      var sbTitle = {
         state   : 0 // 1 = ascending, 0 = none, -1 = descending
      ,  button  : $(utils.make("button"))
            .addClass("titleSort")
            .html("&nbsp; Sort by: Title")
            .click(function () {
               if (sorter !== sbTitle) {
                  sorter.reset();
                  sorter = sbTitle;
               }
               sbTitle.state = (sbTitle.state === -1 ? 1 : -1);
               sbTitle.button.html("&#" + (sbTitle.state === 1 ? "9652" : "9662") + " Sort by: Title");
               var sort = function (A, B) {
                  var a = A.title.toLowerCase()
                    , b = B.title.toLowerCase()
                    , res = 0;
                  if (a < b)
                     res = 1;
                  else if (a > b)
                     res = -1;
                  return sbTitle.state*res;
               };

               entries.sort(sort);
               for (var i = 0, l = entries.length; i < l; i++) {
                  table.append(entries[i].node);
               }
            })
      ,  reset   : function () {
            sbTitle.state = 0;
            sbTitle.button.html("&nbsp; Sort by: Title");
         }
      };
      options.append(sbTitle.button);

      var sorter = sbDate;
      return node;
   }
     , entries = []
     , addEntry = def({
      "entry" : null
   }, function (settings) {
      if (settings.entry === null) {
         return;
      }

      if (loader) {
         loader.remove();
         delete loader;
      }

      var short_date = function (d) {
         var zfill = function (n, l) {
            return Array(l - n.toString().length + 1).join("0") + n.toString();
         }

         return zfill(d.getMonth()+1, 2) + "/" +
            zfill(d.getDate()+1, 2) + "/" +
            zfill(d.getFullYear(), 4);
      };

      var entryNode = $(utils.make("div"))
         .addClass("entry");
      var editButton = $(utils.make("button"))
            .addClass("edit")
            .html("edit &#9656;")
        , deleteButton = $(utils.make("button"))
            .addClass("delete")
            .html("delete");


      entryNode.append($(utils.make("span"))
            .addClass("date")
            .text(short_date(settings.entry.date))
         ).append($(utils.make("span"))
            .addClass("title")
            .text(settings.entry.title)
         ).append(editButton)
         .append(deleteButton)
         .append($(utils.make("span"))
            .addClass("clear")
         );
      (function (listing, entry) {
         editButton.click(function () { editEntry({ "entry" : entry }); });
         deleteButton.click(function () { deleteEntry({ "entry" : entry }); });
      }) (entryNode, settings.entry);

      table.append(entryNode);
      var temp = settings.entry;
      temp.node = entryNode;
      entries.push(temp);
   })
     , editEntry = def({
   }, function (settings) {
      if (!settings.entry) {
         return;
      }

      utils.require({
         name     : "journal.editor"
      ,  path     : "admin/journal/editor"
      ,  callback : function () {
            journal.editor.build({
               "entry"     : (settings.entry.id === null ? null : settings.entry)
            ,  "container" : container
            ,  "handler"   : handler
            });
         }
      });
   })
     , deleteEntry = def({
   }, function (settings) {
      if (!settings.entry) {
         return;
      }

      console.log("delete " + settings.entry.title);
   })
     ;

   self = window.journal.browser = {
      build  : build
   ,  reload : loadEntries
   ,  hide   : hideWindow
   ,  show   : showWindow
   };

   $(document).ready(setup);
})();

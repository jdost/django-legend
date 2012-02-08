(function () {
   if (typeof window.journal !== 'object') {
      return;
   } else if (typeof window.journal.tagEditor !== 'undefined') {
      return;
   }

   var
       self
     , node
     , card
     , handler
     , tag
     , entries
     , table
     , setup = function () {
      utils.loaded({ name: "journal.tagEditor" });
   }
     , build = def({
      tag     : null
   ,  handler : null
   }, function (settings) {
      if (settings.tag === null) {
         return;
      }

      handler = settings.handler;
      handler.loadTag({
         id       : settings.tag
      ,  callback : function (data) {
            tag = data.tag;
            entries = data.entries;
            drawWindow();
         }
      });
   })
     , drawWindow = function () {
      node = $(utils.make("div"))
         .addClass("journal tagEditor window");
      node.append($(utils.make("h3"))
         .addClass("title")
         .text("tag editor: " + tag.name)
      );
      node.append($(utils.make("button"))
         .addClass("saver")
         .text("Apply Changes")
         .click(commit)
      );
      makeSort();
      table = $(utils.make("div"))
         .addClass("table");
      node.append(table);

      for (var i = 0, l = entries.length; i < l; i++) {
         entries[i].node = addEntry(entries[i], i);
         table.append(entries[i].node);
         entries[i].status = entries[i].tagged;
      }

      card = ui.cards.build({
         contents : node
      ,  tree     : "tags"
      ,  name     : "editor"
      });
   }
     , makeSort = function () {
      var sorter = $(utils.make("div"))
         .addClass("sort");
      var sbState = {
         node : $(utils.make("button"))
            .addClass("stateSorter")
            .html("<span>&nbsp;</span> Sort by: State")
            .click(function () {
               var state_sorter = function (a, b) {
                  if (a.status == b.status) {
                     return 0;
                  }
                  return (a.status && !b.status) ? sbState.state : sbState.state*-1;
               };
               if (active !== sbState) {
                  active.reset();
                  active = sbState;
               }
               sbState.state = sbState.state === 1 ? -1 : 1;
               sbState.node.addClass("active")
                  .children("span").html(sbState.state === 1 ? "&#9652;" : "&#9662;");

               entries.sort(state_sorter);
               for (var i = 0, l = entries.length; i < l; i++) {
                  table.append(entries[i].node);
               }

            })
      ,  state : 0
      ,  reset : function () {
            sbState.state = 0;
            sbState.node.children("span").html("&nbsp;");
            sbState.node.removeClass("active");
         }
      };
      sorter.append(sbState.node);
      var sbDate = {
         node : $(utils.make("button"))
            .addClass("dateSorter active")
            .html("<span>&#9652;</span> Sort by: Date")
            .click(function () {
               var date_sorter = function (a, b) {
                  return (a.date.valueOf() - b.date.valueOf())*sbDate.state;
               };
               if (active !== sbDate) {
                  active.reset();
                  active = sbDate;
               }
               sbDate.state = sbDate.state === 1 ? -1 : 1;
               sbDate.node.addClass("active")
                  .children("span").html(sbDate.state === 1 ? "&#9652;" : "&#9662;");

               entries.sort(date_sorter);
               for (var i = 0, l = entries.length; i < l; i++) {
                  table.append(entries[i].node);
               }
            })
      ,  state : 1
      ,  reset : function () {
            sbDate.state = 0;
            sbDate.node.children("span").html("&nbsp;");
            sbDate.node.removeClass("active");
         }
      };
      sorter.append(sbDate.node);
      var sbTitle = {
         node : $(utils.make("button"))
            .addClass("titleSorter")
            .html("<span>&nbsp;</span> Sort by: Title")
            .click(function () {
               var title_sorter = function (A, B) {
                  var a = A.title.toLowerCase()
                    , b = B.title.toLowerCase();
                  return ((a > b) ? 1 : -1) * sbTitle.state;
               };
               if (active !== sbTitle) {
                  active.reset();
                  active = sbTitle;
               }
               sbTitle.state = sbTitle.state === 1 ? -1 : 1;
               sbTitle.node.addClass("active")
                  .children("span").html(sbTitle.state === 1 ? "&#9652;" : "&#9662;");

               entries.sort(title_sorter);
               for (var i = 0, l = entries.length; i < l; i++) {
                  table.append(entries[i].node);
               }
            })
      ,  state : 0
      ,  reset : function () {
            sbTitle.state = 0;
            sbTitle.node.children("span").html("&nbsp;");
            sbTitle.node.removeClass("active");
         }
      };
      sorter.append(sbTitle.node);

      var active = sbDate;

      node.append(sorter);
   }
     , commit = function () {
      var packet = {
         additions : []
      ,  removals  : []
      ,  tag       : tag.id
      };

      for (var i = 0, l = entries.length; i < l; i++) {
         var entry = entries[i];
         if (entry.status !== entry.tagged) {
            (entry.status ? packet.additions : packet.removals).push(entry.id);
         }
      }

      if (packet.additions.length || packet.removals.length) {
         handler.updateTag({
            tag  : tag.id
         ,  data : packet
         });
      }
      card.close();
   }
     , toggle = function (index) {
      entries[index].status = !entries[index].status;
      return entries[index].status;
   }
     , addEntry = function (entry, i) {
      var short_date = function (d) {
         var zfill = function (n, l) {
            return Array(l - n.toString().length + 1).join("0") + n.toString();
         }

         return zfill(d.getMonth()+1, 2) + "/" +
            zfill(d.getDate()+1, 2) + "/" +
            zfill(d.getFullYear(), 4);
      };
      var make_toggle = function () {
         var node = $(utils.make("button"))
            .addClass("toggle" + (entry.tagged ? " tagged" : ""))
            .text(entry.tagged ? "Untag" : " Tag ")
            .click(function (event) {
               event.stopPropagation();
               if (toggle(i)) {
                  node.text("Untag").addClass("tagged");
               } else {
                  node.text(" Tag ").removeClass("tagged");
               }
            });
         return node;
      };

      var node = $(utils.make("div"))
         .addClass("entry");

      var toggler = make_toggle();
      node.append(toggler);

      node.append($(utils.make("span"))
         .addClass("date")
         .text(short_date(entry.date))
      ).append($(utils.make("span"))
         .addClass("title")
         .text(entry.title)
      );

      node.append($(utils.make("div"))
         .addClass("clear")
      );

      node.click(function () { toggler.click(); });

      return node;
   }
     ;

   window.journal.tagEditor = {
      build : build
   };

   $(document).ready(setup);
}) ();

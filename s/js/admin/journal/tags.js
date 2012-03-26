(function () {
   if (typeof window.journal !== 'object') {
      return;
   } else if (typeof window.journal.tags !== 'undefined') {
      return;
   }

   var self
     , container
     , handler
     , node
     , card
     , tags
     , setup = function () {
      utils.loaded({ name: "journal.tags" });
   }
     , build = def({
      "handler"   : null
   ,  "container" : null
   }, function (settings) {
      handler = settings.handler;
      container = settings.container;

      getTags();

      return self;
   })
     , getTags = function () {
      handler.getTags({
         callback : function (data) {
            tags = data;
            drawWindow();
         }
      })
   }
     , drawWindow = function () {
      node = $(utils.make("div"))
         .addClass("journal tagList window");
      node.append($(utils.make("h3"))
         .addClass("title")
         .text("tag browser")
      );
      var table = $(utils.make("div"))
         .addClass("table");
      node.append(table);

      for (var i = 0, l = tags.length; i < l; i++) {
         table.append(makeTag(tags[i]));
      }

      card = container.make({
         content  : node
      ,  tree     : "tags"
      ,  name     : "browser"
      });
   }
     , makeTag = function (tag) {
      var node = $(utils.make("div"))
         .addClass("tag")
         .append($(utils.make("div"))
            .addClass("label")
            .text(tag.name)
         ).append($(utils.make("div"))
            .addClass("count")
            .text("[" + tag.count + "]")
         ).append($(utils.make("button"))
            .addClass("delete")
            .html("Delete")
            .click(function () {
               deleteTag(tag);
            })
         ).append($(utils.make("button"))
            .addClass("addRemove")
            .html("Add/Remove &#9656;")
            .click(function () {
               addRemove(tag);
            })
         ).append($(utils.make("div"))
            .addClass("clear")
         );
      return node;
   }
     , addRemove = function (tag) {
      utils.require({
            name: "journal.tagEditor"
         ,  path: "admin/journal/tagEditor"
         ,  callback: function () {
               journal.tagEditor.build({
                  tag       : tag.id
               ,  handler   : handler
               ,  container : container
               });
            }
         });
   }
     , deleteTag = function (tag) {
      handler.deleteTag({
         "id" : tag.id
      });
   }
     ;

   window.journal.tags = {
      build : build
   };

   $(document).ready(setup);
}) ();

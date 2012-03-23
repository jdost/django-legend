(function () {
   if (typeof window.journal !== 'object') {
      return;
   } else if (typeof window.journal.editor !== 'undefined') {
      return;
   }

   var self
     , container
     , handler
     , node
     , card = null
     , setup = function () {
      utils.loaded({ name: "journal.editor" });
   }

     , build = def({
      "entry"     : null
   ,  "container" : null
   ,  "handler"   : null
   }, function (settings) {
      container = settings.container;
      handler = settings.handler;
      entry = null;

      settings.entry !== null ? getEntry(settings.entry.id) : drawWindow()

      return self;
   })
     , entry
     , getEntry = function (id) {
      var entryLoaded = function (data) {
         entry = data;
         drawWindow();
      };
      handler.loadEntry({
         id       : id
      ,  callback : entryLoaded
      });
   }
     , submitEntry = function () {
      var id = typeof entry === 'object' && entry ? entry.id : null;
      entry = {
         title   : inputs.title.val()
      ,  content : inputs.content.val()
      ,  date    : (new Date())
      ,  tags    : inputs.tags.val()
      };

      console.log(entry);

      if (id === null) {
         handler.addEntry({
            "data" : entry
         });
      } else {
         handler.updateEntry({
            "id"   : id
         ,  "data" : entry
         });
      }
      card.close();
      card = null;
   }
     , cancelEntry = function () {
      card.close();
      card = null;
   }
     , inputs = {}
     , buttons = {}
     , drawWindow = function () {
      if (!utils.isNull(card)) {
         card.close();
      }
      var draw_field = def({
         "name"   : ""
      ,  "label"  : ""
      ,  "value"  : ""
      ,  "type"   : "input"
      }, function (settings) {
         var value = settings.value;
         var input = $(utils.make(settings.type === "input" ? "input" : "textarea"))
            .addClass(settings.name)
            .attr("name", settings.name)
            .attr("placeholder", settings.label);
         input[settings.type === "input" ? "val" : "text"](value);
         return input;
      })
        , draw_button = def({
         "name"   : ""
      ,  "label"  : ""
      ,  "action" : null
      }, function (settings) {
         var button = $(utils.make("button"))
            .click(settings.action)
            .text(settings.label)
            .attr("name", settings.name);
         return button;
      });

      node = $(utils.make("div"))
         .addClass("journal editor window");
      node.append($(utils.make("h3"))
         .addClass("title")
         .text("editor: " + (entry ? entry.title : "new entry"))
      );

      // build inputs and add to card
      inputs.title = draw_field({
         name  : "title"
      ,  label : "title"
      ,  value : entry ? entry.title : ""
      });
      node.append(inputs.title);
      inputs.content = draw_field({
         name  : "content"
      ,  label : "content"
      ,  value : entry ? entry.content : ""
      ,  type  : "text"
      });
      node.append(inputs.content);
      handler.getTags({
         callback : function (tags) {
            var tagArray = [];
            for (var i = 0, l = tags.length; i < l; i++) {
               var tag = tags[i];
               tagArray.push({ "value": tag.id, "label": tag.name });
            }
            inputs.tags = ui.multiselect({
               name    : "tags"
            ,  label   : "tag"
            ,  initial : entry === null ? [] : entry.tags
            ,  options : tagArray
            });
            tagHolder.replaceWith(inputs.tags);
         }
      });
      var tagHolder = $(utils.make("div"));
      node.append(tagHolder);
      // build buttons and add to card
      buttons.send = draw_button({
         name   : "send"
      ,  label  : "apply"
      ,  action : submitEntry
      });
      buttons.cancel = draw_button({
         name   : "cancel"
      ,  label  : "cancel"
      ,  action : cancelEntry
      });
      node.append($(utils.make("div"))
         .addClass("buttons")
         .append(buttons.send)
         .append(buttons.cancel)
      );

      card = container.make({
         content  : node
      ,  tree     : "entries"
      ,  name     : "editor"
      });
   }
     ;
   self = window.journal.editor = {
      build : build
   };

   $(document).ready(setup);
}) ();

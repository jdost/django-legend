(function () {
   if (typeof window.joural === 'object') {
      return;
   }

   var self
     , LOCS = {
      ENTRY      : "/ws/entry/"
   ,  TAGS       : "/ws/tags/"
   }
     , handler
     , container
     , setup = function () {
      utils.require({
         name     : "admin"
      ,  path     : "admin"
      ,  callback : function () {
            admin.navigation.add({
               name   : "journal"
            ,  label  : "Journal"
            ,  module : window.journal
            ,  subs   : [{
                  "name"   : "entries"
               ,  "option" : "browser"
               }, {
                  "name"   : "tags"
               ,  "option" : "tags"
               }]
            });
         }
      });

      utils.require({ name: "journal.browser", path: "admin/journal/browser" });
      utils.require({ name: "journal.tags", path: "admin/journal/tags" });
      utils.loadStyle({ name: "journal", path: "journal" });

      utils.loaded({name: "journal"});
   }
     , load = def({
      "container" : null
   ,  "handler"   : null
   ,  "option"    : "browser"
   }, function (settings) {
      if (settings.container === null || settings.handler === null) {
         return;
      }

      handler = settings.handler;
      container = settings.container;
      container.close();

      journal[settings.option].build({
         container : container
      ,  handler   : hInterface
      });

      return self;
   })
     , getEntryList = def({
      "callback" : null
   }, function (settings) {
      var parseData = function (response) {
         if (response.status === 'error') {
            notify.add({
               name    : "entriesError"
            ,  message : "Retrieving Entries Error: " + response.error
            ,  classes : "error"
            });
            return;
         }
         var dataSet = response.data.entries;
         for (var i = 0, l = dataSet.length; i < l; i++) {
            dataSet[i].date = new Date(dataSet[i].date);
         }
         settings.callback(dataSet);
      };

      handler.request({
         target   : LOCS.ENTRY
      ,  callback : settings.callback === null ? null : parseData
      });
   })
     , getTagList = def({
      "callback" : null
   }, function (settings) {
      var parseData = function (response) {
         if (response.status === 'error') {
            notify.add({
               name    : "tagError"
            ,  message : "Retrieving Tags Error: " + response.error
            ,  classes : "error"
            });
            return;
         }
         var dataSet = response.data.tags
           , processedData = []
           ;
         for (var i = 0, l = dataSet.length; i < l; i++) {
            var tag = dataSet[i];
            processedData[tag.id] = { name: tag.name };
         }
         settings.callback(response.data.tags);
      };
      handler.request({
         target   : LOCS.TAGS
      ,  callback : settings.callback === null ? null : parseData
      });
   })
     , getEntryInfo = def({
      "id"       : -1
   ,  "callback" : null
   }, function (settings) {
      if (settings.id === -1) {
         return;
      }

      var parseData = function (response) {
         if (response.status === 'error') {
            notify.add({
               name    : "getEntryError"
            ,  message : "Retrieving Entry Error: " + response.error
            ,  classes : "error"
            });
            return;
         }
         var entry = response.data.entry;
         settings.callback(entry);
      };

      handler.request({
         target   : LOCS.ENTRY + settings.id.toString() + "/"
      ,  data     : { 'id' : settings.id }
      ,  callback : settings.callback === null ? null : parseData
      });
   })
     , updateEntry = def({
      "id"       : null
   ,  "data"     : null
   ,  "callback" : null
   }, function (settings) {
      if (settings.id === null || settings.data === null) {
         return;
      }

      var notifier = function (response) {
         var title = settings.data.title || settings.id.toString();
         var msg = response.error ?
            "Entry: " + title + " failed" :
            "Entry: " + title + " updated";
         notify.add({
            name    : "entryUpdated"
         ,  message : msg
         ,  classes : response.error ? "error" : "success"
         });
         settings.callback === null ? null : settings.callback(response);
      };

      handler.request({
         target    : LOCS.ENTRY + settings.id.toString() + "/"
      ,  data      : settings.data
      ,  callback  : notifier
      ,  type      : 'POST'
      });
   })
     , createEntry = def({
      "data"     : null
   ,  "callback" : null
   }, function (settings) {
      if (settings.data === null) {
         return;
      }

      var formatDate = function (d) {
         var str = (d.getFullYear()).toString();
         str += "-" + (d.getMonth()+1).toString();
         str += "-" + (d.getDate()).toString();
         str += " " + (d.getHours()).toString();
         str += ":" + (d.getMinutes()).toString();

         return str;
      };

      settings.data.date = formatDate(settings.data.date);


      var notifier = function (response) {
         var msg = response.error ?
            "Entry: " + settings.data.title + " failed" :
            "Entry: " + settings.data.title + " created";
         notify.add({
            name    : "entryCreated"
         ,  message : msg
         ,  classes : response.error ? "error" : "success"
         });
         settings.callback === null ? null : settings.callback(response);
      };

      handler.request({
         target   : LOCS.ENTRY
      ,  data     : settings.data
      ,  callback : notifier
      ,  type     : 'POST'//'PUT' - PUT does not have a natural queryDict in Django, this is a simple workaround, for now
      });
   })
     , getTagInfo = def({
      "id"       : null
   ,  "callback" : null
   }, function (settings) {
      if (settings.id === null) {
         return;
      }

      var parseData = function (response) {
         if (response.error) {
            notify.add({
               name    : "tagReqFailed"
            ,  message : "Tag Request failed: " + response.error
            ,  classes : "error"
            });
            return;
         }

         for (var i = 0, l = response.data.entries.length; i < l; i++) {
            var entry = response.data.entries[i];
            response.data.entries[i].date = new Date(entry.date);
         }

         settings.callback === null ? null : settings.callback(response.data);
      };

      handler.request({
         target   : LOCS.TAGS + settings.id.toString() + "/"
      ,  callback : parseData
      });
   })
     , updateTag = def({
      "tag"  : null
   ,  "data" : null
   }, function (settings) {
      if (settings.tag === null) {
         return;
      }

      var notifier = function (response) {
         notify.add({
            name    : "tagUpdated"
         ,  message : "Tag Update: " + (response.error ? "failed" : "succeeded")
         ,  classes : response.error ? "error" : "success"
         });
      };

      settings.data.additions = JSON.stringify(settings.data.additions);
      settings.data.removals = JSON.stringify(settings.data.removals);

      handler.request({
         target   : LOCS.TAGS + settings.tag + "/"
      ,  data     : settings.data
      ,  type     : 'POST'
      ,  callback : notifier
      });
   })
     , deleteEntry = def({
      "id"  : null
   }, function (settings) {
      if (settings.id === null) {
         return;
      }

      var notifier = function (response) {
         notify.add({
            name  : "entryDeleted"
         ,  message  : "Entry Deletion: " + (response.error ? "failed" : "successful")
         ,  classes  : response.error ? "error" : "success"
         });
      };

      handler.request({
         target     : LOCS.ENTRY + settings.id + "/"
      ,  data       : {}
      ,  callback   : notifier
      ,  type       : 'DELETE'
      });
   })
     , deleteTag = def({
      "id"  : null
   }, function (settings) {
      if (settings.id === null) {
         return;
      }

      var notifier = function (response) {
         notify.add({
            name  : "tagDeleted"
         ,  message  : "Tag Deletion: " + (response.error ? "failed" : "successful")
         ,  classes  : response.error ? "error" : "success"
         });
      };

      handler.request({
         target   : LOCS.TAGS + settings.id + "/"
      ,  data     : {}
      ,  type     : 'DELETE'
      ,  callback : notifier
      });
   })
     , hInterface = {
      loadEntries : getEntryList
   ,  loadEntry   : getEntryInfo
   ,  updateEntry : updateEntry
   ,  addEntry    : createEntry
   ,  deleteEntry : deleteEntry

   ,  getTags     : getTagList
   ,  loadTag     : getTagInfo
   ,  updateTag   : updateTag
   ,  deleteTag   : deleteTag
   }
     ;

   self = window.journal = {
      load : load
   };

   $(document).ready(setup);
})();


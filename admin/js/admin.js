window.admin = (function () { // {{{
   var self = this
     , nodes
     , setup = function () { // {{{
      nodes = { // {{{
         "nav"  : $("#nav")
      ,  "body" : $("#body")
      ,  "js"   : $("#scripts")
      ,  "css"  : $("#styles")
      }; // }}}

      utils.loadStyle({ name: "navigation", path: "navigation" });
      utils.loadStyle({ name: "authentication", path: "authenticate" });
      utils.loaded({name: "admin"});

      authenticate();
   } // }}}
     , AUTH_LOC = '/ws/verify/'
     , authenticate = function () {
      var checkOrBuild = function (response) {
         if (response.XHR.status === 202)
            return;
         var failed = false;
         var auth = $(utils.make('input'))
            .addClass('auth')
            .attr({
               'type'        : 'input'
            ,  'placeholder' : 'computer name'
            ,  'name'        : 'name'
            }).keypress(function (event) {
               var checkAuth = function (response) {
                  console.log(response);
                  if (response.XHR.status !== 202) {
                     auth.val("").addClass("failed");
                     failed = true;
                  } else {
                     node.remove();
                  }
               };
               if (failed) {
                  auth.removeClass("failed");
                  failed = false;
               }

               if (event.keyCode === 13) {
                  moduleHandler.request({
                     target   : AUTH_LOC
                  ,  data     : { "name": auth.val() }
                  ,  callback : checkAuth
                  ,  type     : 'POST'
                  });
               }
            });
         var node = $(utils.make('div'))
            .addClass('authHolder')
            .append($(utils.make('div'))
               .addClass('authWindow')
               .append(auth)
            );

         $("body").append(node);
         utils.center(auth.parent());
      };

      moduleHandler.request({
         target   : AUTH_LOC
      ,  callback : checkOrBuild
      });
   }
     , nav = (function () { // {{{
      var links = {}
        , active
        , addOption = def({
         "name"   : "Unnamed"
      ,  "label"  : "section_name"
      ,  "module" : null
      ,  "subs"   : []
      }, function (settings) { // {{{
         if (typeof links[settings.name] !== 'undefined') {
            return;
         }

         var option = {
            "node"   : $(utils.make("div"))
               .addClass("navLink")
               .click(function (data) {
                  showSubs({"link": option, "data": data});//openLink({"link": option, "data": data});
               })
               .text(settings.label)
         ,  "subs"   : settings.subs
         ,  "module" : settings.module
         };
         links[settings.name] = option;

         nodes.nav.append(option.node);
      }) // }}}
        , removeOption = def({
         "name" : "Unnamed"
      }, function (settings) { //{{{
         var target = links[settings.name];
         if (typeof target === 'undefined') {
            return;
         }

         target.node.remove();
         delete links[settings.name];
      }) // }}}
        , subsVis = false
        , showSubs = def({
         "link" : null
      ,  "data" : {}
      }, function (settings) {
         if (settings.link === null) {
            return;
         }

         if (settings.link.subs.length === 1) {
            openLink({"link": settings.link, "module": settings.link.module, "data": settings.data});
            return;
         } else if (subsVis) {
            return;
         }
         subsVis = true;

         var makeSub = function (sub) {
            var el = $(utils.make("span"))
               .addClass("sub")
               .text(sub.name)
               .click(function (data) {
                  subHolder.animate({ left: -1*subHolder.outerWidth() }, {
                     duration : 'fast'
                  ,  complete : function () {
                     subHolder.remove();
                     }
                  });
                  openLink({"link": settings.link, "module": settings.link.module, "data": data, "option": sub.option});
               });
            return el;
         };

         var subHolder = $(utils.make("div"))
            .addClass("subChoices");

         for (var i = 0, l = settings.link.subs.length; i < l; i++) {
            var sub = settings.link.subs[i];
            subHolder.append(makeSub(sub));
         }

         nodes.nav.append(subHolder);
         subHolder.css({ left: -1*subHolder.outerWidth() }).animate({ left: 0 });
      })
        , openLink = def({
         "link"   : null
      ,  "module" : null
      ,  "data"   : {}
      }, function (settings) { // {{{
         if (settings.link === null || settings.module === null) {
            return;
         }

         if (typeof active !== 'undefined') {
            active.removeClass("active");
         }
         active = settings.link.node;
         active.addClass("active");

         loadModule({
            "module" : settings.module
         ,  "option" : settings.option
         });
         subsVis = false;
      }) // }}}
        ;

      return {
         add    : addOption
      ,  remove : removeOption
      };
   })() // }}}

     , loadModule = def({
         "module" : null
   }, function (settings) { // {{{
      if (settings.module === null) {
         return;
      }

      settings.module.load({
         "container" : nodes["body"]
      ,  "handler"   : moduleHandler
      ,  "option"    : settings.option
      });
   }) // }}}
     , dataRequest = def({
      "target"   : ""
   ,  "data"     : {}
   ,  "type"     : 'GET'
   ,  "callback" : null
   }, function (settings) { // {{{
      jQuery.ajax({
         data     : settings.data
      ,  dataType : 'json'
      ,  type     : settings.type
      ,  url      : settings.target
      ,  success  : function (data, status, XHR) {
            if (typeof settings.callback !== 'function') { return; }
            settings.callback({
               "data"   : data
            ,  "status" : status
            ,  "XHR"    : XHR
            });
         }
      ,  error    : function (XHR, status, error) {
            settings.callback({
               "error"  : error
            ,  "status" : status
            ,  "XHR"    : XHR
            });
         }
      });
   }) // }}}
     , moduleHandler = (function () { // {{{
         return { // {{{
            loadStyle     : utils.loadStyle
         ,  unloadStyle   : utils.unloadStyle

         ,  loadScript    : utils.loadScript
         ,  unloadScript  : utils.unloadScript
         ,  request       : dataRequest
         }; // }}}
      })() // }}}
     ;

   $(document).ready(setup);

   return {
      navigation : nav
   };
})(); // }}}


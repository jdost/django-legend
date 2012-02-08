window.def = typeof window.def === 'function' ? window.def : (function () {
   var PROTO_SUPPORT = !{__proto__ : null}.toString,
   hasOwnP = {}.hasOwnProperty;

   var def;
   if (PROTO_SUPPORT) {
      def = function (params, func) {
         return function (args) {
            args.__proto__ = params;
            return func.call(this, args);
         };
      };
   } else {
      def = function (params, func) {
         return function (args) {
            for (var i in params) {
               if (hasOwnP.call(params, i) && !hasOwnP.call(args, i)) {
                  args[i] = params[i];
               }
            }
            return func.call(this, args);
         };
      };
   }

   return def;
})();

window.utils = (function () { // {{{
   var self = this
     , nodes = {}
     , js_loc = "/"
     , css_loc = "/"
     , setValues = function (settings) { // {{{
      js_loc = settings.javascript || js_loc;
      css_loc = settings.stylesheet || css_loc;
   } // }}}
     , setup = function () { // {{{
      nodes.styles = $("#styles");
      nodes.scripts = $("#scripts");
   } // }}}
     , make = function (nodeType) { // {{{
      var node = document.createElement(nodeType);
      if (typeof node === 'object') {
         return node;
      }
      return "<" + nodeType + "/>";
   } // }}}
     , LOAD_ANIMATION_LOC = "img/loader.gif"
     , makeLoader = def({
   }, function (settings) { // {{{
      var loader = $(make("div")).addClass("loader");
      loader.append($(make("img")).attr({
            "src" : LOAD_ANIMATION_LOC
         })
      );

      return loader;
   }) // }}}

     , scripts = {}
     , loadScript = def({
      "name" : "Unnamed"
   ,  "path" : null
   }, function (settings) { // {{{
      if (typeof scripts[settings.name] !== 'undefined') {
         return;
      } else if (settings.path === null) {
         return;
      }

      var path = js_loc + settings.path + ".js";

      var scriptNode = $(make("script"))
         .attr({
            "type" : "text/javascript"
         ,  "src"  : path
         });
      scripts[settings.name] = scriptNode;
      nodes.scripts.append(scriptNode);
      return self;
   }) // }}}
     , unloadScript = def({
      "name" : "Unnamed"
   }, function (settings) { // {{{
      if (typeof scripts[settings.name] === 'undefined') {
         return;
      }

      scripts[settings.name].remove();
      delete scripts[settings.name];

      return self;
   }) // }}}
     , styles = {}
     , loadStyle = def({
      "name" : "Unnamed"
   ,  "path" : null
   }, function (settings) { // {{{
      if (typeof styles[settings.name] !== 'undefined') {
         return;
      } else if (settings.path === null) {
         return;
      }

      var path = css_loc + settings.path + ".css";

      var styleNode = $(make("link"))
         .attr({
            "type" : "text/css"
         ,  "rel"  : "stylesheet"
         ,  "href" : path
         });
      styles[settings.name] = styleNode;
      nodes.styles.append(styleNode);

      return self;
   }) // }}}
     , unloadStyle = def({
      "name" : "Unnamed"
   }, function (settings) { // {{{{
      if (typeof styles[settings.name] === 'undefined') {
         return;
      }

      styles[settings.name].remove();
      delete styles[settings.name];

      return self;
   }) // }}}
     , modules = {
      utils: {
         path   : "utils"
      ,  loaded : true
      }
   }
     , callbacks = {}
     , loadModule = def({
      "name"     : "Unnamed"
   ,  "path"     : null
   ,  "callback" : null
   }, function (settings) { // {{{
      if (typeof modules[settings.name] !== 'undefined') {
         if (settings.callback !== null) {
            settings.callback();
         }
         return self;
      } else if (settings.path === null) {
         return;
      }

      if (typeof settings.callback === 'function') {
         if (typeof callbacks[settings.name] !== 'object') {
            callbacks[settings.name] = [];
         }
         callbacks[settings.name].push(settings.callback);
      }

      modules[settings.name] = {
         "path"   : settings.path
      ,  "loaded" : false
      };
      loadScript(settings);

      return self;
   }) // }}}
     , moduleLoaded = def({
      "name" : "Unnamed"
   }, function (settings) { // {{{
      if (typeof scripts[settings.name] === 'undefined') {
         return;
      }
      modules[settings.name].loaded = true;

      if (typeof callbacks[settings.name] !== 'object') {
         return self;
      }
      var cb_set = callbacks[settings.name];
      for (var i = 0, l = cb_set.length; i < l; i++) {
         cb_set[i]();
      }
      delete callbacks[settings.name];

      return self;
   }) // }}}
     ;

   $(document).ready(setup);
   return {
      make         : make
   ,  init         : setValues

   ,  loadStyle    : loadStyle
   ,  unloadStyle  : unloadStyle

   ,  loadScript   : loadScript
   ,  unloadScript : unloadScript

   ,  require      : loadModule
   ,  loaded       : moduleLoaded


   ,  makeLoader   : makeLoader
   };
})(); // }}}


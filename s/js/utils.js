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
   var self = {}
     , nodes = {}
     , js_loc = "/"
     , css_loc = "/"
     , setValues = self.init = function (settings) { // {{{
      js_loc = settings.javascript || js_loc;
      css_loc = settings.stylesheet || css_loc;
   } // }}}
     , setup = function () { // {{{
      nodes.styles = $("#styles");
      nodes.scripts = $("#scripts");
   } // }}}
     , make = self.make = function (nodeType) { // {{{
      var node = document.createElement(nodeType);
      if (typeof node === 'object') {
         return node;
      }
      return "<" + nodeType + "/>";
   } // }}}
     , LOAD_ANIMATION_LOC = "/css/img/loader.gif"
     , makeLoader = self.makeLoader = def({
   }, function (settings) { // {{{
      var loader = $(make("div")).addClass("loader");
      loader.append($(make("img")).attr({
            "src" : page.static_root + LOAD_ANIMATION_LOC
         })
      );

      return loader;
   }) // }}}

     , scripts = {}
     , loadScript = self.loadScript = def({
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
     , unloadScript = self.unloadScript = def({
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
     , loadStyle = self.loadStyle = def({
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
     , unloadStyle = self.unloadStyle = def({
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
     , loadModule = self.require = def({
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
     , moduleLoaded = self.loaded = def({
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
     , centerNode = self.center = function (node) {
      var base = node.parent();
      var left = (base.innerWidth() - node.outerWidth())/2,
          above = (base.innerHeight() - node.outerHeight())/2;

      node.css({
         top  : above
      ,  left : left
      });
   }

     , isUndef = self.isUndef = function (a) {
      return typeof a === 'undefined';
   }
     , isNode = self.isNode = function (a) {
      return a instanceof Node;
   }
     , isJq = self.isJq = function (a) {
      return a instanceof jQuery;
   }
     , isNull = self.isNull = function (a) {
      return a === null;
   }
     , isFunc = self.isFunc = function (a) {
      return typeof a === 'function';
   }
     , isObj = self.isObj = function (a) {
      return typeof a === 'object';
   }
     ;

   $(document).ready(setup);
   return self;
})(); // }}}


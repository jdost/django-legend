(function () {
   if (typeof window.ui !== 'object') {
      return;
   } else if (typeof window.ui.multiselect !== 'undefined') {
      return;
   }

   var
       setup = function () {
      utils.loadStyle({ name: "multiselect", path: "multiselect" });

      utils.loaded({ name: "ui.multiselect" });
   }
     ;

   $(document).ready(setup);

   window.ui.multiselect = def({
      "name"    : ""
   ,  "label"   : ""
   ,  "options" : []
   ,  "initial" : []
   }, function (settings) {
      var
          makeDisplay = function () {
         var node = $(utils.make("div"))
            .addClass("valueDisplay");
         return node;
      }
        , makeInput = function () {
         var node = $(utils.make("input"))
            .attr({ type: "text" , placeholder: settings.label })
            .addClass("mainInput")
            .focus(activate)
            .keyup(filter)
            .blur(deactivate);
         return node;
      }
        , values = []
        , addTo = function (option) {
         if (option === null) {
            return;
         }

         if (values.length) {
            display.text(display.text() + ", ");
         }
         display.text(display.text() + option.label);
         values.push(option);
      }
        , optDisplay
        , options = []
        , activate = function (evt) {
         optDisplay = $(utils.make("div"))
            .addClass("inputOptions")
            .css({
               top: input.outerHeight() + (input.outerHeight(true) - input.outerHeight())/2
            ,  left: input.position().left
            });
         var active = function (option) {
            for (var i = 0, l = values.length; i < l; i++) {
               if (values[i].value === option.value)
                  return true;
            }
            return false;
         };
         for (var i = 0, l = settings.options.length; i < l; i++) {
            var opt = settings.options[i];
            if (active(opt))
               continue;
            var node = $(utils.make("div"))
               .addClass("inputOption")
               .attr("index", opt.value)
               .text(opt.label);
            optDisplay.append(node);
            opt.node = node;
            options.push(opt);
            (function (n, o) {
               n.click(function () { addTo(o); });
            }) (node, opt);
         }

         for (var i = 0, l = values.length; i < l; i++) {
            optDisplay.children("[index=" + values[i].value + "]").hide();
         }

         main.append(optDisplay);
         optDisplay.slideDown();
      }
        , deactivate = function (evt) {
         optDisplay.fadeOut(function () { optDisplay.remove(); });
         options = [];
      }
        , filter = function (evt) {
         var current = input.val();
         var matches = (function () {
            var reg = new RegExp(current, "i")
              , opts = [];
            for (var i = 0, l = options.length; i < l; i++) {
               if (reg.test(options[i].label)) {
                  opts.push(options[i]);
               }
               options[i].node.hide();
            }
            return opts;
         })();
         var maker = optDisplay.children(".makeTag");

         for (var i = 0, l = matches.length; i < l; i++) {
            matches[i].node.show();
         }
         if (matches.length === 0 && maker.length === 0) {
            optDisplay.append($(utils.make("div"))
               .addClass("makeTag")
               .text("+ New Tag")
            );
         } else if (matches.length > 0) {
            maker.remove();
         }
         if (evt.keyCode === 13) { // enter key
            if (matches.length > 1) { // don't do anything if multiple matches
               return;
            }
            if (matches.length === 0) { // if not match, "create" option
               addTo({ label: current, value: current });
               maker.remove();
            } else { // if 1 match, add that option
               addTo(matches[0]);
               matches[0].node.remove(); // remove option, it is active
            }
            for (var i = 0, l = options.length; i < l; i++) { // re-show all of the options
               options[i].node.show();
            }
            input.val(""); // clear string
         }
      }
        ;

      var
          display = makeDisplay()
        , input = makeInput()
        , main = $(utils.make("div"))
         .addClass("multiSelect")
         .append(input)
         .append(display)
         .append($(utils.make("div")).addClass("clear"))
        ;

      var find = function (id) {
         for (var i = 0, l = settings.options.length; i < l; i++) {
            var opt = settings.options[i];
            if (opt.value === id)
               return opt;
         }
         return null;
      };

      for (var i = 0, l = settings.initial.length; i < l; i++) {
         addTo(find(settings.initial[i]));
      }

      main.val = function () {
         var build = [];
         for (var i = 0, l = values.length; i < l; i++) {
            build.push(values[i].value);
         }
         return JSON.stringify(build);
      };

      return main;
   });
}) ();

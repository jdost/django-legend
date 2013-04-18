var gallery = (function () {
  var self = {},
    action = {},
    WS = {
      "ALBUM": WS_PREFIX + "/album/",
      "IMAGES": WS_PREFIX + "/images/"
    };

  self.msg = function () {
    gallery.browser();
  };

  var modified = true,
    albums;
  self.getAlbums = function (callback) {
    if (typeof callback !== 'function') { return; }

    if (!modified) {
      callback(albums);
      return modified;
    }

    jQuery.ajax({
      dataType: 'json',
      type: 'GET',
      url: WS.ALBUM,
      success: function (data, status, XHR) {
        callback(data.album_set);
      }
    });
  };

  self.getImages = function (id, callback) {
    if (typeof callback !== 'function') { return; }
    if (typeof id === 'undefined') { return; }

    jQuery.ajax({
      dataType: 'json',
      type: 'GET',
      url: WS.IMAGES + id + "/",
      success: function (data, status, XHR) {
        callback(data.images);
      }
    });
  };

  self.saveAlbum = function (id, album, callback) {
    if (typeof album !== 'object') { return; }

    if (typeof album.images !== 'undefined') {
      album.images = JSON.stringify(album.images);
    }

    jQuery.ajax({
      type: "POST",
      data: album,
      url: WS.ALBUM + (typeof id === 'undefined' ? "" : id + "/"),
      success: function (data, status, XHR) {
        if (typeof callback === 'function') {
          callback(data, status, XHR);
        }
      }
    });
  };

  self.deleteAlbum = function (id) {
    if (typeof id === 'undefined') { return; }

    jQuery.ajax({
      type: 'DELETE',
      url: WS.ALBUM + id + "/"
    });
  };

  self.deleteImage = function (id) {
    if (typeof id === 'undefined') { return; }

    jQuery.ajax({
      type: "DELETE",
      url: WS.IMAGES + id + "/"
    });
  };

  ui.nav.add({
    handler: self,
    label: 'gallery'
  });

  return self;
}());

gallery.browser = (function () {
  var make = function (e) { return $(document.createElement(e)); };
  var table;

  var body = function () {
    table = make("div")
      .addClass("gallery browser");

    make("a")
      .addClass("album")
      .append(make("h6")
        .addClass("title")
        .text("Create Album")
      )
      .click(function () {
        gallery.editor();
      })
      .appendTo(table);

    var addAlbums = function (albums) {
      _.each(albums, function (album) {
        var node = make("a")
          .addClass("album");
        make("h6")
          .addClass("title")
          .text(album.name)
          .appendTo(node);
        make("p")
          .addClass("description")
          .text(album.description)
          .appendTo(node);

        node.click(function () {
          gallery.editor(album);
        });

        table.append(node);
      });
    };

    gallery.getAlbums(addAlbums);
    return table;
  };

  var cleanup = function () {

  };

  return function () {
    ui.nav.title('browse albums');
    ui.body.set(body(), cleanup);
    ui.footer.hide();
  };
}());

gallery.editor = (function () {
  var make = function (e) { return $(document.createElement(e)); };
  var album,
    inputs = [],
    main;

  var body = function () {
    main = make("div")
      .addClass("gallery editor");

    var form = make("form").appendTo(main);

    inputs.push(make("input")
      .attr({
        name: "name",
        type: "text",
        placeholder: "Album Name"
      })
      .addClass("name")
      .val(album.name)
      .appendTo(form));

    inputs.push(make("textarea")
      .attr({
        name: "description",
        placeholder: "Album description"
      })
      .addClass("description")
      .html(album.description)
      .appendTo(form));

    inputs.push(make("input")
      .attr({
        name: "cover",
        type: "hidden"
      })
      .val(album.cover)
      .appendTo(form));

    var images = make("div")
      .addClass("images")
      .appendTo(main);

    if (album.id) {
      gallery.getImages(album.id, function(images_) {
        album.images = images_;

        _.each(album.images, function (image) {
          var editImage = function () {
            captioner(image);
          };

          var node = make("div")
            .addClass("image");

          if (image.caption.length > 0) {
            node.addClass("captioned");
          }

          make("img")
            .addClass("thumbnail")
            .attr("src", image.thumbnail)
            .click(editImage)
            .appendTo(node);

          image.dirty = false;
          image.node = node;

          images.append(node);
        });
      });
    }

    return main;
  };

  var captioner = function (image) {
    var node = make("div")
        .addClass("gallery captioner"),
      foot = make("div")
        .addClass("gallery captioner")
      ;
    var inputs = {};

    var close = function () {
      main.show();
      node.fadeOut(function () {
        node.remove();
        ui.nav.show();
      });
      ui.footer.set(footer());
    };

    make("img")
      .attr({
        "src": image.url
      })
      .addClass("full")
      .appendTo(node);

    inputs.caption = make("textarea")
      .attr({
        "name": "caption",
        "id": "caption",
        "placeholder": "Enter image caption here"
      })
      .val(image.caption);

    make("div")
      .addClass("center")
      .append(inputs.caption)
      .appendTo(foot);

    var dState = 0;
    make("a")
      .addClass("delete")
      .text("Delete")
      .click(function (event) {
        dState++;
        var $this = $(this);

        if (dState === 1) {
          $this.text($this.text() + "?");
          return;
        }

        gallery.deleteImage(image.id);
        close();
      })
      .appendTo(foot);

    if (album.cover !== image.thumbnail) {
      make("a")
        .addClass("cover")
        .text("Make Album Cover")
        .click(function (event) {
          album.cover = image.thumbnail;
          var filename = image.thumbnail.split('/');
          main.find(":hidden[name=cover]").val(filename.pop());
          $(this).remove();
        })
        .appendTo(foot);
    }

    make("a")
      .addClass("cancel")
      .text("Cancel")
      .click(function (event) {
        close();
      })
      .appendTo(foot);

    make("a")
      .addClass("save")
      .text("Save")
      .click(function (event) {
        if (image.caption !== inputs.caption.val()) {
          image.dirty = true;
          image.caption = inputs.caption.val();
          if (image.caption.length > 0) {
            image.node.addClass("captioned");
          }
        }
        close();
      })
      .appendTo(foot);

    ui.footer.set(foot);
    ui.nav.hide();
    node.hide().fadeIn().insertBefore(main);
    main.hide();
  };

  var data = function () {
    var output = {};
    _.each(inputs, function (input) {
      output[input.attr("name")] = input.val();
    });

    output.images = [];
    _.each(album.images, function (image) {
      if (image.dirty) {
        output.images.push({
          id: image.id,
          caption: image.caption
        });
      }
    });

    return output;
  };

  var cleanup = function () {
  };

  var footer = function () {
    var container = make("div")
      .addClass("gallery editor");

    make("a")
      .text("save")
      .click(function () {
        gallery.saveAlbum(album.id, data());
      })
      .appendTo(container);

    var dState = 0;
    make("a")
      .text("delete")
      .click(function () {
        dState++;
        $this = $(this);

        if (dState === 1) {
          $this.text($this.text() + "?");
          return;
        }

        gallery.deleteAlbum(album.id);
        gallery.browser();
      })
      .appendTo(container);

    var uploader = (function () {
      var IFRAME_ID = "IMAGE_UPLOAD_IFRAME";

      var node = make("div")
        .addClass("uploader");

      var form = make("form")
        .attr({
          "method": "POST",
          "enctype": "multipart/form-data",
          "action": WS_PREFIX + "/album/" + album.id + "/",
          "target": IFRAME_ID
        }).appendTo(node);

      make("iframe")
        .attr("id", IFRAME_ID)
        .appendTo(node);

      make("input")
        .attr({
          "type": "file",
          "name": "images"
        })
        .change(function (event) {
          form.submit();
        })
        .appendTo(form);

      return node;
    }()).appendTo(container);

    if (typeof album.id === 'undefined') {
      uploader.hide();
    }

    return container;
  };

  return function (album_) {
    album = (typeof album_ === 'undefined') ? {
      name: "",
      description: "",
      cover: ""
    } : album_;

    ui.nav.title('edit: ' + album.name);
    ui.body.set(body(), cleanup);
    ui.footer.show().set(footer());
  };
}());

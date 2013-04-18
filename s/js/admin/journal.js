var journal = (function () {
  var self = {},
    actions = {},
    WS = {
      "ENTRIES": WS_PREFIX + "/entry/",
      "TAGS": WS_PREFIX + "/tags/"
    };

  self.drafts = (function (ls) {
    var KEY = "journalDrafts";

    var self = {},
      enabled = (typeof ls !== 'undefined'),
      drafts
      ;

    self.save = function () {
      if (!enabled) { return -1; }

      ls.setItem(KEY, JSON.stringify(drafts));
      self.dirty = false;
    };

    self.add = function (entry) {
      if (!enabled) { return -1; }
      entry.date = {
        "year": entry.date.getFullYear(),
        "month": entry.date.getMonth(),
        "day": entry.date.getDate(),
        "hour": entry.date.getHours(),
        "minute": entry.date.getMinutes(),
        "second": entry.date.getSeconds()
      };
      entry.tags = JSON.parse(entry.tags);

      if (typeof entry.id !== 'undefined') {
        entry.id = parseInt(entry.id, 10);
        console.log(entry.date);
        drafts[entry.id] = entry;
      } else {
        entry.id = drafts.length;
        drafts.push(entry);
      }

      self.length = drafts.length;
      self.dirty = true;

      return entry.id;
    };

    self.remove = function (index) {
    };

    self.get = function (index) {
      var res;
      if (!enabled) { return -1; }

      if (typeof index === 'undefined') {
        res = drafts;
        var i, l, draft;
        for (i = 0, l = res.length; i < l; i++) {
          draft = res[i];
          draft.date = new Date(draft.date.year, draft.date.month,
            draft.date.day, draft.date.hour, draft.date.minute,
            draft.date.second);
          draft.isDraft = true;
        }
      } else {
        res = drafts[index];
        res.date = new Date(res.date.year, res.date.month,
          res.date.day, res.date.hour, res.date.minute,
          res.date.second);
        res.isDraft = true;
      }
      return res;
    };

    self.length = 0;
    self.dirty = false;

    if (enabled) {
      try {
        drafts = JSON.parse(ls.getItem(KEY));
        if (drafts) {
          var index, l;
          for (index = 0, l = drafts.length; index < l; index++) {
            drafts[index].id = index;
          }
          self.length = drafts.length;
        } else {
          drafts = [];
          self.length = 0;
          ls.setItem(KEY, drafts);
        }
      } catch (e) {
        enabled = false;
      }
    }

    self.enabled = enabled;
    return self;
  }(window.localStorage));

  self.tags = (function () {
    var self = {},
      tags = [],
      dirty = false
      ;

    self.get = function (id) {
      var res, req;
      if (typeof id === 'undefined') {
        if (dirty) {
          req = jQuery.ajax({
            async: false,
            dataType: "json",
            type: "GET",
            url: WS.TAGS,
            success: function (data, status, XHR) {
              tags = _.map(data.tags, function (tag) {
                tag.dirty = true;
                return tag;
              });
              dirty = false;
            }
          });
        }
        res = _.map(tags, function (tag) {
          return {
            name: tag.name,
            id: tag.id,
            count: tag.count
          };
        });
      } else {
        var tag = _.find(tags, function (tag) {
          return tag.id === id;
        });
        if (tag.dirty) {
          req = jQuery.ajax({
            dataType: "json",
            type: "GET",
            url: WS.TAGS + tag.id + "/",
            async: false,
            success: function (data, status, XHR) {
              tag.dirty = false;
              tag.entries = _.map(data.entries, function (entry) {
                entry.date = new Date(entry.date.year, entry.date.month,
                  entry.date.day, entry.date.hour, entry.date.minute,
                  entry.date.second);

                return entry;
              });
            }
          });
        }
        res = tag;
      }
      return res;
    };

    self.prep = function (tags) {
      if (typeof _.find(tags, function (t) { return typeof t === 'string'; }) !== 'undefined') {
        dirty = true;
      }

      return JSON.stringify(tags);
    };

    self.delete = function (id, callback) {
      if (typeof id === 'undefined') { return; }
      dirty = true;

      jQuery.ajax({
        type: "DELETE",
        url: WS.TAGS + id + "/",
        success: function (data, status, XHR) {
          if (typeof callback === 'function') { callback(); }
        }
      });
    };

    self.update = function (tag, callback) {
      if (typeof tag !== 'object') { return; }
      dirty = true;

      jQuery.ajax({
        dataType: "json",
        data: {
          "additions": JSON.stringify(tag.additions),
          "removals": JSON.stringify(tag.removals)
        },
        type: "POST",
        url: WS.TAGS + tag.id + "/",
        success: function (data, status, XHR) {
          if (typeof callback === 'function') {
            callback();
          }
        }
      });
    };

    jQuery.ajax({
      dataType: "json",
      type: "GET",
      url: WS.TAGS,
      success: function (data, status, XHR) {
        tags = _.map(data.tags, function (tag) {
          tag.dirty = true;
          return tag;
        });
        dirty = false;
      }
    });

    return self;
  }());

  self.msg = function (signal) {
    if (actions.hasOwnProperty(signal)) {
      actions[signal]();
    }
  };

  var modified = true,
    entries;
  self.getEntries = function (callback) {
    if (typeof callback !== 'function') { return; }

    if (!modified) {
      callback(entries);
      return modified;
    }

    jQuery.ajax({
      dataType: "json",
      type: "GET",
      url: WS.ENTRIES,
      success: function (data, status, XHR) {
        callback(_.map(data.entries, function (entry) {
          entry.date = new Date(entry.date.year, entry.date.month,
            entry.date.day, entry.date.hour, entry.date.minute,
            entry.date.second);

          return entry;
        }));
      }
    });

    return modified;
  };
  self.getEntry = function (id, callback) {
    if (typeof callback !== 'function') { return; }
    if (typeof id === 'undefined') { return; }

    jQuery.ajax({
      dataType: "json",
      type: "GET",
      url: WS.ENTRIES + id + "/",
      success: function (data, status, XHR) {
        var entry = data.entry;

        entry.date = new Date(entry.date.year, entry.date.month,
          entry.date.day, entry.date.hour, entry.date.minute,
          entry.date.second);

        callback(entry);
      }
    });
  };
  self.saveEntry = function (entry, callback) {
    if (typeof entry !== 'object') { return; }
    var formatDate = function (d) {
      return (d.getFullYear()) +
        "-" + (d.getMonth()+1) +
        "-" + (d.getDate()) +
        " " + (d.getHours()) +
        ":" + (d.getMinutes());
    };

    entry.date = formatDate(entry.date);

    jQuery.ajax({
      dataType: "json",
      type: "POST",
      data: entry,
      url: (WS.ENTRIES + ((typeof entry.id === 'undefined') ? '' : (entry.id + "/"))),
      success: function (data, status, XHR) {
        if (typeof callback === 'function') { callback(); }
      },
      error: function (a, b, c) {
        console.log(a, b, c);
      }
    });
  };
  self.deleteEntry = function (id) {
    if (typeof id === 'undefined') { return; }

    jQuery.ajax({
      type: "DELETE",
      url: WS.ENTRIES + id + "/"
    });
  };

  actions.entries = function () {
    self.browser();
  };

  actions.tags = function () {
    self.tagBrowser();
  };

  ui.nav.add({
    handler: self,
    label: 'journal',
    sublabels: _.keys(actions)
  });

  return self;
}());

journal.editor = (function () {
  var make = function (type) { return $(document.createElement(type)); };
  var form = make("form").addClass("journal editor");
  var inputs = [];

  var entry = {};
  var body = function () {
    inputs.push(make("input")
      .addClass("title")
      .attr("placeholder", "title")
      .attr("name", "title")
      .attr("type", "text")
      .val(entry.title)
      .appendTo(form));

    var holder = make("div")
      .addClass("body")
      .appendTo(form);

    var isFirst = true;
    var text = make("textarea")
      .text(entry.content)
      .attr("name", "content")
      .focus(function () {
        if (isFirst) {
          $(this).text('');
          isFirst = false;
        }
      })
      .bind('input', function () {
        resizeTester.children("span").html(text.val());
      })
      .appendTo(holder);
    inputs.push(text);

    var resizeTester = make("pre")
      .addClass("hidden")
      .append(make("span")
        .html(text.val())
      )
      .append(make("br"))
      .appendTo(holder);

    inputs.push(ui.tagInput(
          (typeof entry.tags === 'undefined') ? [] : entry.tags,
          journal.tags.get()
        ).addClass("tags")
        .appendTo(form));

    if (typeof entry.id !== 'undefined') {
      inputs.push(make("input")
        .attr("name", "id")
        .attr("type", "hidden")
        .val(entry.id)
        .appendTo(form)
      );
    }

    return form;
  };

  var mdConverter = new Showdown.converter();

  var footer = function () {
    var container = make("div")
      .addClass("journal editor");

    var preview = null;
    container.append(make("a")
      .text("preview")
      .click(function () {
        if (preview !== null) {
          preview.fadeOut(function () {
            preview.remove();
            preview = null;
            ui.nav.show();
          });
          return;
        }

        var md = form.find('[name=content]').val();

        preview = make("div").addClass("preview");
        preview.append(make("h1")
          .text(form.children('[name=title]').val())
        );
        preview.append(make("div")
          .html(mdConverter.makeHtml(md))
        );

        preview.hide().fadeIn().insertBefore(form);
        ui.nav.hide();
      })
    );

    container.append(make("a")
      .text("publish")
      .click(function () {
        journal.saveEntry(data(), function () {
          journal.browser();
        });
      })
    );

    if (typeof entry.id !== 'undefined') {
      var state = 0;
      container.append(make("a")
        .text("delete")
        .click(function () {
          if (state === 1) {
            journal.deleteEntry(entry.id);
            journal.browser();
            state = 0;
          } else {
            state = 1;
            var $t = $(this);
            $t.text($t.text() + "?");
          }
        })
      );
    }

    if (journal.drafts.enabled) {
      container.append(make("a")
        .text("save")
        .click(function () {
          var entryData = data();
          if (typeof entryData.id === 'undefined') {
            if (typeof entry.id !== 'undefined') {
              entryData.id = entry.id;
            }
          }
          entry.id = journal.drafts.add(data());
          journal.drafts.save();
          journal.browser();
        })
      );
    }

    return container;
  };

  var cleanup = function () {
    ui.footer.hide();
  };

  var data = function () {
    var values = {};

    _.each(inputs, function (i) {
      values[i.attr("name")] = (i.attr("name") === 'tags') ?
        journal.tags.prep(i.data("value")) : i.val();
    });

    values.date = (typeof entry.date === 'undefined') ? new Date() : entry.date;

    return values;
  };

  return function (entry_) {
    form.empty();
    inputs = [];
    entry = (typeof entry_ === 'undefined') ? {
      title: "",
      content: "entry content"
    } : entry_;

    ui.nav.title(entry.title.length > 0 ? 'edit: ' + entry.title : 'new entry');
    ui.body.set(body(), cleanup);
    ui.footer.show().set(footer());
  };
}());

journal.browser = (function () {
  var MONTHS = [
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December"
    ],
    DAYS = [
      "Sunday", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday"
    ];
  var make = function (type) { return $(document.createElement(type)); };
  var table = make("div").addClass("journal browser");

  var body = function () {
    var loading = false,
      addEntries = function (entries) {
      if (loading) {
        loading = false;
        table.empty();
      }

      _.each(entries, function (entry) {
        var node = make("a").addClass("entry");
        node.append(make("span")
          .addClass("title")
          .text(entry.title)
        );
        node.append(make("span")
          .addClass("date")
          .text(DAYS[entry.date.getDay()] + ", "
            + MONTHS[entry.date.getMonth()] + " "
            + (entry.date.getDate()+1)
          )
        );
        node.click(function () {
          journal.getEntry(entry.id, function (entry) {
            journal.editor(entry);
          });
        });

        table.append(node);
      });

      _.each(journal.drafts.get(), function (entry) {
        var node = make("a").addClass("entry draft");
        node.append(make("span")
          .addClass("title")
          .text(entry.title)
        );
        node.append(make("span")
          .addClass("date")
          .text(DAYS[entry.date.getDay()] + ", "
            + MONTHS[entry.date.getMonth()] + " "
            + entry.date.getDate()
          )
        );
        node.click(function () {
          journal.editor(entry);
        });

        table.append(node);
      });
    };

    if (journal.getEntries(addEntries)) {
      table.empty().text("loading");
      loading = true;
    }

    return table;
  };

  var footer = function () {
    var node = make("div")
      .addClass("journal browser");

    make("a")
      .text("create")
      .click(function () {
        journal.editor();
      })
      .appendTo(node);

    return node;
  };

  var cleanup = function () {
  };

  return function () {
    ui.nav.title('browse entries');
    ui.body.set(body(), cleanup);
    ui.footer.show().set(footer());
  };
}());

journal.tagBrowser = (function () {
  var make = function (type) { return $(document.createElement(type)); };
  var table = make("div").addClass("journal tagBrowser");
  var body = function () {
    _.each(journal.tags.get(), function (tag) {
      var node = make("a").addClass("tag");
      node.append(make("span")
        .addClass("name")
        .text(tag.name)
      );
      node.append(make("span")
        .addClass("count")
        .text(tag.count)
      );
      node.click(function () {
        journal.tagEditor(tag.id);
      });

      table.append(node);
    });

    return table;
  };

  var cleanup = function () {
  };

  return function () {
    table.empty();
    ui.nav.title('edit tags');
    ui.body.set(body(), cleanup);
    ui.footer.hide();
  };
}());

journal.tagEditor = (function () {
  var make = function (type) { return $(document.createElement(type)); };
  var tag, additions = [], removals = [];

  var body = function () {
    var table = make("div").addClass("journal tagEditor twoColumn");

    var tagged = make("div").addClass("leftColumn tagged")
      .append(make("h6")
        .addClass("title")
        .text("tagged")
      )
      .appendTo(table);
    var untagged = make("div").addClass("rightColumn untagged")
      .append(make("h6")
        .addClass("title")
        .text("untagged")
      )
      .appendTo(table);

    _.each(tag.entries, function (entry) {
      var node = make("a").addClass("entry");

      node.append(make("span")
        .addClass("title")
        .text(entry.title)
      );
      node.append(make("span")
        .addClass("date")
        .text((entry.date.getMonth()+1) + "/" +
          (entry.date.getDate()+1))
      );
      node.click(function () {
        entry.tagged = !entry.tagged;
        if (entry.tagged) {
          if (removals.indexOf(entry.id) !== -1) {
            removals.splice(removals.indexOf(entry.id), 1);
          } else {
            additions.push(entry.id);
          }
          tagged.append(node);
        } else {
          if (additions.indexOf(entry.id) !== -1) {
            additions.splice(additions.indexOf(entry.id), 1);
          } else {
            removals.push(entry.id);
          }
          untagged.append(node);
        }
      });

      if (entry.tagged) {
        tagged.append(node);
      } else {
        untagged.append(node);
      }
    });

    return table;
  };

  var cleanup = function () {
    ui.footer.hide();
  };

  var footer = function () {
    var holder = make("div").addClass("tagEditor");

    holder.append(make("a")
      .text("save")
      .click(function () {
        journal.tags.update({
          id: tag.id,
          additions: additions,
          removals: removals
        }, function () {
          journal.tagBrowser();
        });
      })
    );

    var click_cnt = 0;
    holder.append(make("a")
      .text("delete")
      .click(function () {
        click_cnt++;
        var $input = $(this);
        var contents = $input.text();

        if (click_cnt === 1) {
          $input.text(contents + "?");
        } else {
          click_cnt = 0;
          journal.tags.delete(tag.id, function () {
            $input.text(contents.substr(0, contents.length-1));
            journal.tagBrowser();
          });
        }
      })
    );
    return holder;
  };

  return function (id) {
    tag = journal.tags.get(id);

    ui.nav.title('edit tag: ' + tag.name);
    ui.body.set(body(), cleanup);
    ui.footer.show().set(footer());
  };
}());

ui.tagInput = function (tags, avail_) {
  var DELIM = " ",
     FADE_SPEED = 200;
  var make = function (type) { return $(document.createElement(type)); };
  var in_progress = tags.length - 1;
  var avail = {},
     cycle = {
       flag: false,
       loc: -1,
       filter: null
     };
  var cloud = make("div")
    .addClass("tagCloud");

  _.each(avail_, function (e) {
    var node = make("span")
      .addClass("tag")
      .text(e.name)
      .appendTo(cloud);
    e.node = node;
    avail[e.id] = e;
  });

  var node = make("input")
    .attr({
      "name": "tags",
      "type": "text",
      "placeholder": "entry tags (space delimited)"
    })
    .val(_.map(tags, function (id) {
      avail[id].node.addClass("tagged");
      return avail[id].name;
    }).join(DELIM))
    .data("value", tags);

  node.bind("focus", function () {
    cloud.insertAfter(node)
      .fadeIn(FADE_SPEED);
  })
  .bind("blur", function () {
    cloud.fadeOut(FADE_SPEED, cloud.remove);
  })
  .bind("input", function () {
    //handle matching to tag cloud
    var current = new RegExp(getLastTag(), "i");
    tags[in_progress] = getLastTag();

    cloud.children(".nomatch").removeClass("nomatch");
    _.each(_.reject(avail, function (e) { return current.test(e.name); }),
      function (e) {
        e.node.addClass("nomatch");
      });
  })
  .bind("keypress", function (event) {
    switch (event.which) {
      case 32:
        in_progress++;
        var filter = cycle.flag ? cycle.filter : new RegExp(getLastTag(), "i");
        var matches = _.filter(avail, function (e) { return filter.test(e.name); });

        if (matches.length === 0) {
          return true;
        }

        var vis = node.attr("value").split(DELIM);
        if (matches.length === 1) {
          vis[vis.length-1] = matches[0].name;
          tags[vis.length-1] = matches[0].id;
        } else {
          cycle.filter = filter;
          cycle.loc++;
          if (cycle.flag) {
            vis.pop();
            tags.pop();
            in_progress--;
          }
          if (cycle.loc >= matches.length) {
            cycle.loc = 0;
          }
          vis[vis.length-1] = matches[cycle.loc].name;
          tags[vis.length-1] = matches[cycle.loc].id;
          cycle.flag = true;
        }
        node.attr("value", vis.join(DELIM) + " ");

        event.stopPropagation();
        return false;
      default:
        cycle.flag = false;
        cycle.loc = -1;
        break;
    }
  });

  var getLastTag = function () {
    var raw = node.attr("value");

    raw = raw.split(DELIM);
    return raw[raw.length-1];
  };

  return node;
};

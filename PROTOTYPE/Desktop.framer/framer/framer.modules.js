require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Actions":[function(require,module,exports){
exports.attachStates = function(Layer, Properties) {
  var properties, results, state;
  if (Properties == null) {
    Properties = {
      On: {
        opacity: 1
      },
      Off: {
        opacity: 0
      }
    };
  }
  results = [];
  for (state in Properties) {
    properties = Properties[state];
    results.push(Layer.states.add(state, properties));
  }
  return results;
};

exports.Toggle = function(Layer, States) {
  if (States == null) {
    States = ["On", "Off"];
  }
  return Layer.states["switch"](Layer.states.current !== States[0] ? States[0] : States[1]);
};

exports.getLayer = function(parentLayer, Path) {
  var group, i, layer, len;
  layer = parentLayer;
  for (i = 0, len = Path.length; i < len; i++) {
    group = Path[i];
    layer = layer.subLayersByName(group)[0];
  }
  return layer;
};

exports.setViews = function(layers, Layers) {
  var Layer, View, i, layer, len, ref, results;
  results = [];
  for (i = 0, len = layers.length; i < len; i++) {
    layer = layers[i];
    ref = layer.name.split("_"), Layer = ref[0], View = ref[1];
    if (Layer === "View") {
      layer.on(Events.Click, function() {
        var ref1;
        ref1 = this.name.split("_"), Layer = ref1[0], View = ref1[1];
        return Layers[View].superLayer.superLayer.bringToFront();
      });
    }
    results.push(setViews(layer.subLayers, Layers));
  }
  return results;
};


},{}],"Flex":[function(require,module,exports){
exports.Fluid = new Layer({
  backgroundColor: "transparent"
});

exports.Fluid.fluid({
  autoWidth: true,
  autoHeight: true
});

exports.Arrange = function(sublayer, fixed) {
  var j, k, left, len, len1, len2, m, ref, ref1, ref2, results, right, s, ssublayer;
  if (fixed == null) {
    fixed = [];
  }
  switch ((sublayer.name.split("_"))[1]) {
    case "full":
      sublayer.width = sublayer.superLayer.width;
      sublayer.x = 0;
      break;
    case "center":
      sublayer.centerX();
      sublayer.pixelAlign();
      break;
    case "right":
      sublayer.x = sublayer.superLayer.width - sublayer.width;
      sublayer.pixelAlign();
      break;
    case "left":
      sublayer.x = 0;
      sublayer.pixelAlign();
      break;
    case "middle":
      ref = sublayer.siblingLayers;
      for (j = 0, len = ref.length; j < len; j++) {
        s = ref[j];
        if ((s.name.split("_"))[1] === "left") {
          left = s;
        }
      }
      ref1 = sublayer.siblingLayers;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        s = ref1[k];
        if ((s.name.split("_"))[1] === "right") {
          right = s;
        }
      }
      if ((left != null) && (right != null)) {
        right.x = right.superLayer.width - right.width;
        right.pixelAlign();
        left.x = 0;
        left.pixelAlign();
        sublayer.x = left.width;
        sublayer.width = right.x - left.width;
      }
  }
  switch ((sublayer.name.split("_"))[2]) {
    case "bottom":
      sublayer.y = sublayer.superLayer.height - sublayer.height;
      break;
    case "top":
      sublayer.y = 0;
      break;
    case "full":
      sublayer.height = sublayer.superLayer.height;
      sublayer.y = 0;
  }
  switch ((sublayer.name.split("_"))[3]) {
    case "fixed":
      sublayer.originY = sublayer.y;
      sublayer.bringToFront();
      fixed.push(sublayer);
  }
  switch ((sublayer.name.split("_"))[4]) {
    case "distribute":
      exports.Distribute(sublayer);
      break;
    case "inline":
      exports.Inline(sublayer);
      break;
    case "column":
      exports.Column(sublayer);
  }
  if (sublayer.subLayers.length > 0) {
    ref2 = sublayer.subLayers;
    results = [];
    for (m = 0, len2 = ref2.length; m < len2; m++) {
      ssublayer = ref2[m];
      results.push(exports.Arrange(ssublayer, fixed));
    }
    return results;
  }
};

exports.Parse = function(Scroll, Container, Artboard) {
  var Fixed, Frame, Groups, j, key, l, layer, len, ref;
  Artboard.visible = true;
  Frame = Container.frame;
  Groups = {};
  ref = Artboard.subLayers;
  for (j = 0, len = ref.length; j < len; j++) {
    l = ref[j];
    Groups[l.name] = l;
  }
  Scroll.frame = Frame;
  Scroll.superLayer = Container.id !== 1 ? Container : void 0;
  Scroll.x = 0;
  Scroll.y = 0;
  Fixed = [];
  Artboard.superLayer = Scroll.content;
  Artboard.x = 0;
  Artboard.y = 0;
  Artboard.width = Frame.width;
  for (key in Groups) {
    layer = Groups[key];
    exports.Arrange(layer, Fixed);
  }
  return Scroll.content.on("change:y", function() {
    var f, k, len1, results;
    results = [];
    for (k = 0, len1 = Fixed.length; k < len1; k++) {
      f = Fixed[k];
      results.push(f.y = f.originY - this.y);
    }
    return results;
  });
};

exports.Flex = function(Scroll, Container, Artboard) {
  return exports.Fluid.on("change:size", function() {
    return exports.Parse(Scroll, Container, Artboard);
  });
};

exports.Make = function(Scroll, Container, Artboard) {
  exports.Parse(Scroll, Container, Artboard);
  return exports.Flex(Scroll, Container, Artboard);
};

exports.Column = function(Container) {
  var Block, i, j, len, ref;
  Container.subLayers[0].y = 0;
  ref = Container.subLayers;
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    Block = ref[i];
    if (i > 0) {
      Block.y = Container.subLayers[i - 1].y + Container.subLayers[i - 1].height;
    }
  }
  return Container.pixelAlign();
};

exports.Inline = function(Container) {
  var COLS, H, Height, Width, i, j, jk, jx, jy, len, ref, sublayer;
  Container.width = Container.superLayer.width;
  Container.x = 0;
  Width = Container.width / Container.subLayers.length;
  Height = Container.subLayers[0].height;
  H = 0;
  if (Width < Container.subLayers[0].width) {
    Width = Container.subLayers[0].width;
  }
  COLS = Math.floor(Container.width / Width);
  Container.x = (Width - Container.subLayers[0].width) * .5;
  COLS = COLS > -1 ? COLS : 0;
  Width = Container.width / COLS;
  jx = 0;
  jy = -1;
  ref = Container.subLayers;
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    sublayer = ref[i];
    if (jx < COLS) {
      jx = jx;
    } else {
      jx = 0;
    }
    jk = jx === 0 ? jy++ : void 0;
    sublayer.y = jy * Height;
    sublayer.x = jx * Width;
    jx++;
    sublayer.pixelAlign();
  }
  return Container.height = (jy + 1) * Height;
};

exports.Distribute = function(Container) {
  var X, i, j, len, ref, results, sublayer, virtual;
  Container.width = Container.superLayer.width;
  Container.x = 0;
  ref = Container.subLayers;
  results = [];
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    sublayer = ref[i];
    virtual = new Layer({
      superLayer: Container,
      width: Container.width / Container.subLayers.length,
      backgroundColor: "transparent"
    });
    virtual.x = i * virtual.width;
    sublayer.superLayer = virtual;
    sublayer.centerX();
    sublayer.pixelAlign();
    X = sublayer.x + virtual.x;
    sublayer.superLayer = Container;
    sublayer.x = X;
    results.push(virtual.destroy());
  }
  return results;
};


},{}],"Response":[function(require,module,exports){
exports.Make = function(Design) {
  var key, layer, results;
  results = [];
  for (key in Design) {
    layer = Design[key];
    switch ((layer.name.split("_"))[0]) {
      case "BUTTON":
        layer.on(Events.MouseOver, function() {
          this.brightness = 80;
          return this.style.cursor = "pointer";
        });
        results.push(layer.on(Events.MouseOut, function() {
          this.brightness = 100;
          return this.style.cursor = "pointer";
        }));
        break;
      default:
        results.push(void 0);
    }
  }
  return results;
};


},{}],"functions":[function(require,module,exports){
exports.Navigator = function(Layer) {
  var Selector, controller, i, j, len, len1, ref, ref1, results, view;
  Selector = Layer.subLayersByName("Selector")[0];
  Selector.visible = false;
  ref = Layer.subLayersByName("Views")[0].subLayers;
  for (i = 0, len = ref.length; i < len; i++) {
    view = ref[i];
    view.visible = false;
  }
  ref1 = Layer.subLayersByName("Controllers")[0].subLayers;
  results = [];
  for (j = 0, len1 = ref1.length; j < len1; j++) {
    controller = ref1[j];
    Selector.states.add(controller.name, {
      x: controller.x + controller.superLayer.x,
      y: controller.y + controller.superLayer.y
    });
    results.push(controller.on(Events.Click, function() {
      var len2, m, ref2, results1, show;
      Selector.visible = true;
      Selector.states.switchInstant(this.name);
      ref2 = Layer.subLayersByName("Views")[0].subLayers;
      results1 = [];
      for (m = 0, len2 = ref2.length; m < len2; m++) {
        view = ref2[m];
        if (view.name === this.name) {
          view.visible = true;
          view.opacity = 0;
          show = new Animation({
            layer: view,
            properties: {
              opacity: 1
            }
          });
          results1.push(show.start());
        } else {
          results1.push(view.visible = false);
        }
      }
      return results1;
    }));
  }
  return results;
};

exports.setTabActive = function(Docker, tabName) {
  var controller, i, j, l, len, len1, len2, m, ref, ref1, ref2, results, results1, view;
  if (tabName != null) {
    Docker.subLayersByName("Views")[0].subLayersByName(tabName)[0].states["switch"]("On");
    ref = Docker.subLayersByName("Controllers")[0].subLayersByName(tabName)[0].subLayers;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      l = ref[i];
      results.push(l.states["switch"]("On"));
    }
    return results;
  } else {
    ref1 = Docker.subLayersByName("Views")[0].subLayers;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      view = ref1[j];
      view.states["switch"]("Off");
    }
    ref2 = Docker.subLayersByName("Controllers")[0].subLayers;
    results1 = [];
    for (m = 0, len2 = ref2.length; m < len2; m++) {
      controller = ref2[m];
      results1.push((function() {
        var len3, n, ref3, results2;
        ref3 = controller.subLayers;
        results2 = [];
        for (n = 0, len3 = ref3.length; n < len3; n++) {
          l = ref3[n];
          results2.push(l.states["switch"]("Off"));
        }
        return results2;
      })());
    }
    return results1;
  }
};

exports.Inspector = function(Layer) {
  var ContentScroll, Labels, back, content, controller, i, j, len, len1, ref, ref1, results, view;
  Labels = Layer.subLayersByName("Labels")[0];
  Labels.states.add({
    On: {
      opacity: 1
    },
    Off: {
      opacity: 0
    }
  });
  ref = Layer.subLayersByName("Views")[0].subLayers;
  for (i = 0, len = ref.length; i < len; i++) {
    view = ref[i];
    view.visible = false;
    ContentScroll = new ScrollComponent({
      width: 240,
      height: 840,
      superLayer: view.subLayersByName("Back")[0]
    });
    ContentScroll.scrollHorizontal = false;
    content = view.subLayersByName("Content")[0];
    content.superLayer = ContentScroll.content;
    content.x = 24;
    content.y = 48;
  }
  ref1 = Layer.subLayersByName("Controllers")[0].subLayers;
  results = [];
  for (j = 0, len1 = ref1.length; j < len1; j++) {
    controller = ref1[j];
    back = controller.subLayersByName("Bckgr")[0];
    back.states.add({
      On: {
        opacity: 1
      },
      Off: {
        opacity: 0
      }
    });
    back.states["switch"]("Off");
    results.push(back.on(Events.Click, function() {
      var b, hide, len2, len3, len4, m, n, o, ob, otherbacks, ref2, ref3, results1, show;
      otherbacks = [];
      ref2 = this.superLayer.siblingLayers;
      for (m = 0, len2 = ref2.length; m < len2; m++) {
        b = ref2[m];
        otherbacks.push(b.subLayersByName("Bckgr")[0]);
      }
      for (n = 0, len3 = otherbacks.length; n < len3; n++) {
        ob = otherbacks[n];
        ob.states["switch"]("Off");
      }
      this.states["switch"](this.states.current === "Off" ? "On" : "Off");
      Labels.states["switch"](this.states.current === "On" ? "Off" : "On");
      ref3 = Layer.subLayersByName("Views")[0].subLayers;
      results1 = [];
      for (o = 0, len4 = ref3.length; o < len4; o++) {
        view = ref3[o];
        if (this.states.current === "On" && this.superLayer.name === view.name) {
          view.visible = true;
          view.opacity = 0;
          show = new Animation({
            layer: view,
            properties: {
              opacity: 1
            }
          });
          results1.push(show.start());
        } else {
          hide = new Animation({
            layer: view,
            properties: {
              opacity: 0
            }
          });
          hide.start();
          results1.push(view.visible = false);
        }
      }
      return results1;
    }));
  }
  return results;
};

exports.Docker = function(Layer, layerAnimation, sAnimations) {
  var Layers, Switchers, animation, i, j, k, layer, len, len1, len2, len3, len4, len5, len6, len7, m, modelDocker, n, o, p, q, r, ref, ref1, ref2, ref3, ref4, results, set, sl, switcher, view;
  modelDocker = {
    Controllers: Layer.subLayersByName("Controllers")[0],
    Views: Layer.subLayersByName("Views")[0]
  };
  Layers = [];
  ref = modelDocker.Views.subLayers;
  for (i = 0, len = ref.length; i < len; i++) {
    layer = ref[i];
    Layers.push({
      Layer: layer,
      Animation: layerAnimation
    });
  }
  Switchers = [];
  ref1 = modelDocker.Controllers.subLayers;
  for (j = 0, len1 = ref1.length; j < len1; j++) {
    layer = ref1[j];
    Switchers.push({
      Layer: layer,
      Animation: sAnimations
    });
  }
  for (m = 0, len2 = Layers.length; m < len2; m++) {
    view = Layers[m];
    ref2 = view.Animation;
    for (n = 0, len3 = ref2.length; n < len3; n++) {
      animation = ref2[n];
      view.Layer.states.add(animation);
    }
  }
  for (o = 0, len4 = Layers.length; o < len4; o++) {
    view = Layers[o];
    view.Layer.states["switch"]("Off");
  }
  results = [];
  for (k = p = 0, len5 = Switchers.length; p < len5; k = ++p) {
    switcher = Switchers[k];
    switcher.Layer.on(Events.Click, function() {
      var len10, len6, len7, len8, len9, q, r, ref3, ref4, results1, sl, state, t, u, v;
      state = "Off";
      for (q = 0, len6 = Switchers.length; q < len6; q++) {
        switcher = Switchers[q];
        ref3 = switcher.Layer.subLayers;
        for (r = 0, len7 = ref3.length; r < len7; r++) {
          sl = ref3[r];
          sl.states["switch"]("Off");
        }
      }
      ref4 = this.subLayers;
      for (t = 0, len8 = ref4.length; t < len8; t++) {
        layer = ref4[t];
        if (layer.states.current !== "On") {
          state = "On";
          layer.states["switch"]("On");
        } else {
          state = "Off";
          layer.states["switch"]("Off");
        }
      }
      for (u = 0, len9 = Layers.length; u < len9; u++) {
        view = Layers[u];
        view.Layer.states["switch"]("Off");
      }
      results1 = [];
      for (v = 0, len10 = Layers.length; v < len10; v++) {
        view = Layers[v];
        if (view.Layer.name === this.name) {
          results1.push(view.Layer.states["switch"](state));
        }
      }
      return results1;
    });
    ref3 = switcher.Animation;
    for (q = 0, len6 = ref3.length; q < len6; q++) {
      set = ref3[q];
      ref4 = set.animation;
      for (r = 0, len7 = ref4.length; r < len7; r++) {
        animation = ref4[r];
        switcher.Layer.subLayersByName(set.layer)[0].states.add(animation);
      }
    }
    results.push((function() {
      var len8, ref5, results1, t;
      ref5 = switcher.Layer.subLayers;
      results1 = [];
      for (t = 0, len8 = ref5.length; t < len8; t++) {
        sl = ref5[t];
        results1.push(sl.states["switch"]("Off"));
      }
      return results1;
    })());
  }
  return results;
};

exports.attachColorPalletToView = function(Layer) {
  var i, item, len, pallett, ref, results;
  pallett = Layer.subLayersByName("ColorPallett")[0];
  pallett.states.add({
    On: {
      opacity: 1
    },
    Off: {
      opacity: 0
    }
  });
  pallett.states.switchInstant("Off");
  ref = Layer.subLayers;
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    item = ref[i];
    item.states.add({
      Up: {
        y: item.y
      },
      Down: {
        y: item.y + 200
      }
    });
    if (item.name === "ColorButton") {
      item.states.add({
        On: {
          opacity: 1
        },
        Off: {
          opacity: 1
        }
      });
      item.states.switchInstant("Off");
      results.push(item.on(Events.Click, function() {
        var j, layer, len1, len2, m, ref1, ref2, results1, results2;
        if (this.states.current === "Off") {
          this.superLayer.subLayersByName("ColorPallett")[0].visible = true;
          this.superLayer.subLayersByName("ColorPallett")[0].states["switch"]("On");
          this.states["switch"]("On");
          ref1 = this.siblingLayers;
          results1 = [];
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            layer = ref1[j];
            if (layer.name !== "ColorPallett") {
              results1.push(layer.states["switch"]("Down"));
            }
          }
          return results1;
        } else {
          this.states["switch"]("Off");
          this.superLayer.subLayersByName("ColorPallett")[0].visible = false;
          this.superLayer.subLayersByName("ColorPallett")[0].states["switch"]("Off");
          ref2 = this.siblingLayers;
          results2 = [];
          for (m = 0, len2 = ref2.length; m < len2; m++) {
            layer = ref2[m];
            results2.push(layer.states["switch"]("Up"));
          }
          return results2;
        }
      }));
    } else {
      results.push(void 0);
    }
  }
  return results;
};

exports.Settings = function(Layer) {
  var buttonSettings, stylerSettings;
  buttonSettings = Layer.subLayersByName("ButtonSettings")[0];
  buttonSettings.states.add({
    On: {
      grayscale: 0
    },
    Off: {
      grayscale: 100
    }
  });
  buttonSettings.states.switchInstant("Off");
  stylerSettings = Layer.subLayersByName("PanelSettings")[0];
  stylerSettings.states.add({
    On: {
      opacity: 1
    },
    Off: {
      opacity: 0
    }
  });
  stylerSettings.states.switchInstant("Off");
  exports.attachColorPalletToView(stylerSettings);
  return buttonSettings.on(Events.Click, function() {
    this.states.next(["On", "Off"]);
    return stylerSettings.states.next(["On", "Off"]);
  });
};

exports.attachSwitcher = function(Layers, Switcher) {
  var Item, animation, i, j, len, len1, prefix, ref;
  prefix = Switcher.Layer.name;
  for (i = 0, len = Layers.length; i < len; i++) {
    Item = Layers[i];
    exports.attachAnimation(Item.Layer, Item.Animation, prefix);
    Item.Layer.states["switch"]("Off" + prefix);
  }
  ref = Switcher.Animation;
  for (j = 0, len1 = ref.length; j < len1; j++) {
    animation = ref[j];
    exports.attachAnimation(Switcher.Layer.subLayersByName(animation.layer)[0], animation.animation, prefix);
    Switcher.Layer.subLayersByName(animation.layer)[0].states["switch"]("Off" + prefix);
  }
  return Switcher.Layer.on(Events.Click, function() {
    var Layer, layer, len2, len3, m, n, ref1, results;
    ref1 = this.subLayers;
    for (m = 0, len2 = ref1.length; m < len2; m++) {
      layer = ref1[m];
      layer.states.next(["On" + prefix, "Off" + prefix]);
    }
    results = [];
    for (n = 0, len3 = Layers.length; n < len3; n++) {
      Layer = Layers[n];
      results.push(Layer.Layer.states.next(["On" + prefix, "Off" + prefix]));
    }
    return results;
  });
};

exports.attachAnimation = function(layer, animation, prefix) {
  var a, i, len, results, s, state;
  results = [];
  for (i = 0, len = animation.length; i < len; i++) {
    state = animation[i];
    results.push((function() {
      var results1;
      results1 = [];
      for (s in state) {
        a = state[s];
        results1.push(layer.states.add(s + prefix, a));
      }
      return results1;
    })());
  }
  return results;
};

exports.Slider = function(Group, controllerAnimation, slideAnimation, SelectedTab) {
  var animation, controller, i, j, len, len1, properties, ref, results, state;
  ref = Group.subLayersByName("Controllers")[0].subLayers;
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    controller = ref[i];
    for (j = 0, len1 = controllerAnimation.length; j < len1; j++) {
      animation = controllerAnimation[j];
      controller.subLayersByName(animation.Layer)[0].states.add(animation.Animation);
      controller.subLayersByName(animation.Layer)[0].states["switch"]("Off");
      if (SelectedTab != null) {
        if (controller.name === SelectedTab) {
          controller.subLayersByName(animation.Layer)[0].states["switch"]("On");
        }
      }
    }
    controller.on(Events.Click, function() {
      var layer, len2, len3, m, n, ref1, ref2, results1, sublayer;
      Group.subLayersByName("Content")[0].states["switch"]("On" + this.name);
      ref1 = this.subLayers;
      for (m = 0, len2 = ref1.length; m < len2; m++) {
        sublayer = ref1[m];
        sublayer.states["switch"]("On");
      }
      ref2 = this.siblingLayers;
      results1 = [];
      for (n = 0, len3 = ref2.length; n < len3; n++) {
        layer = ref2[n];
        results1.push((function() {
          var len4, o, ref3, results2;
          ref3 = layer.subLayers;
          results2 = [];
          for (o = 0, len4 = ref3.length; o < len4; o++) {
            sublayer = ref3[o];
            results2.push(sublayer.states["switch"]("Off"));
          }
          return results2;
        })());
      }
      return results1;
    });
    results.push((function() {
      var len2, m, results1;
      results1 = [];
      for (m = 0, len2 = slideAnimation.length; m < len2; m++) {
        animation = slideAnimation[m];
        results1.push((function() {
          var ref1, results2;
          ref1 = animation.Animation;
          results2 = [];
          for (state in ref1) {
            properties = ref1[state];
            state = state + animation.Layer;
            results2.push(Group.subLayersByName("Content")[0].states.add(state, properties));
          }
          return results2;
        })());
      }
      return results1;
    })());
  }
  return results;
};

exports.Select = function(item) {
  var Selection, i, len, ref, s, setSelection;
  ref = item.superLayer.subLayers;
  for (i = 0, len = ref.length; i < len; i++) {
    s = ref[i];
    if (s.name === "Selection") {
      s.destroy();
    }
  }
  Selection = new Layer({
    backgroundColor: "transparent",
    width: item.width + 4,
    height: item.height + 4,
    superLayer: item.superLayer,
    x: item.x - 2,
    y: item.y - 2,
    opacity: 0,
    name: "Selection"
  });
  Selection.style = {
    border: "1px solid #0075FD"
  };
  setSelection = new Animation({
    properties: {
      opacity: 1
    },
    layer: Selection
  });
  return setSelection.start();
};

exports.Inspector = function(Views, Controllers, Select, Postfix) {
  var controller, i, j, len, len1, properties, ref, results, state, view;
  if (Postfix == null) {
    Postfix = "Inspector";
  }
  for (i = 0, len = Views.length; i < len; i++) {
    view = Views[i];
    ref = view.Animation;
    for (state in ref) {
      properties = ref[state];
      view.Layer.states.add(state, properties);
    }
    view.Layer.states.switchInstant("Off");
  }
  results = [];
  for (j = 0, len1 = Controllers.length; j < len1; j++) {
    controller = Controllers[j];
    results.push(controller.Layer.on(Events.Click, function() {
      var len2, m, results1;
      Select(this);
      results1 = [];
      for (m = 0, len2 = Views.length; m < len2; m++) {
        view = Views[m];
        view.Layer.states.switchInstant(view.Layer.name === this.name + Postfix ? "On" : "Off");
        results1.push(view.Layer.visible = view.Layer.name === this.name + Postfix ? true : false);
      }
      return results1;
    }));
  }
  return results;
};

exports.getLayer = function(parentLayer, Path) {
  var group, i, layer, len;
  layer = parentLayer;
  for (i = 0, len = Path.length; i < len; i++) {
    group = Path[i];
    layer = layer.subLayersByName(group)[0];
  }
  return layer;
};

exports.Ruler = function(rulerLayer, sScales) {
  var Back, Label, ScalerRule, Value, styleEdit, styleNormal, valueLive;
  ScalerRule = exports.getLayer(rulerLayer, ["Slider", "ScalerWrapper", "ScalerRule"]);
  ScalerRule.states.add({
    Normal: {
      grayscale: 100,
      opacity: 0.6
    },
    Active: {
      grayscale: 0,
      opacity: 1
    }
  });
  ScalerRule.states.switchInstant("Normal");
  Back = exports.getLayer(rulerLayer, ["Slider", "Back"]);
  Back.on(Events.MouseOver, function() {
    return ScalerRule.states["switch"]("Active");
  });
  Back.on(Events.MouseOut, function() {
    return ScalerRule.states["switch"]("Normal");
  });
  ScalerRule.draggable.enabled = true;
  ScalerRule.draggable.vertical = false;
  ScalerRule.draggable.momentum = false;
  ScalerRule.draggable.speedX = 0.9;
  ScalerRule.on(Events.MouseOver, function() {
    this.style = {
      cursor: "pointer"
    };
    return this.states["switch"]("Active");
  });
  Label = exports.getLayer(rulerLayer, ["Label"]).subLayers[0];
  if (exports.getLayer(rulerLayer, ["Value"]) != null) {
    Value = exports.getLayer(rulerLayer, ["Value"]);
    Value.visible = false;
    valueLive = new Layer({
      width: 43,
      height: 18,
      x: 180,
      y: 8,
      superLayer: Value.superLayer,
      backgroundColor: "transparent"
    });
    styleNormal = {
      fontSize: "12px",
      color: "#4A90E2",
      textAlign: "right",
      lineHeight: "1",
      background: "transparent",
      padding: "0px",
      paddingRight: "4px"
    };
    styleEdit = {
      fontSize: "12px",
      color: "black",
      textAlign: "right",
      lineHeight: "1",
      background: "white",
      paddingTop: "8px",
      paddingRight: "4px",
      height: "28px",
      borderRadius: "0px 3px 3px 0px"
    };
    valueLive.style = styleNormal;
    valueLive.states.add({
      Normal: {
        y: 8
      },
      Edit: {
        y: 0
      }
    });
    valueLive.states.switchInstant("Normal");
    valueLive.on(Events.MouseOver, function() {
      return this.style.cursor = "pointer";
    });
    valueLive.on(Events.Click, function() {
      if (this.states.current === "Normal") {
        this.style = styleEdit;
        return this.states.switchInstant("Edit");
      } else {
        this.style = styleNormal;
        return this.states.switchInstant("Normal");
      }
    });
    valueLive.html = Math.round(Utils.modulate(ScalerRule.x, [275, 493], sScales[Label.name]));
    return ScalerRule.on(Events.Drag, function() {
      this.states["switch"]("Active");
      return valueLive.html = Math.round(Utils.modulate(this.x, [275, 493], sScales[Label.name]));
    });
  }
};


},{}],"myModule":[function(require,module,exports){
exports.myVar = "myVariable";

exports.myFunction = function() {
  return print("myFunction is running");
};

exports.myArray = [1, 2, 3];


},{}],"temp":[function(require,module,exports){
var Arrange, Flex, Make, Parse;

Arrange = function(sublayer, fixed) {
  var i, j, k, left, len, len1, len2, ref, ref1, ref2, results, right, s, ssublayer;
  if (fixed == null) {
    fixed = [];
  }
  switch ((sublayer.name.split("_"))[1]) {
    case "full":
      sublayer.width = sublayer.superLayer.width;
      sublayer.x = 0;
      break;
    case "center":
      sublayer.centerX();
      sublayer.pixelAlign();
      break;
    case "right":
      sublayer.x = sublayer.superLayer.width - sublayer.width;
      sublayer.pixelAlign();
      break;
    case "left":
      sublayer.x = 0;
      sublayer.pixelAlign();
      break;
    case "middle":
      ref = sublayer.siblingLayers;
      for (i = 0, len = ref.length; i < len; i++) {
        s = ref[i];
        if ((s.name.split("_"))[1] === "left") {
          left = s;
        }
      }
      ref1 = sublayer.siblingLayers;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        s = ref1[j];
        if ((s.name.split("_"))[1] === "right") {
          right = s;
        }
      }
      right.x = right.superLayer.width - right.width;
      right.pixelAlign();
      left.x = 0;
      left.pixelAlign();
      sublayer.x = left.width;
      sublayer.width = right.x - left.width;
  }
  switch ((sublayer.name.split("_"))[2]) {
    case "bottom":
      sublayer.y = sublayer.superLayer.height - sublayer.height;
      break;
    case "top":
      sublayer.y = 0;
  }
  switch ((sublayer.name.split("_"))[3]) {
    case "fixed":
      sublayer.originY = sublayer.y;
      sublayer.bringToFront();
      fixed.push(sublayer);
  }
  if (sublayer.subLayers.length > 0) {
    ref2 = sublayer.subLayers;
    results = [];
    for (k = 0, len2 = ref2.length; k < len2; k++) {
      ssublayer = ref2[k];
      results.push(Arrange(ssublayer, fixed));
    }
    return results;
  }
};

Parse = function(Scroll, Frame, Artboard) {
  var Fixed, Groups, i, key, l, layer, len, ref;
  Groups = {};
  ref = Artboard.subLayers;
  for (i = 0, len = ref.length; i < len; i++) {
    l = ref[i];
    Groups[l.name] = l;
  }
  Scroll.frame = Frame;
  Fixed = [];
  Artboard.superLayer = Scroll.content;
  Artboard.frame = Frame;
  for (key in Groups) {
    layer = Groups[key];
    Arrange(layer, Fixed);
  }
  Scroll.content.on("change:y", function() {
    var f, j, len1, results;
    results = [];
    for (j = 0, len1 = Fixed.length; j < len1; j++) {
      f = Fixed[j];
      results.push(f.y = f.originY - this.y);
    }
    return results;
  });
  return Artboard;
};

Flex = function(Scroll, Frame, Artboard) {
  return Fluid.on("change:size", function() {
    return Parse(Scroll, Screen.frame, Artboard);
  });
};

Make = function(Scroll, Frame, Artboard) {
  Parse(Scroll, Screen.frame, Artboard);
  return Flex(Scroll, Screen.frame, Artboard);
};


},{}],"web":[function(require,module,exports){
exports.Parse = function(Groups) {
  var Group, Layers, i, j, key, layer, layers, len, len1, ref, ref1;
  Layers = {
    Full: [],
    Center: [],
    Left: [],
    Right: []
  };
  for (key in Layers) {
    layers = Layers[key];
    ref = Groups.subLayersByName(key);
    for (i = 0, len = ref.length; i < len; i++) {
      Group = ref[i];
      ref1 = Group.subLayers;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        layer = ref1[j];
        layers.push(layer);
      }
    }
  }
  return Layers;
};

exports.Arrange = function(Layers) {
  var flayer, key, layers, results;
  results = [];
  for (key in Layers) {
    layers = Layers[key];
    switch (key) {
      case "Full":
        results.push((function() {
          var i, len, results1;
          results1 = [];
          for (i = 0, len = layers.length; i < len; i++) {
            flayer = layers[i];
            flayer.superLayer.width = Screen.width;
            flayer.width = flayer.superLayer.width;
            flayer.superLayer.x = 0;
            results1.push(flayer.x = 0);
          }
          return results1;
        })());
        break;
      case "Center":
        results.push((function() {
          var i, len, results1;
          results1 = [];
          for (i = 0, len = layers.length; i < len; i++) {
            flayer = layers[i];
            flayer.superLayer.x = 0;
            flayer.superLayer.width = Screen.width;
            results1.push(flayer.centerX().pixelAlign());
          }
          return results1;
        })());
        break;
      case "Half":
        results.push((function() {
          var i, len, results1;
          results1 = [];
          for (i = 0, len = layers.length; i < len; i++) {
            flayer = layers[i];
            flayer.superLayer.width = Screen.width * .5;
            flayer.width = flayer.superLayer.width;
            flayer.superLayer.x = 0;
            results1.push(flayer.x = 0);
          }
          return results1;
        })());
        break;
      case "Right":
        results.push((function() {
          var i, len, results1;
          results1 = [];
          for (i = 0, len = layers.length; i < len; i++) {
            flayer = layers[i];
            results1.push(flayer.superLayer.x = Screen.width - flayer.superLayer.width);
          }
          return results1;
        })());
        break;
      case "Left":
        results.push((function() {
          var i, len, results1;
          results1 = [];
          for (i = 0, len = layers.length; i < len; i++) {
            flayer = layers[i];
            results1.push(flayer.superLayer.x = 0);
          }
          return results1;
        })());
        break;
      default:
        results.push(void 0);
    }
  }
  return results;
};


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY3NvL0RvY3VtZW50cy9ZYW5kZXguRGlzay9ERVNJR04vUFJPSkVDVFMvU1BPUlRJTkcvUFJPVE9UWVBFL0Rlc2t0b3AuZnJhbWVyL21vZHVsZXMvQWN0aW9ucy5jb2ZmZWUiLCIvVXNlcnMvY3NvL0RvY3VtZW50cy9ZYW5kZXguRGlzay9ERVNJR04vUFJPSkVDVFMvU1BPUlRJTkcvUFJPVE9UWVBFL0Rlc2t0b3AuZnJhbWVyL21vZHVsZXMvRmxleC5jb2ZmZWUiLCIvVXNlcnMvY3NvL0RvY3VtZW50cy9ZYW5kZXguRGlzay9ERVNJR04vUFJPSkVDVFMvU1BPUlRJTkcvUFJPVE9UWVBFL0Rlc2t0b3AuZnJhbWVyL21vZHVsZXMvUmVzcG9uc2UuY29mZmVlIiwiL1VzZXJzL2Nzby9Eb2N1bWVudHMvWWFuZGV4LkRpc2svREVTSUdOL1BST0pFQ1RTL1NQT1JUSU5HL1BST1RPVFlQRS9EZXNrdG9wLmZyYW1lci9tb2R1bGVzL2Z1bmN0aW9ucy5jb2ZmZWUiLCIvVXNlcnMvY3NvL0RvY3VtZW50cy9ZYW5kZXguRGlzay9ERVNJR04vUFJPSkVDVFMvU1BPUlRJTkcvUFJPVE9UWVBFL0Rlc2t0b3AuZnJhbWVyL21vZHVsZXMvbXlNb2R1bGUuY29mZmVlIiwiL1VzZXJzL2Nzby9Eb2N1bWVudHMvWWFuZGV4LkRpc2svREVTSUdOL1BST0pFQ1RTL1NQT1JUSU5HL1BST1RPVFlQRS9EZXNrdG9wLmZyYW1lci9tb2R1bGVzL3RlbXAuY29mZmVlIiwiL1VzZXJzL2Nzby9Eb2N1bWVudHMvWWFuZGV4LkRpc2svREVTSUdOL1BST0pFQ1RTL1NQT1JUSU5HL1BST1RPVFlQRS9EZXNrdG9wLmZyYW1lci9tb2R1bGVzL3dlYi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxPQUFPLENBQUMsWUFBUixHQUF1QixTQUFDLEtB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QUFNLENBQUMsQ0FBUCxHQUFXO0FBSlo7OztBQURJO0FBRE4sV0FPTSxRQVBOOzs7QUFRRTtlQUFBLHdDQUFBOztZQUNDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBbEIsR0FBc0I7WUFDdEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFsQixHQUEwQixNQUFNLENBQUM7MEJBQ2pDLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBZ0IsQ0FBQyxVQUFqQixDQUFBO0FBSEQ7OztBQURJO0FBUE4sV0FZTSxNQVpOOzs7QUFhRTtlQUFBLHdDQUFBOztZQUNDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBbEIsR0FBMEIsTUFBTSxDQUFDLEtBQVAsR0FBYTtZQUN2QyxNQUFNLENBQUMsS0FBUCxHQUFlLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDakMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFsQixHQUFzQjswQkFDdEIsTUFBTSxDQUFDLENBQVAsR0FBVztBQUpaOzs7QUFESTtBQVpOLFdBa0JNLE9BbEJOOzs7QUFtQkU7ZUFBQSx3Q0FBQTs7MEJBQ0MsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFsQixHQUFzQixNQUFNLENBQUMsS0FBUCxHQUFlLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFEeEQ7OztBQURJO0FBbEJOLFdBcUJNLE1BckJOOzs7QUFzQkU7ZUFBQSx3Q0FBQTs7MEJBQ0MsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFsQixHQUFzQjtBQUR2Qjs7O0FBREk7QUFyQk47O0FBQUE7QUFERDs7QUFEaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0cy5hdHRhY2hTdGF0ZXMgPSAoTGF5ZXIsUHJvcGVydGllcyA9IHtPbjoge29wYWNpdHk6IDF9LE9mZjoge29wYWNpdHk6IDB9fSktPlxuXHRmb3Igc3RhdGUscHJvcGVydGllcyBvZiBQcm9wZXJ0aWVzXG5cdFx0TGF5ZXIuc3RhdGVzLmFkZChzdGF0ZSwgcHJvcGVydGllcylcblxuZXhwb3J0cy5Ub2dnbGUgPSAoTGF5ZXIsIFN0YXRlcyA9IFtcIk9uXCIsXCJPZmZcIl0pIC0+XG5cdExheWVyLnN0YXRlcy5zd2l0Y2ggaWYgTGF5ZXIuc3RhdGVzLmN1cnJlbnQgaXNudCBTdGF0ZXNbMF0gdGhlbiBTdGF0ZXNbMF0gZWxzZSBTdGF0ZXNbMV1cblxuXG5leHBvcnRzLmdldExheWVyID0gKHBhcmVudExheWVyLFBhdGgpIC0+XG5cdGxheWVyID0gcGFyZW50TGF5ZXJcblx0bGF5ZXIgPSBsYXllci5zdWJMYXllcnNCeU5hbWUoZ3JvdXApWzBdIGZvciBncm91cCBpbiBQYXRoXG5cdHJldHVybiBsYXllclxuXG5leHBvcnRzLnNldFZpZXdzID0gKGxheWVycyxMYXllcnMpIC0+XG5cdGZvciBsYXllciBpbiBsYXllcnNcblx0XHRbTGF5ZXIsIFZpZXddID0gbGF5ZXIubmFtZS5zcGxpdChcIl9cIilcblx0XHRpZiBMYXllciBpcyBcIlZpZXdcIlxuXHRcdFx0bGF5ZXIub24gRXZlbnRzLkNsaWNrLC0+XG5cdFx0XHRcdFtMYXllciwgVmlld10gPSBAbmFtZS5zcGxpdChcIl9cIilcblx0XHRcdFx0TGF5ZXJzW1ZpZXddLnN1cGVyTGF5ZXIuc3VwZXJMYXllci5icmluZ1RvRnJvbnQoKVxuXHRcdHNldFZpZXdzIGxheWVyLnN1YkxheWVycywgTGF5ZXJzIiwiZXhwb3J0cy5GbHVpZCA9IG5ldyBMYXllclxuXHRiYWNrZ3JvdW5kQ29sb3I6IFwidHJhbnNwYXJlbnRcIlxuZXhwb3J0cy5GbHVpZC5mbHVpZFxuXHRhdXRvV2lkdGg6IHRydWVcblx0YXV0b0hlaWdodDogdHJ1ZVxuXG5cbmV4cG9ydHMuQXJyYW5nZSA9IChzdWJsYXllciwgZml4ZWQgPSBbXSkgLT5cblx0c3dpdGNoIChzdWJsYXllci5uYW1lLnNwbGl0IFwiX1wiKVsxXVxuXHRcdHdoZW4gXCJmdWxsXCJcblx0XHRcdHN1YmxheWVyLndpZHRoID0gc3VibGF5ZXIuc3VwZXJMYXllci53aWR0aFxuXHRcdFx0c3VibGF5ZXIueCA9IDBcblx0XHR3aGVuIFwiY2VudGVyXCJcblx0XHRcdHN1YmxheWVyLmNlbnRlclgoKVxuXHRcdFx0c3VibGF5ZXIucGl4ZWxBbGlnbigpXG5cdFx0d2hlbiBcInJpZ2h0XCJcblx0XHRcdHN1YmxheWVyLnggPSBzdWJsYXllci5zdXBlckxheWVyLndpZHRoIC0gc3VibGF5ZXIud2lkdGhcblx0XHRcdHN1YmxheWVyLnBpeGVsQWxpZ24oKVx0XG5cdFx0d2hlbiBcImxlZnRcIlxuXHRcdFx0c3VibGF5ZXIueCA9IDBcblx0XHRcdHN1YmxheWVyLnBpeGVsQWxpZ24oKVxuXHRcdHdoZW4gXCJtaWRkbGVcIlx0XG5cdFx0XHRsZWZ0ID0gcyBmb3IgcyBpbiBzdWJsYXllci5zaWJsaW5nTGF5ZXJzIHdoZW4gKHMubmFtZS5zcGxpdCBcIl9cIilbMV0gaXMgXCJsZWZ0XCJcblx0XHRcdHJpZ2h0ID0gcyBmb3IgcyBpbiBzdWJsYXllci5zaWJsaW5nTGF5ZXJzIHdoZW4gKHMubmFtZS5zcGxpdCBcIl9cIilbMV0gaXMgXCJyaWdodFwiXG5cdFx0XHRpZiBsZWZ0PyAmJiByaWdodD9cblx0XHRcdFx0cmlnaHQueCA9IHJpZ2h0LnN1cGVyTGF5ZXIud2lkdGggLSByaWdodC53aWR0aFxuXHRcdFx0XHRyaWdodC5waXhlbEFsaWduKClcblx0XHRcdFx0bGVmdC54ID0gMFxuXHRcdFx0XHRsZWZ0LnBpeGVsQWxpZ24oKVxuXHRcdFx0XHRzdWJsYXllci54ID0gbGVmdC53aWR0aFxuXHRcdFx0XHRzdWJsYXllci53aWR0aCA9IHJpZ2h0LnggLSBsZWZ0LndpZHRoXG5cdFx0XG5cdHN3aXRjaCAoc3VibGF5ZXIubmFtZS5zcGxpdCBcIl9cIilbMl1cblx0XHR3aGVuIFwiYm90dG9tXCJcblx0XHRcdHN1YmxheWVyLnkgPSBzdWJsYXllci5zdXBlckxheWVyLmhlaWdodCAtIHN1YmxheWVyLmhlaWdodFxuXHRcdHdoZW4gXCJ0b3BcIlxuXHRcdFx0c3VibGF5ZXIueSA9IDBcblx0XHR3aGVuIFwiZnVsbFwiXG5cdFx0XHRzdWJsYXllci5oZWlnaHQgPSBzdWJsYXllci5zdXBlckxheWVyLmhlaWdodFxuXHRcdFx0c3VibGF5ZXIueSA9IDBcdFx0XG5cdHN3aXRjaCAoc3VibGF5ZXIubmFtZS5zcGxpdCBcIl9cIilbM11cblx0XHR3aGVuIFwiZml4ZWRcIlxuXHRcdFx0c3VibGF5ZXIub3JpZ2luWSA9IHN1YmxheWVyLnlcblx0XHRcdHN1YmxheWVyLmJyaW5nVG9Gcm9udCgpXG5cdFx0XHRmaXhlZC5wdXNoIHN1YmxheWVyXG5cdHN3aXRjaCAoc3VibGF5ZXIubmFtZS5zcGxpdCBcIl9cIilbNF1cblx0XHR3aGVuIFwiZGlzdHJpYnV0ZVwiXG5cdFx0XHRleHBvcnRzLkRpc3RyaWJ1dGUgc3VibGF5ZXJcdFxuXHRcdHdoZW4gXCJpbmxpbmVcIlxuXHRcdFx0ZXhwb3J0cy5JbmxpbmUgc3VibGF5ZXJcblx0XHR3aGVuIFwiY29sdW1uXCJcblx0XHRcdGV4cG9ydHMuQ29sdW1uIHN1YmxheWVyXHRcblx0XHRcdFxuXHRpZiBzdWJsYXllci5zdWJMYXllcnMubGVuZ3RoPjAgXG5cdFx0Zm9yIHNzdWJsYXllciBpbiBzdWJsYXllci5zdWJMYXllcnMgXG5cdFx0XHRcdGV4cG9ydHMuQXJyYW5nZVx0c3N1YmxheWVyLCBmaXhlZFx0XHRcblxuZXhwb3J0cy5QYXJzZSA9IChTY3JvbGwsIENvbnRhaW5lciwgQXJ0Ym9hcmQpIC0+XG5cdEFydGJvYXJkLnZpc2libGUgPSB0cnVlXG5cdEZyYW1lID0gQ29udGFpbmVyLmZyYW1lXG5cdEdyb3VwcyA9IHt9XG5cdEdyb3Vwc1tsLm5hbWVdPWwgZm9yIGwgaW4gQXJ0Ym9hcmQuc3ViTGF5ZXJzXG5cdFNjcm9sbC5mcmFtZSA9IEZyYW1lXG5cdFNjcm9sbC5zdXBlckxheWVyID0gaWYgQ29udGFpbmVyLmlkIGlzbnQgMSB0aGVuIENvbnRhaW5lclxuXHRTY3JvbGwueCA9IDBcblx0U2Nyb2xsLnkgPSAwXG5cdEZpeGVkID0gW11cblx0QXJ0Ym9hcmQuc3VwZXJMYXllciA9IFNjcm9sbC5jb250ZW50XG5cdEFydGJvYXJkLnggPSAwXG5cdEFydGJvYXJkLnkgPSAwXG5cdEFydGJvYXJkLndpZHRoID0gRnJhbWUud2lkdGhcblx0Zm9yIGtleSxsYXllciBvZiBHcm91cHNcblx0XHRleHBvcnRzLkFycmFuZ2VcdGxheWVyLCBGaXhlZFxuXG5cdFNjcm9sbC5jb250ZW50Lm9uIFwiY2hhbmdlOnlcIiwtPlxuXHRcdGYueSA9IGYub3JpZ2luWSAtIEB5IGZvciBmIGluIEZpeGVkXG5cblxuXG5leHBvcnRzLkZsZXggPSAoIFNjcm9sbCwgIENvbnRhaW5lciwgQXJ0Ym9hcmQpIC0+XG5cdGV4cG9ydHMuRmx1aWQub24gXCJjaGFuZ2U6c2l6ZVwiLC0+XG5cdFx0ZXhwb3J0cy5QYXJzZSBTY3JvbGwsQ29udGFpbmVyLCBBcnRib2FyZFxuXG5cbmV4cG9ydHMuTWFrZSA9IChTY3JvbGwsIENvbnRhaW5lciwgQXJ0Ym9hcmQpLT5cblx0ZXhwb3J0cy5QYXJzZSBTY3JvbGwsIENvbnRhaW5lciwgQXJ0Ym9hcmRcblx0ZXhwb3J0cy5GbGV4IFNjcm9sbCwgQ29udGFpbmVyLCBBcnRib2FyZFxuXG5leHBvcnRzLkNvbHVtbiA9IChDb250YWluZXIpIC0+XG5cdENvbnRhaW5lci5zdWJMYXllcnNbMF0ueSA9IDBcblx0QmxvY2sueSA9IENvbnRhaW5lci5zdWJMYXllcnNbaS0xXS55ICsgQ29udGFpbmVyLnN1YkxheWVyc1tpLTFdLmhlaWdodCBmb3IgQmxvY2ssaSBpbiBDb250YWluZXIuc3ViTGF5ZXJzIHdoZW4gaT4wXG5cdENvbnRhaW5lci5waXhlbEFsaWduKClcblxuZXhwb3J0cy5JbmxpbmUgPSAoQ29udGFpbmVyKSAtPlxuXHRDb250YWluZXIud2lkdGggPSBDb250YWluZXIuc3VwZXJMYXllci53aWR0aFxuXHRDb250YWluZXIueCA9IDBcblx0V2lkdGggPSBDb250YWluZXIud2lkdGgvQ29udGFpbmVyLnN1YkxheWVycy5sZW5ndGhcblx0SGVpZ2h0ID0gQ29udGFpbmVyLnN1YkxheWVyc1swXS5oZWlnaHRcblx0SCA9IDBcblx0aWYgV2lkdGggPCBDb250YWluZXIuc3ViTGF5ZXJzWzBdLndpZHRoIHRoZW4gV2lkdGggPSBDb250YWluZXIuc3ViTGF5ZXJzWzBdLndpZHRoXG5cdENPTFMgPSBNYXRoLmZsb29yKENvbnRhaW5lci53aWR0aC9XaWR0aClcblx0Q29udGFpbmVyLnggPSAoV2lkdGggLSAgQ29udGFpbmVyLnN1YkxheWVyc1swXS53aWR0aCkqLjVcblx0Q09MUyA9IGlmIENPTFMgPiAtMSB0aGVuIENPTFMgZWxzZSAwXG5cdFdpZHRoID0gQ29udGFpbmVyLndpZHRoL0NPTFNcblx0anggPSAwXG5cdGp5ID0gLTFcblx0Zm9yIHN1YmxheWVyLGkgaW4gQ29udGFpbmVyLnN1YkxheWVyc1xuXHRcdGlmIGp4PENPTFNcblx0XHRcdGp4ID0ganhcblx0XHRlbHNlXG5cdFx0XHRqeCA9IDBcblx0XHRcdFxuXHRcdGprID0gaWYganggaXMgMCB0aGVuIGp5Kytcblx0XHRzdWJsYXllci55ID0gankqSGVpZ2h0XG5cdFx0c3VibGF5ZXIueCA9IGp4KldpZHRoXG5cdFx0angrK1xuXHRcdHN1YmxheWVyLnBpeGVsQWxpZ24oKVxuXHRcblx0Q29udGFpbmVyLmhlaWdodCA9IChqeSsxKSpIZWlnaHRcblx0XHRcblxuXHRcbmV4cG9ydHMuRGlzdHJpYnV0ZSA9IChDb250YWluZXIpIC0+XG5cdENvbnRhaW5lci53aWR0aCA9IENvbnRhaW5lci5zdXBlckxheWVyLndpZHRoXG5cdENvbnRhaW5lci54ID0gMFxuXHRmb3Igc3VibGF5ZXIsaSBpbiBDb250YWluZXIuc3ViTGF5ZXJzXG5cdFx0dmlydHVhbCA9IG5ldyBMYXllclxuXHRcdFx0c3VwZXJMYXllcjogQ29udGFpbmVyXG5cdFx0XHR3aWR0aDogQ29udGFpbmVyLndpZHRoL0NvbnRhaW5lci5zdWJMYXllcnMubGVuZ3RoXG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwidHJhbnNwYXJlbnRcIlxuXHRcdHZpcnR1YWwueCA9IGkqdmlydHVhbC53aWR0aFxuXHRcdHN1YmxheWVyLnN1cGVyTGF5ZXIgPSB2aXJ0dWFsXG5cdFx0c3VibGF5ZXIuY2VudGVyWCgpXHRcblx0XHRzdWJsYXllci5waXhlbEFsaWduKClcblx0XHRYID0gc3VibGF5ZXIueCt2aXJ0dWFsLnhcblx0XHRzdWJsYXllci5zdXBlckxheWVyID0gQ29udGFpbmVyXG5cdFx0c3VibGF5ZXIueCA9IFhcblx0XHR2aXJ0dWFsLmRlc3Ryb3koKVxuXHRcdCIsImV4cG9ydHMuTWFrZSA9IChEZXNpZ24pIC0+XG5cdGZvciBrZXksbGF5ZXIgb2YgRGVzaWduXG5cdFx0XHRzd2l0Y2ggKGxheWVyLm5hbWUuc3BsaXQgXCJfXCIpWzBdXG5cdFx0XHRcdHdoZW4gXCJCVVRUT05cIlxuXHRcdFx0XHRcdGxheWVyLm9uIEV2ZW50cy5Nb3VzZU92ZXIsLT5cblx0XHRcdFx0XHRcdEBicmlnaHRuZXNzID0gODBcblx0XHRcdFx0XHRcdEBzdHlsZS5jdXJzb3IgPSBcInBvaW50ZXJcIlxuXHRcdFx0XHRcdGxheWVyLm9uIEV2ZW50cy5Nb3VzZU91dCwtPlxuXHRcdFx0XHRcdFx0QGJyaWdodG5lc3MgPSAxMDBcblx0XHRcdFx0XHRcdEBzdHlsZS5jdXJzb3IgPSBcInBvaW50ZXJcIiIsImV4cG9ydHMuTmF2aWdhdG9yID0gKExheWVyKS0+XG5cdFNlbGVjdG9yID0gTGF5ZXIuc3ViTGF5ZXJzQnlOYW1lKFwiU2VsZWN0b3JcIilbMF1cblx0U2VsZWN0b3IudmlzaWJsZSA9IGZhbHNlXG5cdHZpZXcudmlzaWJsZSA9IGZhbHNlIGZvciB2aWV3IGluIExheWVyLnN1YkxheWVyc0J5TmFtZShcIlZpZXdzXCIpWzBdLnN1YkxheWVyc1xuXHRmb3IgY29udHJvbGxlciBpbiBMYXllci5zdWJMYXllcnNCeU5hbWUoXCJDb250cm9sbGVyc1wiKVswXS5zdWJMYXllcnNcblx0XHRTZWxlY3Rvci5zdGF0ZXMuYWRkKGNvbnRyb2xsZXIubmFtZSx7eDpjb250cm9sbGVyLnggKyBjb250cm9sbGVyLnN1cGVyTGF5ZXIueCwgeTpjb250cm9sbGVyLnkgKyBjb250cm9sbGVyLnN1cGVyTGF5ZXIueX0pXG5cdFx0Y29udHJvbGxlci5vbiBFdmVudHMuQ2xpY2ssLT5cblx0XHRcdFNlbGVjdG9yLnZpc2libGUgPSB0cnVlXG5cdFx0XHRTZWxlY3Rvci5zdGF0ZXMuc3dpdGNoSW5zdGFudCB0aGlzLm5hbWVcblx0XHRcdFxuXHRcdFx0Zm9yIHZpZXcgaW4gIExheWVyLnN1YkxheWVyc0J5TmFtZShcIlZpZXdzXCIpWzBdLnN1YkxheWVyc1xuXHRcdFx0XHRpZiB2aWV3Lm5hbWUgaXMgdGhpcy5uYW1lXG5cdFx0XHRcdFx0dmlldy52aXNpYmxlID0gdHJ1ZVxuXHRcdFx0XHRcdHZpZXcub3BhY2l0eSA9IDBcblx0XHRcdFx0XHRzaG93ID0gbmV3IEFuaW1hdGlvbih7XG5cdFx0XHRcdFx0XHRsYXllcjogdmlldyxcblx0XHRcdFx0XHRcdHByb3BlcnRpZXM6IHtvcGFjaXR5OiAxfVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0c2hvdy5zdGFydCgpXG5cdFx0XHRcdGVsc2UgXG5cdFx0XHRcdFx0dmlldy52aXNpYmxlID0gZmFsc2VcdFx0XG5cbmV4cG9ydHMuc2V0VGFiQWN0aXZlID0gKERvY2tlcix0YWJOYW1lKSAtPlxuXHRpZiB0YWJOYW1lP1xuXHRcdERvY2tlci5zdWJMYXllcnNCeU5hbWUoXCJWaWV3c1wiKVswXS5zdWJMYXllcnNCeU5hbWUodGFiTmFtZSlbMF0uc3RhdGVzLnN3aXRjaCBcIk9uXCJcblx0XHRsLnN0YXRlcy5zd2l0Y2ggXCJPblwiIGZvciBsIGluIERvY2tlci5zdWJMYXllcnNCeU5hbWUoXCJDb250cm9sbGVyc1wiKVswXS5zdWJMYXllcnNCeU5hbWUodGFiTmFtZSlbMF0uc3ViTGF5ZXJzXG5cdGVsc2Vcblx0XHR2aWV3LnN0YXRlcy5zd2l0Y2ggXCJPZmZcIiBmb3IgdmlldyBpbiBEb2NrZXIuc3ViTGF5ZXJzQnlOYW1lKFwiVmlld3NcIilbMF0uc3ViTGF5ZXJzXG5cdFx0bC5zdGF0ZXMuc3dpdGNoIFwiT2ZmXCIgIGZvciBsIGluIGNvbnRyb2xsZXIuc3ViTGF5ZXJzIGZvciBjb250cm9sbGVyIGluICBEb2NrZXIuc3ViTGF5ZXJzQnlOYW1lKFwiQ29udHJvbGxlcnNcIilbMF0uc3ViTGF5ZXJzXG5cblxuZXhwb3J0cy5JbnNwZWN0b3IgPSAoTGF5ZXIpLT5cblx0TGFiZWxzID0gTGF5ZXIuc3ViTGF5ZXJzQnlOYW1lKFwiTGFiZWxzXCIpWzBdXG5cdExhYmVscy5zdGF0ZXMuYWRkXG5cdFx0T246IHtvcGFjaXR5OiAxfVxuXHRcdE9mZjoge29wYWNpdHk6IDB9XG5cdGZvciB2aWV3IGluIExheWVyLnN1YkxheWVyc0J5TmFtZShcIlZpZXdzXCIpWzBdLnN1YkxheWVyc1xuXHRcdHZpZXcudmlzaWJsZSA9IGZhbHNlIFxuXHRcdENvbnRlbnRTY3JvbGwgPSBuZXcgU2Nyb2xsQ29tcG9uZW50XG5cdFx0XHR3aWR0aDogMjQwXG5cdFx0XHRoZWlnaHQ6IDg0MFxuXHRcdFx0c3VwZXJMYXllcjogdmlldy5zdWJMYXllcnNCeU5hbWUoXCJCYWNrXCIpWzBdXG5cdFx0Q29udGVudFNjcm9sbC5zY3JvbGxIb3Jpem9udGFsID0gZmFsc2Vcblx0XHRjb250ZW50ID0gdmlldy5zdWJMYXllcnNCeU5hbWUoXCJDb250ZW50XCIpWzBdXHRcblx0XHRjb250ZW50LnN1cGVyTGF5ZXIgPSBDb250ZW50U2Nyb2xsLmNvbnRlbnRcblx0XHRjb250ZW50Lng9MjRcblx0XHRjb250ZW50Lnk9NDhcblx0XHRcblx0XHRcblx0Zm9yIGNvbnRyb2xsZXIgaW4gTGF5ZXIuc3ViTGF5ZXJzQnlOYW1lKFwiQ29udHJvbGxlcnNcIilbMF0uc3ViTGF5ZXJzXG5cdFx0YmFjayA9IGNvbnRyb2xsZXIuc3ViTGF5ZXJzQnlOYW1lKFwiQmNrZ3JcIilbMF1cblx0XHRcblx0XHRcblx0XHRiYWNrLnN0YXRlcy5hZGRcblx0XHRcdE9uOiB7b3BhY2l0eTogMX1cblx0XHRcdE9mZjoge29wYWNpdHk6IDB9XG5cdFx0YmFjay5zdGF0ZXMuc3dpdGNoIFwiT2ZmXCJcblx0XHRiYWNrLm9uIEV2ZW50cy5DbGljaywtPlxuXHRcdFx0b3RoZXJiYWNrcyA9IFtdXG5cdFx0XHRvdGhlcmJhY2tzLnB1c2ggYi5zdWJMYXllcnNCeU5hbWUoXCJCY2tnclwiKVswXSBmb3IgYiBpbiB0aGlzLnN1cGVyTGF5ZXIuc2libGluZ0xheWVyc1xuXHRcdFx0b2Iuc3RhdGVzLnN3aXRjaCBcIk9mZlwiIGZvciBvYiBpbiBvdGhlcmJhY2tzXG5cdFx0XHR0aGlzLnN0YXRlcy5zd2l0Y2ggaWYgdGhpcy5zdGF0ZXMuY3VycmVudCBpcyBcIk9mZlwiIHRoZW4gXCJPblwiIGVsc2UgXCJPZmZcIlxuXHRcdFx0TGFiZWxzLnN0YXRlcy5zd2l0Y2ggaWYgdGhpcy5zdGF0ZXMuY3VycmVudCBpcyBcIk9uXCIgdGhlbiBcIk9mZlwiIGVsc2UgXCJPblwiXHRcblx0XHRcdFx0XG5cdFx0XHRmb3IgdmlldyBpbiAgTGF5ZXIuc3ViTGF5ZXJzQnlOYW1lKFwiVmlld3NcIilbMF0uc3ViTGF5ZXJzXG5cdFx0XHRcdGlmIHRoaXMuc3RhdGVzLmN1cnJlbnQgaXMgXCJPblwiIGFuZCB0aGlzLnN1cGVyTGF5ZXIubmFtZSBpcyB2aWV3Lm5hbWVcblx0XHRcdFx0XHR2aWV3LnZpc2libGUgPSB0cnVlXG5cdFx0XHRcdFx0dmlldy5vcGFjaXR5ID0gMFxuXHRcdFx0XHRcdHNob3cgPSBuZXcgQW5pbWF0aW9uKHtcblx0XHRcdFx0XHRcdGxheWVyOiB2aWV3LFxuXHRcdFx0XHRcdFx0cHJvcGVydGllczoge29wYWNpdHk6IDF9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRzaG93LnN0YXJ0KClcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGhpZGUgPSBuZXcgQW5pbWF0aW9uKHtcblx0XHRcdFx0XHRcdGxheWVyOiB2aWV3LFxuXHRcdFx0XHRcdFx0cHJvcGVydGllczoge29wYWNpdHk6IDB9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRoaWRlLnN0YXJ0KCkgXG5cdFx0XHRcdFx0dmlldy52aXNpYmxlID0gZmFsc2VcdFx0XG5cbiMgT25lIENvbnRyb2xsZXIgcnVsZXMgb25lIFZpZXcgaW4gTGF5ZXJcbmV4cG9ydHMuRG9ja2VyID0gKExheWVyLGxheWVyQW5pbWF0aW9uLHNBbmltYXRpb25zKSAtPlxuXHRtb2RlbERvY2tlciA9IHtDb250cm9sbGVyczpMYXllci5zdWJMYXllcnNCeU5hbWUoXCJDb250cm9sbGVyc1wiKVswXSxWaWV3czpMYXllci5zdWJMYXllcnNCeU5hbWUoXCJWaWV3c1wiKVswXX1cblx0TGF5ZXJzID0gW11cblx0TGF5ZXJzLnB1c2gge0xheWVyOiBsYXllciwgQW5pbWF0aW9uOiBsYXllckFuaW1hdGlvbn0gIGZvciBsYXllciBpbiBtb2RlbERvY2tlci5WaWV3cy5zdWJMYXllcnNcdFxuXHRTd2l0Y2hlcnMgPSBbXVxuXHRTd2l0Y2hlcnMucHVzaCB7TGF5ZXI6IGxheWVyLCBBbmltYXRpb246IHNBbmltYXRpb25zfSAgZm9yIGxheWVyIGluIG1vZGVsRG9ja2VyLkNvbnRyb2xsZXJzLnN1YkxheWVyc1xuXHRcblx0Zm9yIHZpZXcgaW4gTGF5ZXJzXG5cdFx0Zm9yIGFuaW1hdGlvbiBpbiB2aWV3LkFuaW1hdGlvblxuIyBcdFx0XHRwcmludCBhbmnDt8O3YXRpb25cblx0XHRcdHZpZXcuTGF5ZXIuc3RhdGVzLmFkZCBhbmltYXRpb24gXG5cdHZpZXcuTGF5ZXIuc3RhdGVzLnN3aXRjaCBcIk9mZlwiIGZvciB2aWV3IGluIExheWVyc1xuXG5cdFxuXHRmb3Igc3dpdGNoZXIsayBpbiBTd2l0Y2hlcnNcblx0XHRcblx0XHRzd2l0Y2hlci5MYXllci5vbiBFdmVudHMuQ2xpY2ssLT5cblx0XHRcdFxuXHRcdFx0c3RhdGUgPSBcIk9mZlwiXG5cdFx0XHRzbC5zdGF0ZXMuc3dpdGNoIFwiT2ZmXCIgZm9yIHNsIGluIHN3aXRjaGVyLkxheWVyLnN1YkxheWVycyBmb3Igc3dpdGNoZXIgaW4gU3dpdGNoZXJzXG5cdFx0XHRmb3IgbGF5ZXIgaW4gdGhpcy5zdWJMYXllcnNcblx0XHRcdFx0aWYgbGF5ZXIuc3RhdGVzLmN1cnJlbnQgaXNudCBcIk9uXCJcblx0XHRcdFx0XHRzdGF0ZSA9IFwiT25cIlxuXHRcdFx0XHRcdGxheWVyLnN0YXRlcy5zd2l0Y2ggXCJPblwiXG5cdFx0XHRcdFx0XG5cdFx0XHRcdGVsc2UgXG5cdFx0XHRcdFx0c3RhdGUgPSBcIk9mZlwiIFxuXHRcdFx0XHRcdGxheWVyLnN0YXRlcy5zd2l0Y2ggXCJPZmZcIlxuXHRcdFx0dmlldy5MYXllci5zdGF0ZXMuc3dpdGNoIFwiT2ZmXCIgZm9yIHZpZXcgaW4gTGF5ZXJzXG5cdFx0XHRcblx0XHRcdGZvciB2aWV3IGluIExheWVycyB3aGVuIHZpZXcuTGF5ZXIubmFtZSBpcyB0aGlzLm5hbWVcblx0XHRcdFx0dmlldy5MYXllci5zdGF0ZXMuc3dpdGNoIHN0YXRlIFx0XHRcblx0XG5cdFx0Zm9yIHNldCBpbiBzd2l0Y2hlci5BbmltYXRpb25cblx0XHRcdHN3aXRjaGVyLkxheWVyLnN1YkxheWVyc0J5TmFtZShzZXQubGF5ZXIpWzBdLnN0YXRlcy5hZGQgYW5pbWF0aW9uIGZvciBhbmltYXRpb24gaW4gc2V0LmFuaW1hdGlvblxuXHRcdHNsLnN0YXRlcy5zd2l0Y2ggXCJPZmZcIiBmb3Igc2wgaW4gc3dpdGNoZXIuTGF5ZXIuc3ViTGF5ZXJzXHRcblxuXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0XG5leHBvcnRzLmF0dGFjaENvbG9yUGFsbGV0VG9WaWV3ID0gKExheWVyKSAtPlxuXHRcdHBhbGxldHQgPSBMYXllci5zdWJMYXllcnNCeU5hbWUoXCJDb2xvclBhbGxldHRcIilbMF1cblx0XHRwYWxsZXR0LnN0YXRlcy5hZGRcblx0XHRcdE9uOiB7b3BhY2l0eTogMX1cblx0XHRcdE9mZjoge29wYWNpdHk6IDB9XG5cdFx0cGFsbGV0dC5zdGF0ZXMuc3dpdGNoSW5zdGFudCBcIk9mZlwiXHRcblxuXHRcdGZvciBpdGVtIGluIExheWVyLnN1YkxheWVyc1xuXHRcdFx0aXRlbS5zdGF0ZXMuYWRkXG5cdFx0XHRcdFVwOiB7eTogaXRlbS55fVxuXHRcdFx0XHREb3duOiB7eTogaXRlbS55ICsgMjAwfVxuXHRcdFx0aWYgaXRlbS5uYW1lIGlzIFwiQ29sb3JCdXR0b25cIlxuXHRcdFx0XHRpdGVtLnN0YXRlcy5hZGRcblx0XHRcdFx0XHRPbjoge29wYWNpdHk6IDF9XG5cdFx0XHRcdFx0T2ZmOiB7b3BhY2l0eTogMX1cblx0XHRcdFx0aXRlbS5zdGF0ZXMuc3dpdGNoSW5zdGFudCBcIk9mZlwiXG5cdFx0XHRcdGl0ZW0ub24gRXZlbnRzLkNsaWNrLC0+XG5cdFx0XHRcdFx0aWYgdGhpcy5zdGF0ZXMuY3VycmVudCBpcyBcIk9mZlwiXG5cdFx0XHRcdFx0XHR0aGlzLnN1cGVyTGF5ZXIuc3ViTGF5ZXJzQnlOYW1lKFwiQ29sb3JQYWxsZXR0XCIpWzBdLnZpc2libGUgPSB0cnVlXG5cdFx0XHRcdFx0XHR0aGlzLnN1cGVyTGF5ZXIuc3ViTGF5ZXJzQnlOYW1lKFwiQ29sb3JQYWxsZXR0XCIpWzBdLnN0YXRlcy5zd2l0Y2ggXCJPblwiXG5cdFx0XHRcdFx0XHR0aGlzLnN0YXRlcy5zd2l0Y2ggXCJPblwiXG5cdFx0XHRcdFx0XHRsYXllci5zdGF0ZXMuc3dpdGNoIFwiRG93blwiIGZvciBsYXllciBpbiB0aGlzLnNpYmxpbmdMYXllcnMgd2hlbiBsYXllci5uYW1lIGlzbnQgXCJDb2xvclBhbGxldHRcIlxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHRoaXMuc3RhdGVzLnN3aXRjaCBcIk9mZlwiXG5cdFx0XHRcdFx0XHR0aGlzLnN1cGVyTGF5ZXIuc3ViTGF5ZXJzQnlOYW1lKFwiQ29sb3JQYWxsZXR0XCIpWzBdLnZpc2libGUgPSBmYWxzZVxuXHRcdFx0XHRcdFx0dGhpcy5zdXBlckxheWVyLnN1YkxheWVyc0J5TmFtZShcIkNvbG9yUGFsbGV0dFwiKVswXS5zdGF0ZXMuc3dpdGNoIFwiT2ZmXCJcblx0XHRcdFx0XHRcdGxheWVyLnN0YXRlcy5zd2l0Y2ggXCJVcFwiIGZvciBsYXllciBpbiB0aGlzLnNpYmxpbmdMYXllcnNcblxuXHRcbiBcdFx0XHRcdFxuZXhwb3J0cy5TZXR0aW5ncyA9IChMYXllcikgLT5cblx0YnV0dG9uU2V0dGluZ3MgPSBMYXllci5zdWJMYXllcnNCeU5hbWUoXCJCdXR0b25TZXR0aW5nc1wiKVswXVxuXHRidXR0b25TZXR0aW5ncy5zdGF0ZXMuYWRkXG5cdFx0T246IHtncmF5c2NhbGU6IDB9XG5cdFx0T2ZmOiB7Z3JheXNjYWxlOiAxMDB9XG5cdGJ1dHRvblNldHRpbmdzLnN0YXRlcy5zd2l0Y2hJbnN0YW50IFwiT2ZmXCJcblx0XG5cdHN0eWxlclNldHRpbmdzID0gTGF5ZXIuc3ViTGF5ZXJzQnlOYW1lKFwiUGFuZWxTZXR0aW5nc1wiKVswXVxuXHRzdHlsZXJTZXR0aW5ncy5zdGF0ZXMuYWRkXG5cdFx0T246IHtvcGFjaXR5OiAxfVxuXHRcdE9mZjoge29wYWNpdHk6IDB9XG5cdHN0eWxlclNldHRpbmdzLnN0YXRlcy5zd2l0Y2hJbnN0YW50IFwiT2ZmXCJcblx0XG5cdGV4cG9ydHMuYXR0YWNoQ29sb3JQYWxsZXRUb1ZpZXcgc3R5bGVyU2V0dGluZ3Ncblx0XG5cdGJ1dHRvblNldHRpbmdzLm9uIEV2ZW50cy5DbGljaywtPlxuXHRcdHRoaXMuc3RhdGVzLm5leHQgW1wiT25cIixcIk9mZlwiXVxuXHRcdHN0eWxlclNldHRpbmdzLnN0YXRlcy5uZXh0IFtcIk9uXCIsXCJPZmZcIl1cblxuXG4jIFN3aXRjaGVyIHJ1bGVzIExheWVyc1xuZXhwb3J0cy5hdHRhY2hTd2l0Y2hlciA9IChMYXllcnMsU3dpdGNoZXIpIC0+XG5cdHByZWZpeCA9IFN3aXRjaGVyLkxheWVyLm5hbWVcblx0Zm9yIEl0ZW0gaW4gTGF5ZXJzXG5cdFx0ZXhwb3J0cy5hdHRhY2hBbmltYXRpb24gSXRlbS5MYXllciwgSXRlbS5BbmltYXRpb24sIHByZWZpeFxuXHRcdEl0ZW0uTGF5ZXIuc3RhdGVzLnN3aXRjaCBcIk9mZlwiICsgcHJlZml4XG5cdFxuXHRmb3IgYW5pbWF0aW9uIGluIFN3aXRjaGVyLkFuaW1hdGlvblxuXHRcdGV4cG9ydHMuYXR0YWNoQW5pbWF0aW9uIFN3aXRjaGVyLkxheWVyLnN1YkxheWVyc0J5TmFtZShhbmltYXRpb24ubGF5ZXIpWzBdLCBhbmltYXRpb24uYW5pbWF0aW9uLHByZWZpeFxuXHRcdFN3aXRjaGVyLkxheWVyLnN1YkxheWVyc0J5TmFtZShhbmltYXRpb24ubGF5ZXIpWzBdLnN0YXRlcy5zd2l0Y2ggXCJPZmZcIiArIHByZWZpeFxuXG5cdFN3aXRjaGVyLkxheWVyLm9uIEV2ZW50cy5DbGljaywtPlxuXHRcdGxheWVyLnN0YXRlcy5uZXh0IFtcIk9uXCIrcHJlZml4LFwiT2ZmXCIrcHJlZml4XSBmb3IgbGF5ZXIgaW4gdGhpcy5zdWJMYXllcnNcblx0XHRMYXllci5MYXllci5zdGF0ZXMubmV4dCBbXCJPblwiK3ByZWZpeCxcIk9mZlwiK3ByZWZpeF0gZm9yIExheWVyICBpbiBMYXllcnNcblxuXG5leHBvcnRzLmF0dGFjaEFuaW1hdGlvbiA9ICAobGF5ZXIsIGFuaW1hdGlvbiwgcHJlZml4KSAtPlxuXHRmb3Igc3RhdGUgaW4gYW5pbWF0aW9uXG5cdFx0bGF5ZXIuc3RhdGVzLmFkZCBzK3ByZWZpeCxhIGZvciBzLGEgb2Ygc3RhdGVcblxuZXhwb3J0cy5TbGlkZXIgPSAoR3JvdXAsY29udHJvbGxlckFuaW1hdGlvbixzbGlkZUFuaW1hdGlvbixTZWxlY3RlZFRhYiktPlxuXHRmb3IgY29udHJvbGxlciBpbiBHcm91cC5zdWJMYXllcnNCeU5hbWUoXCJDb250cm9sbGVyc1wiKVswXS5zdWJMYXllcnNcblx0XHRmb3IgYW5pbWF0aW9uIGluIGNvbnRyb2xsZXJBbmltYXRpb25cblx0XHRcdGNvbnRyb2xsZXIuc3ViTGF5ZXJzQnlOYW1lKGFuaW1hdGlvbi5MYXllcilbMF0uc3RhdGVzLmFkZCBhbmltYXRpb24uQW5pbWF0aW9uXG5cdFx0XHRjb250cm9sbGVyLnN1YkxheWVyc0J5TmFtZShhbmltYXRpb24uTGF5ZXIpWzBdLnN0YXRlcy5zd2l0Y2ggXCJPZmZcIlxuXHRcdFx0aWYgU2VsZWN0ZWRUYWI/IHRoZW4gY29udHJvbGxlci5zdWJMYXllcnNCeU5hbWUoYW5pbWF0aW9uLkxheWVyKVswXS5zdGF0ZXMuc3dpdGNoIFwiT25cIiBpZiBjb250cm9sbGVyLm5hbWUgaXMgU2VsZWN0ZWRUYWJcblx0XHRjb250cm9sbGVyLm9uIEV2ZW50cy5DbGljaywtPlxuXHRcdFx0R3JvdXAuc3ViTGF5ZXJzQnlOYW1lKFwiQ29udGVudFwiKVswXS5zdGF0ZXMuc3dpdGNoIFwiT25cIit0aGlzLm5hbWVcblx0XHRcdHN1YmxheWVyLnN0YXRlcy5zd2l0Y2ggXCJPblwiIGZvciBzdWJsYXllciBpbiB0aGlzLnN1YkxheWVyc1xuXHRcdFx0c3VibGF5ZXIuc3RhdGVzLnN3aXRjaCBcIk9mZlwiIGZvciBzdWJsYXllciBpbiBsYXllci5zdWJMYXllcnMgZm9yIGxheWVyIGluIHRoaXMuc2libGluZ0xheWVyc1xuXHRcdFx0XG5cdFx0Zm9yIGFuaW1hdGlvbiBpbiBzbGlkZUFuaW1hdGlvblxuXHRcdFx0Zm9yIHN0YXRlLHByb3BlcnRpZXMgb2YgYW5pbWF0aW9uLkFuaW1hdGlvblxuXHRcdFx0XHRzdGF0ZSA9IHN0YXRlICsgYW5pbWF0aW9uLkxheWVyXG5cdFx0XHRcdEdyb3VwLnN1YkxheWVyc0J5TmFtZShcIkNvbnRlbnRcIilbMF0uc3RhdGVzLmFkZCBzdGF0ZSxwcm9wZXJ0aWVzXG5cbmV4cG9ydHMuU2VsZWN0ID0gKGl0ZW0pLT5cblx0cy5kZXN0cm95KCkgZm9yIHMgaW4gaXRlbS5zdXBlckxheWVyLnN1YkxheWVycyB3aGVuIHMubmFtZSBpcyBcIlNlbGVjdGlvblwiXG5cdFNlbGVjdGlvbiA9IG5ldyBMYXllclxuXHRcdGJhY2tncm91bmRDb2xvcjogXCJ0cmFuc3BhcmVudFwiXG5cdFx0d2lkdGg6IGl0ZW0ud2lkdGgrNFxuXHRcdGhlaWdodDogaXRlbS5oZWlnaHQrNFxuXHRcdHN1cGVyTGF5ZXI6IGl0ZW0uc3VwZXJMYXllclxuXHRcdHg6IGl0ZW0ueC0yXG5cdFx0eTogaXRlbS55LTJcblx0XHRvcGFjaXR5OiAwXG5cdFx0bmFtZTogXCJTZWxlY3Rpb25cIlxuXHRTZWxlY3Rpb24uc3R5bGUgPVxuXHRcdGJvcmRlcjogXCIxcHggc29saWQgIzAwNzVGRFwiXG5cdHNldFNlbGVjdGlvbiA9IG5ldyBBbmltYXRpb25cblx0XHRwcm9wZXJ0aWVzOiB7IG9wYWNpdHk6IDF9XG5cdFx0bGF5ZXI6IFNlbGVjdGlvblxuXHRzZXRTZWxlY3Rpb24uc3RhcnQoKVxuXG5cbmV4cG9ydHMuSW5zcGVjdG9yID0gKFZpZXdzLENvbnRyb2xsZXJzLFNlbGVjdCxQb3N0Zml4ID0gXCJJbnNwZWN0b3JcIikgLT5cblx0Zm9yIHZpZXcgaW4gVmlld3Ncblx0XHRmb3Igc3RhdGUscHJvcGVydGllcyBvZiB2aWV3LkFuaW1hdGlvblxuXHRcdFx0dmlldy5MYXllci5zdGF0ZXMuYWRkIHN0YXRlLHByb3BlcnRpZXNcblx0XHR2aWV3LkxheWVyLnN0YXRlcy5zd2l0Y2hJbnN0YW50IFwiT2ZmXCJcblx0Zm9yIGNvbnRyb2xsZXIgaW4gQ29udHJvbGxlcnNcbiMgXHRcdHByaW50IGNvbnRyb2xsZXIuTGF5ZXJcblx0XHRjb250cm9sbGVyLkxheWVyLm9uIEV2ZW50cy5DbGljaywtPlxuXHRcdFx0U2VsZWN0IHRoaXNcblx0XHRcdGZvciB2aWV3IGluIFZpZXdzXG5cdFx0XHRcdHZpZXcuTGF5ZXIuc3RhdGVzLnN3aXRjaEluc3RhbnQgaWYgdmlldy5MYXllci5uYW1lIGlzIHRoaXMubmFtZStQb3N0Zml4IHRoZW4gXCJPblwiIGVsc2UgXCJPZmZcIiBcblx0XHRcdFx0dmlldy5MYXllci52aXNpYmxlID0gaWYgdmlldy5MYXllci5uYW1lIGlzIHRoaXMubmFtZStQb3N0Zml4IHRoZW4gdHJ1ZSBlbHNlIGZhbHNlIFxuXG5leHBvcnRzLmdldExheWVyID0gKHBhcmVudExheWVyLFBhdGgpIC0+XG5cdGxheWVyID0gcGFyZW50TGF5ZXJcblx0bGF5ZXIgPSBsYXllci5zdWJMYXllcnNCeU5hbWUoZ3JvdXApWzBdIGZvciBncm91cCBpbiBQYXRoXG5cdHJldHVybiBsYXllclxuXHRcblx0XG5leHBvcnRzLlJ1bGVyID0gKHJ1bGVyTGF5ZXIsc1NjYWxlcykgLT5cblx0XG5cdFNjYWxlclJ1bGUgPSBleHBvcnRzLmdldExheWVyIHJ1bGVyTGF5ZXIsW1wiU2xpZGVyXCIsXCJTY2FsZXJXcmFwcGVyXCIsXCJTY2FsZXJSdWxlXCJdXG5cdFNjYWxlclJ1bGUuc3RhdGVzLmFkZFxuXHRcdE5vcm1hbDoge2dyYXlzY2FsZTogMTAwLG9wYWNpdHk6IDAuNn1cblx0XHRBY3RpdmU6IHtncmF5c2NhbGU6IDAsb3BhY2l0eToxfVxuXHRTY2FsZXJSdWxlLnN0YXRlcy5zd2l0Y2hJbnN0YW50IFwiTm9ybWFsXCJcblx0QmFjayA9XHRleHBvcnRzLmdldExheWVyIHJ1bGVyTGF5ZXIsW1wiU2xpZGVyXCIsXCJCYWNrXCJdXG5cdEJhY2sub24gRXZlbnRzLk1vdXNlT3ZlciwtPlxuXHRcdFNjYWxlclJ1bGUuc3RhdGVzLnN3aXRjaCBcIkFjdGl2ZVwiXG5cdEJhY2sub24gRXZlbnRzLk1vdXNlT3V0LC0+XG5cdFx0U2NhbGVyUnVsZS5zdGF0ZXMuc3dpdGNoIFwiTm9ybWFsXCJcdFxuXHRTY2FsZXJSdWxlLmRyYWdnYWJsZS5lbmFibGVkID0gdHJ1ZVxuXHRTY2FsZXJSdWxlLmRyYWdnYWJsZS52ZXJ0aWNhbCA9IGZhbHNlXG5cdFNjYWxlclJ1bGUuZHJhZ2dhYmxlLm1vbWVudHVtID0gZmFsc2Vcblx0U2NhbGVyUnVsZS5kcmFnZ2FibGUuc3BlZWRYID0gMC45XG5cdFNjYWxlclJ1bGUub24gRXZlbnRzLk1vdXNlT3ZlciwtPlxuXHRcdHRoaXMuc3R5bGUgPVxuXHRcdFx0Y3Vyc29yOiBcInBvaW50ZXJcIlxuXHRcdHRoaXMuc3RhdGVzLnN3aXRjaCBcIkFjdGl2ZVwiXHRcblx0TGFiZWwgPSBleHBvcnRzLmdldExheWVyKHJ1bGVyTGF5ZXIsW1wiTGFiZWxcIl0pLnN1YkxheWVyc1swXVxuXHRcblx0aWYgZXhwb3J0cy5nZXRMYXllcihydWxlckxheWVyLFtcIlZhbHVlXCJdKT9cblx0XHRWYWx1ZSA9IGV4cG9ydHMuZ2V0TGF5ZXIocnVsZXJMYXllcixbXCJWYWx1ZVwiXSlcblx0XHRWYWx1ZS52aXNpYmxlID0gZmFsc2Vcblx0XHR2YWx1ZUxpdmUgPSBuZXcgTGF5ZXJcblx0XHRcdHdpZHRoOiA0M1xuXHRcdFx0aGVpZ2h0OiAxOFxuXHRcdFx0eDogMTgwXG5cdFx0XHR5OiA4XG5cdFx0XHRzdXBlckxheWVyOiBWYWx1ZS5zdXBlckxheWVyXG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwidHJhbnNwYXJlbnRcIlxuXHRcdHN0eWxlTm9ybWFsID1cblx0XHRcdGZvbnRTaXplOiBcIjEycHhcIlxuXHRcdFx0Y29sb3I6IFwiIzRBOTBFMlwiXG5cdFx0XHR0ZXh0QWxpZ246IFwicmlnaHRcIlxuXHRcdFx0bGluZUhlaWdodDogXCIxXCJcblx0XHRcdGJhY2tncm91bmQ6IFwidHJhbnNwYXJlbnRcIlxuXHRcdFx0cGFkZGluZzogXCIwcHhcIlxuXHRcdFx0cGFkZGluZ1JpZ2h0OiBcIjRweFwiXG5cdFx0c3R5bGVFZGl0ID1cblx0XHRcdGZvbnRTaXplOiBcIjEycHhcIlxuXHRcdFx0Y29sb3I6IFwiYmxhY2tcIlxuXHRcdFx0dGV4dEFsaWduOiBcInJpZ2h0XCJcblx0XHRcdGxpbmVIZWlnaHQ6IFwiMVwiXG5cdFx0XHRiYWNrZ3JvdW5kOiBcIndoaXRlXCJcblx0XHRcdHBhZGRpbmdUb3A6IFwiOHB4XCJcdFxuXHRcdFx0cGFkZGluZ1JpZ2h0OiBcIjRweFwiXG5cdFx0XHRoZWlnaHQ6IFwiMjhweFwiXG5cdFx0XHRib3JkZXJSYWRpdXM6IFwiMHB4IDNweCAzcHggMHB4XCJcblx0XHR2YWx1ZUxpdmUuc3R5bGUgPSBzdHlsZU5vcm1hbFxuXHRcdHZhbHVlTGl2ZS5zdGF0ZXMuYWRkIFxuXHRcdFx0Tm9ybWFsOiB7eTo4fVxuXHRcdFx0RWRpdDp7eTowfVxuXHRcdHZhbHVlTGl2ZS5zdGF0ZXMuc3dpdGNoSW5zdGFudCBcIk5vcm1hbFwiXG5cdFx0XG5cdFx0dmFsdWVMaXZlLm9uIEV2ZW50cy5Nb3VzZU92ZXIsLT5cblx0XHRcdHRoaXMuc3R5bGUuY3Vyc29yID0gXCJwb2ludGVyXCJcblx0XHRcdFx0XG5cdFx0dmFsdWVMaXZlLm9uIEV2ZW50cy5DbGljaywtPlxuXHRcdFx0aWYgdGhpcy5zdGF0ZXMuY3VycmVudCBpcyBcIk5vcm1hbFwiXG5cdFx0XHRcdHRoaXMuc3R5bGUgPSBzdHlsZUVkaXRcblx0XHRcdFx0dGhpcy5zdGF0ZXMuc3dpdGNoSW5zdGFudCBcIkVkaXRcIlxuXHRcdFx0ZWxzZVxuXHRcdFx0XHR0aGlzLnN0eWxlID0gc3R5bGVOb3JtYWxcblx0XHRcdFx0dGhpcy5zdGF0ZXMuc3dpdGNoSW5zdGFudCBcIk5vcm1hbFwiIFxuXHRcdHZhbHVlTGl2ZS5odG1sID0gTWF0aC5yb3VuZCBVdGlscy5tb2R1bGF0ZShTY2FsZXJSdWxlLngsWzI3NSwgNDkzXSxzU2NhbGVzW0xhYmVsLm5hbWVdKVxuXHRcdFx0XG5cdFx0U2NhbGVyUnVsZS5vbiBFdmVudHMuRHJhZywtPlxuXHRcdFx0dGhpcy5zdGF0ZXMuc3dpdGNoIFwiQWN0aXZlXCJcblx0XHRcdHZhbHVlTGl2ZS5odG1sID0gTWF0aC5yb3VuZCBVdGlscy5tb2R1bGF0ZSh0aGlzLngsWzI3NSwgNDkzXSxzU2NhbGVzW0xhYmVsLm5hbWVdKVx0IiwiIyBBZGQgdGhlIGZvbGxvd2luZyBsaW5lIHRvIHlvdXIgcHJvamVjdCBpbiBGcmFtZXIgU3R1ZGlvLiBcbiMgbXlNb2R1bGUgPSByZXF1aXJlIFwibXlNb2R1bGVcIlxuIyBSZWZlcmVuY2UgdGhlIGNvbnRlbnRzIGJ5IG5hbWUsIGxpa2UgbXlNb2R1bGUubXlGdW5jdGlvbigpIG9yIG15TW9kdWxlLm15VmFyXG5cbmV4cG9ydHMubXlWYXIgPSBcIm15VmFyaWFibGVcIlxuXG5leHBvcnRzLm15RnVuY3Rpb24gPSAtPlxuXHRwcmludCBcIm15RnVuY3Rpb24gaXMgcnVubmluZ1wiXG5cbmV4cG9ydHMubXlBcnJheSA9IFsxLCAyLCAzXSIsIlxuIFxuQXJyYW5nZSA9IChzdWJsYXllciwgZml4ZWQgPSBbXSkgLT5cblx0c3dpdGNoIChzdWJsYXllci5uYW1lLnNwbGl0IFwiX1wiKVsxXVxuXHRcdHdoZW4gXCJmdWxsXCJcblx0XHRcdHN1YmxheWVyLndpZHRoID0gc3VibGF5ZXIuc3VwZXJMYXllci53aWR0aFxuXHRcdFx0c3VibGF5ZXIueCA9IDBcblx0XHR3aGVuIFwiY2VudGVyXCJcblx0XHRcdHN1YmxheWVyLmNlbnRlclgoKVxuXHRcdFx0c3VibGF5ZXIucGl4ZWxBbGlnbigpXG5cdFx0d2hlbiBcInJpZ2h0XCJcblx0XHRcdHN1YmxheWVyLnggPSBzdWJsYXllci5zdXBlckxheWVyLndpZHRoIC0gc3VibGF5ZXIud2lkdGhcblx0XHRcdHN1YmxheWVyLnBpeGVsQWxpZ24oKVx0XG5cdFx0d2hlbiBcImxlZnRcIlxuXHRcdFx0c3VibGF5ZXIueCA9IDBcblx0XHRcdHN1YmxheWVyLnBpeGVsQWxpZ24oKVxuXHRcdHdoZW4gXCJtaWRkbGVcIlx0XG5cdFx0XHRsZWZ0ID0gcyBmb3IgcyBpbiBzdWJsYXllci5zaWJsaW5nTGF5ZXJzIHdoZW4gKHMubmFtZS5zcGxpdCBcIl9cIilbMV0gaXMgXCJsZWZ0XCJcblx0XHRcdHJpZ2h0ID0gcyBmb3IgcyBpbiBzdWJsYXllci5zaWJsaW5nTGF5ZXJzIHdoZW4gKHMubmFtZS5zcGxpdCBcIl9cIilbMV0gaXMgXCJyaWdodFwiXG5cdFx0XHRyaWdodC54ID0gcmlnaHQuc3VwZXJMYXllci53aWR0aCAtIHJpZ2h0LndpZHRoXG5cdFx0XHRyaWdodC5waXhlbEFsaWduKClcblx0XHRcdGxlZnQueCA9IDBcblx0XHRcdGxlZnQucGl4ZWxBbGlnbigpXG5cdFx0XHRzdWJsYXllci54ID0gbGVmdC53aWR0aFxuXHRcdFx0c3VibGF5ZXIud2lkdGggPSByaWdodC54IC0gbGVmdC53aWR0aFxuXHRzd2l0Y2ggKHN1YmxheWVyLm5hbWUuc3BsaXQgXCJfXCIpWzJdXG5cdFx0d2hlbiBcImJvdHRvbVwiXG5cdFx0XHRzdWJsYXllci55ID0gc3VibGF5ZXIuc3VwZXJMYXllci5oZWlnaHQgLSBzdWJsYXllci5oZWlnaHRcblx0XHR3aGVuIFwidG9wXCJcblx0XHRcdHN1YmxheWVyLnkgPSAwXG5cdHN3aXRjaCAoc3VibGF5ZXIubmFtZS5zcGxpdCBcIl9cIilbM11cblx0XHR3aGVuIFwiZml4ZWRcIlxuXHRcdFx0c3VibGF5ZXIub3JpZ2luWSA9IHN1YmxheWVyLnlcblx0XHRcdHN1YmxheWVyLmJyaW5nVG9Gcm9udCgpXG5cdFx0XHRmaXhlZC5wdXNoIHN1YmxheWVyXG5cdGlmIHN1YmxheWVyLnN1YkxheWVycy5sZW5ndGg+MCBcblx0XHRmb3Igc3N1YmxheWVyIGluIHN1YmxheWVyLnN1YkxheWVycyBcblx0XHRcdFx0QXJyYW5nZVx0c3N1YmxheWVyLCBmaXhlZFx0XHRcblxuUGFyc2UgPSAoU2Nyb2xsLCBGcmFtZSwgQXJ0Ym9hcmQpIC0+XG5cdEdyb3VwcyA9IHt9XG5cdEdyb3Vwc1tsLm5hbWVdPWwgZm9yIGwgaW4gQXJ0Ym9hcmQuc3ViTGF5ZXJzXG5cdFNjcm9sbC5mcmFtZSA9IEZyYW1lXG5cdEZpeGVkID0gW11cblx0QXJ0Ym9hcmQuc3VwZXJMYXllciA9IFNjcm9sbC5jb250ZW50XG5cdEFydGJvYXJkLmZyYW1lID0gRnJhbWVcblx0Zm9yIGtleSxsYXllciBvZiBHcm91cHNcdFxuXHRcdEFycmFuZ2VcdGxheWVyLCBGaXhlZFxuXHRcdFxuXG5cdFNjcm9sbC5jb250ZW50Lm9uIFwiY2hhbmdlOnlcIiwtPlxuXHRcdGYueSA9IGYub3JpZ2luWSAtIEB5IGZvciBmIGluIEZpeGVkXG5cdHJldHVybiBBcnRib2FyZFxuXG5cbkZsZXggPSAoIFNjcm9sbCwgIEZyYW1lLCBBcnRib2FyZCkgLT5cblx0Rmx1aWQub24gXCJjaGFuZ2U6c2l6ZVwiLC0+XG5cdFx0UGFyc2UgU2Nyb2xsLFNjcmVlbi5mcmFtZSwgQXJ0Ym9hcmRcblxuXG5NYWtlID0gKFNjcm9sbCwgRnJhbWUsQXJ0Ym9hcmQgKS0+XG5cdFBhcnNlIFNjcm9sbCwgU2NyZWVuLmZyYW1lLCBBcnRib2FyZFxuXHRGbGV4IFNjcm9sbCwgU2NyZWVuLmZyYW1lLCBBcnRib2FyZFxuXHRcdFxuIiwiZXhwb3J0cy5QYXJzZSA9IChHcm91cHMpIC0+XG5cdExheWVycyA9IHtGdWxsOiBbXSwgQ2VudGVyOiBbXSwgTGVmdDpbXSwgUmlnaHQ6IFtdfVxuXHRmb3Iga2V5LGxheWVycyBvZiBMYXllcnNcblx0XHRmb3IgR3JvdXAgaW4gR3JvdXBzLnN1YkxheWVyc0J5TmFtZSBrZXlcblx0XHRcdGZvciBsYXllciBpbiBHcm91cC5zdWJMYXllcnNcdFxuXHRcdFx0XHRsYXllcnMucHVzaCBsYXllclxuXHRyZXR1cm4gTGF5ZXJzXG5cbmV4cG9ydHMuQXJyYW5nZSA9IChMYXllcnMpIC0+XG5cdGZvciBrZXksbGF5ZXJzIG9mIExheWVyc1xuXHRcdHN3aXRjaCBrZXlcblx0XHRcdHdoZW4gXCJGdWxsXCJcblx0XHRcdFx0Zm9yIGZsYXllciBpbiBsYXllcnNcblx0XHRcdFx0XHRmbGF5ZXIuc3VwZXJMYXllci53aWR0aCA9IFNjcmVlbi53aWR0aFxuXHRcdFx0XHRcdGZsYXllci53aWR0aCA9IGZsYXllci5zdXBlckxheWVyLndpZHRoIFxuXHRcdFx0XHRcdGZsYXllci5zdXBlckxheWVyLnggPSAwXG5cdFx0XHRcdFx0ZmxheWVyLnggPSAwXG5cdFx0XHR3aGVuIFwiQ2VudGVyXCJcblx0XHRcdFx0Zm9yIGZsYXllciBpbiBsYXllcnNcblx0XHRcdFx0XHRmbGF5ZXIuc3VwZXJMYXllci54ID0gMFxuXHRcdFx0XHRcdGZsYXllci5zdXBlckxheWVyLndpZHRoID0gU2NyZWVuLndpZHRoXG5cdFx0XHRcdFx0ZmxheWVyLmNlbnRlclgoKS5waXhlbEFsaWduKClcblx0XHRcdHdoZW4gXCJIYWxmXCJcblx0XHRcdFx0Zm9yIGZsYXllciBpbiBsYXllcnNcblx0XHRcdFx0XHRmbGF5ZXIuc3VwZXJMYXllci53aWR0aCA9IFNjcmVlbi53aWR0aCouNVxuXHRcdFx0XHRcdGZsYXllci53aWR0aCA9IGZsYXllci5zdXBlckxheWVyLndpZHRoIFxuXHRcdFx0XHRcdGZsYXllci5zdXBlckxheWVyLnggPSAwXG5cdFx0XHRcdFx0ZmxheWVyLnggPSAwXHRcblx0XHRcdHdoZW4gXCJSaWdodFwiXHRcblx0XHRcdFx0Zm9yIGZsYXllciBpbiBsYXllcnNcblx0XHRcdFx0XHRmbGF5ZXIuc3VwZXJMYXllci54ID0gU2NyZWVuLndpZHRoIC0gZmxheWVyLnN1cGVyTGF5ZXIud2lkdGhcblx0XHRcdHdoZW4gXCJMZWZ0XCJcdFxuXHRcdFx0XHRmb3IgZmxheWVyIGluIGxheWVyc1xuXHRcdFx0XHRcdGZsYXllci5zdXBlckxheWVyLnggPSAwIl19

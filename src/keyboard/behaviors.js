const Assets = require('./assets');
const Config = require('./config');
const Utils = require('../utils');
const Event = require('../core/event');
const SFX = require('./sfx');
const Behaviors = {};

Behaviors.el = null;

// -----------------------------------------------------------------------------
// KEYBOARD METHODS

Behaviors.showKeyboard = function(el) {
  el.isOpen = true;
  let p = el.object3D.position;
  console.log('show keyboard position')
  console.log(p.x)
  console.log(p.y)
  console.log(p.z)
  if (p.x === -10000 && p.y === -10000 && p.z === -10000) {
    el.object3D.position.set(0, 0, 0);
  }
  !el.parentNode && el.sceneEl.appendChild(el);
};

Behaviors.hideKeyboard = function(el) {
  el.isOpen = false;
  // TODO: Figure out a better way to hide stuff.
  el.object3D.position.set(-10000, -10000, -10000);
}

Behaviors.destroyKeyboard = function(el) {
  let parent = el.parentNode;
  if (!parent) { return; }
  parent && parent.removeChild(el);
};

Behaviors.openKeyboard = function(el) {
  Behaviors.showKeyboard(el);
  Event.emit(Behaviors.el, 'didopen');
};

Behaviors.dismissKeyboard = function(el) {
  Behaviors.hideKeyboard(el);
  Event.emit(Behaviors.el, 'diddismiss');
};

// -----------------------------------------------------------------------------
// KEY EVENTS

Behaviors.addKeyEvents = (el)=>{
  el.addEventListener('click', Behaviors.keyClick);
  el.addEventListener('mousedown', Behaviors.keyDown);
  el.addEventListener('mouseup', Behaviors.keyOut);
  el.addEventListener('raycaster-intersected', Behaviors.keyIn );
  el.addEventListener('raycaster-intersected-cleared', Behaviors.keyOut );
  //triggerdown
  // https://aframe.io/docs/0.6.0/components/hand-controls.html
};

// -----------------------------------------------------------------------------
// KEYCLICK

Behaviors.keyClick = function() {
  SFX.keyDown(Behaviors.el);

  let type = this.getAttribute('key-type');
  let value = this.getAttribute('key-value');

  if (type === 'text' || type === 'spacebar') {
    if (type === 'spacebar') { value = ' '; }
    if (Behaviors.isShiftEnabled) {
      value = value.toUpperCase();
      Behaviors.shiftToggle();
    }
    else if (Behaviors.isSymbols) {
      Behaviors.symbolsToggle();
    }
    Event.emit(Behaviors.el, 'input', value);
  }
  else if (type === 'shift') {
    Behaviors.shiftToggle();
  }
  else if (type === 'symbol') {
    Behaviors.symbolsToggle();
  }
  else if (type === 'backspace') {
    Event.emit(Behaviors.el, 'backspace');
  }
  else if (type === 'enter') {
    Event.emit(Behaviors.el, 'input', '\n');
    Event.emit(Behaviors.el, 'enter', '\n');
  }
  else if (type === 'dismiss') {
    Event.emit(Behaviors.el, 'dismiss');
  }
}

// -----------------------------------------------------------------------------
// KEYDOWN

Behaviors.keyDown = function() {
  this.object3D.position.z = 0.003;
  if (this.getAttribute('key-type') === 'spacebar') {
    this.setAttribute('color', Config.SPACEBAR_COLOR_ACTIVE);
  } else {
    this.setAttribute('color', Config.KEY_COLOR_ACTIVE);
  }
};

// -----------------------------------------------------------------------------
// KEYIN

Behaviors.keyIn = function() {
  if (this.object3D.children[2] && this.object3D.children[2].material && !this.object3D.children[2].material.opacity) {
    return
  }
  SFX.keyIn(Behaviors.el);
  if (this.getAttribute('key-type') === 'spacebar') {
    this.setAttribute('color', Config.SPACEBAR_COLOR_HIGHLIGHT);
  } else {
    this.setAttribute('color', Config.KEY_COLOR_HIGHLIGHT);
  }
};

// -----------------------------------------------------------------------------
// KEYOUT

Behaviors.keyOut = function() {
  this.object3D.position.z = 0;
  if (this.getAttribute('key-type') === 'spacebar') {
    this.setAttribute('color', Config.KEY_COLOR_ACTIVE);
  } else {
    this.setAttribute('color', Config.KEYBOARD_COLOR);
  }
}

// -----------------------------------------------------------------------------
// SHIFT

Behaviors.isShiftEnabled = false;
Behaviors.shiftToggle = function() {
  Behaviors.isShiftEnabled = !Behaviors.isShiftEnabled;

  var icon_el = Behaviors.el.shiftKey.querySelector('[data-type]');
  if (Behaviors.isShiftEnabled) {
    icon_el.setAttribute('src', Assets.aframeKeyboardShiftActive);
  } else {
    icon_el.setAttribute('src', Assets.aframeKeyboardShift);
  }

  for ( let keyEl of document.querySelectorAll("[key-id]") ) {
    let key_id = keyEl.getAttribute('key-id'), key_type = keyEl.getAttribute('key-type');
    if (key_id.startsWith('main-') && key_type === "text") {
      let textEl = keyEl.querySelector('a-text');
      if (textEl) {
        let value = textEl.getAttribute('value').toLowerCase();
        if (this.isShiftEnabled) { value = value.toUpperCase(); }
        textEl.setAttribute('value', value);
      }
    }
  }
}

// -----------------------------------------------------------------------------
// SYMBOLS

Behaviors.isSymbols = false;
Behaviors.symbolsToggle = function() {
  Behaviors.isSymbols = !Behaviors.isSymbols;
  if (!Behaviors.isSymbols) {
    let parent = Behaviors.el.symbolsLayout.parentNode;
    parent.removeChild(Behaviors.el.symbolsLayout);
    parent.appendChild(Behaviors.el.alphabeticalLayout);
    setTimeout(function() {
      Utils.updateOpacity(Behaviors.el.alphabeticalLayout, 1);
    }, 0)
  } else {
    let parent = Behaviors.el.alphabeticalLayout.parentNode;
    parent.removeChild(Behaviors.el.alphabeticalLayout);
    parent.appendChild(Behaviors.el.symbolsLayout);
  }
}



module.exports = Behaviors;

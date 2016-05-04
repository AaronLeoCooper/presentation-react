import $ from 'jquery';
import slideshow from './_slideshow';

/**
 * Document ready
 */
$(document).ready(function () {

  var numKeys = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];

  // Keypress filters / handlers
  var pressed = {
    next: function (keycode) {
      // Spacebar, enter, left arrow
      return [32, 13, 39].indexOf(parseInt(keycode)) > -1;
    },
    prev: function (keycode) {
      // Right arrow
      return [37].indexOf(parseInt(keycode)) > -1;
    }
  };

  // Function to change HTML scale, pass direction as 'in' or 'out'
  function zoomHTML(direction) {
    var currentZoom = 100;
    var newZoom;
    var dir = direction || 'in';
    var newScale;

    if ($('html').attr('data-zoom')) {
      currentZoom = parseInt($('html').attr('data-zoom'));
    }

    if (dir === 'in') {
      newZoom = currentZoom + 10;
    } else {
      newZoom = currentZoom - 10;
    }

    $('html').attr('data-zoom', newZoom);

    newScale = 'scale(' + (newZoom / 100) + ')';

    $('html').css({
      msTransform: newScale,
      webkitTransform: newScale,
      transform: newScale
    });
  }

  $(document).keydown(function (e) {
    // Keypress event listener for slides
    if (pressed.next(e.which)) {
      console.log('hit next');
      slideshow.next();
    } else if (pressed.prev(e.which)) {
      console.log('hit prev');
      slideshow.prev();
    } else if (e.which === 38) { // Keypress for zoom in
      zoomHTML('in');
    } else if (e.which === 40) { // Keypress for zoom out
      zoomHTML('out');
    } else if (numKeys.indexOf(e.which) > -1) {
      slideshow.changeSlide(numKeys.indexOf(e.which));
    } else if (e.which === 83) {
      console.log(slideshow);
    }
  });

});

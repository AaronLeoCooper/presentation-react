import $ from 'jquery';
import _ from 'jquery';

const defaultconfig = {
  positioning: 'stacked'
};

/**
 * Globals
 */
const D = document;
const W = window;
const B = D.getElementsByTagName('BODY')[0];
const $M = $('#main-cont');
const $m = $('#main');
const slideAttr = 'data-slide';
const slideSelector = '.pres-slide';
const popoverSelector = '.pres-popover';
const transitionEnd = 'webkitTransitionEnd otransitionend' +
  'oTransitionEnd msTransitionEnd transitionend';
const popoverDelim = '-';
const popoverActiveClass = 'displaying';

/**
 * Main slide init
 */
let Slideshow = function (conf) {
  var self = this;

  conf = conf || {};
  

  self.slide = 0;
  self.popover = -1; // -1 means not currently displaying popover
  self.$slides = $(slideSelector + '[' + slideAttr + ']');
  self.$popovers = $(popoverSelector + '[' + slideAttr + ']');
  self.changingSlide = false;
  self.slideRefs = {};
  self.popoverRefs = {};
  self.slidePopovers = {};

  // Build up initial slide data
  self.$slides.each(function () {
    var $s = $(this);
    var sNum = $s.attr(slideAttr);
    var newRotation;
    var newTransRotate;
    var adjustTop = 0;
    var adjustLeft = 0;
    var positionOffset = 40;

    // Init the slide data object
    self.slideRefs[sNum] = {};

    if (sNum === '0') { // Intro (first) slide, just set everything to 0
      self.slideRefs[sNum].position = [0, 0];
      self.slideRefs[sNum].rotation = 0;
      self.slideRefs[sNum].part = 0;
    } else { // Any slide except the first
      // Rotation
      newRotation = $s.attr('data-rotate');
      self.slideRefs[sNum].rotation = parseInt(newRotation);

      // If negative rotation, adjust the position
      if (newRotation < 0) {
        adjustLeft = (100 - positionOffset) * -1;
        adjustTop = (positionOffset * -1);
      } else {
        adjustLeft = (positionOffset * -1);
        adjustTop = (100 - positionOffset) * -1;
      }

      // Position
      self.slideRefs[sNum].position = [
        $s.offset().left + adjustLeft,
        $s.offset().top + adjustTop
      ];

      // Apply the given rotation
      newTransRotate = 'rotate(' + newRotation + 'deg)';
      $s.css({
        msTransform: newTransRotate,
        webkitTransform: newTransRotate,
        transform: newTransRotate
      });

      // Part number
      if ($s.attr('data-part')) {
        self.slideRefs[sNum].part = parseInt($s.attr('data-part'));
      } else {
        self.slideRefs[sNum].part = 0;
      }
    }

    // Init the slide popover key for this slide
    self.slidePopovers[sNum] = [];
  });

  // Build up initial popover data
  self.$popovers.each(function () {
    var $p = $(this);
    var pNum = $p.attr(slideAttr);
    var pNumArr = pNum.split(popoverDelim);

    // Store the popover element in the popover reference (slide/order)
    self.popoverRefs[pNum] = self.getPopover(pNumArr[0], pNumArr[1]);

    // Store all slide refs with popover refs in array
    self.slidePopovers[pNumArr[0]].push(parseInt(pNumArr[1]));
  });
};

/**
 * Next slide
 * @method next
 */
Slideshow.prototype.next = function () {
  var self = this;
  var popoverSearchNext = self.slide + popoverDelim + (self.popover + 1);

  if (self.popoverRefs.hasOwnProperty(popoverSearchNext)) { // Next popover exists
    self.changePopover(popoverSearchNext);
  } else { // No popovers left, proceed to next slide
    if (self.slide < (self.$slides.length - 1)) { // Don't go above number of slides
      self.changeSlide(self.slide + 1);
    } else {
      return false;
    }
  }
};

/**
 * Previous slide
 * @method prev
 */
Slideshow.prototype.prev = function () {
  var self = this;
  var popoverSearchPrev = self.slide + popoverDelim + (self.popover - 1);

  if (self.popoverRefs.hasOwnProperty(popoverSearchPrev)) { // Prev popover exists
    self.changePopover(popoverSearchPrev);
  } else { // No popovers left, proceed to prev slide
    if (self.slide > 0) { // Don't go below slide 0
      self.changeSlide((self.slide - 1));
    } else {
      return false;
    }
  }
};

/**
 * Jump to an arbitrary popover
 * @method changePopover
 * @param  {String}         newPopover - Popover ref to jump to
 */
Slideshow.prototype.changePopover = function (newPopover) {
  var self = this;
  var $activePopover = [];
  var $nextPopover = self.popoverRefs[newPopover];
  var newPopoverArr = newPopover.split(popoverDelim);

  self.changingSlide = true;

  // Get & hide currently displayed popover
  if (self.popover > -1) {
    $activePopover = self.getPopover();
    if ($activePopover.length > 0) {
      $activePopover.removeClass(popoverActiveClass);

      return $activePopover.one(transitionEnd, function () {
        // Previous popover hidden, continue with new one
        return continuePopover();
      });
    }
  }

  // No popover to hide, continue with next popover
  return continuePopover();

  function continuePopover() {
    // Update the popover count to the new one
    self.popover = parseInt(newPopoverArr[1]);

    // Display new popover
    $nextPopover.addClass(popoverActiveClass);

    $nextPopover.one(transitionEnd, function () {
      // Popover finished transitioning
      self.changingSlide = false;
    });
  }
};

/**
 * Jump to an arbitrary slide
 * @method changeSlide
 * @param  {Int, String}    newSlide - Slide reference to jump to
 */
Slideshow.prototype.changeSlide = function (newSlide) {
  var self = this;
  var slidePos;
  var slideRot;
  var newTranslate;
  var newWindowRotate;
  var isPrev = newSlide < self.slide;
  var lastPopover;
  var $currentPopover;

  // Only change if not currently changing & if slide is valid
  if (!self.changingSlide && self.slideRefs.hasOwnProperty(newSlide.toString())) {

    // Popover currently displaying, hide it before proceeding
    if (self.popover > -1) {
      $currentPopover = self.getPopover();
      $currentPopover.removeClass(popoverActiveClass);

      return $currentPopover.one(transitionEnd, function () {
        // Popover now hidden, continue on
        self.popover = -1;

        if (isPrev) { // Prev slide, don't change until next prev request
          return false;
        } else { // Next slide, therefore carry on to slide
          return continueSlide();
        }
      });
    }

    // No popover to deal with, continue move to slide
    return continueSlide();

  } else { // End of slides (start/end)
    return false;
  }

  // Contained core slide move logic for calling dynamically
  function continueSlide() {
    self.slide = parseInt(newSlide);
    self.changingSlide = true;

    if (!!self.slideRefs[newSlide].part) {
      $m.attr('data-part', self.slideRefs[newSlide].part);
    } else {
      $m.attr('data-part', '');
    }

    slidePos = self.slideRefs[newSlide].position;
    slideRot = self.slideRefs[newSlide].rotation;

    newTranslate = 'translate(-' + slidePos[0] + 'px, -' + slidePos[1] + 'px)';

    $m.css({
      msTransform: newTranslate,
      webkitTransform: newTranslate,
      transform: newTranslate
    });

    // Calculate the new HTML rotation
    if (slideRot < 0) {
      // Negative rotation
      slideRot -= 3;
    } else if (slideRot > 0) {
      // Positive rotation
      slideRot += 3;
    }

    newWindowRotate = 'rotate(' + (slideRot * -1) + 'deg)';

    $($M).css({
      msTransform: newWindowRotate,
      webkitTransform: newWindowRotate,
      transform: newWindowRotate
    });

    // When transition complete, reset changingSlide
    $m.one(transitionEnd, function () {
      // Previous slide and a popover needs to display
      if (isPrev && self.slidePopovers[newSlide].length > 0) {
        // Retrieve the last (numerically) popover for this slide
        lastPopover = Math.max.apply(null, self.slidePopovers[newSlide]);

        self.changePopover(self.slide + popoverDelim + lastPopover);
      } else {
        self.changingSlide = false;
      }
    });
  }
};

/**
 * Return a slide with the given ref, or the currently active ref
 * @method getSlide
 * @param  {Int, String}    ref - The slide ref to retieve
 */
Slideshow.prototype.getSlide = function (ref) {
  var self = this;
  var ref = ref || self.slide;

  return $(slideSelector + '[' + slideAttr + '="' + ref + '"]');
};

/**
 * Return a popover with the given ref, or the currently active ref
 * @method getPopover
 * @param  {Int, String}    ref - The popover ref to retieve
 */
Slideshow.prototype.getPopover = function (sRef, pRef) {
  var self = this;
  var sRef = sRef || self.slide;
  var pRef = pRef || self.popover;

  return $(popoverSelector + '[' + slideAttr + '="'
    + sRef + popoverDelim + pRef + '"]');
};

/**
 * Extract the transform rotation from an element
 * @method getRotationDegrees
 * @param  {Object}         obj - jQuery selector object
 */
function getRotationDegrees(obj) {
  var values;
  var a;
  var b;
  var angle;
  var matrix = obj.css("-webkit-transform") ||
    obj.css("-moz-transform") ||
    obj.css("-ms-transform") ||
    obj.css("-o-transform") ||
    obj.css("transform");

  if (matrix !== 'none') {
    values = matrix.split('(')[1].split(')')[0].split(',');
    a = values[0];
    b = values[1];
    angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
  } else {
    angle = 0;
  }
  return (angle < 0) ? angle += 360 : angle;
}

export default new Slideshow();

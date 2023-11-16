// Freelancer Theme JavaScript

(function ($) {
  ("use strict"); // Start of use strict

  // jQuery for page scrolling feature - requires jQuery Easing plugin
  $(".page-scroll a").bind("click", function (event) {
    var $anchor = $(this);
    $("html, body")
      .stop()
      .animate(
        {
          scrollTop: $($anchor.attr("href")).offset().top - 50,
        },
        1250,
        "easeInOutExpo"
      );
    event.preventDefault();
  });

  // Highlight the top nav as scrolling occurs
  $("body").scrollspy({
    target: ".navbar-fixed-top",
    offset: 51,
  });

  // Closes the Responsive Menu on Menu Item Click
  $(".navbar-collapse ul li a").click(function () {
    $(".navbar-toggle:visible").click();
  });

  // Floating label headings for the contact form
  $(function () {
    $("body")
      .on("input propertychange", ".floating-label-form-group", function (e) {
        $(this).toggleClass(
          "floating-label-form-group-with-value",
          !!$(e.target).val()
        );
      })
      .on("focus", ".floating-label-form-group", function () {
        $(this).addClass("floating-label-form-group-with-focus");
      })
      .on("blur", ".floating-label-form-group", function () {
        $(this).removeClass("floating-label-form-group-with-focus");
      });
  });
})(jQuery); // End of use strict

const timePerImageInSeconds = 10;
var numOriginalImages = -1;
var imageWidth;
var totalTransitionSeconds;
var totalTranslationX;
var lastResetTransitionMs;

function duplicateImagesToFitWidth() {
  const slider = document.querySelector(".slider");
  const sliderWidth = slider.clientWidth;
  const images = slider.querySelectorAll(".carousel-element");

  var i = images.length % numOriginalImages;
  var overhead = sliderWidth - (images.length - numOriginalImages) * imageWidth;

  if (overhead > 0) {
    var percentagePassed =
      (Date.now() - lastResetTransitionMs) / (1000 * totalTransitionSeconds);
    while (overhead > 0) {
      var cloneImg = images[i].cloneNode(true);
      slider.appendChild(cloneImg);
      i = (i + 1) % images.length;
      overhead -= imageWidth;
    }
    setTimeout(() => imageAnimationAtPercentage(percentagePassed), 10);
  }
}

function resetImage(img) {
  setImage(img, 0, 0);
}

function setImage(img, transitionTime, translationX) {
  img.style.transition = "transform " + transitionTime + "s linear";
  img.style.transform = "translateX(-" + translationX + "px)";
}

function imageAnimationReset() {
  imageAnimationAtPercentage(0);
}

function imageAnimationAtPercentage(percentage) {
  var percentageRemaining = 1 - percentage;
  var timeRemaining = percentageRemaining * totalTransitionSeconds;
  var startingTranslationX = percentage * totalTranslationX;

  const images = document
    .querySelector(".slider")
    .querySelectorAll(".carousel-element");
  images.forEach((img) => {
    setImage(img, 0, startingTranslationX);
    setTimeout(() => setImage(img, timeRemaining, totalTranslationX), 10);
  });
  var virtualTimeElapsed = totalTransitionSeconds * 1000 * percentage;
  lastResetTransitionMs = Date.now() - virtualTimeElapsed;
}

function imageAnimationInitialize() {
  const images = document
    .querySelector(".slider")
    .querySelectorAll(".carousel-element");
  images[0].addEventListener("webkitTransitionEnd", imageAnimationReset);
  images[0].addEventListener("transitioned", imageAnimationReset);
  images[0].addEventListener("msTransitionEnd", imageAnimationReset);
  images[0].addEventListener("oTransitinoEnd", imageAnimationReset);
  numOriginalImages = images.length;
  imageWidth = images[0].querySelector("img").clientWidth - 1;
  totalTransitionSeconds = numOriginalImages * timePerImageInSeconds;
  totalTranslationX = numOriginalImages * imageWidth;
  setTimeout(duplicateImagesToFitWidth, 10);
  setTimeout(imageAnimationReset, 10);
}

function createCarouselElement(filename) {
  const carouselElement = document.createElement("div");
  carouselElement.classList.add("carousel-element");

  const carouselImage = document.createElement("img");
  carouselImage.src = "resources/carousel/" + filename;
  carouselImage.draggable = false;

  carouselElement.appendChild(carouselImage);

  return carouselElement;
}

function attachOriginalImages() {
  const slider = document.querySelector(".slider");

  // Get all image paths from the resources/carousel folder and add them to the
  // sliders div in a random order
  $.ajax({
    url: "resources/carousel/",
    method: "GET",
    success: function (data) {
      var pattern = /<span\s+class="name">([^<]+)<\/span>/g;
      var matches = [];
      var match;
      while ((match = pattern.exec(data)) !== null) matches.push(match[1]);
      matches.shift(); // Has a .. file path
      var swapMatch;
      while (matches.length > 0) {
        const randomIdx = Math.floor(Math.random() * matches.length);
        swapMatch = matches[randomIdx];
        matches[randomIdx] = matches[0];
        matches[0] = swapMatch;
        slider.appendChild(createCarouselElement(matches.shift()));
      }

      setTimeout(imageAnimationInitialize);
    },
    error: function (err) {
      console.error("Error fetching file list:", err);
    },
  });
}

window.addEventListener("DOMContentLoaded", attachOriginalImages);
window.addEventListener("resize", duplicateImagesToFitWidth);
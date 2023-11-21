const timePerImageInSeconds = 10;
var numOriginalImages = -1;
var imageWidth;

function slideOneImage() {
  const slider = document.querySelector(".slider");
  slider.style.transition = "transform " + timePerImageInSeconds + "s linear";
  slider.style.transform = "translateX(-" + imageWidth + "px)";
}

function sliderReset() {
  const slider = document.querySelector(".slider");
  slider.appendChild(slider.childNodes[0]);
  slider.style.transition = "none";
  slider.style.transform = "none";
  setTimeout(slideOneImage, 1);
}

function imageAnimationInitialize() {
  const slider = document.querySelector(".slider");
  const images = slider.querySelectorAll(".carousel-element");
  slider.addEventListener("webkitTransitionEnd", sliderReset);
  slider.addEventListener("transitioned", sliderReset);
  slider.addEventListener("msTransitionEnd", sliderReset);
  slider.addEventListener("oTransitionEnd", sliderReset);
  numOriginalImages = images.length;
  imageWidth = images[0].querySelector("img").clientWidth - 2;
  slideOneImage();
}

function createCarouselElement(imgpath) {
  const carouselElement = document.createElement("div");
  carouselElement.classList.add("carousel-element");
  const carouselImage = document.createElement("img");
  carouselImage.src = imgpath;
  carouselImage.draggable = false;
  carouselElement.appendChild(carouselImage);
  return carouselElement;
}

function attachOriginalImages() {
  const slider = document.querySelector(".slider");
  // Get all image paths from the resources/carousel folder and add them to the
  // sliders div in a random order
  $.ajax({
    url: "https://api.github.com/repos/mariuskilian/mariuskilian.github.io/contents/resources/carousel/images",
    method: "GET",
    success: function (data) {
      for (let i = 0; i < data.length; i++) {
        const nElements = slider.childNodes.length;
        const rndIdx = Math.floor(Math.random() * (nElements + 1));
        const carouselElement = createCarouselElement(data[i].path);
        const beforeElement =
          rndIdx == nElements ? null : slider.childNodes[rndIdx];
        slider.insertBefore(carouselElement, beforeElement);
      }
      setTimeout(imageAnimationInitialize, 10);
    },
    error: function (err) {
      console.error("Error fetching file list:", err);
    },
  });
}

window.addEventListener("DOMContentLoaded", attachOriginalImages);

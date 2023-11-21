function playGif(portfolioitem, play) {
  const cover = portfolioitem.getElementsByTagName("IMG")[0];
  if (play) {
    if (cover.src != cover.getAttribute("gifpath"))
      cover.src = cover.getAttribute("gifpath");
  } else cover.src = cover.getAttribute("imgpath");
}

function initiatePortfolioHoverEffect() {
  var items = document.getElementsByClassName("portfolio-item");
  for (let i = 0; i < items.length; i++) {
    playGif(items[i], false);
    items[i].addEventListener("mouseover", () => playGif(items[i], true));
    items[i].addEventListener("mouseout", () => playGif(items[i], false));
  }
}

window.addEventListener("DOMContentLoaded", initiatePortfolioHoverEffect);

function simulateHover(pfitem, activate) {
  const hovered = "hovered";
  if (activate) {
    pfitem.classList.add(hovered);
    playGif(pfitem, true);
  } else {
    pfitem.classList.remove(hovered);
    playGif(pfitem, false);
  }
}

function getTopmostVisibleElement(elements) {
  var navbarHeight = document.getElementById("mainNav").offsetHeight;
  var topmostVisibleElement = null;
  for (let i = 0; i < elements.length; i++) {
    var rect = elements[i].getBoundingClientRect();
    if (rect.top >= navbarHeight - 10 && rect.bottom <= window.innerHeight) {
      if (
        !topmostVisibleElement ||
        rect.top < topmostVisibleElement.getBoundingClientRect().top
      ) {
        topmostVisibleElement = elements[i];
      }
    }
  }
  return topmostVisibleElement;
}

function initAutoHoverOnMobile() {
  const touchscreen =
    /Android|webOS|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const smallscreen = window.matchMedia(
    "only screen and (max-width: 767px)"
  ).matches;

  if (touchscreen && smallscreen) {
    var items = document.getElementsByClassName("portfolio-item");
    for (let i = 0; i < items.length; i++) {
      items[i].style.transition = "scale 0.4s ease-out";
      var coverContainer = items[i].getElementsByClassName(
        "portfolio-cover-container"
      )[0];
      coverContainer.classList.add("show-clickable");
    }
    var debounceTimer;
    document.addEventListener("scroll", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        var hoveredElement = getTopmostVisibleElement(items);
        for (let i = 0; i < items.length; i++) simulateHover(items[i], false);
        simulateHover(hoveredElement, true);
      }, 500);
    });
  }
}

window.addEventListener("DOMContentLoaded", initAutoHoverOnMobile);

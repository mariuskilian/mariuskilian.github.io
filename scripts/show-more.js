function show_more() {
  var dots = document.getElementById("dots");
  var moreText = document.getElementById("more");

  if (moreText.style.display === "none") {
    dots.style.display = "none";
    moreText.style.display = "inline";
  }
}

function show_cv() {
  var cv = document.getElementById("cv-frame");
  cv.style.height = "auto";
  cv.style.scale = 1;

  var showCVButton = document.getElementById("show-cv-btn");
  showCVButton.style.display = "none";

  var downloadCVButton = document.getElementById("download-cv-btn");
  downloadCVButton.style.display = "inline-block";
  setTimeout(() => {
    downloadCVButton.style.scale = "1";
  }, 1000);
}

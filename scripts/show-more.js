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

function show_full_portfolio() {
  var fullPF = document.getElementById("full-portfolio");
  var pfToggle = document.getElementById("portfolio-toggle");

  if (!pfToggle.hasAttribute("showing")) {
    pfToggle.setAttribute("showing", "");
    document.getElementById("portfolio-show-btn").style.display = "none";
    document.getElementById("portfolio-hide-btn").style.display = "inline";
    fullPF.style.display = "inline";
  } else {
    pfToggle.removeAttribute("showing");
    document.getElementById("portfolio-show-btn").style.display = "inline";
    document.getElementById("portfolio-hide-btn").style.display = "none";
    fullPF.style.display = "none";
  }
}
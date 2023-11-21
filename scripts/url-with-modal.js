const portfolioToOpen = window.location.hash.substring(1).split("?")[0];
console.log(window.location);

if (portfolioToOpen !== null && portfolioToOpen !== "") {
  var modalLink = document.getElementById("portfolioLink" + portfolioToOpen);
  if (modalLink) setTimeout(() => modalLink.click(), 250);
}
// When clicking a portfolio item on the page, this makes sure the url is appended
function appendModalUrl(modalId) {
  const newUrl = window.location.origin + `/#${modalId}`;
  history.pushState({ modal: modalId }, null, newUrl);
}
var portfolioLinks = document.getElementsByClassName("portfolio-link");
for (let i = 0; i < portfolioLinks.length; i++) {
  let link = portfolioLinks[i];
  link.addEventListener("click", () => {
    appendModalUrl(link.id.replace("portfolioLink", ""));
  });
}

$(".portfolio-modal").on("hide.bs.modal", function () {
  history.replaceState(null, null, window.location.pathname);
});

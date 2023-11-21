const urlParams = new URLSearchParams(window.location.search);
const portfolioToOpen = urlParams.get("portfolio");

if (portfolioToOpen) {
  var modalLink = document.getElementById("portfolioLink" + portfolioToOpen);
  if (modalLink) setTimeout(() => modalLink.click(), 250);
}

function appendModalUrl(modalId) {
  const newUrl = window.location.href.split("?")[0] + `?portfolio=${modalId}`;
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
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete("portfolio");
  history.replaceState({}, null, currentUrl.toString());
});

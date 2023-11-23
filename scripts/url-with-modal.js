// Parse hash into query:
// e.g. #/PokeArena?section=names-and-hierarchy becomes
//    window.location.hash = #/PokeArena
//    window.location.search = ?section=names-and-hierarchy
function fixUrlHash(url) {
  let fixedUrl = new URL(url);
  let search = url.search;
  let hash = url.hash;
  const position = url.hash.indexOf("?");
  if (search.length <= 1 && position >= 0) {
    search = hash.substr(position);
    hash = hash.substr(0, position);
    fixedUrl.hash = hash;
    fixedUrl.search = search;
  }
  return fixedUrl;
}

function handleHash() {
  const url = fixUrlHash(window.location);
  const portfolioToOpen = url.hash.substring(2);

  if (portfolioToOpen !== null && portfolioToOpen !== "") {
    let modalLink = document.getElementById("portfolioLink" + portfolioToOpen);
    let modal = document.getElementById("portfolioModal" + portfolioToOpen);
    if (!modalLink) resetUrl();
    else if (modal.style.display !== "block") modalLink.click();
    let openSection = () => {
      if (url.search !== "") {
        const md = document.getElementById("MD" + portfolioToOpen);
        const sections = url.searchParams.get("section").split("/");
        let lastSection = md.shadowRoot;
        let sectionId = "";
        sections.forEach((sectionName) => {
          sectionId += sectionName;
          let nextSection = lastSection.querySelector(
            "#" + sectionId.replace("/", "\\/")
          );
          if (!nextSection) return;
          lastSection = nextSection;
          lastSection.setAttribute("open", "true");
          sectionId += "/";
        });

        let scrollToSection = () => {
          let elementPosition = lastSection.getBoundingClientRect().top;
          modal.scrollTo({
            top: elementPosition + modal.scrollTop,
            behavior: "smooth",
          });
        };
        if (modalShown.get(portfolioToOpen)) scrollToSection();
        else modalShown.set(portfolioToOpen, scrollToSection);
      }
    };
    if (modalLoaded.get(portfolioToOpen)) openSection();
    else modalLoaded.set(portfolioToOpen, openSection);
  }
}

let modalShown = new Map();
let modalLoaded = new Map();

document.addEventListener("zero-md-rendered", (evnt) => {
  const mdNode = evnt.detail.node;
  const portfolioName = mdNode.id.substring(2);
  if (modalLoaded.has(portfolioName)) modalLoaded.get(portfolioName)();
  modalLoaded.set(portfolioName, () => {});

  let link = document.getElementById("portfolioLink" + portfolioName);
  link.addEventListener("click", () => {
    appendModalUrl(portfolioName + "");
  });
});

// When clicking a portfolio item on the page, this makes sure the url is appended
function appendModalUrl(modalId) {
  const fixedUrl = fixUrlHash(window.location);
  if (fixedUrl.hash !== modalId) {
    const newUrl = window.location.origin + `/#/${modalId}`;
    history.pushState({ modal: modalId }, null, newUrl);
  }
}

function resetUrl() {
  history.replaceState(null, null, window.location.pathname);
}

$(".portfolio-modal").on("hide.bs.modal", function () {
  console.log("hidden");
  resetUrl();
});

$(".portfolio-modal").on("shown.bs.modal", function () {
  let portfolioName = this.id.replace("portfolioModal", "");
  if (modalShown.has(portfolioName)) modalShown.get(portfolioName)();
  modalShown.set(portfolioName, () => {});
});

// Attach the event listener to the window
window.onhashchange = handleHash;
window.addEventListener("DOMContentLoaded", handleHash);

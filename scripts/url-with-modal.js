// Attach the event listener to the window
window.onhashchange = handleHash;
window.addEventListener("DOMContentLoaded", handleHash);

let modalOnShown = new Map();
let modalOnLoad = new Map();

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
  const pfName = url.hash.substring(2);

  if (pfName !== null && pfName !== "") {
    let modalLink = document.getElementById("portfolioLink" + pfName);
    let modal = document.getElementById("portfolioModal" + pfName);
    if (!modalLink) resetUrl();
    else if (modal.style.display !== "block") {
      // Close all other modals first (in case url/#/Modal1 followed by url/#/Modal2 is entered)
      $(".portfolio-modal").modal("hide");
      $("#portfolioModal" + pfName).modal("show");
    }
    let openSection = () => {
      if (url.search !== "") {
        const sections = url.searchParams.get("section").split("/");
        let lastSection = document.getElementById("MD" + pfName).shadowRoot;
        let sectionId = "";
        sections.forEach((sectionName) => {
          sectionId += sectionName;
          let nextSection = lastSection.querySelector(
            "#" + sectionId.replaceAll("/", "\\/")
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
        if (modalOnShown.get(pfName)) scrollToSection();
        else modalOnShown.set(pfName, scrollToSection);
      }
    };
    if (modalOnLoad.get(pfName)) openSection();
    else modalOnLoad.set(pfName, openSection);
  }
}

document.addEventListener("zero-md-rendered", (evnt) => {
  const mdNode = evnt.detail.node;
  const pfName = mdNode.id.substring(2);
  if (modalOnLoad.has(pfName)) modalOnLoad.get(pfName)();
  modalOnLoad.set(pfName, () => {});
});

// This patches a bug in iOS Safari where opening and closing a modal
// made the page jump up. With this it ensures that after closing a modal
// the user is at the same position than before.
let homeScrollOnModalOpen;

$(".portfolio-modal").on("shown.bs.modal", function () {
  let pfName = this.id.replace("portfolioModal", "");
  if (modalOnShown.has(pfName)) modalOnShown.get(pfName)();
  modalOnShown.set(pfName, () => {});
});

$(".portfolio-modal").on("hidden.bs.modal", function () {
  resetUrl();
  window.scrollTo({ top: homeScrollOnModalOpen });
});

$(".portfolio-link").on("click", function () {
  let pfName = this.id.replace("portfolioLink", "");
  $("#portfolioModal" + pfName).modal("show");
  appendModalUrl(pfName);
  homeScrollOnModalOpen = window.scrollY;
  return false;
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
  history.pushState(null, null, window.location.pathname);
}

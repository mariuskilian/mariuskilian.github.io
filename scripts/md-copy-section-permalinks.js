const copiedPopup = document.querySelector(".clipboard");
var clipboardTimeout;

function showClipboardPopup() {
  copiedPopup.style.display = "block";
  setTimeout(() => copiedPopup.setAttribute("show", ""), 10);
  clearTimeout(clipboardTimeout);
  clipboardTimeout = setTimeout(() => {
    copiedPopup.removeAttribute("show");
    clipboardTimeout = setTimeout(
      () => (copiedPopup.style.display = "none"),
      2500
    );
  }, 3000);
}

document.addEventListener("zero-md-rendered", (evnt) => {
  const mdNode = evnt.detail.node;
  const pfName = mdNode.id.substring(2); // remove MD prefix
  mdNode.shadowRoot.querySelectorAll("details").forEach((details) => {
    const summary = details.querySelector("summary");
    const linkImg = document.createElement("img");
    linkImg.classList.add("copy");
    linkImg.src = "resources/writeups/link-45deg.svg";
    const copyUrl =
      window.location.origin + "/#/" + pfName + "?section=" + details.id;
    linkImg.onclick = (event) => {
      event.preventDefault();
      navigator.clipboard.writeText(copyUrl);
      showClipboardPopup();
    };
    summary.appendChild(linkImg);
  });
});

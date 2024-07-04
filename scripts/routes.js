// Attach the event listener to the window
window.onhashchange = handleLive;
window.addEventListener("DOMContentLoaded", handleLive);

function handleLive() {
  const url = fixUrlHash(window.location);
  const liveName = url.searchParams.get("live");

  if (!liveName) {
    history.pushState(null, null, window.location.pathname);
    return;
  }

  const liveWindow =
    document.getElementById("live" + liveName) ||
    document.getElementById("liveDefault");
  console.log(liveWindow.d);
  if (liveWindow.style.display !== "block") {
    // Close all other modals first (in case url/#/Modal1 followed by url/#/Modal2 is entered)
    $(".portfolio-modal").modal("hide");
    $("#" + liveWindow.id).modal("show");
  }
}

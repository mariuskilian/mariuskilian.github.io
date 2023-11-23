function addId(details, prefix = "") {
  let title = details
    .querySelector("summary")
    .querySelector("h2, h3, h4, h5, h6").innerHTML;
  title = title.replaceAll(" ", "-").toLowerCase();
  details.id = prefix + title;
  details
    .querySelectorAll(":scope > details")
    .forEach((child) => addId(child, details.id + "/"));
}

document.addEventListener("zero-md-rendered", (evnt) => {
  const mdNode = evnt.detail.node;
  mdNode.shadowRoot
    .querySelector(".markdown-body")
    .querySelectorAll(":scope > details")
    .forEach((details) => addId(details));
  mdNode.shadowRoot.querySelectorAll("a[href^='#']").forEach((a) => {
    let portfolioName = mdNode.id.substring(2);
    a.setAttribute("target", "_self");
    a.href = "#/" + portfolioName + "?section=" + a.href.split("#")[1];
    a.onclick = () => {
      location.hash = portfolioName;
    };
  });
});

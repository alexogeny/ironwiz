import { networkRequestScript } from "./lib/utilities/network";

let ironWizDataDiv = document.getElementById("ironwiz-response");
if (!ironWizDataDiv) {
  const ironWizDataDiv = document.createElement("div");
  ironWizDataDiv.id = "ironwiz-response";
  ironWizDataDiv.style.display = "none";
  document.body.appendChild(ironWizDataDiv);
}
ironWizDataDiv = document.getElementById("ironwiz-response");
const injectScript = () => {
  let script = document.createElement("script");
  script.textContent = networkRequestScript;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
};
injectScript();

// setInterval(() => {
//   addTrackerDetails(true);
// }, 1000);
const observer = new MutationObserver((mutations) => {
  // addXpPerMinToSkillTable();
  // addTrackerDetails();
  mutations.forEach(function (mutation) {
    if (mutation.type === "attributes") {
      if (mutation.target instanceof Element) {
        const responseBody = mutation.target.getAttribute("data-response");
        const responseUrl = mutation.target.getAttribute("data-response-url");
        console.log(`responseBody: ${responseBody}`);
        console.log(`responseUrl: ${responseUrl}`);
        chrome.runtime.sendMessage(
          {
            action: "networkRequest",
            responseBody,
            responseUrl,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
            } else {
              console.log("Message sent successfully", response);
            }
          }
        );
      }
    }
  });
});
observer.observe(ironWizDataDiv!, {
  attributes: true,
});

import { addToTable } from "./lib/gameFunctions";

if (!window["myScriptHasRun"]) {
  console.log(
    "Loaded ironwiz extension for ironwoodRPG. Please report any bugs to https://github.com/alexogeny/ironwiz/issues/new"
  );
  window["myScriptHasRun"] = true;
}

let lastProcessedURL: string = "";

const observer = new MutationObserver((mutations) => {
  const currentURL = window.location.pathname;
  if (currentURL !== lastProcessedURL && currentURL.startsWith("/skill/")) {
    lastProcessedURL = currentURL;
    addToTable();
  }
});
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getDocumentHTML") {
    const documentHTML = document.documentElement.outerHTML;
    sendResponse({ documentHTML });
  }

  if (message.action === "notification") {
    chrome.notifications.create(message.options);
  }
});

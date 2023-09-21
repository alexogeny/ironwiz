import { addXpPerMinToSkillTable } from "./lib/gameFunctions";

if (!window["myScriptHasRun"]) {
  console.log(
    "Loaded ironwiz extension for ironwoodRPG. Please report any bugs to https://github.com/alexogeny/ironwiz/issues/new"
  );
  window["myScriptHasRun"] = true;
}

let lastProcessedURL: string = "";

const observer = new MutationObserver((mutations) => {
  addXpPerMinToSkillTable();
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

const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo, init?: RequestInit) => {
  const response = await originalFetch(input, init);

  if (
    typeof input === "string" &&
    input.includes("/getUser") &&
    init?.method === "GET"
  ) {
    const clone = response.clone(); // Clone the response so that it doesn't get consumed
    const data = await clone.json();
    const user = data.user;
    const questReset = user.quests.reset;
    console.debug(`Quest reset: ${questReset}`);
  }

  return response;
};

/// <reference lib="dom" />

chrome.webRequest.onCompleted.addListener(
  (details) => {
    // Handle network request completion
  },
  { urls: ["*://ironwoodrpg.com/*"] }
);

chrome.storage.onChanged.addListener((changes, namespace) => {
  // Handle local storage changes
});

chrome.notifications.create({
  type: "basic",
  iconUrl: "icon.png",
  title: "Ironwood",
  message: "You finished smelting Iron Bars (22).",
});

chrome.webNavigation.onCompleted.addListener((details) => {
  // Handle navigation events
  // get the url path
  const url = new URL(details.url);

  // log the url path
  console.log(url.pathname);
});

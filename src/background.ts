/// <reference lib="dom" />

const { version } = chrome.runtime.getManifest();

const setupNotificationForCraftCompletion = (document: Document) => {
  const headers = Array.from(document.querySelectorAll(".card .header .name"));
  const materialBeingCrafted = headers[0]?.textContent?.trim();
  if (!materialBeingCrafted) return;
  const materialRows = headers
    .find((x) => x?.textContent?.trim() === "Materials")
    ?.parentNode?.parentNode?.querySelectorAll(".row");
  const materialCounts = new Map<string, [number, number]>();
  materialRows?.forEach((row) => {
    const name = row.querySelector(".name")?.textContent?.trim();
    const value = row.querySelector(".value")?.textContent?.trim();
    if (name && value) {
      const [owned, used] = value.split(" / ").map(Number);
      materialCounts.set(name, [owned, used]);
    }
  });
  const lootHeader = headers.find((x) => x?.textContent?.trim() === "Loot");
  const lootHeaderNextSibling = lootHeader?.nextSibling;
  const totalToCraft = lootHeaderNextSibling?.textContent?.trim();
  const [crafted, total] = totalToCraft?.split(" / ").map(Number) || [0, 0];
  const minCrafts = total
    ? total - crafted
    : Math.min(
        ...Array.from(materialCounts.entries()).map(([_, [owned, used]]) =>
          Math.floor(owned / used)
        )
      );

  const actionHeader = headers.find(
    (x) => x?.textContent?.trim() === "Actions"
  );
  const actionRows =
    actionHeader?.parentNode?.parentNode?.querySelectorAll(".row");
  const actionRow = Array.from(actionRows || []).find(
    (row) =>
      row.querySelector(".name")?.textContent?.trim() === materialBeingCrafted
  );
  const craftDuration = actionRow
    ?.querySelector(".interval span")
    ?.textContent?.trim();
  const craftDurationSeconds = craftDuration
    ? parseFloat(craftDuration.replace("s", ""))
    : 0;
  const totalTime = minCrafts * craftDurationSeconds * 1000;

  setTimeout(() => {
    chrome.notifications.create({
      title: "Crafting Finished",
      message: `Crafting ${minCrafts} ${materialBeingCrafted} finished at ${new Date().toLocaleString()}`,
      iconUrl: "icon.png",
      type: "basic",
    });
  }, totalTime);
};

const getDomAndSetupNotification = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab.id) {
      chrome.tabs.sendMessage(
        activeTab.id,
        { action: "getDocumentHTML" },
        (response) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(
            response.documentHTML,
            "text/html"
          );
          setTimeout(() => {
            setupNotificationForCraftCompletion(doc);
          }, 2500);
        }
      );
    }
  });
};

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.method === "POST" && details.url.includes("/startAction")) {
      if (
        details.requestBody &&
        details.requestBody.raw &&
        details.requestBody.raw[0]
      ) {
        const enc = new TextDecoder("utf-8");
        const requestBody = JSON.parse(
          enc.decode(details.requestBody.raw[0].bytes)
        );

        if (!("amount" in requestBody)) {
          console.debug(
            'Doing nothing because "amount" key is not present in the request body'
          );
          return;
        }

        setTimeout(() => {
          getDomAndSetupNotification();
        }, 500);
      }
    }
  },
  { urls: ["*://ironwoodrpg.com/*", "*://api.ironwoodrpg.com/*"] },
  ["requestBody"]
);

chrome.storage.onChanged.addListener((changes, namespace) => {
  // Handle local storage changes
});

chrome.notifications.create({
  type: "basic",
  iconUrl: "icon.png",
  title: "Ironwood",
  message: `Loaded extension. Current version: ${version}`,
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "notification") {
    chrome.notifications.create(message.options);
  }
});

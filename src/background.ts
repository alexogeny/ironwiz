/// <reference lib="dom" />

// get the version key from the package.json
const { version } = chrome.runtime.getManifest();

const setupNotificationForCraftCompletion = (document: Document) => {
  const headers = Array.from(document.querySelectorAll(".card .header .name"));
  console.debug({ headers });
  // materialBeingCrafted should always be the first header
  const materialBeingCrafted = headers[0]?.textContent?.trim();
  if (!materialBeingCrafted) return;
  // get the materials required for crafting as a map
  const materialRows = headers
    .find((x) => x?.textContent?.trim() === "Materials")
    ?.parentNode?.parentNode?.querySelectorAll(".row");
  // materialCounts is keyed on the material name, then it has the total amount / amount used per craft
  const materialCounts = new Map<string, [number, number]>();
  materialRows?.forEach((row) => {
    const name = row.querySelector(".name")?.textContent?.trim();
    const value = row.querySelector(".value")?.textContent?.trim();
    if (name && value) {
      const [owned, used] = value.split(" / ").map(Number);
      materialCounts.set(name, [owned, used]);
    }
  });
  console.debug({ materialCounts });
  const lootHeader = headers.find((x) => x?.textContent?.trim() === "Loot");
  console.debug({ lootHeader });
  // if lootHeader has a nextSibling, then there's a fixed amount of crafts in the format `crafted / totalToCraft`
  // otherwise we should fall back to the max amount we can craft with the materials we have
  const lootHeaderNextSibling = lootHeader?.nextSibling;
  console.debug({ lootHeaderNextSibling });
  const totalToCraft = lootHeaderNextSibling?.textContent?.trim();
  console.debug({ totalToCraft });
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
  // then we should find the matching .row from the actions table and get the per-craft duration in the .interval span
  const actionRows =
    actionHeader?.parentNode?.parentNode?.querySelectorAll(".row");
  const actionRow = Array.from(actionRows || []).find(
    (row) =>
      row.querySelector(".name")?.textContent?.trim() === materialBeingCrafted
  );
  const craftDuration = actionRow
    ?.querySelector(".interval span")
    ?.textContent?.trim();
  // the format of craftDuration (if not null) is 0.0s
  const craftDurationSeconds = craftDuration
    ? parseFloat(craftDuration.replace("s", ""))
    : 0;
  // Calculate total time required for crafting to finish
  const totalTime = minCrafts * craftDurationSeconds * 1000;

  console.log(`Crafting ${minCrafts} items will take ${totalTime}ms`);
  console.log(
    `Notification will be sent at ${new Date(
      Date.now() + totalTime
    ).toLocaleString()}`
  );

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
          console.debug('Sending "getDocumentHTML" message to tab');
          console.debug({ doc });
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
    console.debug("webRequest.onCompleted");
    console.debug({ details });
    // Handle network request completion
    // if we hit the /startAction endpoint, then we should do stuff
    if (details.method === "POST" && details.url.includes("/startAction")) {
      // if 'amount' key is not present in the request body, then we can exit early
      if (
        details.requestBody &&
        details.requestBody.raw &&
        details.requestBody.raw[0]
      ) {
        const enc = new TextDecoder("utf-8");
        const requestBody = JSON.parse(
          enc.decode(details.requestBody.raw[0].bytes)
        );
        console.debug({ requestBody });

        if (!("amount" in requestBody)) {
          console.debug(
            'Doing nothing because "amount" key is not present in the request body'
          );
          return;
        }

        // set timeout to get the DOM and setup the notification
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

// chrome.webNavigation.onCompleted.addListener((details) => {
//   console.log({ details });
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "notification") {
    chrome.notifications.create(message.options);
  }
});

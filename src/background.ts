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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "notification") {
    chrome.notifications.create(message.options);
  } else if (message.action === "networkRequest") {
    if (message.responseUrl.includes("stopAction")) {
      chrome.notifications.create({
        title: "IronWiz",
        message: `Action Complete. At ${new Date().toLocaleString()}`,
        iconUrl: "icon.png",
        type: "basic",
      });
    } else if (message.responseUrl.includes("startAction")) {
      const detail = JSON.parse(message.responseBody);
      const skillId = detail.skillId;
      const actionId = detail.actionId;
      let amount = null;
      if (detail.amount) {
        amount = detail.amount;
      }
    }
  } else if (message.action === "notifyActionComplete") {
    const skillName = message.currentSkill;
    chrome.notifications.create({
      title: "IronWiz",
      message: `Finished ${skillName}! At ${new Date().toLocaleString()}`,
      iconUrl: "icon.png",
      type: "basic",
    });
  }
});

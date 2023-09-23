function getComponentFromDocument(componentName: string) {
  const component = document.querySelector(componentName);
  if (component) {
    return component;
  }
  return null;
}

function checkIfSkillTableHasXpPerMin() {
  const actionsComponent = getComponentFromDocument("actions-component");
  if (actionsComponent) {
    const xpPerMin = actionsComponent.querySelector(".xp-per-min");
    if (xpPerMin) {
      return true;
    }
  }
}

function activeAction() {
  const actionsComponent = getComponentFromDocument("actions-component");
  if (actionsComponent) {
    const activeAction = actionsComponent.querySelector(".active-link");
    if (activeAction) {
      const interval = activeAction.querySelector(".interval");
      const exp = activeAction.querySelector(".exp");
      return {
        interval: parseFloat(interval?.textContent?.replace("s", "") || "0"),
        exp: parseFloat(exp?.textContent?.replace(" XP", "") || "0"),
      };
    }
  }
  return { interval: 0, exp: 0 };
}
const safelyParseFloat = (str: string): number => {
  const cleanedStr = str.replace(/[^\d.]/g, "");
  return parseFloat(cleanedStr);
};
export function addTrackerDetails(triggeredByListener: boolean = false) {
  const trackerComponent = document.querySelector("tracker-component");
  if (!trackerComponent) {
    return;
  }
  if (
    trackerComponent.querySelector(".custom-tracker-details") &&
    !triggeredByListener
  ) {
    return;
  }
  const { interval, exp } = activeAction();
  if (interval === 0 || exp === 0) {
    return;
  }
  const expElement = trackerComponent.querySelector(".exp");
  if (!expElement) {
    return;
  }
  const [currentXp, xpForNextLevel] = expElement?.textContent?.split(" / ") || [
    "0",
    "0",
  ];
  if (currentXp === "0" || xpForNextLevel === "0") {
    return;
  }

  const craftPercentElement = document
    .querySelector("action-component")
    ?.querySelector(".bar")
    ?.querySelector(".fill");

  const craftPercent =
    craftPercentElement
      ?.getAttribute("style")
      ?.split("width: ")[1]
      ?.split("%")[0] || "0";
  const craftPercentFloat = safelyParseFloat(craftPercent);
  const partialXpGained = (craftPercentFloat / 100) * exp;

  const xpRemaining =
    safelyParseFloat(xpForNextLevel) -
    safelyParseFloat(currentXp) -
    partialXpGained;
  const calculatedActionsRemaining = xpRemaining / exp;
  const calculatedTimeUntilLevelUp = calculatedActionsRemaining * interval;
  const formattedActionsRemaining = calculatedActionsRemaining.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 2,
    }
  );
  const formattedTimeUntilLevelUp = new Date(calculatedTimeUntilLevelUp * 1000)
    .toISOString()
    .substr(11, 8);

  const newRow = document.createElement("div");
  newRow.classList.add("row");
  newRow.classList.add("custom-tracker-details");
  newRow.style.display = "flex"; // Add display: flex
  newRow.style.justifyContent = "space-around"; // Add justify-content: space-around
  newRow.style.paddingTop = "12px";
  newRow.style.paddingBottom = "12px";
  newRow.style.fontFamily = "monospace";
  const actionsRemaining = document.createElement("div");
  actionsRemaining.classList.add("actions-remaining");
  actionsRemaining.textContent = `Actions: ${formattedActionsRemaining}`; // Replace 'xyz' with the actual value
  actionsRemaining.style.color = "#aaa"; // Change text color to #aaa

  const timeUntilLevelUp = document.createElement("div");
  timeUntilLevelUp.classList.add("time-until-level-up");
  timeUntilLevelUp.textContent = `Time: ${formattedTimeUntilLevelUp}`; // Replace with the actual time
  timeUntilLevelUp.style.color = "#aaa"; // Change text color to #aaa

  newRow.appendChild(actionsRemaining);
  newRow.appendChild(timeUntilLevelUp);

  if (!triggeredByListener) {
    trackerComponent.querySelector(".skill")?.appendChild(newRow);
  } else {
    trackerComponent
      .querySelector(".skill")
      ?.replaceChild(
        newRow,
        trackerComponent.querySelector(".custom-tracker-details")!
      );
  }
}

export function addXpPerMinToSkillTable() {
  if (checkIfSkillTableHasXpPerMin()) {
    return;
  }

  const actionsComponent = getComponentFromDocument("actions-component");
  if (!actionsComponent) {
    return;
  }

  const rows = actionsComponent.querySelectorAll(".row");

  if (rows.length > 0) {
    rows.forEach((row) => {
      let kindOfAction = "skilling";
      let xpElement = row.querySelector(".exp");
      if (!xpElement) {
        xpElement = row.querySelector(".combat-exp");
        kindOfAction = "combat";
      }
      const timeElement = row.querySelector(".interval span");
      const levelElement = row.querySelector(".level");

      const xp = parseFloat(xpElement?.textContent?.replace(" XP", "") || "0");
      let xpPerMin = null;
      if (kindOfAction === "combat") {
        xpPerMin = (xp * 60).toFixed(2);
      } else {
        const time = parseFloat(
          timeElement?.textContent?.replace("s", "") || "0"
        );
        xpPerMin = ((xp / time) * 60).toFixed(2);
      }

      const newDiv = document.createElement("div");
      newDiv.className = "xp-per-min";
      newDiv.textContent = `${xpPerMin} XP/min`;
      row.insertBefore(newDiv, levelElement);
    });
  }
}

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

function getComponentFromDocument(componentName: string) {
  const component = document.querySelector(componentName);
  if (component) {
    return component;
  }
  return null;
}

function checkIfSkillTableHasXpPerMin() {
  // if the .xp-per-min class exists in the actions-component element then we know that the xp per min has already been added
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
      const xpElement = row.querySelector(".exp");
      const timeElement = row.querySelector(".interval span");
      const levelElement = row.querySelector(".level");

      if (xpElement && timeElement && levelElement) {
        const xp = parseFloat(
          xpElement?.textContent?.replace(" XP", "") || "0"
        );
        const time = parseFloat(
          timeElement?.textContent?.replace("s", "") || "0"
        );

        const xpPerMin = ((xp / time) * 60).toFixed(2);

        const newDiv = document.createElement("div");
        newDiv.className = "xp-per-min";
        newDiv.textContent = `${xpPerMin} XP/min`;
        row.insertBefore(newDiv, levelElement);
      }
    });
  }
}

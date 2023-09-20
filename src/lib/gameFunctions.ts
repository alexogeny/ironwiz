export function addToTable() {
  // The code for adding XP/min column will go here
  const rows = document.querySelectorAll(".row");

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

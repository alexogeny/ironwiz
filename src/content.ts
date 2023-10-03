import { skillMap } from "./lib/gameInfo/i18n/skills";
import { networkRequestScript } from "./lib/utilities/network";

let ironWizLoaded = document.getElementById("ironwiz-loaded");
let ironWizDataDiv = document.getElementById("ironwiz-response");
if (!ironWizLoaded && !ironWizDataDiv) {
  const ironWizDataDiv = document.createElement("div");
  ironWizDataDiv.id = "ironwiz-response";
  ironWizDataDiv.style.display = "none";
  document.body.appendChild(ironWizDataDiv);
  ironWizDataDivCreated = true;

  const welcomeBack = localStorage.getItem("welcomeBack");
  if (welcomeBack) {
    // parse wb as json
    const welcomeBackJSON = JSON.parse(welcomeBack);
    if (welcomeBackJSON.skillName) {
      ironWizDataDiv.setAttribute(
        "data-current-skill",
        welcomeBackJSON.skillName
      );
    }
  }

  const injectCSS = (cssString) => {
    const head = document.head || document.getElementsByTagName("head")[0];
    const style = document.createElement("style");

    style.appendChild(document.createTextNode(cssString));

    head.appendChild(style);
  };

  // Inject the CSS for the fade-out effect
  injectCSS(`
    .fade-out {
      animation: fadeOut 0.6s ease-out forwards;
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `);

  injectCSS(`
    actions-component > .card > .row, action-drops-component > .drops .item {
      padding: 8px 12px !important;
    }
    actions-component > .card > .row > .image, action-drops-component > .drops > .item > .image {
      width: 24px !important;
      min-width: 24px !important;
      height: 24px !important;
    }
    body > app-component > nav-component > .nav > .scroll > button[type="button"] {
      height: 40px !important;
      padding: 4px 24px !important;
    }
    body > app-component > nav-component > .nav > .scroll > button[type="button"] > .image,
    body > app-component > nav-component > .nav > .scroll > button[type="button"] > img {
      height: 24px !important;
      width: 24px !important;
      min-width: 24px !important;
    }
  `);
}
ironWizDataDiv = document.getElementById("ironwiz-response");
const injectScript = () => {
  let script = document.createElement("script");
  script.textContent = networkRequestScript;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
};
injectScript();

const isAppLoadingVisible = () => {
  const appLoadingElement = document.querySelector(".app-loading");
  return (
    appLoadingElement && getComputedStyle(appLoadingElement).height !== "0px"
  );
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach(function (mutation) {
    if (mutation.type === "attributes") {
      if (mutation.target instanceof Element) {
        const responseBody = mutation.target.getAttribute("data-response");
        const responseUrl = mutation.target.getAttribute("data-response-url");
        const currentSkill = mutation.target.getAttribute("data-current-skill");
        if (currentSkill && responseUrl?.includes("stopAction")) {
          chrome.runtime.sendMessage({
            action: "notifyActionComplete",
            currentSkill,
          });
          // delete the current skill attribute
          document
            .getElementById("ironwiz-response")!
            .removeAttribute("data-current-skill");

          const response = JSON.parse(responseBody!);
          const {
            charcoal,
            compost,
            coins,
            inventory,
            skills,
            equipment,
            home,
          } = response;
          // put these into localStorage under their own keys. charcoal, compost, and coins are just ints
          localStorage.setItem("charcoal", charcoal);
          localStorage.setItem("compost", compost);
          localStorage.setItem("coins", coins);
          localStorage.setItem("inventory", JSON.stringify(inventory));
          localStorage.setItem("skills", JSON.stringify(skills));
          localStorage.setItem("equipment", JSON.stringify(equipment));
          localStorage.setItem("home", JSON.stringify(home));
          const favicon = document.querySelector(
            "link[rel*='icon']"
          ) as HTMLLinkElement;
          favicon.href = `/favicon/favicon-32x32.png`;
        } else if (!currentSkill && responseUrl?.includes("startAction")) {
          const detail = JSON.parse(responseBody!);
          const skillId = detail.skillId;
          const skillName = skillMap[skillId];
          document
            .getElementById("ironwiz-response")!
            .setAttribute("data-current-skill", skillName);

          // set the favicon to the matching asset png in the assets folder
          const favicon = document.querySelector(
            "link[rel*='icon']"
          ) as HTMLLinkElement;
          favicon.href = `/assets/misc/${skillName.toLowerCase()}.png`;
        }
      }
    }
  });
});

observer.observe(ironWizDataDiv!, {
  attributes: true,
});

const appLoaderObserver = new MutationObserver((mutations) => {
  mutations.forEach(function (mutation) {
    // if the computed style changes
    if (mutation.type === "attributes") {
      if (!isAppLoadingVisible() && !ironWizLoaded) {
        const notificationComponent = document
          .querySelector("notification-component")
          ?.querySelector(".notifications");
        if (notificationComponent) {
          // create new notification from raw text
          const notificationContainer = document.createElement("div");
          // style the custom notification
          notificationContainer.id = "custome-notif";
          // Set the styles
          notificationContainer.style.padding = "8px 16px 8px 12px";
          notificationContainer.style.borderRadius = "4px";
          notificationContainer.style.webkitBackdropFilter = "blur(8px)";
          notificationContainer.style.backdropFilter = "blur(8px)";
          notificationContainer.style.background = "rgba(255, 255, 255, .15)";
          notificationContainer.style.boxShadow = "0 8px 16px -4px #00000080";
          notificationContainer.style.display = "flex";
          notificationContainer.style.alignItems = "center";
          notificationContainer.style.minHeight = "48px";
          notificationContainer.style.marginTop = "12px";

          const notificationImageContainer = document.createElement("div");
          notificationImageContainer.style.display = "flex";
          notificationImageContainer.style.alignItems = "center";
          notificationImageContainer.style.justifyContent = "center";
          notificationImageContainer.style.width = "32px";
          notificationImageContainer.style.height = "32px";

          const notificationImage = document.createElement("img");
          notificationImage.src = "/assets/items/material-coal.png";
          notificationImage.style.filter =
            "drop-shadow(0px 8px 4px rgba(0,0,0,.1))";

          const notificationText = document.createElement("div");
          notificationText.style.marginLeft = "8px";
          notificationText.textContent = "IronWiz Extension Loaded";

          notificationContainer.appendChild(notificationImageContainer);
          notificationImageContainer.appendChild(notificationImage);
          notificationContainer.appendChild(notificationText);

          notificationComponent.appendChild(notificationContainer);

          setTimeout(() => {
            const notif = document.getElementById("custome-notif")!;
            notif.classList.add("fade-out");
            notif.addEventListener("animationend", () => {
              notif.remove();
            });
          }, 5000);
        }

        // create ironwiz-loaded div
        ironWizLoaded = document.createElement("div");
        ironWizLoaded.id = "ironwiz-loaded";
        ironWizLoaded.style.display = "none";
        document.body.appendChild(ironWizLoaded);

        appLoaderObserver.disconnect();
      }
    }
  });
});
appLoaderObserver.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
});

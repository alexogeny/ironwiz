import { networkRequestScript } from "./lib/utilities/network";

let ironWizLoaded = document.getElementById("ironwiz-loaded");
let ironWizDataDiv = document.getElementById("ironwiz-response");
if (!ironWizDataDiv) {
  const ironWizDataDiv = document.createElement("div");
  ironWizDataDiv.id = "ironwiz-response";
  ironWizDataDiv.style.display = "none";
  document.body.appendChild(ironWizDataDiv);
  ironWizDataDivCreated = true;

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
        console.log(`responseBody: ${responseBody}`);
        console.log(`responseUrl: ${responseUrl}`);
        chrome.runtime.sendMessage(
          {
            action: "networkRequest",
            responseBody,
            responseUrl,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
            } else {
              console.log("Message sent successfully", response);
            }
          }
        );
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

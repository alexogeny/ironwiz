// This should run as soon as the content script is injected
console.log(
  "Loaded ironwiz extension for ironwoodRPG. Please report any bugs to https://github.com/alexogeny/ironwiz/issues/new"
);

// Initialize a MutationObserver to watch for changes to the DOM
const observer = new MutationObserver((mutations) => {
  // Log the current URL path whenever the DOM changes
  console.debug("DOM changed, current URL:", window.location.pathname);
});

// Start observing changes to the body and its descendants
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

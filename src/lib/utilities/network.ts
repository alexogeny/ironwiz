const networkRequestScript =
  "(" +
  function () {
    console.log("Injected script for network request");
    const monkeyPatch = function () {
      const request = window.XMLHttpRequest.prototype.open;
      window.XMLHttpRequest.prototype.open = function () {
        console.log("XMLHttpRequest.prototype.open");
        this.addEventListener("load", function () {
          const responseBody = this.responseText;
          const responseUrl = this.responseURL;
          document
            .getElementById("ironwiz-response")
            ?.setAttribute("data-response", responseBody);
          document
            .getElementById("ironwiz-response")
            ?.setAttribute("data-response-url", responseUrl);
        });
        return request.apply(this, arguments);
      };
    };
    monkeyPatch();
  } +
  ")();";

export { networkRequestScript };

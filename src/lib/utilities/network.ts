const onNetworkRequest = (url: string, callback: (arg0: {}) => void) => {
  const request = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function () {
    this.addEventListener("load", function () {
      let response = {};
      try {
        response = JSON.parse(this.responseText);
      } catch (e) {
        return;
      }
      if (response && this.responseURL.indexOf(url) !== -1) {
        callback(response);
      }
    });
    request.apply(this, arguments);
  };
};

export { onNetworkRequest };

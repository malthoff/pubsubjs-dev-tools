chrome.devtools.panels.create("PubSubJS", null, "index.html", (panel) => {
  var appIsMounted = false;

  panel.onShown.addListener(() => {
    if (appIsMounted) {
      chrome.runtime.sendMessage("onShow");
    }
  });

  panel.onHidden.addListener(() => {
    if (appIsMounted) {
      chrome.runtime.sendMessage("onHidden");
    }
  });

  // listen for onMounted event from vue app.
  chrome.runtime.onMessage.addListener((message) => {
    if (message === "onMounted") {
      appIsMounted = true;
    }
  });

  chrome.webNavigation.onCompleted.addListener(function (details) {
    if (details.frameId === 0 && details.frameType === "outermost_frame") {
      chrome.runtime.sendMessage("pageReloaded");
    }
  });
});

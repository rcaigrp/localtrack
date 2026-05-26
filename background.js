chrome.storage.onChanged.addListener((changes) => {
  if (changes.timer) {
    console.log("Timer state updated:", changes.timer.newValue);
  }
});
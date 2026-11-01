document.getElementById("analyze").addEventListener("click", async () => {
  const status = document.getElementById("status");
  const button = document.getElementById("analyze");
  button.disabled = true;
  status.textContent = "HM đang kết nối với ô chat…";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("NO_ACTIVE_TAB");
    const result = await chrome.tabs.sendMessage(tab.id, { type: "HM_ANALYZE_NOW" });
    if (result?.ok) {
      status.textContent = result.empty
        ? "HM đã mở trên trang. Popup sẽ tự đóng để bạn nhập nội dung vào ChatGPT."
        : "HM đã mở trên trang. Popup sẽ tự đóng để bạn tiếp tục làm việc.";
      // Browser action popups keep keyboard/mouse focus and block interaction
      // with the page underneath. Close it after the in-page panel is opened.
      setTimeout(() => window.close(), 250);
    } else {
      status.textContent = "Chưa nhận diện được ô chat. Hãy click vào vùng nhập tin nhắn trên trang AI rồi thử lại. Mã chẩn đoán: " + JSON.stringify(result?.diagnostics || {});
      button.disabled = false;
    }
  } catch (error) {
    status.textContent = "Không kết nối được HM trong tab này. Tại edge://extensions, nhấn Reload cho HM rồi quay lại ChatGPT nhấn Ctrl+R.";
    button.disabled = false;
  }
});

document.getElementById("analyze").addEventListener("click", async () => {
  const status = document.getElementById("status");
  try {
    const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
    if (!tab || !tab.id) throw new Error("Không tìm thấy tab đang mở.");
    const result = await chrome.tabs.sendMessage(tab.id, {type:"HM_ANALYZE_NOW"});
    status.textContent = result && result.ok ? "Đã mở bảng phân tích trên trang ChatGPT." : "Không tìm thấy ô nhập liệu. Hãy mở ChatGPT và nhập prompt.";
  } catch (e) {
    status.textContent = "Hãy tải lại tab ChatGPT sau khi cài tiện ích, rồi thử lại.";
  }
});
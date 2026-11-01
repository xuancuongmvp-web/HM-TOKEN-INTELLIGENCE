document.getElementById("analyze").addEventListener("click", async () => {
  const status = document.getElementById("status");
  const button = document.getElementById("analyze");
  button.disabled = true;
  status.textContent = "HM đang tìm ô nhập của trang AI…";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("Không tìm thấy tab đang mở.");
    const result = await chrome.tabs.sendMessage(tab.id, { type: "HM_ANALYZE_NOW" });
    if (result?.ok) {
      status.textContent = "Đã mở HM ngay cạnh ô chat. Hãy xem bảng HM trên trang.";
    } else {
      status.textContent = "Chưa định vị được ô chat. Hãy bấm vào vùng nhập tin nhắn trên trang AI, đóng popup này rồi mở lại HM. Nếu vẫn lỗi, nhấn Ctrl+R để tải lại trang.";
    }
  } catch (error) {
    status.textContent = "Tiện ích chưa được nạp vào tab này. Hãy tải lại trang AI (Ctrl+R), sau đó thử lại. Có thể cần bấm Reload ở trang quản lý tiện ích.";
  } finally {
    button.disabled = false;
  }
});

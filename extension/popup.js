document.getElementById("analyze").addEventListener("click", async () => {
  const status = document.getElementById("status");
  const button = document.getElementById("analyze");
  button.disabled = true;
  status.textContent = "HM đang lấy nội dung từ ô chat…";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("NO_ACTIVE_TAB");
    const result = await chrome.tabs.sendMessage(tab.id, { type: "HM_ANALYZE_NOW" });
    if (result?.ok) {
      status.textContent = "Đã mở bảng HM ngay trên trang AI. Hãy xem cạnh ô chat.";
    } else if (result?.reason === "EMPTY_COMPOSER") {
      status.textContent = "HM đã tìm thấy vùng nhập nhưng chưa đọc được chữ. Hãy click vào ô chat, gõ một ký tự rồi thử lại. Mã chẩn đoán: " + JSON.stringify(result.diagnostics || {});
    } else {
      status.textContent = "HM chưa nhận diện được trình soạn thảo. Hãy click vào ô chat, gõ một ký tự, đóng popup rồi thử lại. Mã chẩn đoán: " + JSON.stringify(result?.diagnostics || {});
    }
  } catch (error) {
    status.textContent = "Không kết nối được HM trong tab này. Tại edge://extensions, kiểm tra phiên bản 0.3.2, nhấn Reload cho HM rồi quay lại ChatGPT nhấn Ctrl+R.";
  } finally {
    button.disabled = false;
  }
});

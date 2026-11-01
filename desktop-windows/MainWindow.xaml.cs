using System.Collections.ObjectModel;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Interop;
using System.Windows.Media;

namespace HM.Desktop;

public partial class MainWindow : Window
{
    private const int HotkeyId = 0x484D;
    private const uint ModControl = 0x0002;
    private const uint ModShift = 0x0004;
    private const uint VkH = 0x48;
    private const int WmHotkey = 0x0312;
    private HwndSource? _source;
    private bool _hotkeyRegistered;
    private PromptAnalysis? _lastAnalysis;
    private readonly ObservableCollection<Finding> _findings = new();

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool UnregisterHotKey(IntPtr hWnd, int id);

    public MainWindow()
    {
        InitializeComponent();
        FindingsList.ItemsSource = _findings;
        SourceInitialized += OnSourceInitialized;
        Closed += OnClosed;
    }

    private void OnSourceInitialized(object? sender, EventArgs e)
    {
        var hwnd = new WindowInteropHelper(this).Handle;
        _source = HwndSource.FromHwnd(hwnd);
        _source?.AddHook(WindowProc);
        _hotkeyRegistered = RegisterHotKey(hwnd, HotkeyId, ModControl | ModShift, VkH);
        StatusText.Text = _hotkeyRegistered
            ? "Phím tắt toàn hệ thống: Ctrl+Shift+H"
            : "Không đăng ký được Ctrl+Shift+H (đang được ứng dụng khác sử dụng). Dùng nút ĐỌC CLIPBOARD.";
    }

    private void OnClosed(object? sender, EventArgs e)
    {
        var hwnd = new WindowInteropHelper(this).Handle;
        if (_hotkeyRegistered) UnregisterHotKey(hwnd, HotkeyId);
        _source?.RemoveHook(WindowProc);
        _source?.Dispose();
    }

    private IntPtr WindowProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
    {
        if (msg == WmHotkey && wParam.ToInt32() == HotkeyId)
        {
            handled = true;
            LoadClipboardPrompt();
        }
        return IntPtr.Zero;
    }

    private void LoadClipboardPrompt()
    {
        try
        {
            var text = Clipboard.ContainsText() ? Clipboard.GetText() : "";
            if (string.IsNullOrWhiteSpace(text))
            {
                ShowAndActivate();
                StatusText.Text = "Clipboard trống. Trong ô chat, nhấn Ctrl+A rồi Ctrl+C, sau đó Ctrl+Shift+H.";
                return;
            }

            PromptInput.Text = text;
            AnalyzePrompt();
            ShowAndActivate();
            StatusText.Text = "Đã nạp prompt từ clipboard. Kiểm tra kết quả và bổ sung thông tin nếu cần.";
        }
        catch (Exception ex)
        {
            ShowAndActivate();
            StatusText.Text = "Không đọc được clipboard: " + ex.Message;
        }
    }

    private void ShowAndActivate()
    {
        if (!IsVisible) Show();
        if (WindowState == WindowState.Minimized) WindowState = WindowState.Normal;
        Activate();
        Topmost = true;
        Topmost = false;
        Focus();
    }

    private void ReadClipboard_Click(object sender, RoutedEventArgs e) => LoadClipboardPrompt();

    private void PromptInput_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e)
    {
        if (PromptStats is not null)
            PromptStats.Text = $"{PromptInput.Text.Length:N0} ký tự";
    }

    private void Analyze_Click(object sender, RoutedEventArgs e) => AnalyzePrompt();

    private void AnalyzePrompt()
    {
        var text = PromptInput.Text;
        _lastAnalysis = Analyzer.Analyze(text);
        TokenCount.Text = _lastAnalysis.ApproxTokens.ToString("N0");
        WordCount.Text = _lastAnalysis.Words.ToString("N0");
        StructureCount.Text = $"{_lastAnalysis.PresentDimensions}/6";
        IssueCount.Text = _lastAnalysis.Findings.Count(x => x.Level != "good").ToString();
        DimensionsGrid.Children.Clear();

        foreach (var dimension in _lastAnalysis.Dimensions)
        {
            var card = new System.Windows.Controls.Border
            {
                Background = new SolidColorBrush(Color.FromRgb(11, 20, 37)),
                BorderBrush = new SolidColorBrush(Color.FromRgb(48, 65, 88)),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(9),
                Margin = new Thickness(0, 3, 6, 3)
            };
            var stack = new System.Windows.Controls.StackPanel();
            stack.Children.Add(new System.Windows.Controls.TextBlock
            {
                Text = (dimension.Found ? "✓ " : "○ ") + dimension.Label,
                Foreground = new SolidColorBrush(dimension.Found ? Color.FromRgb(140, 224, 182) : Color.FromRgb(226, 191, 123)),
                FontSize = 10,
                FontWeight = FontWeights.SemiBold
            });
            stack.Children.Add(new System.Windows.Controls.TextBlock
            {
                Text = dimension.Found ? "Đã nhận diện" : "Chưa thấy dấu hiệu",
                Foreground = new SolidColorBrush(Color.FromRgb(152, 164, 184)),
                FontSize = 9,
                Margin = new Thickness(0, 3, 0, 0)
            });
            card.Child = stack;
            DimensionsGrid.Children.Add(card);
        }

        _findings.Clear();
        foreach (var finding in _lastAnalysis.Findings) _findings.Add(finding);
        AnalysisNote.Text = "Token chỉ là ước tính (ký tự/3,2), chưa phải số đếm tiktoken chính xác. 6 thành phần là tín hiệu cấu trúc, không phải điểm chất lượng tuyệt đối. HM chỉ phân tích văn bản được sao chép.";
    }

    private void BuildProposal_Click(object sender, RoutedEventArgs e)
    {
        if (_lastAnalysis is null || string.IsNullOrWhiteSpace(PromptInput.Text))
        {
            StatusText.Text = "Hãy nhập hoặc nạp prompt rồi phân tích trước.";
            return;
        }

        var original = PromptInput.Text.Trim();
        var supplements = new List<string>();
        AddSupplement(supplements, "Phạm vi cụ thể", ScopeInput.Text);
        AddSupplement(supplements, "Bối cảnh / dữ liệu đầu vào", ContextInput.Text);
        AddSupplement(supplements, "Đầu ra mong muốn", OutputInput.Text);
        AddSupplement(supplements, "Ràng buộc cần tuân thủ", ConstraintsInput.Text);
        AddSupplement(supplements, "Đối tượng sử dụng kết quả", AudienceInput.Text);
        AddSupplement(supplements, "Tiêu chí hoàn thành", CriteriaInput.Text);

        var openItems = new List<string>();
        if (Has(original, Analyzer.BroadTerms) && string.IsNullOrWhiteSpace(ScopeInput.Text))
            openItems.Add("Phạm vi cụ thể: [Nêu các hạng mục/đối tượng cần tập trung.]");
        if (_lastAnalysis.IsAnalytical && !_lastAnalysis.Dimensions.Any(x => x.Key == "context" && x.Found) && string.IsNullOrWhiteSpace(ContextInput.Text))
            openItems.Add("Bối cảnh/dữ liệu: [Nêu nguồn dữ liệu, tài liệu hoặc hiện trạng.]");
        if ((_lastAnalysis.IsAnalytical || _lastAnalysis.IsCreation) && !_lastAnalysis.Dimensions.Any(x => x.Key == "output" && x.Found) && string.IsNullOrWhiteSpace(OutputInput.Text))
            openItems.Add("Đầu ra: [Chọn định dạng và cấu trúc mong muốn.]");
        if ((_lastAnalysis.IsAnalytical || _lastAnalysis.IsCreation) && !_lastAnalysis.Dimensions.Any(x => x.Key == "constraints" && x.Found) && string.IsNullOrWhiteSpace(ConstraintsInput.Text) && _lastAnalysis.Words > 20)
            openItems.Add("Ràng buộc: [Nêu giới hạn, dữ kiện phải giữ nguyên và điều cần tránh.]");
        if ((_lastAnalysis.IsAnalytical || _lastAnalysis.IsCreation) && !_lastAnalysis.Dimensions.Any(x => x.Key == "audience" && x.Found) && string.IsNullOrWhiteSpace(AudienceInput.Text))
            openItems.Add("Đối tượng sử dụng: [Nêu người đọc/người dùng kết quả nếu cần.]");
        if ((_lastAnalysis.IsAnalytical || _lastAnalysis.IsCreation) && !_lastAnalysis.Dimensions.Any(x => x.Key == "criteria" && x.Found) && string.IsNullOrWhiteSpace(CriteriaInput.Text))
            openItems.Add("Tiêu chí hoàn thành: [Nêu điều kiện để xác nhận kết quả đạt yêu cầu.]");

        var sb = new StringBuilder();
        sb.AppendLine("YÊU CẦU GỐC");
        sb.AppendLine(original);
        if (supplements.Count > 0 || openItems.Count > 0)
        {
            sb.AppendLine();
            sb.AppendLine("THÔNG TIN LÀM RÕ");
            foreach (var item in supplements) sb.AppendLine("- " + item);
            foreach (var item in openItems) sb.AppendLine("- " + item);
        }
        sb.AppendLine();
        sb.Append("Nguyên tắc thực hiện: giữ nguyên ý định và dữ kiện trong yêu cầu gốc; không tự suy đoán thông tin chưa được cung cấp. Nếu phạm vi hoặc dữ liệu chưa đủ rõ, hãy hỏi lại trước khi kết luận.");
        ProposalOutput.Text = sb.ToString();
        CopyStatus.Text = "Đã tạo bản đề xuất. Nội dung chưa được chèn hoặc gửi đi.";
    }

    private static void AddSupplement(List<string> items, string label, string value)
    {
        if (!string.IsNullOrWhiteSpace(value)) items.Add($"{label}: {value.Trim()}");
    }

    private void CopyProposal_Click(object sender, RoutedEventArgs e)
    {
        if (string.IsNullOrWhiteSpace(ProposalOutput.Text))
        {
            CopyStatus.Text = "Chưa có bản đề xuất để sao chép.";
            return;
        }
        try
        {
            Clipboard.SetText(ProposalOutput.Text);
            CopyStatus.Text = "Đã sao chép. Quay lại ô chat AI, nhấn Ctrl+A rồi Ctrl+V để thay nội dung.";
        }
        catch (Exception ex)
        {
            CopyStatus.Text = "Không thể sao chép: " + ex.Message;
        }
    }

    private void Clear_Click(object sender, RoutedEventArgs e)
    {
        PromptInput.Clear();
        ProposalOutput.Clear();
        ClearFields_Click(sender, e);
        _lastAnalysis = null;
        _findings.Clear();
        TokenCount.Text = WordCount.Text = StructureCount.Text = IssueCount.Text = "—";
        DimensionsGrid.Children.Clear();
        AnalysisNote.Text = "Điểm cấu trúc chỉ là tín hiệu heuristic, không phải xác suất AI trả lời đúng.";
    }

    private void ClearFields_Click(object sender, RoutedEventArgs e)
    {
        ScopeInput.Clear(); ContextInput.Clear(); OutputInput.Clear();
        ConstraintsInput.Clear(); AudienceInput.Clear(); CriteriaInput.Clear();
        CopyStatus.Text = "Đã xóa các trường bổ sung.";
    }

    private static bool Has(string text, IEnumerable<string> phrases) => Analyzer.Has(text, phrases);
}

public sealed record Finding(string Level, string Title, string Detail, string Suggestion);
public sealed record DimensionResult(string Key, string Label, bool Found);
public sealed record PromptAnalysis(int Words, int ApproxTokens, int PresentDimensions,
    bool IsAnalytical, bool IsCreation,
    IReadOnlyList<DimensionResult> Dimensions, IReadOnlyList<Finding> Findings);

public static class Analyzer
{
    public static readonly string[] BroadTerms = ["tất cả mọi thứ","mọi thứ","càng nhiều càng tốt","thật chi tiết","everything","as much as possible","全部内容","所有内容","越详细越好"];
    private static readonly string[] TaskTerms = ["hãy","giúp tôi","viết","soạn","tạo","lập","thiết kế","dịch","kiểm tra","sửa","xây dựng","giải thích","tìm","so sánh","tổng hợp","liệt kê","đánh giá","phân tích","triển khai","tính toán","vẽ","lập trình","chuyển đổi","tóm tắt","đề xuất","hướng dẫn","write","draft","create","build","design","translate","check","fix","review","explain","find","compare","summarize","list","evaluate","analyze","calculate","implement","draw","convert","recommend","guide","help me","please","请","帮我","写","创建","设计","翻译","检查","修改","建立","解释","查找","比较","总结","列出","评估","分析","计算","实现","绘制","推荐"];
    private static readonly string[] AnalyticalTerms = ["phân tích","đánh giá","so sánh","rà soát","kiểm tra","lập kế hoạch","đề xuất","analyze","evaluate","compare","review","audit","plan","recommend","分析","评估","比较","审查","计划"];
    private static readonly string[] CreationTerms = ["viết","soạn","tạo","lập","thiết kế","xây dựng","write","draft","create","design","build","写","创建","设计","建立"];
    private static readonly string[] OutputTerms = ["đầu ra","định dạng","bảng","danh sách","từng bước","file","tệp","tiêu chí","kết luận","báo cáo","email","thư","mẫu","biểu mẫu","kịch bản","mã nguồn","code","excel","word","pdf","json","csv","slide","powerpoint","checklist","format","table","list","steps","deliverable","criteria","report","template","script","source code","spreadsheet","document","presentation","表格","清单","步骤","格式","结论","输出","报告","邮件","模板","代码","文档"];
    private static readonly string[] ContextTerms = ["bối cảnh","hiện trạng","dữ liệu","thông tin nền","tài liệu đính kèm","dựa trên","theo tài liệu","tôi gửi","tôi cung cấp","dưới đây","sau đây","đối tượng là","hiện tại","context","background","based on","according to","attached","provided","the following","source material","current situation","given data","背景","根据","附件","以下内容","目前情况","提供的资料"];
    private static readonly string[] ConstraintTerms = ["không được","không thay đổi","không tự ý","giữ nguyên","chỉ sử dụng","chỉ được","tối đa","ít nhất","giới hạn","bắt buộc","tránh","đừng","phải giữ","do not","don't","must not","never","preserve","keep unchanged","only use","at most","at least","limit","avoid","must","不得","不要","必须","保持不变","仅使用","最多","至少","限制"];
    private static readonly string[] AudienceTerms = ["dành cho","người đọc","khách hàng","nhân viên","ban giám đốc","for the","audience","reader","customer","employee","executive","for beginners","面向","读者","客户","员工","管理层"];
    private static readonly string[] CriteriaTerms = ["tiêu chí đánh giá","tiêu chí hoàn thành","điều kiện nghiệm thu","đáp ứng yêu cầu","thành công khi","kiểm chứng","xác minh","đảm bảo rằng","success criteria","acceptance criteria","definition of done","verify that","validate","success means","must satisfy","验收标准","成功标准","验证","确保满足"];
    private static readonly string[] ReferenceTerms = ["nó","cái này","ở đó","như trên","như đã nói","this","that","it","above","as mentioned","这个","那个","如上所述"];

    public static bool Has(string text, IEnumerable<string> terms)
    {
        var lower = text.ToLowerInvariant();
        foreach (var term in terms)
        {
            if (term.Any(c => c >= '\u3400' && c <= '\u9fff'))
            {
                if (lower.Contains(term.ToLowerInvariant(), StringComparison.Ordinal)) return true;
                continue;
            }
            var pattern = $@"(?<![\p{{L}}\p{{N}}_]){Regex.Escape(term)}(?![\p{{L}}\p{{N}}_])";
            if (Regex.IsMatch(lower, pattern, RegexOptions.IgnoreCase | RegexOptions.CultureInvariant)) return true;
        }
        return false;
    }

    public static PromptAnalysis Analyze(string text)
    {
        var trimmed = text.Trim();
        var words = trimmed.Length == 0 ? 0 : Regex.Split(trimmed, @"\s+").Length;
        var dims = new[]
        {
            new DimensionResult("task","Nhiệm vụ chính",Has(text,TaskTerms)),
            new DimensionResult("context","Bối cảnh / dữ liệu",Has(text,ContextTerms)),
            new DimensionResult("output","Sản phẩm đầu ra",Has(text,OutputTerms)),
            new DimensionResult("constraints","Ràng buộc",Has(text,ConstraintTerms)),
            new DimensionResult("audience","Đối tượng sử dụng",Has(text,AudienceTerms)),
            new DimensionResult("criteria","Tiêu chí hoàn thành",Has(text,CriteriaTerms))
        };
        var analytical = Has(text,AnalyticalTerms);
        var creation = Has(text,CreationTerms);
        var findings = new List<Finding>();
        void Add(string level, string title, string detail, string suggestion) => findings.Add(new(level,title,detail,suggestion));

        if (trimmed.Length == 0) Add("warn","Chưa có prompt","Clipboard hoặc ô nhập đang trống.","Nhập prompt hoặc sao chép nội dung từ ô chat.");
        else
        {
            if (!dims[0].Found && words > 5) Add("warn","Chưa rõ hành động chính","HM chưa nhận diện động từ mô tả việc AI cần thực hiện.","Bắt đầu bằng hành động như phân tích, so sánh, viết, dịch hoặc kiểm tra.");
            if (Has(text,BroadTerms)) Add("warn","Phạm vi quá rộng","Các cụm từ bao quát chưa giới hạn đối tượng hoặc hạng mục.","Nêu rõ phạm vi và các phần cần tập trung.");
            if ((analytical || (creation && words > 25)) && !dims[1].Found) Add("warn","Thiếu bối cảnh hoặc dữ liệu","Yêu cầu có vẻ cần dữ liệu/hiện trạng nhưng chưa chỉ rõ nguồn đầu vào.","Bổ sung tài liệu, dữ kiện, đối tượng hoặc tình trạng hiện tại.");
            if ((analytical || creation) && !dims[2].Found) Add("warn","Chưa rõ sản phẩm đầu ra","Chưa thấy định dạng hoặc loại kết quả mong muốn.","Nêu rõ muốn nhận bảng, báo cáo, checklist, email, bản dịch hay tệp.");
            if ((analytical || creation) && !dims[3].Found && words > 20) Add("info","Chưa thấy ràng buộc","Chưa thấy giới hạn, điều phải giữ hoặc điều cần tránh.","Nêu các quy tắc quan trọng và giới hạn thực hiện.");
            if (words < 120 && Has(text,ReferenceTerms)) Add("warn","Tham chiếu có thể mơ hồ","Các từ như “nó”, “cái này”, “this” có thể không xác định rõ đối tượng.","Thay bằng tên đối tượng hoặc tài liệu cụ thể.");
            var repeated = text.Split('\n').Select(x => x.Trim()).Where(x => x.Length > 0)
                .GroupBy(x => x,StringComparer.OrdinalIgnoreCase).Any(g => g.Count() > 1);
            if (repeated) Add("warn","Có dòng lặp chính xác","Phát hiện ít nhất một dòng lặp; có thể là nhấn mạnh có chủ ý.","Kiểm tra trước khi xóa. HM không tự bỏ nội dung.");
            if (Regex.IsMatch(text,@"(ngắn gọn|brief|concise)",RegexOptions.IgnoreCase) &&
                Regex.IsMatch(text,@"(thật chi tiết|càng chi tiết càng tốt|comprehensive|as detailed as possible)",RegexOptions.IgnoreCase))
                Add("info","Có thể mâu thuẫn về độ chi tiết","Prompt đồng thời yêu cầu ngắn gọn và rất chi tiết.","Chọn ưu tiên hoặc đặt giới hạn độ dài cụ thể.");
            if (words > 250) Add("info","Prompt tương đối dài","Độ dài không đồng nghĩa lãng phí, nhưng nên rà phần lặp hoặc ngoài mục tiêu.","Chỉ rút gọn phần thực sự không ảnh hưởng kết quả.");
            if (findings.Count == 0) Add("good","Chưa phát hiện cảnh báo nổi bật","Các quy tắc hiện tại chưa nhận diện được lỗi phổ biến.","Vẫn cần kiểm tra bối cảnh và tiêu chí hoàn thành theo yêu cầu thực tế.");
        }

        var present = dims.Count(x => x.Found);
        return new PromptAnalysis(words,(int)Math.Ceiling(text.Length/3.2),present,analytical,creation,dims,findings);
    }
}

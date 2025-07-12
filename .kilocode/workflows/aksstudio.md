# aksstudio.md

Chào bạn Kilo Code, mình biết bạn từ lâu khi trước đây Claude Code đã giúp mình rất nhiều trong dự án code DMG về dự án xây dựng code dashboard cho Studio Label Digital Music Distribution. Với giao diện, các trang đã được xây dựng chỉnh chu, chỉ là hiện tại có quá nhiều trang code js, tsx, ts..... dư thừa. Các code trong folder typer, scripts dùng để kiểm tra bị lỗi hoặc bị trống mà tôi không hiểu tại sao.

Các trang code bị ngó lơ đến mức không được áp dụng theo đúng mong muốn.
- Về database tôi có sử dụng PostgrestSQL tuy nhiên có quá nhiều code giả định, code thử ngay từ đầu tôi chẳng cần. Chính xác là không cần thiết và cũng không thể chạy nếu tôi thực sự không biết các sử dụng và không thể biết nếu tình trạng code chỉ là demo. Vậy nên với readme aksstudio này, sẽ giúp bạn hiểu rõ tình trạng code và những bước cần làm tiếp theo:
+ Vì dự án có sự tiếp sức nhưng do Claude Code trước đây sử dụng chỉ có hạn nên tôi có cộng tác thêm các code AI khác nên tôi sẽ liệt kê để bạn hiểu tình hình: GitHub Copilot: Claude là chủ yếu, GPT 4.0 và 4.1 nhưng hai tên này luôn tự ý tạo thêm và phá hỏng dự án. Gemini là cuối cùng nhưng Gemini cũng hỗ trợ khá nhiều về debug code và kiến thức.
Cuối cùng nhờ bạn Kilo Code by Claude. Nhờ bạn fix sửa chữa lại những tổn hại đến dự án và giúp nó thoát khỏi tình trạng bị hỏng, demo, và thiếu tính năng
## Quy định
1. Không sử dụng tiếng anh, sử dụng tiếng việt cho cả quá trình giao tiếp lẫn ghi chú trên code. Tiêu đề hoặc nội dung liên quan đến thẻ h1, h2,h3, a, p... đều là tiếng việt. Trong quá trình code do lỗi có tiếng anh nên nó là tiếng anh những vẫn giải thích và trả lời bằng ngôn ngữ gốc tiếng việt,
2. Trong dự án code các tệp MD khác hay đọc chúng rồi tiếp tục, đừng ngần ngại hỏi tôi bất cứ điều gì cần thiết.
3. Trong dự án có PostgregSQL nên bản có thể kết nối và kiểm tra vì tôi đã đầy về VSCode.
4. Tài khoản quản trị đã có, và có 3 tài khoản người dùng thật, Ko phải tài khoản giả nên hãy dùng trực tiếp chúng. Dữ liệu mẫu cũng có sẳn.


## Các bước cần làm

1. Sửa lại kết nối database và login, logout, register... sẳn tiện fix lại background video vì bản setting của backgroud chưa hoạt động tốt. 
2. Sửa lại các phần data vẫn chưa hiển thị tốt, trống hoặc không có cũng như chưa hiển thị đúng ở 2 phân quyền là label_manager và artist.

* Tạm thời trước mắt là như vậy đã rồi tiếp tục, sau đây tôi sẽ cùng cấp các liên kết.
Thư mục: F:\Dev\DMG\.kilocode
F:\Dev\DMG  // Gốc
F:\Dev\DMG\scripts \\Chứa các code node dùng gọi terminal để kiểm tra kết nối hoặc fix nhưng có thể chưa hoạt động tốt hoặc lỗi
F:\Dev\DMG\.env.local \\Chưa các biến môi trường quan trọng | Cấm xóa
Trong quá trình làm nhớ cho tớ biết thêm thông tin để có thể học hỏi vì tớ chỉ là Design UX UI nên kém lắm. Hihi

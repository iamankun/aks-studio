-- Tệp migration này thêm các chính sách Bảo mật cấp hàng (RLS) ban đầu vào các bảng
-- đã bật RLS nhưng chưa có chính sách nào được định nghĩa.

-- Lưu ý: Đây là các chính sách mẫu. Bạn PHẢI xem xét và điều chỉnh chúng để phù hợp
-- với các yêu cầu bảo mật cụ thể của ứng dụng.

----------------------------------------------------------------
-- Chính sách cho bảng: public.users
-- Cho phép người dùng xem và cập nhật thông tin hồ sơ của chính họ.
-- Giả định: Bảng 'users' có một cột 'id' kiểu UUID tương ứng với
-- ID của người dùng đã xác thực từ auth.users.
----------------------------------------------------------------

CREATE POLICY "Cho phép cá nhân đọc thông tin của mình" ON public.artist
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Cho phép cá nhân cập nhật thông tin của mình" ON public.artist
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

----------------------------------------------------------------
-- Chính sách cho bảng: public.submissions
-- Cho phép người dùng quản lý các bài nộp (submission) của chính họ.
-- Giả định: Bảng 'submissions' có một cột 'user_id' tham chiếu đến
-- người dùng đã tạo bài nộp.
----------------------------------------------------------------

CREATE POLICY "Cho phép toàn quyền trên bài nộp của mình" ON public.submissions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

----------------------------------------------------------------
-- Chính sách cho các bảng khác
-- Các chính sách dưới đây cấp quyền chỉ đọc cho bất kỳ người dùng đã xác thực nào.
-- Đây là một điểm khởi đầu phổ biến, nhưng bạn nên xác minh xem dữ liệu có nên
-- công khai hay không, hoặc liệu bạn có cần các chính sách ghi (write) chặt chẽ hơn không.
----------------------------------------------------------------

CREATE POLICY "Cho phép người dùng đã xác thực đọc" ON public.tracks FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Cho phép người dùng đã xác thực đọc" ON public.track_artists FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Cho phép người dùng đã xác thực đọc" ON public.submission_artists FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Cho phép người dùng đã xác thực đọc" ON public.submission_platforms FOR SELECT USING (auth.role() = 'authenticated');

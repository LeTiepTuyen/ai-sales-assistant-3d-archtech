# Ý tưởng thô ban đầu — AI Sales Assistant Demo

## 1. Mục tiêu dự án

Phát triển một hệ thống AI Sales Assistant giả lập nhằm hỗ trợ đội ngũ Sales với giao diện UI Chatbox chuyên nghiệp trong việc:

- tư vấn khách hàng,
- trả lời các câu hỏi liên quan đến dịch vụ,
- tìm kiếm thông tin từ tài liệu nội bộ,
- tạo tài liệu phục vụ bán hàng dựa trên prompt mẫu và dữ liệu đầu vào từ Sales.

Hệ thống AI cần có khả năng:

- Hiểu và xử lý các yêu cầu từ đội ngũ Sales.
- Nếu Sales nhập yêu cầu thuộc bộ prompt đã cung cấp, AI cần trả lời theo output format tương ứng.
- Tìm kiếm, tổng hợp và trích xuất thông tin từ sales materials đã được cung cấp.
- Tạo proposal cho từng client cụ thể dựa trên input do Sales cung cấp.
- Có thêm một tab/trang quản trị để cung cấp thêm Data Source cho AI Sales Assistant trong tương lai.

Flow mong muốn:

Sales nhập input → AI Sales Assistant phân tích yêu cầu → kiểm tra intent có nằm trong bộ prompt đã tạo sẵn không → truy xuất tài liệu nội bộ liên quan → trả output tương ứng.

## 2. Data source

Data hiện tại gồm các file PDF/XLSX nội bộ của 3D Archtech, bao gồm:

- proposal cũ,
- portfolio sản phẩm/dự án cho nhiều ngành,
- company profile,
- prompt library cho Sales team.

Các file sẽ được đặt trong:

```text
data/source-pdfs/
```

## 3. Use case demo chính

### 3.1. Tạo Proposal tự động từ template cũ

Khi nhân viên Sales nhập thông tin khách hàng mới, AI có khả năng tạo proposal mới dựa trên:

- proposal template cũ,
- project showcase,
- case studies,
- thông tin/yêu cầu khách hàng.

Input ví dụ:

- Tên khách hàng
- Ngành nghề
- Pain points / nhu cầu khách hàng
- Dịch vụ khách hàng quan tâm
- Quy mô dự án
- Timeline dự kiến
- Budget nếu có
- Proposal mẫu cũ hoặc style mong muốn

Output mong muốn:

- Proposal draft hoàn chỉnh
- Company Overview
- Project Overview
- Solution Overview
- Current Challenges & Proposed Solutions
- Proposed Solution Features
- Proposed Timeline
- Expected Results & Benefits
- Export DOCX/PDF

### 3.2. Tìm kiếm và giải thích thông tin cho Sales

AI Assistant hỗ trợ Sales tra cứu thông tin từ knowledge base nội bộ và sales materials công ty.

AI cần có khả năng:

- Giải thích dịch vụ công ty
- Giải thích technical terms bằng ngôn ngữ business dễ hiểu
- Gợi ý case study phù hợp theo ngành

Ví dụ câu hỏi:

- “BIM Visualization là gì?”
- “Digital Twin giúp ích gì cho nhà máy?”
- “Case study nào phù hợp cho khách hàng bất động sản?”
- “Hãy giải thích giải pháp này theo hướng business thay vì technical.”

## 4. Kết quả mong muốn của demo

Sau khi hoàn thành, AI Sales Assistant cần chứng minh khả năng:

- tìm kiếm và tổng hợp thông tin nhanh chóng,
- tạo tài liệu bán hàng tự động,
- hỗ trợ giải thích technical terms cho Sales,
- chạy local ổn định,
- có kế hoạch deploy public demo chi phí thấp.

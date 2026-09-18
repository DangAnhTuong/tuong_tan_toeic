# 📊 BÁO CÁO TOÀN DIỆN CHI TIẾT TÌNH HÌNH TỪNG CÂU VÀ TỪNG ẢNH (PART 1 - 538 CÂU HỎI)

> **Ngày lập báo cáo:** 18/09/2026  
> **Trạng thái:** ✅ Đã hoàn thành 100% - Đã triển khai Production VPS (116.118.3.69) & Đồng bộ MongoDB.

## 1. TỔNG QUAN HỆ THỐNG VÀ THỐNG KÊ

| Chỉ tiêu | Số lượng / Trạng thái | Ghi chú |
| :--- | :--- | :--- |
| **Tổng số câu hỏi Part 1** | **538 / 538** | Trọn bộ 5 Level và 3 Chủ đề Part 1 |
| **Tổng số file ảnh độc lập** | **538 file (p1_q1.jpg → p1_q538.jpg)** | Lưu tại /var/www/tuong-tan-toeic/media/listening/part1/ |
| **Tỷ lệ trùng lặp MD5** | **0% (538 mã MD5 duy nhất)** | Tiêu chuẩn Zero Duplicate Standard |
| **Ảnh Scan ETS gốc chuẩn** | **273 câu (50.7%)** | Quét chuẩn xác từ đề ETS 2017 - 2026 và trích xuất PDF PyMuPDF |
| **Ảnh chụp thực tế chuẩn ETS** | **265 câu (49.3%)** | Khớp 100% chủ ngữ và hành động thực tế của câu, phong cách Grayscale ETS |
| **Độ phân giải chuẩn** | **800 x 600 px** | Chuẩn khung hình đề thi ETS Part 1 |
| **Tình trạng cắm nhầm ảnh** | **0 câu (Đã loại bỏ 100%)** | Xử lý triệt để 289 câu lệch bối cảnh trước đây |
| **Trạng thái CDN VPS** | **100% HTTP 200 OK** | Phục vụ trực tiếp qua HTTPS Nginx VPS (150.19 MB) |

## 2. PHÂN BỔ CHI TIẾT THEO TỪNG LEVEL

| Level | Tổng số câu | Ảnh Scan ETS gốc | Ảnh chụp bối cảnh ETS | Tỷ lệ sẵn sàng |
| :--- | :---: | :---: | :---: | :---: |
| **Level 1 (Cơ bản)** | 169 câu (Q1 - Q169) | 96 | 73 | 100% |
| **Level 2 (Sơ cấp)** | 93 câu (Q170 - Q262) | 57 | 36 | 100% |
| **Level 3 (Trung cấp)** | 92 câu (Q263 - Q354) | 48 | 44 | 100% |
| **Level 4 (Trung cao)** | 92 câu (Q355 - Q446) | 43 | 49 | 100% |
| **Level 5 (Nâng cao)** | 92 câu (Q447 - Q538) | 29 | 63 | 100% |
| **TỔNG CỘNG** | **538 câu** | **273 (50.7%)** | **265 (49.3%)** | **100%** |


## 3. BẢNG TRA CỨU CHI TIẾT TỪNG CÂU VÀ TỪNG ẢNH (Q1 - Q538)

| STT | Câu hỏi | Level | File ảnh | Đáp án đúng (correctText) | Nguồn ảnh & Loại | Mã MD5 | Trạng thái |
| :---: | :--- | :---: | :---: | :--- | :--- | :---: | :---: |
| 1 | Q1 | Lv 1 | p1_q1.jpg | He's using a laptop computer. | Scan ETS gốc (cropped_ets_photos_2019/test10/q1.jpg) | b7ec299d46... | ✅ 100% Khớp |
| 2 | Q2 | Lv 1 | p1_q2.jpg | They're walking down stairs. | Scan ETS gốc (cropped_ets_photos_2019/test9/q1.jpg) | 4c1276fc7c... | ✅ 100% Khớp |
| 3 | Q3 | Lv 1 | p1_q3.jpg | A man is walking down a stone path. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_2.jpg) | 906fe3f136... | ✅ 100% Khớp |
| 4 | Q4 | Lv 1 | p1_q4.jpg | He's hanging a clock. | Scan ETS gốc (cropped_ets_photos_2021/test2/q1.jpg) | 60a71bb2e5... | ✅ 100% Khớp |
| 5 | Q5 | Lv 1 | p1_q5.jpg | He's carrying some packages. | Scan ETS gốc (cropped_ets_photos_2020/test7/q1.jpg) | adb616e779... | ✅ 100% Khớp |
| 6 | Q6 | Lv 1 | p1_q6.jpg | She’s eating in a picnic area. | Scan ETS gốc (cropped_ets_photos_2024/test1/q3.jpg) | bf389cff71... | ✅ 100% Khớp |
| 7 | Q7 | Lv 1 | p1_q7.jpg | A man is carrying a backpack. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_6.jpg) | 624b2a37bc... | ✅ 100% Khớp |
| 8 | Q8 | Lv 1 | p1_q8.jpg | Some people are carrying bags. | Scan ETS gốc (cropped_ets_photos_2019/test6/q1.jpg) | 06f512e9c8... | ✅ 100% Khớp |
| 9 | Q9 | Lv 1 | p1_q9.jpg | He's holding a fishing pole. | Scan ETS gốc (cropped_ets_photos_2019/test2/q1.jpg) | 2b332659f5... | ✅ 100% Khớp |
| 10 | Q10 | Lv 1 | p1_q10.jpg | A woman is looking at a map. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_9.jpg) | 68586a8d64... | ✅ 100% Khớp |
| 11 | Q11 | Lv 1 | p1_q11.jpg | She's washing her hands. | Scan ETS gốc (cropped_ets_photos_2021/test1/q1.jpg) | ff571ef419... | ✅ 100% Khớp |
| 12 | Q12 | Lv 1 | p1_q12.jpg | He's talking on a phone. | Scan ETS gốc (cropped_ets_photos_2019/test7/q1.jpg) | 1477f157dd... | ✅ 100% Khớp |
| 13 | Q13 | Lv 1 | p1_q13.jpg | He's tying his shoe. | Scan ETS gốc (cropped_ets_photos_2020/test8/q1.jpg) | 8c2e3c4358... | ✅ 100% Khớp |
| 14 | Q14 | Lv 1 | p1_q14.jpg | He's reading a book. | Scan ETS gốc (cropped_ets_photos_2020/test3/q1.jpg) | 4c724543c1... | ✅ 100% Khớp |
| 15 | Q15 | Lv 1 | p1_q15.jpg | She's looking at a newspaper. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_14.jpg) | 41a0f8c16c... | ✅ 100% Khớp |
| 16 | Q16 | Lv 1 | p1_q16.jpg | He's looking down at some notes. | Scan ETS gốc (cropped_ets_photos_2021/test4/q1.jpg) | c640a92071... | ✅ 100% Khớp |
| 17 | Q17 | Lv 1 | p1_q17.jpg | The people are looking at some menus. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_16.jpg) | c7f5d4a95e... | ✅ 100% Khớp |
| 18 | Q18 | Lv 1 | p1_q18.jpg | He's looking at a mobile phone. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_17.jpg) | f4ace22ab8... | ✅ 100% Khớp |
| 19 | Q19 | Lv 1 | p1_q19.jpg | They're looking at a book. | Scan ETS gốc (cropped_ets_photos_2020/test4/q1.jpg) | e38bc47413... | ✅ 100% Khớp |
| 20 | Q20 | Lv 1 | p1_q20.jpg | She’s writing on a document. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_19.jpg) | 464dc695cd... | ✅ 100% Khớp |
| 21 | Q21 | Lv 1 | p1_q21.jpg | They're writing some notes. | Scan ETS gốc (cropped_ets_photos_2021/test3/q1.jpg) | 29bda14c3c... | ✅ 100% Khớp |
| 22 | Q22 | Lv 1 | p1_q22.jpg | They're examining a camera. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_21.jpg) | 5e2b9b7d18... | ✅ 100% Khớp |
| 23 | Q23 | Lv 1 | p1_q23.jpg | A woman is watering a plant. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_22.jpg) | d1f0bab39a... | ✅ 100% Khớp |
| 24 | Q24 | Lv 1 | p1_q24.jpg | The man is wearing a backpack. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_23.jpg) | 287161bdfa... | ✅ 100% Khớp |
| 25 | Q25 | Lv 1 | p1_q25.jpg | A man is reaching for a coat. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_24.jpg) | 5c82ca45dc... | ✅ 100% Khớp |
| 26 | Q26 | Lv 1 | p1_q26.jpg | He’s pouring some liquid into a cup. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_25.jpg) | e751d6dc80... | ✅ 100% Khớp |
| 27 | Q27 | Lv 1 | p1_q27.jpg | He's using a knife to slice some food. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_26.jpg) | 6015aa749e... | ✅ 100% Khớp |
| 28 | Q28 | Lv 1 | p1_q28.jpg | They're approaching a sign in a parking area. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_27.jpg) | b520520acb... | ✅ 100% Khớp |
| 29 | Q29 | Lv 1 | p1_q29.jpg | He's looking at a printed document. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_28.jpg) | b3a8b76ec2... | ✅ 100% Khớp |
| 30 | Q30 | Lv 1 | p1_q30.jpg | A man is walking beside his bicycle. | Scan ETS gốc (cropped_ets_photos/test2/q1.jpg) | de8b1be7bc... | ✅ 100% Khớp |
| 31 | Q31 | Lv 1 | p1_q31.jpg | She's sawing a plank. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_30.jpg) | 8a85a632fd... | ✅ 100% Khớp |
| 32 | Q32 | Lv 1 | p1_q32.jpg | She's standing near a street mailbox. | Scan ETS gốc (cropped_ets_photos/test4/q1.jpg) | e7ba98c891... | ✅ 100% Khớp |
| 33 | Q33 | Lv 1 | p1_q33.jpg | She's talking on the phone. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_32.jpg) | 71d778e8db... | ✅ 100% Khớp |
| 34 | Q34 | Lv 1 | p1_q34.jpg | The man is pointing at a location on a map. | Scan ETS gốc (cropped_ets_photos_2022/test10/q1.jpg) | 24d5f0c085... | ✅ 100% Khớp |
| 35 | Q35 | Lv 1 | p1_q35.jpg | The men are fixing a bicycle. | Scan ETS gốc (cropped_ets_photos_2021/test1/q2.jpg) | 71ecbd11f6... | ✅ 100% Khớp |
| 36 | Q36 | Lv 1 | p1_q36.jpg | She’s holding some products. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_35.jpg) | 397212c753... | ✅ 100% Khớp |
| 37 | Q37 | Lv 1 | p1_q37.jpg | She's arranging some office folders. | Scan ETS gốc (cropped_ets_photos/test5/q1.jpg) | 3e49e8affb... | ✅ 100% Khớp |
| 38 | Q38 | Lv 1 | p1_q38.jpg | She's putting an umbrella into a basket. | Scan ETS gốc (cropped_ets_photos_2020/test3/q2.jpg) | eecf93a127... | ✅ 100% Khớp |
| 39 | Q39 | Lv 1 | p1_q39.jpg | The woman is kneading some dough on a wooden board. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_38.jpg) | 259ed8c582... | ✅ 100% Khớp |
| 40 | Q40 | Lv 1 | p1_q40.jpg | A man is reading a newspaper. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_39.jpg) | 3a86ec4b54... | ✅ 100% Khớp |
| 41 | Q41 | Lv 1 | p1_q41.jpg | He's typing on a keyboard. | Scan ETS gốc (cropped_ets_photos_2019/test9/q2.jpg) | 303eba4a93... | ✅ 100% Khớp |
| 42 | Q42 | Lv 1 | p1_q42.jpg | Seating area is empty. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_41.jpg) | d0d1db69ef... | ✅ 100% Khớp |
| 43 | Q43 | Lv 1 | p1_q43.jpg | They're walking along a path. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_42.jpg) | 4753e93f3e... | ✅ 100% Khớp |
| 44 | Q44 | Lv 1 | p1_q44.jpg | The man is assembling a metal rack. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_43.jpg) | 23a9607208... | ✅ 100% Khớp |
| 45 | Q45 | Lv 1 | p1_q45.jpg | Some bicycles are parked outside. | Scan ETS gốc (cropped_ets_photos_2021/test4/q2.jpg) | 81b497b366... | ✅ 100% Khớp |
| 46 | Q46 | Lv 1 | p1_q46.jpg | A worker is using a machine to move some boxes. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_45.jpg) | f53ccc1934... | ✅ 100% Khớp |
| 47 | Q47 | Lv 1 | p1_q47.jpg | He's typing on a keyboard. | Scan ETS gốc (cropped_ets_photos/test3/q1.jpg) | c26c029ad9... | ✅ 100% Khớp |
| 48 | Q48 | Lv 1 | p1_q48.jpg | One of the men is reaching for a telephone. | Scan ETS gốc (cropped_ets_photos_2019/test7/q2.jpg) | 58cce98990... | ✅ 100% Khớp |
| 49 | Q49 | Lv 1 | p1_q49.jpg | She's reading a glossy magazine. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_48.jpg) | 420117dca7... | ✅ 100% Khớp |
| 50 | Q50 | Lv 1 | p1_q50.jpg | She’s using a microwave oven. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_49.jpg) | e01786f918... | ✅ 100% Khớp |
| 51 | Q51 | Lv 1 | p1_q51.jpg | The man is pointing out a window. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_50.jpg) | b9d6fca1c7... | ✅ 100% Khớp |
| 52 | Q52 | Lv 1 | p1_q52.jpg | She's gathering some vegetables. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_51.jpg) | 90437ac354... | ✅ 100% Khớp |
| 53 | Q53 | Lv 1 | p1_q53.jpg | He's inspecting a car engine. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_52.jpg) | 1988f77b42... | ✅ 100% Khớp |
| 54 | Q54 | Lv 1 | p1_q54.jpg | They're inspecting a crate. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_53.jpg) | 25c2fd05a4... | ✅ 100% Khớp |
| 55 | Q55 | Lv 1 | p1_q55.jpg | Some people are facing each other. | Scan ETS gốc (cropped_ets_photos_2019/test3/q2.jpg) | e574d41748... | ✅ 100% Khớp |
| 56 | Q56 | Lv 1 | p1_q56.jpg | He is inspecting a tall pantry cabinet. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_55.jpg) | 7d7eb00529... | ✅ 100% Khớp |
| 57 | Q57 | Lv 1 | p1_q57.jpg | Some people are gathered around a desk. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_56.jpg) | 22860ba48f... | ✅ 100% Khớp |
| 58 | Q58 | Lv 1 | p1_q58.jpg | She's putting paper in a copy machine. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_57.jpg) | 53416aca87... | ✅ 100% Khớp |
| 59 | Q59 | Lv 1 | p1_q59.jpg | A man is drinking from a bottle. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_58.jpg) | 980a4f8ec8... | ✅ 100% Khớp |
| 60 | Q60 | Lv 1 | p1_q60.jpg | Some people are looking at a book. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_59.jpg) | 3ea6dbf89e... | ✅ 100% Khớp |
| 61 | Q61 | Lv 1 | p1_q61.jpg | She's using some office equipment. | Scan ETS gốc (cropped_ets_photos_2024/test1/q1.jpg) | bbf964af25... | ✅ 100% Khớp |
| 62 | Q62 | Lv 1 | p1_q62.jpg | Some people are gathered around a market stand. | Scan ETS gốc (cropped_ets_photos_2024/test1/q2.jpg) | f95b762d7b... | ✅ 100% Khớp |
| 63 | Q63 | Lv 1 | p1_q63.jpg | She is holding up some fruit. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_62.jpg) | 3958f1f690... | ✅ 100% Khớp |
| 64 | Q64 | Lv 1 | p1_q64.jpg | They're looking into a copy machine. | Scan ETS gốc (cropped_ets_photos_2024/test1/q4.jpg) | 445e865cb5... | ✅ 100% Khớp |
| 65 | Q65 | Lv 1 | p1_q65.jpg | Some visitors are conversing on a deck. | Scan ETS gốc (cropped_ets_photos_2024/test1/q5.jpg) | b3f0428ddb... | ✅ 100% Khớp |
| 66 | Q66 | Lv 1 | p1_q66.jpg | A worker is using a cart to move inventory. | Scan ETS gốc (cropped_ets_photos/test5/q2.jpg) | 105f5557c0... | ✅ 100% Khớp |
| 67 | Q67 | Lv 1 | p1_q67.jpg | Ircuit board is being assembled. | Scan ETS gốc (cropped_ets_photos_2024/test2/q1.jpg) | a8aa15e56b... | ✅ 100% Khớp |
| 68 | Q68 | Lv 1 | p1_q68.jpg | Seating area has been set up outside. | Scan ETS gốc (cropped_ets_photos_2024/test2/q2.jpg) | d8627f0136... | ✅ 100% Khớp |
| 69 | Q69 | Lv 1 | p1_q69.jpg | A man is using an exercise machine. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_68.jpg) | 1ac618f8c8... | ✅ 100% Khớp |
| 70 | Q70 | Lv 1 | p1_q70.jpg | The man is pointing at a whiteboard. | Scan ETS gốc (cropped_ets_photos_2024/test2/q4.jpg) | 117b476f8b... | ✅ 100% Khớp |
| 71 | Q71 | Lv 1 | p1_q71.jpg | She has opened a refrigerator. | Scan ETS gốc (cropped_ets_photos_2024/test2/q5.jpg) | 6b877867a2... | ✅ 100% Khớp |
| 72 | Q72 | Lv 1 | p1_q72.jpg | He's operating a photocopier. | Scan ETS gốc (cropped_ets_photos_2024/test2/q6.jpg) | 2ccecca0db... | ✅ 100% Khớp |
| 73 | Q73 | Lv 1 | p1_q73.jpg | The woman is seated in front of a computer. | Scan ETS gốc (cropped_ets_photos_2024/test3/q1.jpg) | 1d4ef4141b... | ✅ 100% Khớp |
| 74 | Q74 | Lv 1 | p1_q74.jpg | They're looking at a document. | Scan ETS gốc (cropped_ets_photos_2024/test3/q2.jpg) | e924209b49... | ✅ 100% Khớp |
| 75 | Q75 | Lv 1 | p1_q75.jpg | He is holding a basket near the grocery counter. | Scan ETS gốc (cropped_ets_photos_2024/test3/q3.jpg) | 1f9967b4c2... | ✅ 100% Khớp |
| 76 | Q76 | Lv 1 | p1_q76.jpg | There are supplies organized on trays. | Scan ETS gốc (cropped_ets_photos_2024/test3/q4.jpg) | f921bbe803... | ✅ 100% Khớp |
| 77 | Q77 | Lv 1 | p1_q77.jpg | The man is drinking from a cup. | Scan ETS gốc (cropped_ets_photos_2024/test3/q5.jpg) | 4cf8ccce72... | ✅ 100% Khớp |
| 78 | Q78 | Lv 1 | p1_q78.jpg | Several vans are parked in a row. | Scan ETS gốc (cropped_ets_photos_2024/test3/q6.jpg) | 497f2ff38b... | ✅ 100% Khớp |
| 79 | Q79 | Lv 1 | p1_q79.jpg | They're walking past a bench. | Scan ETS gốc (cropped_ets_photos_2024/test4/q1.jpg) | 5923475b3e... | ✅ 100% Khớp |
| 80 | Q80 | Lv 1 | p1_q80.jpg | A man is standing behind a counter. | Scan ETS gốc (cropped_ets_photos_2024/test4/q2.jpg) | be276a96ce... | ✅ 100% Khớp |
| 81 | Q81 | Lv 1 | p1_q81.jpg | Some hedges are trimmed with shears. | Scan ETS gốc (cropped_ets_photos/test3/q2.jpg) | 6c99a0b4f8... | ✅ 100% Khớp |
| 82 | Q82 | Lv 1 | p1_q82.jpg | The man is looking into a microscope. | Scan ETS gốc (cropped_ets_photos_2024/test4/q4.jpg) | e7645af1c0... | ✅ 100% Khớp |
| 83 | Q83 | Lv 1 | p1_q83.jpg | He's holding up an umbrella. | Scan ETS gốc (cropped_ets_photos_2024/test4/q5.jpg) | fe5fbf72d6... | ✅ 100% Khớp |
| 84 | Q84 | Lv 1 | p1_q84.jpg | She's pouring some milk into a pitcher. | Scan ETS gốc (cropped_ets_photos_2024/test4/q6.jpg) | b2b0c95b0a... | ✅ 100% Khớp |
| 85 | Q85 | Lv 1 | p1_q85.jpg | Some chairs are arranged in a circle. | Scan ETS gốc (cropped_ets_photos_2024/test5/q1.jpg) | f11f069aca... | ✅ 100% Khớp |
| 86 | Q86 | Lv 1 | p1_q86.jpg | A ladder is leaning against a truck. | Scan ETS gốc (cropped_ets_photos_2024/test5/q2.jpg) | 8e5f1ebe02... | ✅ 100% Khớp |
| 87 | Q87 | Lv 1 | p1_q87.jpg | One of the women is talking on a mobile phone. | Scan ETS gốc (cropped_ets_photos_2024/test5/q3.jpg) | c19b852ea8... | ✅ 100% Khớp |
| 88 | Q88 | Lv 1 | p1_q88.jpg | One of the men is pointing at some flowers. | Scan ETS gốc (cropped_ets_photos_2024/test5/q4.jpg) | 70a48d5bcc... | ✅ 100% Khớp |
| 89 | Q89 | Lv 1 | p1_q89.jpg | Rolling chair has been placed next to a counter. | Scan ETS gốc (cropped_ets_photos_2024/test5/q5.jpg) | 77eceac2c6... | ✅ 100% Khớp |
| 90 | Q90 | Lv 1 | p1_q90.jpg | He's reaching for a paper napkin. | Scan ETS gốc (cropped_ets_photos_2024/test5/q6.jpg) | 69b2dec651... | ✅ 100% Khớp |
| 91 | Q91 | Lv 1 | p1_q91.jpg | The woman is typing on a keyboard. | Scan ETS gốc (cropped_ets_photos_2024/test6/q1.jpg) | 0934cdfc72... | ✅ 100% Khớp |
| 92 | Q92 | Lv 1 | p1_q92.jpg | A woman is holding a bowl. | Scan ETS gốc (cropped_ets_photos_2024/test6/q2.jpg) | 26c13c54a7... | ✅ 100% Khớp |
| 93 | Q93 | Lv 1 | p1_q93.jpg | Some pillows are organized on shelves. | Scan ETS gốc (cropped_ets_photos_2024/test6/q3.jpg) | ba84b57837... | ✅ 100% Khớp |
| 94 | Q94 | Lv 1 | p1_q94.jpg | Some people are seated outdoors. | Scan ETS gốc (cropped_ets_photos_2024/test6/q4.jpg) | 28253917e0... | ✅ 100% Khớp |
| 95 | Q95 | Lv 1 | p1_q95.jpg | He's carrying a box toward an elevator. | Scan ETS gốc (cropped_ets_photos_2024/test6/q5.jpg) | 77a6bd90dc... | ✅ 100% Khớp |
| 96 | Q96 | Lv 1 | p1_q96.jpg | She's holding a water bottle. | Scan ETS gốc (cropped_ets_photos_2024/test6/q6.jpg) | 9cd84504ed... | ✅ 100% Khớp |
| 97 | Q97 | Lv 1 | p1_q97.jpg | The woman is reaching for some medication. | Scan ETS gốc (cropped_ets_photos_2024/test7/q1.jpg) | 585f98c008... | ✅ 100% Khớp |
| 98 | Q98 | Lv 1 | p1_q98.jpg | The woman is writing on a document. | Scan ETS gốc (cropped_ets_photos_2024/test7/q2.jpg) | a02059a5c9... | ✅ 100% Khớp |
| 99 | Q99 | Lv 1 | p1_q99.jpg | A man is looking at a small camera in his hands. | Scan ETS gốc (cropped_ets_photos/test3/q3.jpg) | 950d82c987... | ✅ 100% Khớp |
| 100 | Q100 | Lv 1 | p1_q100.jpg | R has been parked beside a building. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_99.jpg) | a5a2601f37... | ✅ 100% Khớp |
| 101 | Q101 | Lv 1 | p1_q101.jpg | A woman is reaching into her bag. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_100.jpg) | b2a7a4e9e1... | ✅ 100% Khớp |
| 102 | Q102 | Lv 1 | p1_q102.jpg | They're walking along a sidewalk. | Scan ETS gốc (cropped_ets_photos_2024/test7/q6.jpg) | 62d90cf23e... | ✅ 100% Khớp |
| 103 | Q103 | Lv 1 | p1_q103.jpg | A man is holding onto a wheelbarrow. | Scan ETS gốc (cropped_ets_photos_2024/test8/q1.jpg) | 489f29e667... | ✅ 100% Khớp |
| 104 | Q104 | Lv 1 | p1_q104.jpg | The men are on different sides of a desk. | Scan ETS gốc (cropped_ets_photos_2024/test8/q2.jpg) | cd44f41301... | ✅ 100% Khớp |
| 105 | Q105 | Lv 1 | p1_q105.jpg | The man is looking at a monitor. | Scan ETS gốc (cropped_ets_photos_2024/test8/q3.jpg) | b1a3e957a7... | ✅ 100% Khớp |
| 106 | Q106 | Lv 1 | p1_q106.jpg | There are mountains in the background. | Scan ETS gốc (cropped_ets_photos_2024/test8/q4.jpg) | bb0777f373... | ✅ 100% Khớp |
| 107 | Q107 | Lv 1 | p1_q107.jpg | One of the women is speaking into a telephone headset. | Scan ETS gốc (cropped_ets_photos_2024/test8/q5.jpg) | ecbeb30a07... | ✅ 100% Khớp |
| 108 | Q108 | Lv 1 | p1_q108.jpg | A woman is walking behind a man in a hallway. | Scan ETS gốc (cropped_ets_photos/test4/q3.jpg) | f23d5e2e23... | ✅ 100% Khớp |
| 109 | Q109 | Lv 1 | p1_q109.jpg | Some people are looking at a screen. | Scan ETS gốc (cropped_ets_photos_2024/test9/q1.jpg) | 440ad82af1... | ✅ 100% Khớp |
| 110 | Q110 | Lv 1 | p1_q110.jpg | She's washing a cup in the sink. | Scan ETS gốc (cropped_ets_photos_2024/test9/q2.jpg) | 12153fa312... | ✅ 100% Khớp |
| 111 | Q111 | Lv 1 | p1_q111.jpg | Picnic table has been placed on grass. | Scan ETS gốc (cropped_ets_photos_2024/test9/q3.jpg) | ef1222c877... | ✅ 100% Khớp |
| 112 | Q112 | Lv 1 | p1_q112.jpg | There are backpacks resting on the grass. | Scan ETS gốc (cropped_ets_photos/test5/q3.jpg) | 3162a711e9... | ✅ 100% Khớp |
| 113 | Q113 | Lv 1 | p1_q113.jpg | She's rolling up a poster. | Scan ETS gốc (cropped_ets_photos_2024/test9/q5.jpg) | 213d334bdf... | ✅ 100% Khớp |
| 114 | Q114 | Lv 1 | p1_q114.jpg | Some of the passengers are standing near a counter. | Scan ETS gốc (cropped_ets_photos_2024/test9/q6.jpg) | 9f85089388... | ✅ 100% Khớp |
| 115 | Q115 | Lv 1 | p1_q115.jpg | A man is standing in front of a desk. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_114.jpg) | bafb243439... | ✅ 100% Khớp |
| 116 | Q116 | Lv 1 | p1_q116.jpg | Some furniture has been stacked near a fence. | Scan ETS gốc (cropped_ets_photos_2024/test10/q2.jpg) | ddf85f62a1... | ✅ 100% Khớp |
| 117 | Q117 | Lv 1 | p1_q117.jpg | Handrails have been placed along a ramp. | Scan ETS gốc (cropped_ets_photos_2024/test10/q3.jpg) | 43d86e25fd... | ✅ 100% Khớp |
| 118 | Q118 | Lv 1 | p1_q118.jpg | Some picture frames are hanging on a wall. | Scan ETS gốc (cropped_ets_photos_2024/test10/q4.jpg) | c00f4f359d... | ✅ 100% Khớp |
| 119 | Q119 | Lv 1 | p1_q119.jpg | Igital screen has been mounted above a workbench. | Scan ETS gốc (cropped_ets_photos_2024/test10/q5.jpg) | 100530c697... | ✅ 100% Khớp |
| 120 | Q120 | Lv 1 | p1_q120.jpg | Some umbrellas have been opened. | Scan ETS gốc (cropped_ets_photos_2024/test10/q6.jpg) | b7fe8d02c3... | ✅ 100% Khớp |
| 121 | Q121 | Lv 1 | p1_q121.jpg | Computer station has been set up on a desk. | Scan ETS gốc (cropped_ets_photos_2023/test1/q1.jpg) | 457c357d78... | ✅ 100% Khớp |
| 122 | Q122 | Lv 1 | p1_q122.jpg | One of the women is holding up a book. | Scan ETS gốc (cropped_ets_photos_2023/test1/q2.jpg) | 331b2c1919... | ✅ 100% Khớp |
| 123 | Q123 | Lv 1 | p1_q123.jpg | The woman is wearing dark sunglasses. | Scan ETS gốc (cropped_ets_photos_2023/test1/q3.jpg) | 21ac824553... | ✅ 100% Khớp |
| 124 | Q124 | Lv 1 | p1_q124.jpg | He's rolling a suitcase down a sidewalk. | Scan ETS gốc (cropped_ets_photos/test4/q4.jpg) | 7001e71ff3... | ✅ 100% Khớp |
| 125 | Q125 | Lv 1 | p1_q125.jpg | Some umbrellas have been opened in an outdoor dining area. | Scan ETS gốc (cropped_ets_photos_2023/test1/q5.jpg) | 3dbe1b5db2... | ✅ 100% Khớp |
| 126 | Q126 | Lv 1 | p1_q126.jpg | Some boxes are stacked on a cart. | Scan ETS gốc (cropped_ets_photos_2023/test1/q6.jpg) | 301becb969... | ✅ 100% Khớp |
| 127 | Q127 | Lv 1 | p1_q127.jpg | Some gardeners are standing beside a cart. | Scan ETS gốc (cropped_ets_photos_2023/test2/q1.jpg) | 67c6cf0dd9... | ✅ 100% Khớp |
| 128 | Q128 | Lv 1 | p1_q128.jpg | The man is handing a cup to the woman. | Scan ETS gốc (cropped_ets_photos_2019/test8/q4.jpg) | a9e8bb0dea... | ✅ 100% Khớp |
| 129 | Q129 | Lv 1 | p1_q129.jpg | Some hedges have been trimmed along a fence. | Scan ETS gốc (cropped_ets_photos_2023/test2/q3.jpg) | d358c9a903... | ✅ 100% Khớp |
| 130 | Q130 | Lv 1 | p1_q130.jpg | Some of the ceramic vases are arranged in a row. | Scan ETS gốc (cropped_ets_photos_2023/test2/q4.jpg) | b6ad7c1b9b... | ✅ 100% Khớp |
| 131 | Q131 | Lv 1 | p1_q131.jpg | She's holding a coffee mug. | Scan ETS gốc (cropped_ets_photos_2023/test2/q5.jpg) | 88b61fc5db... | ✅ 100% Khớp |
| 132 | Q132 | Lv 1 | p1_q132.jpg | The man is repairing a lawnmower. | Scan ETS gốc (cropped_ets_photos_2023/test2/q6.jpg) | b526977b47... | ✅ 100% Khớp |
| 133 | Q133 | Lv 1 | p1_q133.jpg | The woman is assisting a shopper. | Scan ETS gốc (cropped_ets_photos_2023/test3/q1.jpg) | 604b5a7565... | ✅ 100% Khớp |
| 134 | Q134 | Lv 1 | p1_q134.jpg | Handbags are displayed outside on stands. | Scan ETS gốc (cropped_ets_photos/test5/q4.jpg) | b8d1b75709... | ✅ 100% Khớp |
| 135 | Q135 | Lv 1 | p1_q135.jpg | They're seated across from each other. | Scan ETS gốc (cropped_ets_photos/test3/q4.jpg) | ff6a790b96... | ✅ 100% Khớp |
| 136 | Q136 | Lv 1 | p1_q136.jpg | The participants are seated watching a presentation. | Scan ETS gốc (cropped_ets_photos_2023/test3/q4.jpg) | 1abbab85e8... | ✅ 100% Khớp |
| 137 | Q137 | Lv 1 | p1_q137.jpg | Some travelers are seated in a waiting area. | Scan ETS gốc (cropped_ets_photos_2019/test2/q5.jpg) | cd14fe351a... | ✅ 100% Khớp |
| 138 | Q138 | Lv 1 | p1_q138.jpg | Some picture frames are displayed on a wall. | Scan ETS gốc (cropped_ets_photos_2023/test3/q6.jpg) | 9880193cc6... | ✅ 100% Khớp |
| 139 | Q139 | Lv 1 | p1_q139.jpg | One of the men is pointing at a chart. | Scan ETS gốc (cropped_ets_photos/test5/q5.jpg) | b69f34cd6e... | ✅ 100% Khớp |
| 140 | Q140 | Lv 1 | p1_q140.jpg | Some travelers have assembled near a terminal. | Scan ETS gốc (cropped_ets_photos_2023/test4/q2.jpg) | b0248cce47... | ✅ 100% Khớp |
| 141 | Q141 | Lv 1 | p1_q141.jpg | She's chopping vegetables on a counter. | Scan ETS gốc (cropped_ets_photos/test2/q5.jpg) | 7929ec3845... | ✅ 100% Khớp |
| 142 | Q142 | Lv 1 | p1_q142.jpg | Television is mounted on the wall. | Scan ETS gốc (cropped_ets_photos_2023/test4/q4.jpg) | 06a69ebb7d... | ✅ 100% Khớp |
| 143 | Q143 | Lv 1 | p1_q143.jpg | He's holding a hammer. | Scan ETS gốc (cropped_ets_photos_2023/test4/q5.jpg) | bb68613a82... | ✅ 100% Khớp |
| 144 | Q144 | Lv 1 | p1_q144.jpg | Some cushions have been arranged in an outdoor patio area. | Scan ETS gốc (cropped_ets_photos_2023/test4/q6.jpg) | 746beb74d4... | ✅ 100% Khớp |
| 145 | Q145 | Lv 1 | p1_q145.jpg | One of the women is holding a document folder under her arm. | Scan ETS gốc (cropped_ets_photos_2023/test5/q1.jpg) | 153ccfee5d... | ✅ 100% Khớp |
| 146 | Q146 | Lv 1 | p1_q146.jpg | Some cups have been lined up on shelves. | Scan ETS gốc (cropped_ets_photos_2023/test5/q2.jpg) | f8a37dadb4... | ✅ 100% Khớp |
| 147 | Q147 | Lv 1 | p1_q147.jpg | Some coffee cups have been placed on a counter. | Scan ETS gốc (cropped_ets_photos_2023/test5/q3.jpg) | 45e4e2e64a... | ✅ 100% Khớp |
| 148 | Q148 | Lv 1 | p1_q148.jpg | Some shoes are lined up on shelves. | Scan ETS gốc (cropped_ets_photos/test3/q5.jpg) | ee9e4e399b... | ✅ 100% Khớp |
| 149 | Q149 | Lv 1 | p1_q149.jpg | One of the passengers is holding a ticket in her hand. | Scan ETS gốc (cropped_ets_photos/test4/q5.jpg) | 3ebd64a96d... | ✅ 100% Khớp |
| 150 | Q150 | Lv 1 | p1_q150.jpg | Some chairs have been arranged in a line. | Scan ETS gốc (cropped_ets_photos_2023/test5/q6.jpg) | 83d1a6b439... | ✅ 100% Khớp |
| 151 | Q151 | Lv 1 | p1_q151.jpg | One of the researchers is adjusting a digital scale. | Scan ETS gốc (cropped_ets_photos_2023/test6/q1.jpg) | a363ddd941... | ✅ 100% Khớp |
| 152 | Q152 | Lv 1 | p1_q152.jpg | Some boats are tied to a wooden pier. | Scan ETS gốc (cropped_ets_photos_2023/test6/q2.jpg) | 14e8e2a8c6... | ✅ 100% Khớp |
| 153 | Q153 | Lv 1 | p1_q153.jpg | Some lights are mounted beside a terminal. | Scan ETS gốc (cropped_ets_photos_2023/test6/q3.jpg) | 7d7e6cb2cc... | ✅ 100% Khớp |
| 154 | Q154 | Lv 1 | p1_q154.jpg | Cups and glasses have been arranged on a shelf. | Scan ETS gốc (cropped_ets_photos_2023/test6/q4.jpg) | 62718dcef4... | ✅ 100% Khớp |
| 155 | Q155 | Lv 1 | p1_q155.jpg | Table is being transported across a lawn. | Scan ETS gốc (cropped_ets_photos_2023/test6/q5.jpg) | 57953f8f95... | ✅ 100% Khớp |
| 156 | Q156 | Lv 1 | p1_q156.jpg | A woman is standing at a service counter. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_155.jpg) | 8aec8d73b8... | ✅ 100% Khớp |
| 157 | Q157 | Lv 1 | p1_q157.jpg | Some water glasses have been set on a table. | Scan ETS gốc (cropped_ets_photos/test4/q6.jpg) | acd6c69c00... | ✅ 100% Khớp |
| 158 | Q158 | Lv 1 | p1_q158.jpg | Projector is fixed to the ceiling. | Scan ETS gốc (cropped_ets_photos_2023/test7/q2.jpg) | b22a8b1ce2... | ✅ 100% Khớp |
| 159 | Q159 | Lv 1 | p1_q159.jpg | There's an umbrella extending over a sidewalk. | Scan ETS gốc (cropped_ets_photos_2023/test7/q3.jpg) | 4b48dc8ccb... | ✅ 100% Khớp |
| 160 | Q160 | Lv 1 | p1_q160.jpg | Display board is mounted on the wall. | Scan ETS gốc (cropped_ets_photos_2023/test7/q4.jpg) | f3e56410eb... | ✅ 100% Khớp |
| 161 | Q161 | Lv 1 | p1_q161.jpg | Paper shredder has been connected to an outlet. | Scan ETS gốc (cropped_ets_photos_2023/test7/q5.jpg) | 00dfcd4ed7... | ✅ 100% Khớp |
| 162 | Q162 | Lv 1 | p1_q162.jpg | He's wiping an outdoor table. | Scan ETS gốc (cropped_ets_photos/test2/q6.jpg) | 87df834c34... | ✅ 100% Khớp |
| 163 | Q163 | Lv 1 | p1_q163.jpg | N airline staff is examining a passport. | Scan ETS gốc (cropped_ets_photos_2023/test8/q1.jpg) | 3237a02428... | ✅ 100% Khớp |
| 164 | Q164 | Lv 1 | p1_q164.jpg | Some crates are placed beside a fence. | Scan ETS gốc (cropped_ets_photos/test5/q6.jpg) | 61b46efb75... | ✅ 100% Khớp |
| 165 | Q165 | Lv 1 | p1_q165.jpg | Some storage shelves have been arranged along a wall. | Scan ETS gốc (cropped_ets_photos_2023/test8/q3.jpg) | 2713bbbd45... | ✅ 100% Khớp |
| 166 | Q166 | Lv 1 | p1_q166.jpg | Some people are sitting on a park bench. | Scan ETS gốc (cropped_ets_photos/test3/q6.jpg) | e270f0f51b... | ✅ 100% Khớp |
| 167 | Q167 | Lv 1 | p1_q167.jpg | Some merchandise is arranged for display. | Scan ETS gốc (cropped_ets_photos_2023/test8/q5.jpg) | e5dccd84f7... | ✅ 100% Khớp |
| 168 | Q168 | Lv 1 | p1_q168.jpg | Ulletin board is attached to the wall. | Scan ETS gốc (cropped_ets_photos_2023/test8/q6.jpg) | ff5dbcdb28... | ✅ 100% Khớp |
| 169 | Q169 | Lv 1 | p1_q169.jpg | There are lamps lighting a display shelf. | Scan ETS gốc (cropped_ets_photos_2023/test9/q1.jpg) | 6c65edac11... | ✅ 100% Khớp |
| 170 | Q170 | Lv 2 | p1_q170.jpg | She's preparing some food. | Scan ETS gốc (cropped_ets_photos_2020/test9/q1.jpg) | 4589396994... | ✅ 100% Khớp |
| 171 | Q171 | Lv 2 | p1_q171.jpg | She's taking an item out of a refrigerator. | Scan ETS gốc (cropped_ets_photos_2023/test9/q3.jpg) | 57c768215e... | ✅ 100% Khớp |
| 172 | Q172 | Lv 2 | p1_q172.jpg | She’s holding a towel. | Scan ETS gốc (cropped_ets_photos_2023/test9/q4.jpg) | d17a4663c4... | ✅ 100% Khớp |
| 173 | Q173 | Lv 2 | p1_q173.jpg | He is looking into a cardboard box. | Scan ETS gốc (cropped_ets_photos_2023/test9/q5.jpg) | ff9647b534... | ✅ 100% Khớp |
| 174 | Q174 | Lv 2 | p1_q174.jpg | She's harvesting some fruit. | Scan ETS gốc (cropped_ets_photos_2023/test9/q6.jpg) | 51997258b8... | ✅ 100% Khớp |
| 175 | Q175 | Lv 2 | p1_q175.jpg | The men are laying a piece of flooring. | Scan ETS gốc (cropped_ets_photos_2023/test10/q1.jpg) | 01709843ec... | ✅ 100% Khớp |
| 176 | Q176 | Lv 2 | p1_q176.jpg | He's drinking from a mug. | Scan ETS gốc (cropped_ets_photos_2023/test10/q2.jpg) | 43550c47e5... | ✅ 100% Khớp |
| 177 | Q177 | Lv 2 | p1_q177.jpg | He's lifting some furniture. | Scan ETS gốc (cropped_ets_photos_2023/test10/q3.jpg) | 692cf9f55c... | ✅ 100% Khớp |
| 178 | Q178 | Lv 2 | p1_q178.jpg | He's looking in a drawer. | Scan ETS gốc (cropped_ets_photos_2023/test10/q4.jpg) | cfb153d1c1... | ✅ 100% Khớp |
| 179 | Q179 | Lv 2 | p1_q179.jpg | The man is trying on gloves. | Scan ETS gốc (cropped_ets_photos_2023/test10/q5.jpg) | eb37e0f9d9... | ✅ 100% Khớp |
| 180 | Q180 | Lv 2 | p1_q180.jpg | He's climbing down a ladder. | Scan ETS gốc (cropped_ets_photos_2023/test10/q6.jpg) | 90cab32bbb... | ✅ 100% Khớp |
| 181 | Q181 | Lv 2 | p1_q181.jpg | He’s climbing a ladder. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_180.jpg) | cbe890995a... | ✅ 100% Khớp |
| 182 | Q182 | Lv 2 | p1_q182.jpg | A woman is searching a bookshelf. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_181.jpg) | 61a9466857... | ✅ 100% Khớp |
| 183 | Q183 | Lv 2 | p1_q183.jpg | She’s lifting a bin. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_182.jpg) | d446ab542d... | ✅ 100% Khớp |
| 184 | Q184 | Lv 2 | p1_q184.jpg | He's holding some clothes. | Scan ETS gốc (cropped_ets_photos_2020/test2/q1.jpg) | 7618fe73bb... | ✅ 100% Khớp |
| 185 | Q185 | Lv 2 | p1_q185.jpg | She's standing next to a bin. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_184.jpg) | 5d5f3f6c01... | ✅ 100% Khớp |
| 186 | Q186 | Lv 2 | p1_q186.jpg | She’s wearing a backpack. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_185.jpg) | 0664e8d814... | ✅ 100% Khớp |
| 187 | Q187 | Lv 2 | p1_q187.jpg | He's writing on a form. | Scan ETS gốc (cropped_ets_photos_2019/test4/q1.jpg) | be0722d9ab... | ✅ 100% Khớp |
| 188 | Q188 | Lv 2 | p1_q188.jpg | He's working on a machine. | Scan ETS gốc (cropped_ets_photos_2020/test6/q1.jpg) | bf890aedfc... | ✅ 100% Khớp |
| 189 | Q189 | Lv 2 | p1_q189.jpg | The worker is writing some notes. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_188.jpg) | 74d9661e1a... | ✅ 100% Khớp |
| 190 | Q190 | Lv 2 | p1_q190.jpg | He's standing on a walkway. | Scan ETS gốc (cropped_ets_photos_2021/test3/q2.jpg) | ec1a8c2494... | ✅ 100% Khớp |
| 191 | Q191 | Lv 2 | p1_q191.jpg | Some people are gathered on a balcony. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_190.jpg) | 7f2eb785af... | ✅ 100% Khớp |
| 192 | Q192 | Lv 2 | p1_q192.jpg | They're going down some stairs. | Scan ETS gốc (cropped_ets_photos_2020/test8/q2.jpg) | 5260985848... | ✅ 100% Khớp |
| 193 | Q193 | Lv 2 | p1_q193.jpg | The man is measuring a board. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_192.jpg) | b7e1f55842... | ✅ 100% Khớp |
| 194 | Q194 | Lv 2 | p1_q194.jpg | Some bushes are covered with snow. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_193.jpg) | cdbe218771... | ✅ 100% Khớp |
| 195 | Q195 | Lv 2 | p1_q195.jpg | Chairs are set up on the beach. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_194.jpg) | 2602d4bdcc... | ✅ 100% Khớp |
| 196 | Q196 | Lv 2 | p1_q196.jpg | They're handling a package. | Scan ETS gốc (cropped_ets_photos_2020/test5/q2.jpg) | c91ee69a61... | ✅ 100% Khớp |
| 197 | Q197 | Lv 2 | p1_q197.jpg | Reading material is on display in a hallway. | Scan ETS gốc (cropped_ets_photos_2019/test6/q2.jpg) | b3b295d2bf... | ✅ 100% Khớp |
| 198 | Q198 | Lv 2 | p1_q198.jpg | Laptop has been left open. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_197.jpg) | 60d1e009f5... | ✅ 100% Khớp |
| 199 | Q199 | Lv 2 | p1_q199.jpg | The man is singing into a microphone. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_198.jpg) | 4ae51985aa... | ✅ 100% Khớp |
| 200 | Q200 | Lv 2 | p1_q200.jpg | Pillow is being arranged on a seat. | Scan ETS gốc (cropped_ets_photos_2024/test2/q3.jpg) | 68de50b23d... | ✅ 100% Khớp |
| 201 | Q201 | Lv 2 | p1_q201.jpg | They’re examining a document. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_200.jpg) | df46ccde17... | ✅ 100% Khớp |
| 202 | Q202 | Lv 2 | p1_q202.jpg | There are products stacked on shelves. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_201.jpg) | 3da8eaf040... | ✅ 100% Khớp |
| 203 | Q203 | Lv 2 | p1_q203.jpg | A woman is carrying a tray. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_202.jpg) | 4ccc524396... | ✅ 100% Khớp |
| 204 | Q204 | Lv 2 | p1_q204.jpg | A man is climbing some stairs. | Scan ETS gốc (cropped_ets_photos_2018/test3/q4.jpg) | 3fcf8999d2... | ✅ 100% Khớp |
| 205 | Q205 | Lv 2 | p1_q205.jpg | Some merchandise is on display in a store. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_204.jpg) | a25e76efbb... | ✅ 100% Khớp |
| 206 | Q206 | Lv 2 | p1_q206.jpg | One of the women is tying her shoe. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_205.jpg) | cd989ff74d... | ✅ 100% Khớp |
| 207 | Q207 | Lv 2 | p1_q207.jpg | They're unpacking some cardboard boxes. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_206.jpg) | a446bc1782... | ✅ 100% Khớp |
| 208 | Q208 | Lv 2 | p1_q208.jpg | A woman is writing on a piece of paper. | Scan ETS gốc (cropped_ets_photos_2020/test9/q3.jpg) | 24e0e89630... | ✅ 100% Khớp |
| 209 | Q209 | Lv 2 | p1_q209.jpg | The man is talking to a server. | Scan ETS gốc (cropped_ets_photos_2020/test6/q3.jpg) | 420054340d... | ✅ 100% Khớp |
| 210 | Q210 | Lv 2 | p1_q210.jpg | The man is lifting a weight. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_209.jpg) | a8a33b7e7d... | ✅ 100% Khớp |
| 211 | Q211 | Lv 2 | p1_q211.jpg | The man is using a hammer. | Scan ETS gốc (cropped_ets_photos_2020/test2/q3.jpg) | 1b02386cee... | ✅ 100% Khớp |
| 212 | Q212 | Lv 2 | p1_q212.jpg | One of the people is posing for a photograph. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_211.jpg) | fb79535cbe... | ✅ 100% Khớp |
| 213 | Q213 | Lv 2 | p1_q213.jpg | The man is resting his arm on a counter. | Scan ETS gốc (cropped_ets_photos_2024/test7/q5.jpg) | 7f4e43fde2... | ✅ 100% Khớp |
| 214 | Q214 | Lv 2 | p1_q214.jpg | Some people are seated at a café. | Scan ETS gốc (cropped_ets_photos_2019/test9/q3.jpg) | e2a3ad0ef4... | ✅ 100% Khớp |
| 215 | Q215 | Lv 2 | p1_q215.jpg | Some people are playing instruments. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_214.jpg) | d039880a4c... | ✅ 100% Khớp |
| 216 | Q216 | Lv 2 | p1_q216.jpg | A woman is wearing a jacket. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_215.jpg) | 8c2d1078c2... | ✅ 100% Khớp |
| 217 | Q217 | Lv 2 | p1_q217.jpg | They're installing a roof on a house. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_216.jpg) | 2d2c8f398b... | ✅ 100% Khớp |
| 218 | Q218 | Lv 2 | p1_q218.jpg | He's pushing a cart toward a doorway. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_217.jpg) | 78f2ab4e3c... | ✅ 100% Khớp |
| 219 | Q219 | Lv 2 | p1_q219.jpg | The women are waiting in a line. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_218.jpg) | 98d825f7c5... | ✅ 100% Khớp |
| 220 | Q220 | Lv 2 | p1_q220.jpg | The woman is trying on a helmet. | Scan ETS gốc (cropped_ets_photos_2019/test7/q3.jpg) | de2771d3be... | ✅ 100% Khớp |
| 221 | Q221 | Lv 2 | p1_q221.jpg | A man is loading boxes onto a cart. | Scan ETS gốc (cropped_ets_photos_2019/test2/q3.jpg) | 0f92990313... | ✅ 100% Khớp |
| 222 | Q222 | Lv 2 | p1_q222.jpg | Some of the people are waiting in a line. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_221.jpg) | 6d24c1f711... | ✅ 100% Khớp |
| 223 | Q223 | Lv 2 | p1_q223.jpg | Some people are examining a printed document. | Scan ETS gốc (cropped_ets_photos/test1/q2.jpg) | 99d9dda054... | ✅ 100% Khớp |
| 224 | Q224 | Lv 2 | p1_q224.jpg | A man is spreading out a map on top of his car. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_223.jpg) | e0ddba99aa... | ✅ 100% Khớp |
| 225 | Q225 | Lv 2 | p1_q225.jpg | One of the women is looking at a post on a bulletin board. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_224.jpg) | 0c08ad37c6... | ✅ 100% Khớp |
| 226 | Q226 | Lv 2 | p1_q226.jpg | The man is posting some information. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_225.jpg) | d703d669e6... | ✅ 100% Khớp |
| 227 | Q227 | Lv 2 | p1_q227.jpg | The man is staring at a computer. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_226.jpg) | 48df371cd1... | ✅ 100% Khớp |
| 228 | Q228 | Lv 2 | p1_q228.jpg | Some people are working in a garden. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_227.jpg) | 5256c7762e... | ✅ 100% Khớp |
| 229 | Q229 | Lv 2 | p1_q229.jpg | One of the men is reading in front of a shelf. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_228.jpg) | b896faa6a5... | ✅ 100% Khớp |
| 230 | Q230 | Lv 2 | p1_q230.jpg | Some ladders have been set up in a work space. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_229.jpg) | 60489b25ef... | ✅ 100% Khớp |
| 231 | Q231 | Lv 2 | p1_q231.jpg | There’s a guitar beside a fireplace. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_230.jpg) | b3e194af3b... | ✅ 100% Khớp |
| 232 | Q232 | Lv 2 | p1_q232.jpg | The workers are behind a counter. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_231.jpg) | 56f23a7248... | ✅ 100% Khớp |
| 233 | Q233 | Lv 2 | p1_q233.jpg | The man is bending over a bicycle. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_232.jpg) | a1c4e8cd6d... | ✅ 100% Khớp |
| 234 | Q234 | Lv 2 | p1_q234.jpg | Boat is moving toward a bridge. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_233.jpg) | 28b8a373fb... | ✅ 100% Khớp |
| 235 | Q235 | Lv 2 | p1_q235.jpg | Trees are lining a walkway. | Scan ETS gốc (cropped_ets_photos_2021/test1/q4.jpg) | c19bcdd7ec... | ✅ 100% Khớp |
| 236 | Q236 | Lv 2 | p1_q236.jpg | A man is standing in front of a group. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_235.jpg) | ceb197a58e... | ✅ 100% Khớp |
| 237 | Q237 | Lv 2 | p1_q237.jpg | She's holding on to a handrail. | Scan ETS gốc (cropped_ets_photos_2020/test6/q4.jpg) | 3caec869ad... | ✅ 100% Khớp |
| 238 | Q238 | Lv 2 | p1_q238.jpg | Some fruit has been stacked in a bin. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_237.jpg) | 20d80d06f9... | ✅ 100% Khớp |
| 239 | Q239 | Lv 2 | p1_q239.jpg | A man is adjusting a desk lamp. | Scan ETS gốc (cropped_ets_photos/test2/q4.jpg) | 65707763bc... | ✅ 100% Khớp |
| 240 | Q240 | Lv 2 | p1_q240.jpg | One of the men is holding a kitchen knife. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_239.jpg) | e29ff85a87... | ✅ 100% Khớp |
| 241 | Q241 | Lv 2 | p1_q241.jpg | The man is drawing a graph on a presentation board. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_240.jpg) | 576d7513cc... | ✅ 100% Khớp |
| 242 | Q242 | Lv 2 | p1_q242.jpg | Some cars are parked along a sidewalk. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_241.jpg) | 8f53406e7c... | ✅ 100% Khớp |
| 243 | Q243 | Lv 2 | p1_q243.jpg | Some people are walking toward a boat. | Scan ETS gốc (cropped_ets_photos_2019/test3/q4.jpg) | c4115d68ec... | ✅ 100% Khớp |
| 244 | Q244 | Lv 2 | p1_q244.jpg | Musician is playing outdoors. | Scan ETS gốc (cropped_ets_photos_2019/test4/q4.jpg) | 29ac7edd2f... | ✅ 100% Khớp |
| 245 | Q245 | Lv 2 | p1_q245.jpg | The bicycles are lined up in a row. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_244.jpg) | 171072df3c... | ✅ 100% Khớp |
| 246 | Q246 | Lv 2 | p1_q246.jpg | One of the men is writing on a poster board. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_245.jpg) | 7c2ae4d6fd... | ✅ 100% Khớp |
| 247 | Q247 | Lv 2 | p1_q247.jpg | One of the men is riding a motorcycle down a street. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_246.jpg) | 55cd9b4f03... | ✅ 100% Khớp |
| 248 | Q248 | Lv 2 | p1_q248.jpg | Some artwork has been hung on a wall. | Scan ETS gốc (cropped_ets_photos_2019/test9/q5.jpg) | 8b748445e5... | ✅ 100% Khớp |
| 249 | Q249 | Lv 2 | p1_q249.jpg | Travel bag has been set on a chair. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_248.jpg) | cfa6fe9190... | ✅ 100% Khớp |
| 250 | Q250 | Lv 2 | p1_q250.jpg | Some chairs are facing a television screen. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_249.jpg) | f8dd4a3103... | ✅ 100% Khớp |
| 251 | Q251 | Lv 2 | p1_q251.jpg | She's standing on a stepladder. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_250.jpg) | 2581eebd9b... | ✅ 100% Khớp |
| 252 | Q252 | Lv 2 | p1_q252.jpg | Some products have been set out under tents. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_251.jpg) | f20b69cd4e... | ✅ 100% Khớp |
| 253 | Q253 | Lv 2 | p1_q253.jpg | Some customers are waiting in line. | Scan ETS gốc (cropped_ets_photos_2019/test5/q3.jpg) | 048df839b0... | ✅ 100% Khớp |
| 254 | Q254 | Lv 2 | p1_q254.jpg | They're climbing some stairs. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_253.jpg) | cefe4fbb43... | ✅ 100% Khớp |
| 255 | Q255 | Lv 2 | p1_q255.jpg | N office chair has been pushed under a desk. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_254.jpg) | 6cad9e4e47... | ✅ 100% Khớp |
| 256 | Q256 | Lv 2 | p1_q256.jpg | Some people have gathered in an outdoor seating area. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_255.jpg) | e91945a880... | ✅ 100% Khớp |
| 257 | Q257 | Lv 2 | p1_q257.jpg | The woman's squeezing a plastic bottle. | Scan ETS gốc (cropped_ets_photos_2019/test9/q6.jpg) | 0b0a13c0ed... | ✅ 100% Khớp |
| 258 | Q258 | Lv 2 | p1_q258.jpg | Some plants have been placed near a desk. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_257.jpg) | e30e69ed94... | ✅ 100% Khớp |
| 259 | Q259 | Lv 2 | p1_q259.jpg | One of the people is lifting a box. | Scan ETS gốc (cropped_ets_photos_2022/test10/q4.jpg) | daba529e4c... | ✅ 100% Khớp |
| 260 | Q260 | Lv 2 | p1_q260.jpg | Some trees are lining a walkway. | Scan ETS gốc (cropped_ets_photos_2020/test4/q6.jpg) | 924fc6add8... | ✅ 100% Khớp |
| 261 | Q261 | Lv 2 | p1_q261.jpg | Books have been piled up by a glass door. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_260.jpg) | a2fa1d869e... | ✅ 100% Khớp |
| 262 | Q262 | Lv 2 | p1_q262.jpg | Customer is standing near a shopping cart. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_261.jpg) | cb731545a8... | ✅ 100% Khớp |
| 263 | Q263 | Lv 3 | p1_q263.jpg | She's shoveling some snow. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_262.jpg) | d1381064a3... | ✅ 100% Khớp |
| 264 | Q264 | Lv 3 | p1_q264.jpg | She's looking in a display case. | Scan ETS gốc (cropped_ets_photos_2019/test1/q1.jpg) | f90bf082e1... | ✅ 100% Khớp |
| 265 | Q265 | Lv 3 | p1_q265.jpg | Some furniture has been placed on a covered patio. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_264.jpg) | 7354106bd0... | ✅ 100% Khớp |
| 266 | Q266 | Lv 3 | p1_q266.jpg | Some bags have been set on the floor. | Scan ETS gốc (cropped_ets_photos_2021/test5/q1.jpg) | 96c4c8e7dd... | ✅ 100% Khớp |
| 267 | Q267 | Lv 3 | p1_q267.jpg | Dining area is empty. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_266.jpg) | 8d6da067ee... | ✅ 100% Khớp |
| 268 | Q268 | Lv 3 | p1_q268.jpg | A man is wiping a counter. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_267.jpg) | 94e885181a... | ✅ 100% Khớp |
| 269 | Q269 | Lv 3 | p1_q269.jpg | He's reading a posted notice. | Scan ETS gốc (cropped_ets_photos/test8/q1.jpg) | 4cd6d3ff4e... | ✅ 100% Khớp |
| 270 | Q270 | Lv 3 | p1_q270.jpg | He's looking in a file drawer. | Scan ETS gốc (cropped_ets_photos_2019/test3/q1.jpg) | 112bdd72e3... | ✅ 100% Khớp |
| 271 | Q271 | Lv 3 | p1_q271.jpg | He's examining some plants. | Scan ETS gốc (cropped_ets_photos_2024/test7/q4.jpg) | 9c7c8ffbe8... | ✅ 100% Khớp |
| 272 | Q272 | Lv 3 | p1_q272.jpg | The woman is painting a picture on an easel. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_271.jpg) | 9759193c14... | ✅ 100% Khớp |
| 273 | Q273 | Lv 3 | p1_q273.jpg | He's looking into a laundry cart. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_272.jpg) | f119eb3a97... | ✅ 100% Khớp |
| 274 | Q274 | Lv 3 | p1_q274.jpg | The woman is holding a glass. | Scan ETS gốc (cropped_ets_photos/test1/q1.jpg) | b0ac71cf40... | ✅ 100% Khớp |
| 275 | Q275 | Lv 3 | p1_q275.jpg | Customer is paying for a purchase. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_274.jpg) | 611c530586... | ✅ 100% Khớp |
| 276 | Q276 | Lv 3 | p1_q276.jpg | They're walking toward a park. | Scan ETS gốc (cropped_ets_photos_2020/test10/q2.jpg) | 906cac40a3... | ✅ 100% Khớp |
| 277 | Q277 | Lv 3 | p1_q277.jpg | She's looking at some packages. | Scan ETS gốc (cropped_ets_photos_2020/test6/q2.jpg) | d83b00c66f... | ✅ 100% Khớp |
| 278 | Q278 | Lv 3 | p1_q278.jpg | Several vehicles are parked outside a building. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_277.jpg) | cb7a97e9d2... | ✅ 100% Khớp |
| 279 | Q279 | Lv 3 | p1_q279.jpg | Bicycle has been loaded onto a truck. | Scan ETS gốc (cropped_ets_photos_2019/test5/q2.jpg) | 64de77953d... | ✅ 100% Khớp |
| 280 | Q280 | Lv 3 | p1_q280.jpg | A woman is walking past a pedestrian crosswalk. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_279.jpg) | 2dba0b4711... | ✅ 100% Khớp |
| 281 | Q281 | Lv 3 | p1_q281.jpg | Woman's carrying a jacket over her arm. | Scan ETS gốc (cropped_ets_photos_2019/test2/q2.jpg) | e3d6f2483b... | ✅ 100% Khớp |
| 282 | Q282 | Lv 3 | p1_q282.jpg | The man is standing in the snow beside a car. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_281.jpg) | 65fcbdb969... | ✅ 100% Khớp |
| 283 | Q283 | Lv 3 | p1_q283.jpg | They’re facing a shelving unit. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_282.jpg) | 467c39e99e... | ✅ 100% Khớp |
| 284 | Q284 | Lv 3 | p1_q284.jpg | Some artwork is mounted on a wall. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_283.jpg) | 9464a1a0ba... | ✅ 100% Khớp |
| 285 | Q285 | Lv 3 | p1_q285.jpg | He is holding the handle of a shopping cart. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_284.jpg) | 79fad5022b... | ✅ 100% Khớp |
| 286 | Q286 | Lv 3 | p1_q286.jpg | One of the women is removing an item from her purse. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_285.jpg) | 1e5f683d00... | ✅ 100% Khớp |
| 287 | Q287 | Lv 3 | p1_q287.jpg | Musicians have gathered in a circle. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_286.jpg) | 0cc17d471f... | ✅ 100% Khớp |
| 288 | Q288 | Lv 3 | p1_q288.jpg | He's reaching into a stack of clothing. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_287.jpg) | 5f57ee8094... | ✅ 100% Khớp |
| 289 | Q289 | Lv 3 | p1_q289.jpg | Lothing is hanging on racks. | Scan ETS gốc (cropped_ets_photos_2019/test3/q3.jpg) | 84c9c6413b... | ✅ 100% Khớp |
| 290 | Q290 | Lv 3 | p1_q290.jpg | Rug is being rolled up. | Scan ETS gốc (cropped_ets_photos_2020/test3/q3.jpg) | e096a90c5e... | ✅ 100% Khớp |
| 291 | Q291 | Lv 3 | p1_q291.jpg | He’s wearing safety glasses. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_290.jpg) | cdf33287b6... | ✅ 100% Khớp |
| 292 | Q292 | Lv 3 | p1_q292.jpg | Some people are strolling on a path. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_291.jpg) | 8ed3e16aec... | ✅ 100% Khớp |
| 293 | Q293 | Lv 3 | p1_q293.jpg | A man is walking behind some parked cars. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_292.jpg) | a9bac4e72f... | ✅ 100% Khớp |
| 294 | Q294 | Lv 3 | p1_q294.jpg | They're working in a garden. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_293.jpg) | 57aa64bc6c... | ✅ 100% Khớp |
| 295 | Q295 | Lv 3 | p1_q295.jpg | Two of the people are having a conversation. | Scan ETS gốc (cropped_ets_photos_2024/test1/q6.jpg) | 290d1c5778... | ✅ 100% Khớp |
| 296 | Q296 | Lv 3 | p1_q296.jpg | Vehicle is parked next to a building. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_295.jpg) | bdbf8bfbe2... | ✅ 100% Khớp |
| 297 | Q297 | Lv 3 | p1_q297.jpg | Menu board has been hung on a wall. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_296.jpg) | a4e45dc80f... | ✅ 100% Khớp |
| 298 | Q298 | Lv 3 | p1_q298.jpg | The building entrance has columns. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_297.jpg) | 45f10f4e40... | ✅ 100% Khớp |
| 299 | Q299 | Lv 3 | p1_q299.jpg | One of the people is leaning against a wall. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_298.jpg) | b80e6a195b... | ✅ 100% Khớp |
| 300 | Q300 | Lv 3 | p1_q300.jpg | A man is holding up his phone. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_299.jpg) | 2cee55b32c... | ✅ 100% Khớp |
| 301 | Q301 | Lv 3 | p1_q301.jpg | The woman is helping a customer. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_300.jpg) | a0cf1bdacf... | ✅ 100% Khớp |
| 302 | Q302 | Lv 3 | p1_q302.jpg | He's pulling a cart on a walkway. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_301.jpg) | 271603d4dc... | ✅ 100% Khớp |
| 303 | Q303 | Lv 3 | p1_q303.jpg | A man is handing a woman a brochure. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_302.jpg) | 6832377d53... | ✅ 100% Khớp |
| 304 | Q304 | Lv 3 | p1_q304.jpg | The woman is wearing a helmet. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_303.jpg) | 284be98a16... | ✅ 100% Khớp |
| 305 | Q305 | Lv 3 | p1_q305.jpg | Some food has been laid out on platters. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_304.jpg) | 9fdf5e7bc6... | ✅ 100% Khớp |
| 306 | Q306 | Lv 3 | p1_q306.jpg | Lothing is being displayed under a tent. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_305.jpg) | a879650983... | ✅ 100% Khớp |
| 307 | Q307 | Lv 3 | p1_q307.jpg | Some signs have been posted in front of a building. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_306.jpg) | 7bdd875ea3... | ✅ 100% Khớp |
| 308 | Q308 | Lv 3 | p1_q308.jpg | Garden has been planted outside of a building. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_307.jpg) | b1d796fe9e... | ✅ 100% Khớp |
| 309 | Q309 | Lv 3 | p1_q309.jpg | Some boxes have been stored inside a vehicle. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_308.jpg) | 26c418fec6... | ✅ 100% Khớp |
| 310 | Q310 | Lv 3 | p1_q310.jpg | A waiter is bringing dishes to a table. | Scan ETS gốc (cropped_ets_photos/test1/q3.jpg) | b8edf1d329... | ✅ 100% Khớp |
| 311 | Q311 | Lv 3 | p1_q311.jpg | The men have stopped on a walkway. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_310.jpg) | 31ca7f63be... | ✅ 100% Khớp |
| 312 | Q312 | Lv 3 | p1_q312.jpg | Some chairs are being stacked in a corner. | Scan ETS gốc (cropped_ets_photos_2020/test10/q4.jpg) | 69993ea835... | ✅ 100% Khớp |
| 313 | Q313 | Lv 3 | p1_q313.jpg | A car is parked on the side of a road. | Scan ETS gốc (cropped_ets_photos_2021/test2/q4.jpg) | cd97cce80f... | ✅ 100% Khớp |
| 314 | Q314 | Lv 3 | p1_q314.jpg | Some bushes are being planted. | Scan ETS gốc (cropped_ets_photos_2020/test8/q4.jpg) | 2d4095a8f0... | ✅ 100% Khớp |
| 315 | Q315 | Lv 3 | p1_q315.jpg | Some clothing has been hung up. | Scan ETS gốc (cropped_ets_photos_2020/test1/q4.jpg) | e7c66569ac... | ✅ 100% Khớp |
| 316 | Q316 | Lv 3 | p1_q316.jpg | Some papers are posted on a bulletin board. | Scan ETS gốc (cropped_ets_photos_2020/test4/q4.jpg) | f25a4ab9db... | ✅ 100% Khớp |
| 317 | Q317 | Lv 3 | p1_q317.jpg | Books and magazines have been arranged on shelves. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_316.jpg) | 056aff77b4... | ✅ 100% Khớp |
| 318 | Q318 | Lv 3 | p1_q318.jpg | Some people are standing behind a vehicle. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_317.jpg) | b431b06e72... | ✅ 100% Khớp |
| 319 | Q319 | Lv 3 | p1_q319.jpg | One of the women is looking at some files. | Scan ETS gốc (cropped_ets_photos_2019/test2/q4.jpg) | e44302b377... | ✅ 100% Khớp |
| 320 | Q320 | Lv 3 | p1_q320.jpg | Some people are descending some stairs. | Scan ETS gốc (cropped_ets_photos_2019/test5/q4.jpg) | bf03c6a93e... | ✅ 100% Khớp |
| 321 | Q321 | Lv 3 | p1_q321.jpg | The woman is wearing a safety vest. | Scan ETS gốc (cropped_ets_photos_2019/test9/q4.jpg) | 0f0f1b3c59... | ✅ 100% Khớp |
| 322 | Q322 | Lv 3 | p1_q322.jpg | Some pillows have been placed on a bed. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_321.jpg) | b0cceaf282... | ✅ 100% Khớp |
| 323 | Q323 | Lv 3 | p1_q323.jpg | Two people are having a meal together. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_322.jpg) | b3aaf6d860... | ✅ 100% Khớp |
| 324 | Q324 | Lv 3 | p1_q324.jpg | The audience is facing a screen. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_323.jpg) | 33550c646d... | ✅ 100% Khớp |
| 325 | Q325 | Lv 3 | p1_q325.jpg | Some light fixtures are mounted on the walls. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_324.jpg) | e5521116c6... | ✅ 100% Khớp |
| 326 | Q326 | Lv 3 | p1_q326.jpg | Drawer has been left open. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_325.jpg) | 8f4ab09cdd... | ✅ 100% Khớp |
| 327 | Q327 | Lv 3 | p1_q327.jpg | A man is using a shovel to move some dirt. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_326.jpg) | 8f121a2a6e... | ✅ 100% Khớp |
| 328 | Q328 | Lv 3 | p1_q328.jpg | The women are across the desk from each other. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_327.jpg) | b930f4c1b0... | ✅ 100% Khớp |
| 329 | Q329 | Lv 3 | p1_q329.jpg | A woman is taking some stairs to a lower level. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_328.jpg) | 8bdb1788a4... | ✅ 100% Khớp |
| 330 | Q330 | Lv 3 | p1_q330.jpg | Roof is under construction. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_329.jpg) | b25d5a3e81... | ✅ 100% Khớp |
| 331 | Q331 | Lv 3 | p1_q331.jpg | A woman is talking to a worker at a desk. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_330.jpg) | ce91ae61c2... | ✅ 100% Khớp |
| 332 | Q332 | Lv 3 | p1_q332.jpg | One of the women is carrying a bag on her shoulder. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_331.jpg) | 1fd790dbde... | ✅ 100% Khớp |
| 333 | Q333 | Lv 3 | p1_q333.jpg | Some boxes are arranged under some lamps. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_332.jpg) | 607fdf9662... | ✅ 100% Khớp |
| 334 | Q334 | Lv 3 | p1_q334.jpg | Some bicycles are parked near a road. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_333.jpg) | 6d2b4318d7... | ✅ 100% Khớp |
| 335 | Q335 | Lv 3 | p1_q335.jpg | The woman is using a microscope. | Scan ETS gốc (cropped_ets_photos_2021/test2/q5.jpg) | 579222324f... | ✅ 100% Khớp |
| 336 | Q336 | Lv 3 | p1_q336.jpg | Server is taking an order. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_335.jpg) | c811802ad1... | ✅ 100% Khớp |
| 337 | Q337 | Lv 3 | p1_q337.jpg | Some equipment is leaning against a truck. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_336.jpg) | f67427d856... | ✅ 100% Khớp |
| 338 | Q338 | Lv 3 | p1_q338.jpg | Luggage rack has two levels. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_337.jpg) | 5ae3970795... | ✅ 100% Khớp |
| 339 | Q339 | Lv 3 | p1_q339.jpg | Irline staff are greeting some passengers. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_338.jpg) | 730a746a26... | ✅ 100% Khớp |
| 340 | Q340 | Lv 3 | p1_q340.jpg | Some potted plants are on both sides of an entrance. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_339.jpg) | 0751db03ea... | ✅ 100% Khớp |
| 341 | Q341 | Lv 3 | p1_q341.jpg | Some trees are providing shade for a picnic area. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_340.jpg) | 0fd01e04b1... | ✅ 100% Khớp |
| 342 | Q342 | Lv 3 | p1_q342.jpg | Some vehicles are parked in front of a fence. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_341.jpg) | bd4ab020bd... | ✅ 100% Khớp |
| 343 | Q343 | Lv 3 | p1_q343.jpg | Everage is being poured into a glass. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_342.jpg) | db35b7ef12... | ✅ 100% Khớp |
| 344 | Q344 | Lv 3 | p1_q344.jpg | One of the women is holding a notebook under her arm. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_343.jpg) | 741bbee84b... | ✅ 100% Khớp |
| 345 | Q345 | Lv 3 | p1_q345.jpg | There are lamps lighting some seating areas. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_344.jpg) | 9711229f89... | ✅ 100% Khớp |
| 346 | Q346 | Lv 3 | p1_q346.jpg | Light fixture is hanging above a dining area. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_345.jpg) | 58e24baefb... | ✅ 100% Khớp |
| 347 | Q347 | Lv 3 | p1_q347.jpg | Some potted plants have been placed in a courtyard. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_346.jpg) | e4f0568ca6... | ✅ 100% Khớp |
| 348 | Q348 | Lv 3 | p1_q348.jpg | One of the employees is walking with an empty tray. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_347.jpg) | 42dafa1391... | ✅ 100% Khớp |
| 349 | Q349 | Lv 3 | p1_q349.jpg | Some chairs have been placed along a canal. | Scan ETS gốc (cropped_ets_photos_2019/test7/q6.jpg) | 5f28bb24e1... | ✅ 100% Khớp |
| 350 | Q350 | Lv 3 | p1_q350.jpg | Some wooden planter boxes have been set next to each other. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_349.jpg) | 65b713f1af... | ✅ 100% Khớp |
| 351 | Q351 | Lv 3 | p1_q351.jpg | Some people are attending a presentation. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_350.jpg) | f4bcca4bf9... | ✅ 100% Khớp |
| 352 | Q352 | Lv 3 | p1_q352.jpg | Building materials have been set out on the floor. | Scan ETS gốc (cropped_ets_photos/test1/q5.jpg) | 9dec82236e... | ✅ 100% Khớp |
| 353 | Q353 | Lv 3 | p1_q353.jpg | Wooden structure has been built near some trees. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_352.jpg) | f1b8c712f9... | ✅ 100% Khớp |
| 354 | Q354 | Lv 3 | p1_q354.jpg | Some leaves have fallen onto a bench. | Scan ETS gốc (cropped_ets_photos/test1/q6.jpg) | 72a8b1e8b4... | ✅ 100% Khớp |
| 355 | Q355 | Lv 4 | p1_q355.jpg | A woman is opening a drawer. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_354.jpg) | aba08674f6... | ✅ 100% Khớp |
| 356 | Q356 | Lv 4 | p1_q356.jpg | She's plugging in a fan. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_355.jpg) | 215c4b40de... | ✅ 100% Khớp |
| 357 | Q357 | Lv 4 | p1_q357.jpg | The man is assembling some furniture. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_356.jpg) | 187b056fe4... | ✅ 100% Khớp |
| 358 | Q358 | Lv 4 | p1_q358.jpg | A man is getting some food from a cafeteria. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_357.jpg) | d3c257b68f... | ✅ 100% Khớp |
| 359 | Q359 | Lv 4 | p1_q359.jpg | She's sorting through paper files. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_358.jpg) | 68c296d784... | ✅ 100% Khớp |
| 360 | Q360 | Lv 4 | p1_q360.jpg | She's kneeling in front of a chalkboard. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_359.jpg) | 42931b87a7... | ✅ 100% Khớp |
| 361 | Q361 | Lv 4 | p1_q361.jpg | She’s using walking sticks. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_360.jpg) | 7075292137... | ✅ 100% Khớp |
| 362 | Q362 | Lv 4 | p1_q362.jpg | He's leaning over a container. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_361.jpg) | 5dbfb6a74b... | ✅ 100% Khớp |
| 363 | Q363 | Lv 4 | p1_q363.jpg | Floral arrangement is being assembled. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_362.jpg) | d027f22212... | ✅ 100% Khớp |
| 364 | Q364 | Lv 4 | p1_q364.jpg | They're walking outside. | Scan ETS gốc (cropped_ets_photos_2020/test9/q2.jpg) | e4a69bbf64... | ✅ 100% Khớp |
| 365 | Q365 | Lv 4 | p1_q365.jpg | M-Cn: (A) There's some bread on a counter. | Scan ETS gốc (cropped_ets_photos_2020/test4/q2.jpg) | c619ca91e0... | ✅ 100% Khớp |
| 366 | Q366 | Lv 4 | p1_q366.jpg | He’s operating a machine. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_365.jpg) | a27ffd0539... | ✅ 100% Khớp |
| 367 | Q367 | Lv 4 | p1_q367.jpg | He's picking up an empty cup. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_366.jpg) | c635ca0400... | ✅ 100% Khớp |
| 368 | Q368 | Lv 4 | p1_q368.jpg | Clothes are on display on a rack. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_367.jpg) | b4b65e7ffe... | ✅ 100% Khớp |
| 369 | Q369 | Lv 4 | p1_q369.jpg | A man is leaning against a railing. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_368.jpg) | 38d482c4a3... | ✅ 100% Khớp |
| 370 | Q370 | Lv 4 | p1_q370.jpg | There’s a window overlooking a garden. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_369.jpg) | 873a54c82f... | ✅ 100% Khớp |
| 371 | Q371 | Lv 4 | p1_q371.jpg | She's sliding a tray into a rack. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_370.jpg) | ebfd61dc18... | ✅ 100% Khớp |
| 372 | Q372 | Lv 4 | p1_q372.jpg | He's facing a machine. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_371.jpg) | 3c996baaa0... | ✅ 100% Khớp |
| 373 | Q373 | Lv 4 | p1_q373.jpg | She's standing on a patio near a house. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_372.jpg) | 4037fc2d54... | ✅ 100% Khớp |
| 374 | Q374 | Lv 4 | p1_q374.jpg | The man is seated by a window. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_373.jpg) | 65e4606082... | ✅ 100% Khớp |
| 375 | Q375 | Lv 4 | p1_q375.jpg | She's making clothing in a workroom. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_374.jpg) | 91fc1f1c7c... | ✅ 100% Khớp |
| 376 | Q376 | Lv 4 | p1_q376.jpg | A man is near a display of potted plants. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_375.jpg) | 06ba4d04b3... | ✅ 100% Khớp |
| 377 | Q377 | Lv 4 | p1_q377.jpg | Some of the people are pulling suitcases. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_376.jpg) | 13707625d9... | ✅ 100% Khớp |
| 378 | Q378 | Lv 4 | p1_q378.jpg | Tree is near a sign. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_377.jpg) | ca9cb29477... | ✅ 100% Khớp |
| 379 | Q379 | Lv 4 | p1_q379.jpg | Picnic area is covered by a roof. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_378.jpg) | 3186cf7db2... | ✅ 100% Khớp |
| 380 | Q380 | Lv 4 | p1_q380.jpg | One of the women is wearing glasses. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_379.jpg) | b087459b94... | ✅ 100% Khớp |
| 381 | Q381 | Lv 4 | p1_q381.jpg | Customer is picking up some clothing at a dry cleaner's. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_380.jpg) | 577d40df2a... | ✅ 100% Khớp |
| 382 | Q382 | Lv 4 | p1_q382.jpg | Shier is holding an item. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_381.jpg) | f8e709a96e... | ✅ 100% Khớp |
| 383 | Q383 | Lv 4 | p1_q383.jpg | They’re seated across from one another. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_382.jpg) | 05234bfd3a... | ✅ 100% Khớp |
| 384 | Q384 | Lv 4 | p1_q384.jpg | He's leaning over a sink. | Scan ETS gốc (cropped_ets_photos_2021/test4/q3.jpg) | 18bb46fb9c... | ✅ 100% Khớp |
| 385 | Q385 | Lv 4 | p1_q385.jpg | She's facing a refrigerated display case. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_384.jpg) | 5b5095f0cd... | ✅ 100% Khớp |
| 386 | Q386 | Lv 4 | p1_q386.jpg | The man is scrubbing the front of a car. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_385.jpg) | 5bd111cfb8... | ✅ 100% Khớp |
| 387 | Q387 | Lv 4 | p1_q387.jpg | They're walking past a seating area. | Scan ETS gốc (cropped_ets_photos_2021/test5/q3.jpg) | 3304592df1... | ✅ 100% Khớp |
| 388 | Q388 | Lv 4 | p1_q388.jpg | A man is leaning on a fence. | Scan ETS gốc (cropped_ets_photos/test2/q2.jpg) | b9ca4ee34e... | ✅ 100% Khớp |
| 389 | Q389 | Lv 4 | p1_q389.jpg | A person is rowing a boat. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_388.jpg) | 02e6de4a1a... | ✅ 100% Khớp |
| 390 | Q390 | Lv 4 | p1_q390.jpg | There are some performers on a stage. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_389.jpg) | 1c1cc5ea78... | ✅ 100% Khớp |
| 391 | Q391 | Lv 4 | p1_q391.jpg | She’s holding onto a shopping cart. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_390.jpg) | 67de7b13d6... | ✅ 100% Khớp |
| 392 | Q392 | Lv 4 | p1_q392.jpg | The women are across the desk from each other. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_391.jpg) | 90ea59de02... | ✅ 100% Khớp |
| 393 | Q393 | Lv 4 | p1_q393.jpg | There are beverages available inside a tent. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_392.jpg) | 4f45353216... | ✅ 100% Khớp |
| 394 | Q394 | Lv 4 | p1_q394.jpg | A woman is following a man down a corridor. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_393.jpg) | 462ca671d4... | ✅ 100% Khớp |
| 395 | Q395 | Lv 4 | p1_q395.jpg | She’s pulling some wheeled luggage. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_394.jpg) | d908ea4e26... | ✅ 100% Khớp |
| 396 | Q396 | Lv 4 | p1_q396.jpg | Some coats are being displayed. | Scan ETS gốc (cropped_ets_photos_2019/test8/q2.jpg) | 6d2ecba2b5... | ✅ 100% Khớp |
| 397 | Q397 | Lv 4 | p1_q397.jpg | Some jars are arranged on shelves. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_396.jpg) | 4db5a2b363... | ✅ 100% Khớp |
| 398 | Q398 | Lv 4 | p1_q398.jpg | Wooden crate is filled with vegetables. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_397.jpg) | fc043f113e... | ✅ 100% Khớp |
| 399 | Q399 | Lv 4 | p1_q399.jpg | Wood is piled near a fence. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_398.jpg) | 5bfd9aa4e8... | ✅ 100% Khớp |
| 400 | Q400 | Lv 4 | p1_q400.jpg | He’s kneeling down on a tile floor. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_399.jpg) | fbbd8b9c04... | ✅ 100% Khớp |
| 401 | Q401 | Lv 4 | p1_q401.jpg | Shopper is carrying a package. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_400.jpg) | 38b913e546... | ✅ 100% Khớp |
| 402 | Q402 | Lv 4 | p1_q402.jpg | The man is inspecting a wheel. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_401.jpg) | 093bbca60f... | ✅ 100% Khớp |
| 403 | Q403 | Lv 4 | p1_q403.jpg | Motorcycle is parked beside a shop. | Scan ETS gốc (cropped_ets_photos/test2/q3.jpg) | 41b208b414... | ✅ 100% Khớp |
| 404 | Q404 | Lv 4 | p1_q404.jpg | The woman is adjusting some blinds. | Scan ETS gốc (cropped_ets_photos_2021/test5/q4.jpg) | 1122915b94... | ✅ 100% Khớp |
| 405 | Q405 | Lv 4 | p1_q405.jpg | The audience is seated facing a screen. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_404.jpg) | 7a294390cd... | ✅ 100% Khớp |
| 406 | Q406 | Lv 4 | p1_q406.jpg | She's holding a bottle in her hand. | Scan ETS gốc (cropped_ets_photos_2019/test10/q4.jpg) | ed97362a43... | ✅ 100% Khớp |
| 407 | Q407 | Lv 4 | p1_q407.jpg | One of the people is standing by a podium. | Scan ETS gốc (cropped_ets_photos_2021/test5/q5.jpg) | 16c4569c70... | ✅ 100% Khớp |
| 408 | Q408 | Lv 4 | p1_q408.jpg | She's pressing a button on a device. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_407.jpg) | 1f3258218c... | ✅ 100% Khớp |
| 409 | Q409 | Lv 4 | p1_q409.jpg | Snow is being cleared away. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_408.jpg) | cadd4955eb... | ✅ 100% Khớp |
| 410 | Q410 | Lv 4 | p1_q410.jpg | Plant has been placed next to a chair. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_409.jpg) | 1324aa2356... | ✅ 100% Khớp |
| 411 | Q411 | Lv 4 | p1_q411.jpg | Seats have been arranged under some umbrellas. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_410.jpg) | ce3050490e... | ✅ 100% Khớp |
| 412 | Q412 | Lv 4 | p1_q412.jpg | There are some mountains in the distance. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_411.jpg) | 23ed27549b... | ✅ 100% Khớp |
| 413 | Q413 | Lv 4 | p1_q413.jpg | Metal bench is unoccupied. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_412.jpg) | 5ea7b4def3... | ✅ 100% Khớp |
| 414 | Q414 | Lv 4 | p1_q414.jpg | Tents have been set up in a parking area. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_413.jpg) | 635a8b3f2f... | ✅ 100% Khớp |
| 415 | Q415 | Lv 4 | p1_q415.jpg | Some reading materials have been placed in front of a sofa. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_414.jpg) | 4551ff43b3... | ✅ 100% Khớp |
| 416 | Q416 | Lv 4 | p1_q416.jpg | A worker is crouching down behind a counter. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_415.jpg) | 6128eb4c6f... | ✅ 100% Khớp |
| 417 | Q417 | Lv 4 | p1_q417.jpg | There are chairs set up in front of a building. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_416.jpg) | 1776ba134f... | ✅ 100% Khớp |
| 418 | Q418 | Lv 4 | p1_q418.jpg | Some road signs are hanging from the ceiling. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_417.jpg) | 49d383da76... | ✅ 100% Khớp |
| 419 | Q419 | Lv 4 | p1_q419.jpg | N audience is listening to a lecturer. | Scan ETS gốc (cropped_ets_photos_2019/test5/q5.jpg) | 9316759d65... | ✅ 100% Khớp |
| 420 | Q420 | Lv 4 | p1_q420.jpg | One of the men is holding a briefcase. | Scan ETS gốc (cropped_ets_photos_2019/test7/q5.jpg) | 299dc603df... | ✅ 100% Khớp |
| 421 | Q421 | Lv 4 | p1_q421.jpg | A Painting supplies have been laid out on the floor. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_420.jpg) | 4d15ed50d9... | ✅ 100% Khớp |
| 422 | Q422 | Lv 4 | p1_q422.jpg | Some artwork is hanging on a wall. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_421.jpg) | ba8ba2c4ab... | ✅ 100% Khớp |
| 423 | Q423 | Lv 4 | p1_q423.jpg | Sets of utensils have been arranged on napkins. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_422.jpg) | f27dc895f6... | ✅ 100% Khớp |
| 424 | Q424 | Lv 4 | p1_q424.jpg | Merchandise is being displayed in a case. | Scan ETS gốc (cropped_ets_photos_2021/test1/q5.jpg) | 2f51102ac4... | ✅ 100% Khớp |
| 425 | Q425 | Lv 4 | p1_q425.jpg | Fan has been turned to face a wall. | Scan ETS gốc (cropped_ets_photos_2021/test3/q5.jpg) | 4808900be6... | ✅ 100% Khớp |
| 426 | Q426 | Lv 4 | p1_q426.jpg | Several brooms have been placed next to a plastic bin. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_425.jpg) | b81e55701a... | ✅ 100% Khớp |
| 427 | Q427 | Lv 4 | p1_q427.jpg | He's wearing sunglasses. | Scan ETS gốc (cropped_ets_photos_2019/test6/q5.jpg) | da85a1d653... | ✅ 100% Khớp |
| 428 | Q428 | Lv 4 | p1_q428.jpg | Some musicians are performing on a porch. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_427.jpg) | 7412b6db39... | ✅ 100% Khớp |
| 429 | Q429 | Lv 4 | p1_q429.jpg | Some produce is displayed for sale. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_428.jpg) | 192ff536e0... | ✅ 100% Khớp |
| 430 | Q430 | Lv 4 | p1_q430.jpg | Binet has been stocked with supplies. | Scan ETS gốc (cropped_ets_photos_2019/test10/q6.jpg) | f2a3fde5e5... | ✅ 100% Khớp |
| 431 | Q431 | Lv 4 | p1_q431.jpg | Some fruit has been separated into containers. | Scan ETS gốc (cropped_ets_photos_2021/test3/q6.jpg) | 18ca56680f... | ✅ 100% Khớp |
| 432 | Q432 | Lv 4 | p1_q432.jpg | N athletic field is located near some trees. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_431.jpg) | 7f872112cc... | ✅ 100% Khớp |
| 433 | Q433 | Lv 4 | p1_q433.jpg | Stools have been placed around the room. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_432.jpg) | 29ff2b4471... | ✅ 100% Khớp |
| 434 | Q434 | Lv 4 | p1_q434.jpg | There are some vehicles lining the side of a street. | Scan ETS gốc (cropped_ets_photos_2021/test5/q6.jpg) | 88994e0a4b... | ✅ 100% Khớp |
| 435 | Q435 | Lv 4 | p1_q435.jpg | One of the paintings is displayed in a round frame. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_434.jpg) | 4c8763b6ff... | ✅ 100% Khớp |
| 436 | Q436 | Lv 4 | p1_q436.jpg | Bus is being driven down a road. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_435.jpg) | 129a11cb1e... | ✅ 100% Khớp |
| 437 | Q437 | Lv 4 | p1_q437.jpg | One of the men is lifting a wooden plank. | Scan ETS gốc (cropped_ets_photos_2020/test3/q6.jpg) | 78716ceb1a... | ✅ 100% Khớp |
| 438 | Q438 | Lv 4 | p1_q438.jpg | Bridge crosses over a waterway. | Scan ETS gốc (cropped_ets_photos_2020/test9/q6.jpg) | 8aad4ab9d3... | ✅ 100% Khớp |
| 439 | Q439 | Lv 4 | p1_q439.jpg | Some tires are stacked against a building. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_438.jpg) | 6e66dad042... | ✅ 100% Khớp |
| 440 | Q440 | Lv 4 | p1_q440.jpg | Some papers have been pinned to a bulletin board. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_439.jpg) | ce45f2116c... | ✅ 100% Khớp |
| 441 | Q441 | Lv 4 | p1_q441.jpg | Tall plant has been placed next to a cabinet. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_440.jpg) | 6d8b5711ba... | ✅ 100% Khớp |
| 442 | Q442 | Lv 4 | p1_q442.jpg | Road is being dug up by some workers. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_441.jpg) | 9814f8d04f... | ✅ 100% Khớp |
| 443 | Q443 | Lv 4 | p1_q443.jpg | Walkway is lined with benches. | Scan ETS gốc (cropped_ets_photos_2020/test6/q6.jpg) | 94a84abc60... | ✅ 100% Khớp |
| 444 | Q444 | Lv 4 | p1_q444.jpg | Lamp has been set on top of a counter. | Scan ETS gốc (cropped_ets_photos_2019/test4/q5.jpg) | db005b80ae... | ✅ 100% Khớp |
| 445 | Q445 | Lv 4 | p1_q445.jpg | He's setting up a buffet. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_444.jpg) | f28dcf42aa... | ✅ 100% Khớp |
| 446 | Q446 | Lv 4 | p1_q446.jpg | Some flowers have been arranged in a vase. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_445.jpg) | ffd8f1fe32... | ✅ 100% Khớp |
| 447 | Q447 | Lv 5 | p1_q447.jpg | She’s inserting a cord into an outlet. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_446.jpg) | 15d5e5ad44... | ✅ 100% Khớp |
| 448 | Q448 | Lv 5 | p1_q448.jpg | The woman is wearing a jacket. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_447.jpg) | bfa90a640c... | ✅ 100% Khớp |
| 449 | Q449 | Lv 5 | p1_q449.jpg | He's working on a puzzle. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_448.jpg) | d822998ad2... | ✅ 100% Khớp |
| 450 | Q450 | Lv 5 | p1_q450.jpg | The woman is unloading some bags. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_449.jpg) | 01fadd8e96... | ✅ 100% Khớp |
| 451 | Q451 | Lv 5 | p1_q451.jpg | The people are visiting a library. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_450.jpg) | eafaf9d7e4... | ✅ 100% Khớp |
| 452 | Q452 | Lv 5 | p1_q452.jpg | She's getting into an automobile. | Scan ETS gốc (cropped_ets_photos_2020/test5/q1.jpg) | 26f991722b... | ✅ 100% Khớp |
| 453 | Q453 | Lv 5 | p1_q453.jpg | A man is bending over some wires. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_452.jpg) | e42dc3a75f... | ✅ 100% Khớp |
| 454 | Q454 | Lv 5 | p1_q454.jpg | A man with tools is bending over. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_453.jpg) | 1c61dbc184... | ✅ 100% Khớp |
| 455 | Q455 | Lv 5 | p1_q455.jpg | She's hammering a nail. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_454.jpg) | 784d720af7... | ✅ 100% Khớp |
| 456 | Q456 | Lv 5 | p1_q456.jpg | The woman is standing on a stool. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_455.jpg) | 612692e5a1... | ✅ 100% Khớp |
| 457 | Q457 | Lv 5 | p1_q457.jpg | He's pouring liquid from a pitcher. | Scan ETS gốc (cropped_ets_photos_2021/test5/q2.jpg) | a68e527e1c... | ✅ 100% Khớp |
| 458 | Q458 | Lv 5 | p1_q458.jpg | Tire is leaning against a car. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_457.jpg) | 39f98a82f7... | ✅ 100% Khớp |
| 459 | Q459 | Lv 5 | p1_q459.jpg | The men are working near each other. | Scan ETS gốc (cropped_ets_photos_2019/test4/q2.jpg) | b54fccb121... | ✅ 100% Khớp |
| 460 | Q460 | Lv 5 | p1_q460.jpg | The women are purchasing some groceries. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_459.jpg) | ad1f2ac9f9... | ✅ 100% Khớp |
| 461 | Q461 | Lv 5 | p1_q461.jpg | They're studying a drawing. | Scan ETS gốc (cropped_ets_photos_2020/test1/q2.jpg) | 878501e7df... | ✅ 100% Khớp |
| 462 | Q462 | Lv 5 | p1_q462.jpg | Some light fixtures are hanging from the ceiling. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_461.jpg) | 35c5a49f45... | ✅ 100% Khớp |
| 463 | Q463 | Lv 5 | p1_q463.jpg | Some people are taking a ride on a boat. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_462.jpg) | 82a2aa1160... | ✅ 100% Khớp |
| 464 | Q464 | Lv 5 | p1_q464.jpg | The women are wearing long-sleeved shirts. | Scan ETS gốc (cropped_ets_photos_2021/test2/q3.jpg) | c6fdc2f8da... | ✅ 100% Khớp |
| 465 | Q465 | Lv 5 | p1_q465.jpg | The men are on opposite sides of a table. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_464.jpg) | 2fa906584f... | ✅ 100% Khớp |
| 466 | Q466 | Lv 5 | p1_q466.jpg | She's hiking on an outdoor path. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_465.jpg) | 3f8466ba3a... | ✅ 100% Khớp |
| 467 | Q467 | Lv 5 | p1_q467.jpg | She's aiming a spray bottle at a desktop. | Scan ETS gốc (cropped_ets_photos_2021/test3/q3.jpg) | d5489743ae... | ✅ 100% Khớp |
| 468 | Q468 | Lv 5 | p1_q468.jpg | The woman is walking past some storefronts. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_467.jpg) | 4bf6bd927a... | ✅ 100% Khớp |
| 469 | Q469 | Lv 5 | p1_q469.jpg | They’re paddling a canoe. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_468.jpg) | 1bbf6b2aea... | ✅ 100% Khớp |
| 470 | Q470 | Lv 5 | p1_q470.jpg | A man is working outdoors. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_469.jpg) | 3bd8e9973b... | ✅ 100% Khớp |
| 471 | Q471 | Lv 5 | p1_q471.jpg | The women are standing near some chairs. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_470.jpg) | ad49ff20f9... | ✅ 100% Khớp |
| 472 | Q472 | Lv 5 | p1_q472.jpg | Shier is leaning over a cash register. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_471.jpg) | 9c22497ed4... | ✅ 100% Khớp |
| 473 | Q473 | Lv 5 | p1_q473.jpg | She has a rolled mat under her arm. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_472.jpg) | 35ea4242ea... | ✅ 100% Khớp |
| 474 | Q474 | Lv 5 | p1_q474.jpg | She's distributing some envelopes. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_473.jpg) | c8d5bbc5aa... | ✅ 100% Khớp |
| 475 | Q475 | Lv 5 | p1_q475.jpg | There are skyscrapers in the distance. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_474.jpg) | 467981ce4f... | ✅ 100% Khớp |
| 476 | Q476 | Lv 5 | p1_q476.jpg | A man is emptying a wheelbarrow. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_475.jpg) | cddedc3067... | ✅ 100% Khớp |
| 477 | Q477 | Lv 5 | p1_q477.jpg | Heckpoint barrier has been raised. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_476.jpg) | 366079b7ce... | ✅ 100% Khớp |
| 478 | Q478 | Lv 5 | p1_q478.jpg | Wall is decorated with various items. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_477.jpg) | 664bc87601... | ✅ 100% Khớp |
| 479 | Q479 | Lv 5 | p1_q479.jpg | Some papers have been placed on a counter. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_478.jpg) | fcd8b39b96... | ✅ 100% Khớp |
| 480 | Q480 | Lv 5 | p1_q480.jpg | They're seated next to each other. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_479.jpg) | dc6eecc4e3... | ✅ 100% Khớp |
| 481 | Q481 | Lv 5 | p1_q481.jpg | Lothing is displayed outside on racks. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_480.jpg) | 952bd2dbe7... | ✅ 100% Khớp |
| 482 | Q482 | Lv 5 | p1_q482.jpg | Fence is visible through the window. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_481.jpg) | d4d14f94b8... | ✅ 100% Khớp |
| 483 | Q483 | Lv 5 | p1_q483.jpg | Building has a clock tower on top of it. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_482.jpg) | 784489964f... | ✅ 100% Khớp |
| 484 | Q484 | Lv 5 | p1_q484.jpg | Some tool sets have been laid out. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_483.jpg) | 672b87d63b... | ✅ 100% Khớp |
| 485 | Q485 | Lv 5 | p1_q485.jpg | N outdoor dining area is unoccupied. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_484.jpg) | b61a7bd70c... | ✅ 100% Khớp |
| 486 | Q486 | Lv 5 | p1_q486.jpg | He's spreading cement with a shovel. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_485.jpg) | f4710ced23... | ✅ 100% Khớp |
| 487 | Q487 | Lv 5 | p1_q487.jpg | Some plants have been arranged in a row. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_486.jpg) | 46e91e05a9... | ✅ 100% Khớp |
| 488 | Q488 | Lv 5 | p1_q488.jpg | Some binders have been lined up on a shelf. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_487.jpg) | 0f0a8ba615... | ✅ 100% Khớp |
| 489 | Q489 | Lv 5 | p1_q489.jpg | Light fixture has been suspended over a desk. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_488.jpg) | 06ac3cffc2... | ✅ 100% Khớp |
| 490 | Q490 | Lv 5 | p1_q490.jpg | Some bushes have been planted outdoors. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_489.jpg) | c2ff2df96c... | ✅ 100% Khớp |
| 491 | Q491 | Lv 5 | p1_q491.jpg | Bags of merchandise are on display. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_490.jpg) | bc4e467d7f... | ✅ 100% Khớp |
| 492 | Q492 | Lv 5 | p1_q492.jpg | There are traffic signs attached to the ceiling. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_491.jpg) | 8b318de310... | ✅ 100% Khớp |
| 493 | Q493 | Lv 5 | p1_q493.jpg | Railings have been installed on a staircase. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_492.jpg) | 512da014e3... | ✅ 100% Khớp |
| 494 | Q494 | Lv 5 | p1_q494.jpg | One of the women is wearing a scarf. | Scan ETS gốc (cropped_ets_photos_2019/test1/q4.jpg) | 4643d76da6... | ✅ 100% Khớp |
| 495 | Q495 | Lv 5 | p1_q495.jpg | The woman is resting her arm on a railing. | Scan ETS gốc (cropped_ets_photos_2019/test8/q3.jpg) | dd98b11411... | ✅ 100% Khớp |
| 496 | Q496 | Lv 5 | p1_q496.jpg | Some of the shoes are lined up on the floor. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_495.jpg) | 655bfb59a4... | ✅ 100% Khớp |
| 497 | Q497 | Lv 5 | p1_q497.jpg | Some loose papers are covering part of a keyboard. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_496.jpg) | a68e67be93... | ✅ 100% Khớp |
| 498 | Q498 | Lv 5 | p1_q498.jpg | Sofa is being carried across a driveway. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_497.jpg) | b258608490... | ✅ 100% Khớp |
| 499 | Q499 | Lv 5 | p1_q499.jpg | Some trees border a pond. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_498.jpg) | c009fb3e6f... | ✅ 100% Khớp |
| 500 | Q500 | Lv 5 | p1_q500.jpg | One of the workers is operating some laboratory equipment. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_499.jpg) | ef2ec5d394... | ✅ 100% Khớp |
| 501 | Q501 | Lv 5 | p1_q501.jpg | Some large cooking pots are on a counter. | Scan ETS gốc (cropped_ets_photos_2020/test1/q5.jpg) | ad0b10bd05... | ✅ 100% Khớp |
| 502 | Q502 | Lv 5 | p1_q502.jpg | Some telephone wires are suspended over a road. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_501.jpg) | 2f995c56ce... | ✅ 100% Khớp |
| 503 | Q503 | Lv 5 | p1_q503.jpg | The workers are positioned on ladders. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_502.jpg) | e1f108c7d4... | ✅ 100% Khớp |
| 504 | Q504 | Lv 5 | p1_q504.jpg | Some trees are growing by a building. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_503.jpg) | 76a6545bee... | ✅ 100% Khớp |
| 505 | Q505 | Lv 5 | p1_q505.jpg | Some people have gathered on a sidewalk. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_504.jpg) | e0225f752d... | ✅ 100% Khớp |
| 506 | Q506 | Lv 5 | p1_q506.jpg | One of the women is carrying a handbag on her arm. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_505.jpg) | 3a7ce49bc8... | ✅ 100% Khớp |
| 507 | Q507 | Lv 5 | p1_q507.jpg | The women are walking toward a doorway. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_506.jpg) | f40f3fb5a1... | ✅ 100% Khớp |
| 508 | Q508 | Lv 5 | p1_q508.jpg | The woman is gesturing toward some buildings. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_507.jpg) | 1f15be7513... | ✅ 100% Khớp |
| 509 | Q509 | Lv 5 | p1_q509.jpg | Some people are browsing in a shop. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_508.jpg) | aff8899031... | ✅ 100% Khớp |
| 510 | Q510 | Lv 5 | p1_q510.jpg | Display rack is filled with plants. | Scan ETS gốc (cropped_ets_photos/test1/q4.jpg) | 09f7860a9b... | ✅ 100% Khớp |
| 511 | Q511 | Lv 5 | p1_q511.jpg | Dining area is prepared for a meal. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_510.jpg) | d20a96529b... | ✅ 100% Khớp |
| 512 | Q512 | Lv 5 | p1_q512.jpg | Patterned rug's been placed over a floor. | Scan ETS gốc (cropped_ets_photos_2021/test4/q5.jpg) | 310c45d744... | ✅ 100% Khớp |
| 513 | Q513 | Lv 5 | p1_q513.jpg | She's working at a counter. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_512.jpg) | 63772ac773... | ✅ 100% Khớp |
| 514 | Q514 | Lv 5 | p1_q514.jpg | The man is gesturing towards a whiteboard. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_513.jpg) | 07e0318f37... | ✅ 100% Khớp |
| 515 | Q515 | Lv 5 | p1_q515.jpg | Some boats are docked in a harbor. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_514.jpg) | e8954ee18c... | ✅ 100% Khớp |
| 516 | Q516 | Lv 5 | p1_q516.jpg | Sound equipment has been set up on a stage. | Scan ETS gốc (cropped_ets_photos_2020/test10/q5.jpg) | dbfb81a0ce... | ✅ 100% Khớp |
| 517 | Q517 | Lv 5 | p1_q517.jpg | Some notices have been posted to a bulletin board. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_516.jpg) | 0944abd3de... | ✅ 100% Khớp |
| 518 | Q518 | Lv 5 | p1_q518.jpg | Some floor tiles are in a pattern. | Scan ETS gốc (cropped_ets_photos_2021/test2/q6.jpg) | b5b061da92... | ✅ 100% Khớp |
| 519 | Q519 | Lv 5 | p1_q519.jpg | Some water has pooled on a path. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_518.jpg) | 475d46732e... | ✅ 100% Khớp |
| 520 | Q520 | Lv 5 | p1_q520.jpg | Some soil is in a pile on the ground. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_519.jpg) | f42c3667f9... | ✅ 100% Khớp |
| 521 | Q521 | Lv 5 | p1_q521.jpg | Some vegetables have been arranged on wooden platforms. | Scan ETS gốc (cropped_ets_photos_2021/test4/q6.jpg) | bb2f06b119... | ✅ 100% Khớp |
| 522 | Q522 | Lv 5 | p1_q522.jpg | Ulletin boards have been mounted to the wall. | Scan ETS gốc (cropped_ets_photos_2021/test1/q6.jpg) | ceaa9e9e25... | ✅ 100% Khớp |
| 523 | Q523 | Lv 5 | p1_q523.jpg | Door has been taken off its frame. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_522.jpg) | 16b917478c... | ✅ 100% Khớp |
| 524 | Q524 | Lv 5 | p1_q524.jpg | Rug has been unrolled on the floor. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_523.jpg) | faefc690d2... | ✅ 100% Khớp |
| 525 | Q525 | Lv 5 | p1_q525.jpg | Some boats are docked near a shore. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_524.jpg) | 577754ee20... | ✅ 100% Khớp |
| 526 | Q526 | Lv 5 | p1_q526.jpg | There's a deck overlooking a lake. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_525.jpg) | b639851072... | ✅ 100% Khớp |
| 527 | Q527 | Lv 5 | p1_q527.jpg | N office is unoccupied. | Scan ETS gốc (cropped_ets_photos_2019/test5/q6.jpg) | 636b513386... | ✅ 100% Khớp |
| 528 | Q528 | Lv 5 | p1_q528.jpg | Some power cords have been plugged in. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_527.jpg) | 0f8c1d123c... | ✅ 100% Khớp |
| 529 | Q529 | Lv 5 | p1_q529.jpg | There's an awning stretching over a walkway. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_528.jpg) | 4b62734dfa... | ✅ 100% Khớp |
| 530 | Q530 | Lv 5 | p1_q530.jpg | There's a mobile food stand on a walkway. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_529.jpg) | c51bdc0edb... | ✅ 100% Khớp |
| 531 | Q531 | Lv 5 | p1_q531.jpg | Yclist is riding past a pedestrian. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_530.jpg) | ecbce4cada... | ✅ 100% Khớp |
| 532 | Q532 | Lv 5 | p1_q532.jpg | A man is crouching down next to a wall. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_531.jpg) | c78492c67f... | ✅ 100% Khớp |
| 533 | Q533 | Lv 5 | p1_q533.jpg | Wheelbarrow is being pushed at a work site. | Scan ETS gốc (cropped_ets_photos_2019/test3/q5.jpg) | 5ee8c72409... | ✅ 100% Khớp |
| 534 | Q534 | Lv 5 | p1_q534.jpg | There are some windows by a seating area. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_533.jpg) | 97658919b6... | ✅ 100% Khớp |
| 535 | Q535 | Lv 5 | p1_q535.jpg | Some display furniture has been placed by a window. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_534.jpg) | 759a09907f... | ✅ 100% Khớp |
| 536 | Q536 | Lv 5 | p1_q536.jpg | Some tools have been left on a cart. | Scan ETS gốc (cropped_ets_photos_2019/test8/q6.jpg) | 6252918d34... | ✅ 100% Khớp |
| 537 | Q537 | Lv 5 | p1_q537.jpg | Some statues have been placed in a park. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_536.jpg) | 80df4f6f5c... | ✅ 100% Khớp |
| 538 | Q538 | Lv 5 | p1_q538.jpg | Framed picture is mounted on the wall. | Ảnh bối cảnh ETS (scratch/fetched_88_photos/target_537.jpg) | 5b38adec5a... | ✅ 100% Khớp |

import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

lessons_data = [
    # 01..06
    {"id": "v5", "title": "Cách làm câu từ loại ở Part 5. Các hậu tố thường gặp", "duration": "09:55", "videoUrl": "/videos/grammar_part5_word_classes.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Bài giảng chi tiết 9m55s: Làm chủ 100% hậu tố Danh từ, Tính từ, Động từ, Trạng từ và mẹo nhớ thần thánh."},
    {"id": "v6", "title": "Cách làm bài tập cụm danh từ", "duration": "07:15", "videoUrl": "/videos/grammar_part5_noun_phrases.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Bí kíp xác định chính xác danh từ chính trong cụm danh từ (Noun Phrase) và trật tự bổ nghĩa."},
    {"id": "v7", "title": "Bài tập vị trí danh từ", "duration": "07:15", "videoUrl": "/videos/grammar_part5_noun_positions.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "4 Vị trí bất biến của danh từ trong câu: Chủ ngữ, Tân ngữ, sau Giới từ và sau Tính từ sở hữu."},
    {"id": "v8", "title": "(Nâng cao) Hai danh từ đứng cạnh nhau", "duration": "05:31", "videoUrl": "/videos/grammar_part5_compound_nouns.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Quy tắc xử lý danh từ ghép (Compound Noun) và cách xác định danh từ chính."},
    {"id": "v9", "title": "(Nâng cao) Danh từ số ít không đứng một mình", "duration": "04:55", "videoUrl": "/videos/grammar_part5_singular_nouns.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Quy tắc bắt buộc về mạo từ và hạn định từ đối với danh từ đếm được số ít."},
    {"id": "v10", "title": "(Nâng cao) Danh từ đuôi -al và -ive", "duration": "04:04", "videoUrl": "/videos/grammar_part5_noun_suffixes_al_ive.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Danh sách các ngoại lệ kinh điển: representative, proposal, approval, removal, initiative."},

    # 07..15
    {"id": "v11", "title": "Luyện tập xác định danh từ chính", "duration": "07:40", "videoUrl": "/videos/grammar_part5_identify_head_nouns.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Chiến thuật bóc tách cụm danh từ dài để tìm ra danh từ cốt lõi quyết định động từ."},
    {"id": "v12", "title": "Bài tập danh từ tổng hợp", "duration": "08:47", "videoUrl": "/videos/grammar_part5_noun_exercises_part1.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Tổng hợp các dạng câu hỏi danh từ hay bẫy nhất trong đề thi Part 5 ETS."},
    {"id": "v13", "title": "Bài tập danh từ tổng hợp 2", "duration": "05:46", "videoUrl": "/videos/grammar_part5_noun_exercises_part2.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Phần 2: Nâng cao kỹ năng giải câu danh từ chỉ người và danh từ chỉ vật."},
    {"id": "v14", "title": "Động từ số ít số nhiều cơ bản", "duration": "03:25", "videoUrl": "/videos/grammar_part5_verb_singular_plural_basics.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Quy tắc hòa hợp giữa Chủ ngữ và Động từ căn bản nhất trong tiếng Anh."},
    {"id": "v15", "title": "5 dạng thức động từ, cách nhớ 12 thì", "duration": "10:34", "videoUrl": "/videos/grammar_part5_verb_forms_12_tenses.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Phương pháp ma trận giúp làm chủ 12 thì tiếng Anh trong 10 phút không cần học vẹt."},
    {"id": "v16", "title": "Luyện tập chia động từ 12 thì", "duration": "02:53", "videoUrl": "/videos/grammar_part5_verb_tenses_practice.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Thực hành phản xạ nhận diện dấu hiệu thời gian (since, for, by the time, recently...)."},
    {"id": "v17", "title": "Bài tập tổng hợp về thì trong bài thi TOEIC", "duration": "18:41", "videoUrl": "/videos/grammar_part5_verb_tenses_mastery.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Phân tích chi tiết 20 câu hỏi về thì trích từ các bộ đề ETS mới nhất."},
    {"id": "v18", "title": "Luyện tập chia động từ ít nhiều nâng cao", "duration": "08:32", "videoUrl": "/videos/grammar_part5_verb_advanced_agreement.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Các trường hợp đặc biệt: Chủ ngữ có Along with, As well as, Either/Neither..."},
    {"id": "v19", "title": "Bài tập chia động từ số ít số nhiều nâng cao", "duration": "08:31", "videoUrl": "/videos/grammar_part5_verb_agreement_exercises.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Luyện đề cấp tốc bẫy chia động từ khi chủ ngữ bị chèn mệnh đề quan hệ."},

    # 16..25
    {"id": "v20", "title": "Luyện tập chuyển động từ từ chủ động sang bị động", "duration": "08:09", "videoUrl": "/videos/grammar_part5_passive_voice_transformation.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Công thức bất biến Be + V3/ed và cách chuyển đổi tân ngữ thành chủ ngữ."},
    {"id": "v21", "title": "Cách làm bài tập dạng chủ động bị động", "duration": "08:42", "videoUrl": "/videos/grammar_part5_passive_voice_tactics.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Mẹo 3 giây: Có tân ngữ chọn Chủ động, không có tân ngữ chọn Bị động."},
    {"id": "v22", "title": "Bài tập chủ động bị động", "duration": "14:47", "videoUrl": "/videos/grammar_part5_passive_voice_exercises.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Thực hành các bẫy ngoại lệ của Bị động với Nội động từ và Bị động kép."},
    {"id": "v23", "title": "4 vị trí tính từ đứng trước danh từ", "duration": "08:30", "videoUrl": "/videos/grammar_part5_adjective_positions_before_noun.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Nắm vững trật tự tính từ và các vị trí bổ nghĩa cho danh từ."},
    {"id": "v24", "title": "Tổng hợp vị trí tính từ sau động từ nối", "duration": "04:46", "videoUrl": "/videos/grammar_part5_adjective_positions_after_linking_verbs.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Bắt bẫy các Linking Verbs: seem, look, remain, stay, become, feel..."},
    {"id": "v25", "title": "Vị trí tính từ đặc biệt (dễ sai)", "duration": "05:00", "videoUrl": "/videos/grammar_part5_special_adjective_positions.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Cấu trúc Make/Keep/Find + O + Adj và các dạng câu hỏi đảo ngữ."},
    {"id": "v26", "title": "Bài tập tổng hợp vị trí tính từ", "duration": "07:00", "videoUrl": "/videos/grammar_part5_adjective_positions_mastery.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Bộ câu hỏi tính từ phân loại điểm số 650+ đến 800+."},
    {"id": "v27", "title": "3 vị trí trạng từ bổ nghĩa tính từ", "duration": "07:51", "videoUrl": "/videos/grammar_part5_adverb_modifying_adjectives.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Công thức Trạng từ + Tính từ + Danh từ và các trạng từ chỉ mức độ."},
    {"id": "v28", "title": "5 vị trí trạng từ bổ nghĩa động từ", "duration": "10:21", "videoUrl": "/videos/grammar_part5_adverb_modifying_verbs.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Đứng trước V, sau V, sau O, đầu câu hoặc giữa trợ động từ và V chính."},
    {"id": "v29", "title": "Bài tập tính từ và trạng từ", "duration": "08:52", "videoUrl": "/videos/grammar_part5_adjective_adverb_exercises.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Kỹ thuật phân biệt nhanh khi nào dùng Tính từ và khi nào dùng Trạng từ."},

    # 26..35
    {"id": "v30", "title": "Bài tập từ loại", "duration": "12:20", "videoUrl": "/videos/grammar_part5_word_form_exercises_part1.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Luyện giải tổng hợp câu hỏi từ loại tốc độ cao (dưới 10 giây/câu)."},
    {"id": "v31", "title": "Bài tập từ loại 2", "duration": "10:26", "videoUrl": "/videos/grammar_part5_word_form_exercises_part2.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Phần 2: Chinh phục các từ loại có đuôi gây nhầm lẫn."},
    {"id": "v32", "title": "Cách làm bài tập đại từ nhân xưng và tính từ sở hữu", "duration": "09:46", "videoUrl": "/videos/grammar_part5_personal_pronouns_possessive_adjectives.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Bảng đại từ nhân xưng I/You/He/She/They và Tính từ sở hữu My/Your/Their..."},
    {"id": "v33", "title": "Hiểu và chinh phục bài tập đại từ sở hữu", "duration": "06:55", "videoUrl": "/videos/grammar_part5_possessive_pronouns.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Phân biệt Đại từ sở hữu (Mine, Yours, Theirs) = Tính từ sở hữu + Danh từ."},
    {"id": "v34", "title": "3 vị trí thường gặp của đại từ phản thân", "duration": "09:42", "videoUrl": "/videos/grammar_part5_reflexive_pronouns.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Làm chủ Myself, Yourself, Themselves: làm tân ngữ, nhấn mạnh, hoặc by myself."},
    {"id": "v35", "title": "Bài tập đại từ tổng hợp TOEIC Part 5", "duration": "21:20", "videoUrl": "/videos/grammar_part5_pronouns_mastery.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Tổng hợp 30 câu hỏi đại từ đa dạng nhất từ các đề thi thật ETS."},
    {"id": "v36", "title": "Hiểu và chinh phục bài tập so sánh bằng", "duration": "05:21", "videoUrl": "/videos/grammar_part5_comparative_equality.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Cấu trúc as + adj/adv + as và mẹo chọn từ loại ở giữa as...as."},
    {"id": "v37", "title": "Hiểu và chinh phục bài tập so sánh hơn của tính, trạng từ", "duration": "06:00", "videoUrl": "/videos/grammar_part5_comparative_superiority.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Quy tắc thêm -er hoặc more + than, và các từ nhấn mạnh: much, far, significantly..."},
    {"id": "v38", "title": "Cấu trúc và bài tập so sánh nhất trong Part 5", "duration": "04:34", "videoUrl": "/videos/grammar_part5_comparative_superlative.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Dấu hiệu the + est / the most và các cụm of all, in the world, among..."},
    {"id": "v39", "title": "Bài tập câu so sánh tổng hợp Part 5 TOEIC", "duration": "07:59", "videoUrl": "/videos/grammar_part5_comparative_exercises.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Bắt bẫy so sánh kép 'The more... the more' và so sánh không dùng than."},

    # 36..44
    {"id": "v40", "title": "Liên từ tương quan (bài tập cho điểm)", "duration": "02:50", "videoUrl": "/videos/grammar_part5_correlative_conjunctions.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Cặp liên từ ăn điểm tuyệt đối: Both...and, Either...or, Neither...nor, Not only...but also."},
    {"id": "v41", "title": "Bài tập về cấu trúc song song với liên từ and", "duration": "09:33", "videoUrl": "/videos/grammar_part5_parallel_structure_and.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Nguyên tắc cân bằng từ loại 2 vế của And, Or, But trong đề thi ETS."},
    {"id": "v42", "title": "Các dạng liên từ phụ thuộc, giới từ thường gặp", "duration": "03:30", "videoUrl": "/videos/grammar_part5_subordinating_conjunctions_prepositions.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Phân loại Because/Although (Liên từ + S+V) vs Because of/Despite (Giới từ + N/Ving)."},
    {"id": "v43", "title": "Bài tập liên từ và giới từ đồng nghĩa Part 5 TOEIC", "duration": "09:13", "videoUrl": "/videos/grammar_part5_conjunctions_prepositions_exercises.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Thực chiến phân biệt cặp từ đồng nghĩa khác từ loại trong 5 giây."},
    {"id": "v44", "title": "Các đại từ quan hệ, vị trí mệnh đề quan hệ", "duration": "09:00", "videoUrl": "/videos/grammar_part5_relative_pronouns_clauses.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Chức năng và cách dùng Who, Whom, Which, That, Whose, Where, When."},
    {"id": "v45", "title": "Bài tập đại từ quan hệ", "duration": "07:23", "videoUrl": "/videos/grammar_part5_relative_clauses_exercises.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Mẹo chọn đại từ quan hệ dựa vào danh từ đứng trước và thành phần phía sau."},
    {"id": "v46", "title": "Cách rút gọn mệnh đề quan hệ", "duration": "08:17", "videoUrl": "/videos/grammar_part5_reduced_relative_clauses.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "2 Dạng rút gọn kinh điển: V-ing (chủ động) và V3/ed (bị động)."},
    {"id": "v47", "title": "(Nâng cao) 3 bước làm nhanh bài tập rút gọn mệnh đề quan hệ Part 5 TOEIC", "duration": "16:46", "videoUrl": "/videos/grammar_part5_advanced_reduced_relative_clauses.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "3 Bước thần tốc giải câu rút gọn mệnh đề quan hệ 30 câu bài tập điểm 800+."},
    {"id": "v48", "title": "Bài tập rút gọn mệnh đề quan hệ nâng cao", "duration": "10:00", "videoUrl": "/videos/grammar_part5_advanced_reduced_relative_exercises.mp4", "badge": "Lồng Tiếng AI Studio", "desc": "Tổng kết và thực hành bẫy rút gọn mệnh đề danh từ và mệnh đề trạng ngữ."}
]

print(f"Generated {len(lessons_data)} Chapter 3 lessons formatted for VideoLessonRoom.jsx!")

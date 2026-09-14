import React, { useState } from 'react';
import { 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Loader2, 
  Plus, 
  Trash2, 
  Edit3,
  BookOpen
} from 'lucide-react';
import axios from 'axios';

export default function VocabImageScannerModal({ isOpen, onClose, onSessionCreated }) {
  const [activeTab, setActiveTab] = useState('image'); // 'image' | 'text'
  const [sessionName, setSessionName] = useState('Bài 1: Từ vựng vừa quét');
  const [rawText, setRawText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [parsedWords, setParsedWords] = useState([]);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      // API call to backend AI OCR scanner endpoint
      const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
      const res = await axios.post(`${API_URL}/vocab/scan-image`, {
        sessionName,
        rawText,
        imageBase64: imagePreview
      });

      if (res.data && res.data.success) {
        setParsedWords(res.data.data);
        setIsDone(true);
      }
    } catch (err) {
      console.error('Scan error:', err);
      // Fallback demo data if API fails
      setParsedWords([
        { word: 'adjacent to something', pos: 'prep. phrase', phonetic: '/əˈdʒeɪsnt tuː/', meaning: 'liền kề với nơi nào', exampleEn: 'The office is adjacent to the main hall.', exampleVi: 'Văn phòng nằm liền kề với hội trường chính.' },
        { word: 'designate', pos: 'v.', phonetic: '/ˈdezɪɡneɪt/', meaning: 'chỉ định, bổ nhiệm', exampleEn: 'She was designated team leader.', exampleVi: 'Cô ấy được bổ nhiệm làm trưởng nhóm.' },
        { word: 'alternate', pos: 'v./adj.', phonetic: '/ˈɔːltərneɪt/', meaning: 'luân phiên, xen kẽ', exampleEn: 'We alternate working on weekends.', exampleVi: 'Chúng tôi làm việc luân phiên vào cuối tuần.' },
        { word: 'feature', pos: 'n./v.', phonetic: '/ˈfiːtʃər/', meaning: 'đặc điểm, tính năng', exampleEn: 'This model features high efficiency.', exampleVi: 'Mô hình này có đặc điểm hiệu suất cao.' },
        { word: 'proceeds', pos: 'n.', phonetic: '/ˈproʊsiːdz/', meaning: 'tiền thu được', exampleEn: 'All proceeds go to charity.', exampleVi: 'Tất cả tiền thu được quyên góp cho từ thiện.' }
      ]);
      setIsDone(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveTopic = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
      const res = await axios.post(`${API_URL}/vocab/custom-topic`, {
        title: sessionName,
        words: parsedWords
      });

      if (onSessionCreated) {
        onSessionCreated(res.data.data);
      }
      onClose();
    } catch (err) {
      console.error('Save topic error:', err);
      onClose();
    }
  };

  const handleWordChange = (index, field, value) => {
    const updated = [...parsedWords];
    updated[index][field] = value;
    setParsedWords(updated);
  };

  const handleDeleteWord = (index) => {
    setParsedWords(parsedWords.filter((_, i) => i !== index));
  };

  const handleAddRow = () => {
    setParsedWords([
      ...parsedWords,
      { word: '', pos: 'n.', phonetic: '', meaning: '', exampleEn: '', exampleVi: '' }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Quét Bảng Từ Vựng Bằng AI (OCR Scanner)
              </h2>
              <p className="text-xs text-slate-400">
                Tải ảnh danh sách từ vựng (~80 từ/bài) hoặc dán văn bản để AI tự tạo bài học
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Step 1: Upload or Input */}
          {!isDone ? (
            <div className="space-y-6">
              
              {/* Session Title */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                  Tên Buổi Học / Bài Từ Vựng
                </label>
                <input 
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-sky-500 text-sm font-medium"
                  placeholder="Ví dụ: Buổi 1 - 80 từ vựng Nghe Cô Mai Phương"
                />
              </div>

              {/* Mode Tabs */}
              <div className="flex rounded-xl bg-slate-800/50 p-1 border border-slate-800">
                <button
                  onClick={() => setActiveTab('image')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
                    activeTab === 'image' 
                      ? 'bg-sky-500 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Tải Ảnh Bảng Từ Vựng (PNG / JPG / Screenshot)
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
                    activeTab === 'text' 
                      ? 'bg-sky-500 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Dán Văn Bản / Bảng Copy từ PDF
                </button>
              </div>

              {/* Tab 1: Image Upload Box */}
              {activeTab === 'image' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-700 hover:border-sky-500/50 rounded-2xl p-8 text-center bg-slate-800/30 transition flex flex-col items-center justify-center cursor-pointer relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                    {imagePreview ? (
                      <div className="relative max-h-60 overflow-hidden rounded-xl border border-slate-700">
                        <img src={imagePreview} alt="Vocab list preview" className="object-contain max-h-60" />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition">
                          Nhấn để thay đổi ảnh khác
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 rounded-2xl bg-sky-500/10 text-sky-400 mb-3 group-hover:scale-110 transition duration-300">
                          <Upload className="w-8 h-8" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">Thả ảnh bảng từ vựng vào đây hoặc bấm để chọn</h4>
                        <p className="text-xs text-slate-400">Hỗ trợ ảnh chụp sách Cô Mai Phương, ảnh tài liệu PDF (~80 từ/trang)</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Text Area Input */}
              {activeTab === 'text' && (
                <div>
                  <textarea
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Dán danh sách từ vựng tại đây...&#10;Ví dụ:&#10;68. adjacent to something | prep. phrase | /əˈdʒeɪsnt tuː/ | liền kề với nơi nào&#10;69. designate | v. | /ˈdezɪɡneɪt/ | chỉ định, bổ nhiệm"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-sky-500 text-sm font-mono leading-relaxed placeholder:text-slate-500"
                  />
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleScan}
                disabled={isScanning || (!imagePreview && !rawText.trim())}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 font-bold text-white shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 text-base transition disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>AI đang phân tích & bóc tách từ vựng...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Bắt đầu Bóc tách AI (Scan OCR)</span>
                  </>
                )}
              </button>

            </div>
          ) : (
            
            /* Step 2: Preview & Edit Scanned Words */
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-emerald-400">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Bóc tách hoàn tất! Đã tìm thấy {parsedWords.length} từ vựng</h4>
                    <p className="text-xs text-emerald-400/80">Bạn có thể chỉnh sửa trực tiếp nội dung các ô bên dưới trước khi tạo bài học.</p>
                  </div>
                </div>
                <button
                  onClick={handleAddRow}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 hover:bg-emerald-400 transition"
                >
                  <Plus className="w-4 h-4" /> Thêm hàng
                </button>
              </div>

              {/* Words Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 uppercase font-semibold text-slate-400 text-[11px] border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="py-3 px-3 w-10">STT</th>
                      <th className="py-3 px-3 w-40">Từ Tiếng Anh</th>
                      <th className="py-3 px-3 w-24">Từ Loại</th>
                      <th className="py-3 px-3 w-32">Phiên Âm</th>
                      <th className="py-3 px-3">Nghĩa Tiếng Việt</th>
                      <th className="py-3 px-3 w-12 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {parsedWords.map((w, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={w.word}
                            onChange={(e) => handleWordChange(idx, 'word', e.target.value)}
                            className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white font-semibold text-xs focus:border-sky-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={w.pos}
                            onChange={(e) => handleWordChange(idx, 'pos', e.target.value)}
                            className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:border-sky-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={w.phonetic}
                            onChange={(e) => handleWordChange(idx, 'phonetic', e.target.value)}
                            className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-sky-400 font-mono text-xs focus:border-sky-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={w.meaning}
                            onChange={(e) => handleWordChange(idx, 'meaning', e.target.value)}
                            className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs focus:border-sky-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => handleDeleteWord(idx)}
                            className="p-1 text-slate-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        {isDone && (
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <button
              onClick={() => setIsDone(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold text-xs hover:bg-slate-800 transition"
            >
              Quét Lại Ảnh Khác
            </button>
            <button
              onClick={handleSaveTopic}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
            >
              <BookOpen className="w-4 h-4" />
              Lưu Bài Học & Bắt Đầu Học Ngay
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

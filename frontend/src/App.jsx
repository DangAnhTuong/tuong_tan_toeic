import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import UserHub from './pages/UserHub';
import ListeningDashboard from './pages/ListeningDashboard';
import ListeningPractice from './pages/ListeningPractice';
import ListeningDictation from './pages/ListeningDictation';
import LevelPracticeRoom from './pages/LevelPracticeRoom';
import ReadingDashboard from './pages/ReadingDashboard';
import ReadingPractice from './pages/ReadingPractice';
import GrammarLesson from './pages/GrammarLesson';
import BilingualReader from './pages/BilingualReader';
import WritingDashboard from './pages/WritingDashboard';
import WritingPart1Practice from './pages/WritingPart1Practice';
import WritingPart2Practice from './pages/WritingPart2Practice';
import VocabularyDashboard from './pages/VocabularyDashboard';
import VocabularyPractice from './pages/VocabularyPractice';
import MockTestDashboard from './pages/MockTestDashboard';
import MockTestRoom from './pages/MockTestRoom';
import VideoLessonRoom from './pages/VideoLessonRoom';
import Leaderboard from './pages/Leaderboard';
import ErrorNotebook from './pages/ErrorNotebook';
import SpeakingDashboard from './pages/SpeakingDashboard';
import SpeakingPractice from './pages/SpeakingPractice';
import AdminDashboard from './pages/AdminDashboard';
import BattleRoom from './pages/BattleRoom';
import BlogDashboard from './pages/BlogDashboard';
import BlogDetail from './pages/BlogDetail';
import NotFound from './pages/NotFound';
import FloatingSocialChat from './components/FloatingSocialChat';
import MobileBottomNav from './components/MobileBottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import { DictionaryProvider } from './context/DictionaryContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <DictionaryProvider>
            <ErrorBoundary>
              <AuthModal />
              <FloatingSocialChat />
              <MobileBottomNav onOpenMenu={() => window.dispatchEvent(new CustomEvent('open_mobile_menu'))} />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/sign_up" element={<SignUp />} />
                <Route path="/signup" element={<Navigate to="/sign_up" replace />} />
                <Route path="/register" element={<Navigate to="/sign_up" replace />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/hub" element={<ProtectedRoute><UserHub /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                
                {/* Listening Routes */}
                <Route path="/listen" element={<ListeningDashboard />} />
                <Route path="/listen/practice/:id" element={<ProtectedRoute><ListeningPractice /></ProtectedRoute>} />
                <Route path="/listen/dictation" element={<ProtectedRoute><ListeningDictation /></ProtectedRoute>} />
                <Route path="/listen/dictation/:id" element={<ProtectedRoute><ListeningDictation /></ProtectedRoute>} />
                <Route path="/listen/level-practice" element={<ProtectedRoute><LevelPracticeRoom /></ProtectedRoute>} />

                {/* Reading Routes */}
                <Route path="/read" element={<ReadingDashboard />} />
                <Route path="/read/practice/:id" element={<ProtectedRoute><ReadingPractice /></ProtectedRoute>} />
                <Route path="/grammar/:id" element={<ProtectedRoute><GrammarLesson /></ProtectedRoute>} />
                <Route path="/reading/article/:id" element={<ProtectedRoute><BilingualReader /></ProtectedRoute>} />

                {/* Writing Routes */}
                <Route path="/write" element={<WritingDashboard />} />
                <Route path="/write/part1/:id" element={<ProtectedRoute><WritingPart1Practice /></ProtectedRoute>} />
                <Route path="/write/part2/:id" element={<ProtectedRoute><WritingPart2Practice /></ProtectedRoute>} />

                {/* Speaking Routes */}
                <Route path="/speaking" element={<SpeakingDashboard />} />
                <Route path="/speaking/practice/:partId" element={<ProtectedRoute><SpeakingPractice /></ProtectedRoute>} />
                <Route path="/speak" element={<Navigate to="/speaking" replace />} />

                {/* Error Notebook / Sổ Tay Câu Sai */}
                <Route path="/mistakes" element={<ProtectedRoute><ErrorNotebook /></ProtectedRoute>} />
                <Route path="/notebook" element={<Navigate to="/mistakes" replace />} />

                {/* Vocabulary Routes */}
                <Route path="/vocab" element={<Navigate to="/vocabulary" replace />} />
                <Route path="/vocabulary" element={<VocabularyDashboard />} />
                <Route path="/vocabulary/review" element={<ProtectedRoute><VocabularyPractice /></ProtectedRoute>} />
                <Route path="/vocabulary/learn/:id" element={<ProtectedRoute><VocabularyPractice /></ProtectedRoute>} />

                {/* Full Mock Test Routes */}
                <Route path="/mock_test" element={<Navigate to="/tests" replace />} />
                <Route path="/tests" element={<MockTestDashboard />} />
                <Route path="/tests/room/:id" element={<ProtectedRoute><MockTestRoom /></ProtectedRoute>} />

                {/* Video Learning Routes */}
                <Route path="/video" element={<VideoLessonRoom />} />

                {/* Leaderboard Route */}
                <Route path="/leaderboard" element={<Leaderboard />} />

                {/* 1v1 Battle Arena Route */}
                <Route path="/battle" element={<ProtectedRoute><BattleRoom /></ProtectedRoute>} />

                {/* Blog & Articles Routes */}
                <Route path="/blog" element={<BlogDashboard />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/articles" element={<Navigate to="/blog" replace />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </DictionaryProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

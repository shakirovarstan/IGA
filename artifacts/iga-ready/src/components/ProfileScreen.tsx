import React, { useState } from 'react';
import { UserProfile } from '../hooks/useProfile';
import { Language, UserProgress } from '../types';
import {
  Bell,
  Globe,
  LogOut,
  ChevronRight,
  Flame,
  Trophy
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ProfileScreenProps {
  profile: UserProfile;
  lang: Language;
  progress: UserProgress;
  onLogout: () => void;
  setLang: (lang: Language) => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export function ProfileScreen({
  profile,
  lang,
  progress,
  onLogout,
  setLang,
  onUpdateProfile
}: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editSurname, setEditSurname] = useState(profile.surname);
  const [editAvatar, setEditAvatar] = useState(
    profile.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.name}`
  );

  const totalCorrect = Object.values(progress.topicStats).reduce(
    (acc, stat) => acc + stat.correct,
    0
  );

  const totalAnswered = Object.values(progress.topicStats).reduce(
    (acc, stat) => acc + stat.total,
    0
  );

  const xp = totalCorrect * 15;
  const accuracy =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const topicsCompleted = (progress.studiedTopics || []).length;
  const streak = progress.streak || 0;

  const rawFriends = profile.friends || [];

  const fakeNames = [
    'Амина',
    'Белек',
    'Дастан',
    'Amina',
    'Felix',
    'Амина С.',
    'Нурик Ж.',
    'Айбек М.',
    'Жибек Т.',
    'Улан',
    'Ulan'
  ];

  const filteredFriends = rawFriends.filter(
    f => !fakeNames.some(fake => f.name.includes(fake))
  );

  const getRankData = (xpValue: number) => {
    if (xpValue >= 2000)
      return {
        title: lang === 'ru' ? 'Гуру' : 'Гуру',
        bg: 'bg-indigo-600',
        text: 'text-white',
        icon: '👑'
      };

    if (xpValue >= 1000)
      return {
        title: lang === 'ru' ? 'Мастер' : 'Мастер',
        bg: 'bg-[#84fb42]',
        text: 'text-[#2d7100]',
        icon: '🌟'
      };

    if (xpValue >= 500)
      return {
        title: lang === 'ru' ? 'Ученик' : 'Окуучу',
        bg: 'bg-[#ffda44]',
        text: 'text-[#8c6b00]',
        icon: '📚'
      };

    return {
      title: lang === 'ru' ? 'Новичок' : 'Жаңы баштаган',
      bg: 'bg-[#e2e8f0]',
      text: 'text-[#475569]',
      icon: '🌱'
    };
  };

  const rank = getRankData(xp);

  const getTitles = () => {
    const titles = [];

    if (accuracy > 90 && totalAnswered > 50)
      titles.push(lang === 'ru' ? 'Снайпер' : 'Мергенчи');

    if (streak >= 7)
      titles.push(lang === 'ru' ? 'Стахановец' : 'Жигердүү');

    if (topicsCompleted >= 20)
      titles.push(lang === 'ru' ? 'Всезнайка' : 'Билгич');

    if (xp >= 2000)
      titles.push(lang === 'ru' ? 'Мудрец' : 'Акылман');

    if (progress.mistakes.length === 0 && totalAnswered > 20)
      titles.push(lang === 'ru' ? 'Отличник' : 'Мыкты');

    return titles;
  };

  const activeTitles = getTitles();

  const handleInvite = () => {
    const link = `${window.location.origin}/invite?ref=${encodeURIComponent(
      profile.name
    )}`;

    if (navigator.share) {
      navigator
        .share({ title: 'Присоединяйся к IGA Prep!', url: link })
        .catch(() => navigator.clipboard.writeText(link));
    } else {
      navigator.clipboard.writeText(link);
    }
  };

  const saveProfile = () => {
    onUpdateProfile({
      ...profile,
      name: editName,
      surname: editSurname,
      avatar: editAvatar
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex justify-center">
      <div className="w-full max-w-md pb-24 pt-8 px-5 flex flex-col">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 rounded-full border-[3px] border-[#1cb0f6] p-1 mb-4">
            <img
              src={editAvatar}
              className="w-full h-full rounded-full object-cover"
              alt="avatar"
            />
          </div>

          <div
            className={`px-3 py-1 rounded-lg font-black text-[11px] ${rank.bg} ${rank.text}`}
          >
            {rank.icon} {rank.title}
          </div>

          <h1 className="text-2xl font-bold mt-3">
            {profile.name} {profile.surname}
          </h1>

          <p className="text-sm text-[var(--text-muted)]">
            {lang === 'ru' ? `Класс: ${profile.grade}` : profile.grade}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white p-4 rounded-xl border">
            <div className="text-xl font-black">{xp}</div>
            <div className="text-xs">XP</div>
          </div>

          <div className="bg-white p-4 rounded-xl border">
            <div className="text-xl font-black">{accuracy}%</div>
            <div className="text-xs">Accuracy</div>
          </div>
        </div>

        {/* Settings (FIXED BLOCK) */}
        <div>
          <h2 className="text-xl font-bold mb-4">
            {lang === 'ru' ? 'Настройки' : 'Жөндөөлөр'}
          </h2>

          <div className="flex items-center justify-between p-4 bg-white rounded-xl border mb-2">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span>{lang === 'ru' ? 'Язык' : 'Тил'}</span>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setLang('ru')}>RU</button>
              <button onClick={() => setLang('ky')}>KY</button>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="w-full p-4 bg-white rounded-xl border flex justify-between"
          >
            {lang === 'ru' ? 'Изменить профиль' : 'Профилди өзгөртүү'}
            <ChevronRight />
          </button>

          <button
            onClick={onLogout}
            className="w-full p-4 bg-white rounded-xl border flex justify-between text-red-500 mt-2"
          >
            {lang === 'ru' ? 'Выйти' : 'Чыгуу'}
            <LogOut />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">
              {lang === 'ru' ? 'Редактировать' : 'Түзөтүү'}
            </h3>

            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full p-3 border rounded mb-2"
              placeholder="Name"
            />

            <input
              value={editSurname}
              onChange={e => setEditSurname(e.target.value)}
              className="w-full p-3 border rounded mb-4"
              placeholder="Surname"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 p-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={saveProfile}
                className="flex-1 p-2 bg-blue-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
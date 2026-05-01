import React, { useState } from 'react';
import { UserProfile } from '../hooks/useProfile';
import { Language, UserProgress } from '../types';
import { Bell, Globe, LogOut, ChevronRight, Flame, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProfileScreenProps {
  profile: UserProfile;
  lang: Language;
  progress: UserProgress;
  onLogout: () => void;
  setLang: (lang: Language) => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export function ProfileScreen({ profile, lang, progress, onLogout, setLang, onUpdateProfile }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editSurname, setEditSurname] = useState(profile.surname);
  const [editAvatar, setEditAvatar] = useState(profile.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.name}`);
  
  const totalCorrect = Object.values(progress.topicStats).reduce((acc, stat) => acc + stat.correct, 0);
  const totalAnswered = Object.values(progress.topicStats).reduce((acc, stat) => acc + stat.total, 0);
  const xp = totalCorrect * 15; // Increased XP per correct answer for better feeling
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const topicsCompleted = (progress.studiedTopics || []).length;
  const streak = progress.streak || 0;

  const rawFriends = profile.friends || [];
  const fakeNames = ['Амина', 'Белек', 'Дастан', 'Amina', 'Felix', 'Амина С.', 'Нурик Ж.', 'Айбек М.', 'Жибек Т.', 'Улан', 'Ulan'];
  const filteredFriends = rawFriends.filter(f => !fakeNames.some(fake => f.name.includes(fake)));

 
  const getRankData = (xpValue: number) => {
    if (xpValue >= 2000) return { title: lang === 'ru' ? 'Гуру' : 'Гуру', bg: 'bg-indigo-600', text: 'text-white', icon: '👑' };
    if (xpValue >= 1000) return { title: lang === 'ru' ? 'Мастер' : 'Мастер', bg: 'bg-[#84fb42]', text: 'text-[#2d7100]', icon: '🌟' };
    if (xpValue >= 500) return { title: lang === 'ru' ? 'Ученик' : 'Окуучу', bg: 'bg-[#ffda44]', text: 'text-[#8c6b00]', icon: '📚' };
    return { title: lang === 'ru' ? 'Новичок' : 'Жаңы баштаган', bg: 'bg-[#e2e8f0]', text: 'text-[#475569]', icon: '🌱' };
  };
  const rank = getRankData(xp);

  // Real achievements/rewards as titles
  const getTitles = () => {
    const titles = [];
    if (accuracy > 90 && totalAnswered > 50) titles.push(lang === 'ru' ? 'Снайпер' : 'Мергенчи');
    if (streak >= 7) titles.push(lang === 'ru' ? 'Стахановец' : 'Жигердүү');
    if (topicsCompleted >= 20) titles.push(lang === 'ru' ? 'Всезнайка' : 'Билгич');
    if (xp >= 2000) titles.push(lang === 'ru' ? 'Мудрец' : 'Акылман');
    if (progress.mistakes.length === 0 && totalAnswered > 20) titles.push(lang === 'ru' ? 'Отличник' : 'Мыкты');
    return titles;
  };
  const activeTitles = getTitles();

  const handleInvite = () => {
    const link = `${window.location.origin}/invite?ref=${encodeURIComponent(profile.name)}`;
    if (navigator.share) {
      navigator.share({ title: 'Присоединяйся к IGA Prep!', url: link }).catch(() => {
        navigator.clipboard.writeText(link);
        alert(lang === 'ru' ? 'Ссылка скопирована!' : 'Шилтеме көчүрүлдү!');
      });
    } else {
      navigator.clipboard.writeText(link);
      alert(lang === 'ru' ? 'Ссылка скопирована!' : 'Шилтеме көчүрүлдү!');
    }
  };

  const saveProfile = () => {
    onUpdateProfile({ ...profile, name: editName, surname: editSurname, avatar: editAvatar });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex justify-center">
      <div className="w-full max-w-md pb-24 relative flex flex-col pt-8 px-5">
        
         <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full border-[3px] border-[#1cb0f6] p-1">
               <div className="w-full h-full rounded-full bg-slate-200 overflow-hidden">
                 <img src={profile.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.name}`} alt="Avatar" className="w-full h-full object-cover" />
               </div>
            </div>
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 ${rank.bg} ${rank.text} border-2 border-white px-3 py-1 rounded-lg font-black text-[11px] uppercase tracking-wider shadow-sm whitespace-nowrap`}>
              {rank.icon} {rank.title}
            </div>
          </div>
          
          <h1 className="text-2xl font-serif font-bold text-[var(--text-main)] mb-1">
            {profile.name} {profile.surname}
          </h1>
          
          {activeTitles.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mb-2">
              {activeTitles.map((t, i) => (
                <span key={i} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-blue-50 text-[#006590] rounded-full border border-blue-100 shadow-sm">
                  {t}
                </span>
              ))}
            </div>
          )}
          
          <p className="text-[var(--text-muted)] font-medium text-sm">
            {lang === 'ru' ? `Класс: ${profile.grade}` : `${profile.grade}-класс`}
          </p>
          
          <div className="flex gap-3 mt-4">
            <div className="flex items-center gap-1.5 bg-white border border-[#e3e2e2] px-4 py-1.5 rounded-xl shadow-sm">
               <Flame className="w-4 h-4 text-[#f18e00]" />
               <span className="font-bold text-sm">{streak}</span>
               <span className="text-[10px] uppercase font-black text-[var(--text-muted)] mt-0.5 ml-0.5">{lang === 'ru' ? 'дней' : 'күн'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-[#e3e2e2] px-4 py-1.5 rounded-xl shadow-sm">
               <Trophy className="w-4 h-4 text-[#1cb0f6]" />
               <span className="font-bold text-sm">{accuracy > 90 ? 'ТОП 1%' : accuracy > 70 ? 'ТОП 5%' : 'ТОП 20%'}</span>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mb-8">
          <h2 className="text-lg font-black text-[var(--text-main)] uppercase tracking-wider mb-4 ml-1">
            {lang === 'ru' ? 'Успеваемость' : 'Статистика'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-[1.5rem] p-5 border border-[#e3e2e2] shadow-[0_4px_12px_rgba(0,0,0,0.03)] relative overflow-hidden group hover:border-[#1cb0f6]/30 transition-all">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-50 rounded-full opacity-50 transition-transform group-hover:scale-150" />
              <div className="text-3xl font-black text-[#006590] mb-1">{xp}</div>
              <div className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.1em]">XP</div>
            </div>
            
            <div className="bg-white rounded-[1.5rem] p-5 border border-[#e3e2e2] shadow-[0_4px_12px_rgba(0,0,0,0.03)] relative overflow-hidden group hover:border-[#84fb42]/30 transition-all">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-50 rounded-full opacity-50 transition-transform group-hover:scale-150" />
              <div className="text-3xl font-black text-[#2b6c00] mb-1">{accuracy}%</div>
              <div className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.1em]">{lang === 'ru' ? 'Точность' : 'Тактык'}</div>
            </div>

            <div className="col-span-2 bg-white rounded-[1.5rem] p-5 border border-[#e3e2e2] shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-between">
               <div className="flex-1">
                  <div className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.1em] mb-3">{lang === 'ru' ? 'Освоено тем' : 'Өздөштүрүлгөн темалар'}</div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-400 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (topicsCompleted / 40) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 font-black text-[10px] text-slate-400">
                    <span>{topicsCompleted} / 40</span>
                    <span>{Math.round((topicsCompleted / 40) * 100)}%</span>
                  </div>
               </div>
               <div className="ml-6 w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 font-bold text-lg">
                 🔥
               </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
           <div className="flex justify-between items-end mb-4">
             <h2 className="text-[22px] font-serif font-bold text-[var(--text-main)]">
               {lang === 'ru' ? 'Друзья' : 'Достор'}
             </h2>
             
           </div>
           
           <div className="bg-white rounded-[1.5rem] border border-[#e3e2e2] shadow-sm p-2 mb-4 overflow-hidden">
              {/* Current user */}
              <div className="flex items-center gap-3 p-3 bg-[#f4f3f3] rounded-2xl m-1 border border-white">
                 <div className={cn("w-9 h-9 rounded-full border-2 border-white flex items-center justify-center shrink-0 shadow-sm text-[12px]", rank.bg, rank.text)}>
                   {rank.icon}
                 </div>
                 <div className="w-11 h-11 rounded-full border-2 border-white bg-slate-200 overflow-hidden shrink-0 shadow-sm">
                    <img src={profile.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.name}`} alt="You" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1">
                   <div className="font-bold text-[16px] text-[#001f29] leading-tight">{lang === 'ru' ? 'Вы' : 'Сиз'}</div>
                   <div className="text-[10px] uppercase font-black text-slate-400 mt-0.5 tracking-wider">{rank.title}</div>
                 </div>
                 <div className="text-right pr-2">
                   <div className="font-black text-[#006590] text-lg">{xp}</div>
                   <div className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-tighter">XP</div>
                 </div>
              </div>
              
              <div className="flex justify-between items-center mb-4 px-3">
                <h3 className="font-bold text-[18px] text-[#001f29] font-serif">{lang === 'ru' ? 'Друзья' : 'Достор'}</h3>
                <span className="text-[12px] font-bold text-[var(--primary)] bg-blue-50/50 px-3 py-1 rounded-full">{filteredFriends.length}</span>
              </div>
              
              <div className="h-[1px] bg-slate-100 mx-3 my-1" />
              
              {/* Friends list */}
              {filteredFriends.length === 0 ? (
                <div className="py-12 px-6 text-center">
                   <p className="text-[var(--text-muted)] text-sm font-medium italic opacity-60">
                     {lang === 'ru' ? 'У вас пока нет друзей.' : 'Азырынча досторуңуз жок.'}
                   </p>
                   <p className="text-[10px] uppercase font-black text-slate-300 mt-2 tracking-widest leading-relaxed px-4">
                     {lang === 'ru' ? 'Пригласите одноклассников по ссылке' : 'Шилтеме аркылуу классташтарыңызды чакырыңыз'}
                   </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {filteredFriends.map((friend, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 group transition-colors hover:bg-slate-50/50">
                       <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 font-black flex items-center justify-center shrink-0 text-[11px]">{index + 1}</div>
                       <div className="w-11 h-11 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.name}`} alt={friend.name} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1">
                         <div className="font-bold text-[15px] text-[#001f29] capitalize">{friend.name} {friend.surname}</div>
                         <div className={cn("text-[10px] font-bold uppercase tracking-tight mt-0.5", friend.isPending ? "text-orange-400" : "text-slate-400")}>
                           {friend.isPending ? (lang === 'ru' ? 'Ожидание активации...' : 'Активация күтүлүүдө...') : friend.grade}
                         </div>
                       </div>
                       <div className="text-right pr-2">
                         <div className="font-bold text-[#006590] text-base">{friend.xp || 0}</div>
                         <div className="text-[8px] font-black uppercase text-[var(--text-muted)] tracking-tighter">XP</div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
           
           <button 
             onClick={handleInvite} 
             className="w-full bg-blue-50 border-2 border-dashed border-[#1cb0f6] text-[#006590] rounded-[1.5rem] py-4 font-black uppercase text-[11px] tracking-widest active:scale-95 transition-all shadow-sm hover:bg-blue-100 group"
           >
             <span className="flex items-center justify-center gap-2">
                <Globe className="w-4 h-4 group-hover:animate-bounce" />
                {lang === 'ru' ? 'Позвать друзей' : 'Досторду чакыруу'}
             </span>
           </button>
        </div>

        <div>
          <h2 className="text-[22px] font-serif font-bold text-[var(--text-main)] mb-4">
            {lang === 'ru' ? 'Настройки' : 'Жөндөөлөр'}
          </h2>
          <
            <div className="flex items-center gap-4 p-5">
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-[#f18e00] shrink-0">
                 <Globe className="w-5 h-5" />
              </div>
               <div className="flex-1">
                 <div className="font-bold text-[15px]">{lang === 'ru' ? 'Язык интерфейса' : 'Интерфейс тили'}</div>
                 <div className="text-[12px] text-[var(--text-muted)] font-medium">Выберите удобный язык</div>
               </div>
               <div className="flex bg-[#eeeeed] p-1 rounded-xl">
                 <button onClick={() => setLang('ru')} className={cn("px-3 py-1 font-bold text-xs rounded-lg transition-colors", lang === 'ru' ? 'bg-white text-[#006590] shadow-sm' : 'text-slate-500')}>RU</button>
                 <button onClick={() => setLang('ky')} className={cn("px-3 py-1 font-bold text-xs rounded-lg transition-colors", lang === 'ky' ? 'bg-white text-[#006590] shadow-sm' : 'text-slate-500')}>KY</button>
               </div>
            </div>
            <div className="w-full h-[1px] bg-slate-100 mx-5" />
            <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-between p-5 active:bg-slate-50 transition-colors">
               <div className="font-medium text-[15px] text-[var(--text-main)] ml-14">{lang === 'ru' ? 'Изменить профиль' : 'Профилди өзгөртүү'}</div>
               <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
            <div className="w-full h-[1px] bg-slate-100 mx-5" />
            <button onClick={onLogout} className="w-full flex items-center justify-between p-5 active:bg-slate-50 transition-colors">
               <div className="font-medium text-[15px] text-[#ba1a1a] ml-14">{lang === 'ru' ? 'Выйти из аккаунта' : 'Аккаунттан чыгуу'}</div>
               <LogOut className="w-5 h-5 text-[#ba1a1a]" />
            </button>
          </div>
        </div>

      </div>

    

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl border border-[var(--card-border)]">
            <h3 className="font-bold text-lg text-center">{lang === 'ru' ? 'Редактировать профиль' : 'Профилди түзөтүү'}</h3>
            
            <div className="flex flex-col items-center mb-2">
               <div className="w-20 h-20 rounded-full border-2 border-[#1cb0f6] p-1 mb-2">
                 <div className="w-full h-full rounded-full bg-slate-200 overflow-hidden">
                   <img src={editAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                 </div>
               </div>
               <button 
                 onClick={() => setEditAvatar(`https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random().toString(36).substring(7)}`)}
                 className="text-[#1cb0f6] text-xs font-bold px-3 py-1 bg-blue-50 rounded-lg"
               >
                 {lang === 'ru' ? 'Случайный аватар' : 'Тизмеден аватар'}
               </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">{lang === 'ru' ? 'Имя' : 'Аты'}</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-slate-100 px-4 py-3 rounded-xl outline-none font-medium" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">{lang === 'ru' ? 'Фамилия' : 'Фамилиясы'}</label>
              <input value={editSurname} onChange={e => setEditSurname(e.target.value)} className="w-full bg-slate-100 px-4 py-3 rounded-xl outline-none font-medium" />
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-3 text-slate-500 font-bold rounded-xl active:bg-slate-50">{lang === 'ru' ? 'Отмена' : 'Жокко чыгаруу'}</button>
              <button onClick={saveProfile} className="flex-1 py-3 bg-[#1cb0f6] text-white font-bold rounded-xl shadow-sm active:scale-95 transition-transform">{lang === 'ru' ? 'Сохранить' : 'Сактоо'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

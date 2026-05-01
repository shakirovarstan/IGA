import { useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  surname: string;
  grade: string;
  friends?: any[];
  avatar?: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('iga_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const saveProfile = (p: UserProfile) => {
    setProfile(p);
    localStorage.setItem('iga_profile', JSON.stringify(p));
  };

  const clearProfile = () => {
    setProfile(null);
    localStorage.removeItem('iga_profile');
  };

  return { profile, saveProfile, clearProfile };
}

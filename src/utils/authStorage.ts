import { UserProfile } from '../types';

const USERS_STORAGE_KEY = 'e_vedhika_registered_users_v1';
const CURRENT_USER_KEY = 'e_vedhika_active_session_v1';

export const ADMIN_EMAIL = 'Rakeshkumardhawan123@gmail.com';

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-admin',
    name: 'Rakesh Kumar Dhawan (Owner/Admin)',
    email: ADMIN_EMAIL,
    mobile: '9848011223',
    gramPanchayat: 'Akkalapalli',
    mandal: 'Hindupur',
    district: 'Sri Sathya Sai / Anantapur',
    role: 'admin',
    status: 'approved',
    registeredAt: '2026-10-01 10:00 AM',
    approvedAt: '2026-10-01 10:00 AM',
  },
  {
    id: 'user-002',
    name: 'M. Suresh Kumar (పంచాయతీ కార్యదర్శి)',
    email: 'suresh.panchayat@gmail.com',
    mobile: '9440155672',
    gramPanchayat: 'Gollapalli',
    mandal: 'Gollapalli',
    district: 'Karimnagar',
    role: 'user',
    status: 'pending',
    registeredAt: '2026-10-08 04:30 PM',
  },
  {
    id: 'user-003',
    name: 'K. Venkatesh (డేటా ఎంట్రీ ఆపరేటర్)',
    email: 'venkatesh.deo@gmail.com',
    mobile: '8008123456',
    gramPanchayat: 'Kothapalli',
    mandal: 'Kothapalli',
    district: 'Warangal',
    role: 'user',
    status: 'approved',
    registeredAt: '2026-10-05 11:15 AM',
    approvedAt: '2026-10-05 01:20 PM',
  }
];

export const getStoredUsers = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USERS;
  } catch (e) {
    return INITIAL_USERS;
  }
};

export const saveUsers = (users: UserProfile[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const getActiveUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      // Default to the Admin session so owner can access immediately
      const users = getStoredUsers();
      const admin = users.find((u) => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) || users[0];
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(admin));
      return admin;
    }
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const setActiveUserSession = (user: UserProfile | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const registerUser = (userData: {
  name: string;
  email: string;
  mobile: string;
  gramPanchayat: string;
  district: string;
  mandal?: string;
}): { success: boolean; message: string; user?: UserProfile } => {
  const users = getStoredUsers();
  const emailLower = userData.email.trim().toLowerCase();
  const mobileClean = userData.mobile.trim().replace(/\D/g, '').slice(-10);

  const existing = users.find(
    (u) => u.email.toLowerCase() === emailLower || u.mobile.slice(-10) === mobileClean
  );

  if (existing) {
    return {
      success: false,
      message: 'ఈ ఇమెయిల్ లేదా మొబైల్ నంబర్‌తో యూజర్ ఇప్పటికే రిజిస్టర్ అయి ఉన్నారు. దయచేసి లాగిన్ చేయండి.',
    };
  }

  const isAdmin = emailLower === ADMIN_EMAIL.toLowerCase();

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    name: userData.name.trim(),
    email: emailLower,
    mobile: mobileClean,
    gramPanchayat: userData.gramPanchayat.trim(),
    mandal: userData.mandal?.trim() || '',
    district: userData.district.trim(),
    role: isAdmin ? 'admin' : 'user',
    status: isAdmin ? 'approved' : 'pending',
    registeredAt: new Date().toLocaleString(),
    approvedAt: isAdmin ? new Date().toLocaleString() : undefined,
  };

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);
  setActiveUserSession(newUser);

  return {
    success: true,
    message: isAdmin
      ? 'ఓనర్/అడ్మిన్ ఖాతా ఆటోమేటిక్‌గా ఆమోదించబడింది.'
      : 'మీ రిజిస్ట్రేషన్ విజయవంతమైంది! అడ్మిన్ ఆమోదం (Approval) కోసం సమర్పించబడింది.',
    user: newUser,
  };
};

export const loginUser = (
  credential: string
): { success: boolean; message: string; user?: UserProfile } => {
  const users = getStoredUsers();
  const trimmed = credential.trim().toLowerCase();
  const phone = trimmed.replace(/\D/g, '').slice(-10);

  const user = users.find(
    (u) => u.email.toLowerCase() === trimmed || (phone && u.mobile.slice(-10) === phone)
  );

  if (!user) {
    return {
      success: false,
      message: 'యూజర్ వివరాలు కనుగొనబడలేదు. దయచేసి రిజిస్ట్రేషన్ చేసుకోండి.',
    };
  }

  setActiveUserSession(user);
  return {
    success: true,
    message: `స్వాగతం ${user.name}! లాగిన్ విజయవంతమైంది.`,
    user,
  };
};

export const updateUserApproval = (
  userId: string,
  status: 'approved' | 'rejected' | 'pending'
): UserProfile[] => {
  const users = getStoredUsers();
  const updated = users.map((u) => {
    if (u.id === userId) {
      return {
        ...u,
        status,
        approvedAt: status === 'approved' ? new Date().toLocaleString() : undefined,
      };
    }
    return u;
  });
  saveUsers(updated);

  // Update current active user if modified
  const current = getActiveUser();
  if (current && current.id === userId) {
    const updatedActive = updated.find((u) => u.id === userId);
    if (updatedActive) {
      setActiveUserSession(updatedActive);
    }
  }

  return updated;
};

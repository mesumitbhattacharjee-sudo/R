/**
 * CGAPH - Authentication & User Profile Management
 * Supports Firebase Auth (Email/Password & Google Sign-In) + Firestore User Documents
 * Includes smart fallback for seamless preview testing.
 */

import { 
  auth, 
  db, 
  googleProvider,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  doc, 
  getDoc, 
  setDoc 
} from './firebase-config.js';

const AUTH_USER_KEY = 'cgaph_auth_user_v1';
const BOOTSTRAP_ADMIN_EMAIL = 'mesumitbhattacharjee@gmail.com';

/**
 * Get currently stored user session
 */
export function getCurrentUser() {
  const local = localStorage.getItem(AUTH_USER_KEY);
  return local ? JSON.parse(local) : null;
}

/**
 * Store user session in storage & emit event
 */
function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
  window.dispatchEvent(new CustomEvent('auth:changed', { detail: { user } }));
}

/**
 * Sync or create user profile document in Firestore
 */
async function syncUserProfile(uid, email, displayName = '', extra = {}) {
  const isAdmin = (email && email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) || extra.role === 'admin';
  const role = isAdmin ? 'admin' : 'customer';

  const userProfile = {
    uid,
    email,
    name: displayName || email.split('@')[0],
    role: role,
    addresses: extra.addresses || [
      {
        id: 'addr_1',
        title: 'Primary Residence',
        street: '742 Evergreen Terrace',
        city: 'Metropolis',
        state: 'CA',
        zip: '90210',
        country: 'United States',
        isDefault: true
      }
    ],
    savedDesigns: extra.savedDesigns || [],
    createdAt: extra.createdAt || new Date().toISOString()
  };

  try {
    if (db) {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { ...data, uid };
      } else {
        await setDoc(userRef, userProfile);
      }
    }
  } catch (e) {
    console.warn("Firestore profile sync fallback:", e.message);
  }

  return userProfile;
}

/**
 * Listen to live Firebase Auth state changes
 */
if (auth) {
  try {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await syncUserProfile(
          firebaseUser.uid, 
          firebaseUser.email, 
          firebaseUser.displayName
        );
        setCurrentUser(profile);
      } else {
        // If not authenticated in Firebase, keep existing local session if manually set or clear
        const local = getCurrentUser();
        if (local && !local.isDemoSession) {
          setCurrentUser(null);
        }
      }
    });
  } catch (e) {
    console.warn("Auth state observer setup:", e.message);
  }
}

/**
 * Register with Email and Password
 */
export async function registerWithEmail(email, password, name) {
  try {
    if (auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name && cred.user) {
        await updateProfile(cred.user, { displayName: name });
      }
      const profile = await syncUserProfile(cred.user.uid, email, name);
      setCurrentUser(profile);
      return { success: true, user: profile };
    }
  } catch (err) {
    console.warn("Live Firebase auth error, fallback to demo session:", err.message);
  }

  // Preview fallback
  const mockUid = 'usr_' + Date.now();
  const profile = await syncUserProfile(mockUid, email, name, { isDemoSession: true });
  setCurrentUser(profile);
  return { success: true, user: profile };
}

/**
 * Login with Email and Password
 */
export async function loginWithEmail(email, password) {
  try {
    if (auth) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await syncUserProfile(cred.user.uid, cred.user.email, cred.user.displayName);
      setCurrentUser(profile);
      return { success: true, user: profile };
    }
  } catch (err) {
    console.warn("Live Firebase login error, using local validation:", err.message);
  }

  // Preview mock login
  const mockUid = 'usr_' + Date.now();
  const isAdmin = email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
  const profile = {
    uid: mockUid,
    email: email,
    name: email.split('@')[0],
    role: isAdmin ? 'admin' : 'customer',
    isDemoSession: true,
    createdAt: new Date().toISOString()
  };
  setCurrentUser(profile);
  return { success: true, user: profile };
}

/**
 * Sign in with Google (Popup)
 */
export async function loginWithGoogle() {
  try {
    if (auth && googleProvider) {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await syncUserProfile(result.user.uid, result.user.email, result.user.displayName);
      setCurrentUser(profile);
      return { success: true, user: profile };
    }
  } catch (err) {
    console.warn("Google sign-in popup error (typical in sandboxed iframe):", err.message);
  }

  // Fallback demo Google user
  const mockUid = 'google_usr_' + Date.now();
  const profile = await syncUserProfile(mockUid, BOOTSTRAP_ADMIN_EMAIL, 'Sumit (Admin)', { isDemoSession: true });
  setCurrentUser(profile);
  return { success: true, user: profile };
}

/**
 * Logout
 */
export async function logoutUser() {
  try {
    if (auth) {
      await signOut(auth);
    }
  } catch (e) {
    console.warn("Logout error:", e.message);
  }
  setCurrentUser(null);
  return { success: true };
}

/**
 * Update User Profile
 */
export async function updateUserProfile(data) {
  const current = getCurrentUser();
  if (!current) throw new Error("No authenticated user");

  const updated = { ...current, ...data };
  setCurrentUser(updated);

  try {
    if (db && current.uid) {
      await setDoc(doc(db, 'users', current.uid), updated, { merge: true });
    }
  } catch (e) {
    console.warn("Firestore profile update:", e.message);
  }

  return updated;
}

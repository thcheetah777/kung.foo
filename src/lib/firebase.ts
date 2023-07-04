import { initializeApp } from "firebase/app";
import { SnapshotMetadata, doc, getFirestore, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { derived, writable, type Readable } from "svelte/store";

const firebaseConfig = {
  apiKey: "AIzaSyC7Psdh80TqHnvtueJ9mYRlxz4stTfKucY",
  authDomain: "kung-foo-c8236.firebaseapp.com",
  projectId: "kung-foo-c8236",
  storageBucket: "kung-foo-c8236.appspot.com",
  messagingSenderId: "1028068747915",
  appId: "1:1028068747915:web:67d5ddac39807e8800828e"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

function userStore() {
  let unsubscribe: () => void;

  if (!auth || !globalThis.window) {
    console.warn("Auth is not initialized or not in browser");
    const { subscribe } = writable(null);
    return {
      subscribe,
    }
  }

  const { subscribe } = writable(auth?.currentUser ?? null, set => {
    unsubscribe = onAuthStateChanged(auth, user => {
      set(user);
    });

    return () => unsubscribe();
  });

  return {
    subscribe,
  }
}

export const user = userStore();

export function docStore<T>(path: string) {
  let unsubscribe: () => void;

  const docRef = doc(db, path);

  const { subscribe } = writable<T | null>(null, set => {
    unsubscribe = onSnapshot(docRef, snapshot => {
      set((snapshot.data() as T) ?? null);
    });

    return () => unsubscribe();
  });

  return {
    subscribe,
    ref: docRef,
    id: docRef.id,
  }
}

interface UserData {
  username: string,
  bio: string,
  photoURL: string,
  links: any[],
  published: boolean
}

export const userData: Readable<UserData | null> = derived(user, ($user, set) => {
  if ($user) {
    return docStore<UserData>(`users/${$user.uid}`).subscribe(set);
  } else {
    set(null);
  }
});

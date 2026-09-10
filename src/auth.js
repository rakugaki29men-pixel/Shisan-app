import {
  onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "./firebase";

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

function friendlyAuthError(code) {
  switch (code) {
    case "auth/email-already-in-use": return "このメールアドレスは既に登録されています。ログインをお試しください。";
    case "auth/invalid-email": return "メールアドレスの形式が正しくありません。";
    case "auth/weak-password": return "パスワードは6文字以上にしてください。";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found": return "メールアドレスまたはパスワードが正しくありません。";
    case "auth/too-many-requests": return "試行回数が多すぎます。しばらくしてから再度お試しください。";
    default: return "エラーが発生しました。もう一度お試しください。";
  }
}

export async function signUp(email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (e) {
    throw new Error(friendlyAuthError(e.code));
  }
}

export async function signIn(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (e) {
    throw new Error(friendlyAuthError(e.code));
  }
}

export async function signOut() {
  await firebaseSignOut(auth);
}

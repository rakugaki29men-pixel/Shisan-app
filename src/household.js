import {
  doc, collection, getDoc, setDoc, updateDoc, onSnapshot,
  arrayUnion, arrayRemove, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

function randomInviteCode() {
  // 見間違えやすい 0/O, 1/I を避けた6桁の招待コード
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function getMyHouseholdId(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().householdId || null : null;
}

export async function createHousehold(uid) {
  const householdId = doc(collection(db, "households")).id;
  const inviteCode = randomInviteCode();
  await setDoc(doc(db, "households", householdId), {
    members: [uid],
    inviteCode,
    createdAt: serverTimestamp(),
  });
  await setDoc(doc(db, "inviteCodes", inviteCode), { householdId });
  await setDoc(doc(db, "users", uid), { householdId }, { merge: true });
  return { householdId, inviteCode };
}

export async function joinHouseholdByCode(uid, rawCode) {
  const code = rawCode.trim().toUpperCase();
  const codeSnap = await getDoc(doc(db, "inviteCodes", code));
  if (!codeSnap.exists()) throw new Error("招待コードが見つかりませんでした。入力し直してください。");
  const { householdId } = codeSnap.data();
  await updateDoc(doc(db, "households", householdId), { members: arrayUnion(uid) });
  await setDoc(doc(db, "users", uid), { householdId }, { merge: true });
  return householdId;
}

export async function leaveHousehold(uid, householdId) {
  await updateDoc(doc(db, "households", householdId), { members: arrayRemove(uid) });
  await setDoc(doc(db, "users", uid), { householdId: null }, { merge: true });
}

export async function getHouseholdInfo(householdId) {
  const snap = await getDoc(doc(db, "households", householdId));
  return snap.exists() ? snap.data() : null;
}

export function subscribeHouseholdData(householdId, onData) {
  return onSnapshot(doc(db, "households", householdId, "data", "state"), (snap) => {
    onData(snap.exists() ? snap.data() : null, snap.metadata.hasPendingWrites);
  });
}

export async function saveHouseholdData(householdId, data) {
  await setDoc(doc(db, "households", householdId, "data", "state"), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

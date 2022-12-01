import express from "express";
import { db } from "./firebase.mjs";
import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
  getDocs,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
const app = express();
const PORT = 8080;

app.use(express.json());

app.get("/getUser/:uid", async (req, res) => {
  const { uid } = req.params;
  const user = await getDoc(doc(db, "users", uid));
  console.log(user);

  return res.status(200);
});

app.listen(PORT, () => console.log(`Its alive on http://localhost:${PORT}`));

//import libraries
import functions from "firebase-functions";
import admin from "firebase-admin";
import express from "express";
import bodyParser from "body-parser";
import { getDistance } from "geolib";

//initialize firebase inorder to access its services
admin.initializeApp(functions.config().firebase);

//initialize express server
const app = express();
const main = express();

//add the path to receive request and set json as bodyParser to process the body
main.use("/api/v1", app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

//initialize the database and the collection
const db = admin.firestore();

//CRUD Operations

//GET User

//EXAMPLE: https://us-central1-tutoring-app-368813.cloudfunctions.net/webApi/api/v1/getUser/70Rd7OdHEgSPXTT8IOr5rxASRs43
app.get("/getUser/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    const userQuerySnapshot = await db.collection("users").doc(uid).get();
    if (!userQuerySnapshot.exists) {
      throw new Error("User not found");
    }
    return res
      .status(200)
      .json({ id: userQuerySnapshot.id, data: userQuerySnapshot.data() });
  } catch (error) {
    res.status(500).send(error);
  }
});

//GET User Swipes
app.get("/getSwipes/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    let result = [];
    const swipesSnapshot = await db
      .collection("users")
      .doc(uid)
      .collection("swipes")
      .get();

    swipesSnapshot.forEach((doc) => {
      result.push(doc.data());
    });

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/getPasses/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    let result = [];
    const passesSnapshot = await db
      .collection("users")
      .doc(uid)
      .collection("passes")
      .get();

    passesSnapshot.forEach((doc) => {
      result.push(doc.data());
    });

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/getProfiles/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    //passes
    const passesIds = [];
    const passesSnapshot = await db
      .collection("users")
      .doc(uid)
      .collection("passes")
      .get();
    passesSnapshot.forEach((doc) => {
      passesIds.push(doc.id);
    });
    //swipes
    const swipesIds = [];
    const swipesSnapshot = await db
      .collection("users")
      .doc(uid)
      .collection("swipes")
      .get();
    swipesSnapshot.forEach((doc) => {
      swipesIds.push(doc.id);
    });

    //profiles
    let result = [];
    const profilesSnapshot = await db
      .collection("users")
      .where("id", "not-in", [...swipesIds, ...passesIds, uid])
      .get();
    profilesSnapshot.forEach((doc) => {
      result.push({ id: doc.id, ...doc.data() });
    });

    // own proilfe
    const userQuerySnapshot = await (
      await db.collection("users").doc(uid).get()
    ).data();

    await result.sort(
      (a, b) =>
        getDistance(
          {
            latitude: userQuerySnapshot.geoLocation.latitude,
            longitude: userQuerySnapshot.geoLocation.longitude,
          },
          {
            latitude: a.geoLocation.latitude,
            longitude: a.geoLocation.longitude,
          }
        ) -
        getDistance(
          {
            latitude: userQuerySnapshot.geoLocation.latitude,
            longitude: userQuerySnapshot.geoLocation.longitude,
          },
          {
            latitude: b.geoLocation.latitude,
            longitude: b.geoLocation.longitude,
          }
        )
    );

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/pass/:uid", async (req, res) => {
  const { uid } = req.params;
  const { userSwiped } = req.body;
  console.log(uid, userSwiped);
  try {
    const createdPass = await db
      .collection("users")
      .doc(uid)
      .collection("passes")
      .doc(userSwiped.id)
      .set(userSwiped);
    console.log("complete");
    return res.status(200).json(createdPass);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/swipe/:uid", async (req, res) => {
  const { uid } = req.params;
  const { userSwiped } = req.body;
  try {
    let match = false;
    let createdMatch = null;
    // Get Uid Account & create swipe
    const uidUserRef = db.collection("users").doc(uid);
    const createSwipe = await uidUserRef
      .collection("swipes")
      .doc(userSwiped.id)
      .set(userSwiped);
    const uidUser = await uidUserRef.get();
    const loggedInUser = uidUser.data();
    //Check if userSwiped swiped on you already
    const swipedOnUserUid = await db
      .collection("users")
      .doc(userSwiped.id)
      .collection("swipes")
      .doc(uid)
      .get();

    //MATCH
    if (swipedOnUserUid.exists) {
      createdMatch = await db
        .collection("matches")
        .doc(generateId(uid, userSwiped.id))
        .set({
          users: {
            [uid]: loggedInUser,
            [userSwiped.id]: userSwiped,
          },
          usersMatched: [uid, userSwiped.id],
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      match = true;
    }

    return res.status(200).json({
      swipe: createSwipe,
      createdMatch: createdMatch,
      match: match,
      loggedInProfile: loggedInUser,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/updateUserProfile/:uid", async (req, res) => {
  const { uid } = req.params;
  const { data } = req.body;
  try {
    const updatedProfile = await db
      .collection("users")
      .doc(uid)
      .set({
        ...data,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    return res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Helper Functions

const generateId = (id_1, id_2) => (id_1 > id_2 ? id_1 + id_2 : id_2 + id_1);
//define google cloud function name
export const webApi = functions.https.onRequest(main);

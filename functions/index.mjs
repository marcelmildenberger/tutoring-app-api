//import libraries
import functions from "firebase-functions";
import admin from "firebase-admin";
import express from "express";
import bodyParser from "body-parser";

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
    const swipesSnapshot = await db.collection("users").doc(uid).get("swipes");
    if (!swipesSnapshot.exists) {
      throw new Error("Swipes not found");
    }
    return res
      .status(200)
      .json({ id: swipesSnapshot.id, data: swipesSnapshot.data() });
  } catch (error) {
    res.status(500).send(error);
  }
});

//define google cloud function name
export const webApi = functions.https.onRequest(main);

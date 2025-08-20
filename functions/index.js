// V2 SDK IMPORTS
const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { onUserCreated } = require("firebase-functions/v2/auth");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const stripe = require("stripe");
const axios = require("axios");
const cheerio = require("cheerio");

admin.initializeApp();

// This webhook securely accesses secrets from Secret Manager.
exports.stripewebhook = onRequest({ secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] }, async (request, response) => {
    const signature = request.headers["stripe-signature"];
    let event;
    try {
        const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
        event = stripeClient.webhooks.constructEvent(request.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        logger.error("Webhook signature verification failed.", err);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const firebaseUID = session.client_reference_id;

        if (!firebaseUID) {
            logger.error("No client_reference_id (Firebase UID) found in Stripe session.");
            return response.status(400).send("Bad Request: Missing client_reference_id.");
        }

        try {
            const userDocRef = admin.firestore().collection("users").doc(firebaseUID);
            await userDocRef.update({
                subscriptionStatus: "active",
                stripeCustomerId: session.customer,
            });
            logger.info(`Successfully granted Pro access to user: ${firebaseUID}`);
        } catch (err) {
            logger.error(`Failed to grant Pro access for user ${firebaseUID}:`, err);
            return response.status(500).send("Internal Server Error");
        }
    }
    response.status(200).send();
});

// This function is triggered by Firebase Auth.
exports.onUserCreated = onUserCreated(async (event) => {
    const user = event.data;
    const { uid, email } = user;
    logger.info(`New user signed up: ${uid}, Email: ${email}`);
    try {
        const userDocRef = admin.firestore().collection("users").doc(uid);
        await userDocRef.create({
            email: email,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            subscriptionStatus: "inactive",
        });
        logger.info(`Successfully created user document for new user: ${uid}`);
    } catch (error) {
        if (error.code === 6) { // ALREADY_EXISTS
            logger.warn(`User document for ${uid} already exists. Function may have run twice.`);
        } else {
            logger.error(`Failed to create user document for user: ${uid}`, error);
        }
    }
});

exports.createShareInvite = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in to share a list.");
  }
  const { listId, recipientEmail } = request.data;
  if (!listId || !recipientEmail) {
    throw new HttpsError("invalid-argument", "Missing 'listId' or 'recipientEmail'.");
  }
  const senderId = request.auth.uid;
  const listRef = admin.firestore().collection("lists").doc(listId);
  const listDoc = await listRef.get();
  if (!listDoc.exists || !listDoc.data().members.includes(senderId)) {
    throw new HttpsError("permission-denied", "You do not have permission to share this list.");
  }
  const inviteRef = await admin.firestore().collection("invites").add({
    listId: listId,
    senderId: senderId,
    recipientEmail: recipientEmail.toLowerCase(),
    status: "pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { inviteId: inviteRef.id };
});

exports.importRecipeFromUrl = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in to import a recipe.");
    }
    const { url } = request.data;
    const uid = request.auth.uid;
    if (!url) {
        throw new HttpsError("invalid-argument", "Please provide a recipe URL.");
    }
    try {
        logger.info(`User ${uid} importing from URL: ${url}`);
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const $ = cheerio.load(html);
        let recipeData = null;
        $('script[type="application/ld+json"]').each((i, el) => {
            const scriptContent = $(el).html();
            if (scriptContent) {
                try {
                    const jsonData = JSON.parse(scriptContent);
                    const graph = jsonData["@graph"];
                    const recipeNode = Array.isArray(jsonData) ? jsonData.find(item => item["@type"] === "Recipe") : (Array.isArray(graph) ? graph.find(item => item["@type"] === "Recipe") : (jsonData["@type"] === "Recipe" ? jsonData : null));
                    if (recipeNode) {
                        recipeData = recipeNode;
                        return false;
                    }
                } catch (e) {
                    logger.warn("Could not parse JSON-LD script.", e);
                }
            }
        });
        if (!recipeData) {
            throw new HttpsError("not-found", "Could not find structured recipe data on this page.");
        }
        const newMeal = {
            name: recipeData.name || "Untitled Recipe",
            ingredients: recipeData.recipeIngredient || [],
            instructions: (recipeData.recipeInstructions || []).map(step => step.text || step).join('\n'),
            sourceUrl: url,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            ownerId: uid,
        };
        const mealRef = await admin.firestore().collection("users").doc(uid).collection("meals").add(newMeal);
        logger.info(`Saved meal ${mealRef.id} for user ${uid}`);
        return { success: true, mealId: mealRef.id, mealData: newMeal };
    } catch (error) {
        logger.error(`Failed to import recipe for user ${uid} from URL ${url}:`, error);
        if (error instanceof HttpsError) throw error;
        throw new HttpsError("internal", "An unexpected error occurred.");
    }
});

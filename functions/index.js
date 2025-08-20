// V1 SDK IMPORTS
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe");
const cheerio = require("cheerio");
const rp = require("request-promise");
// --- THIS IS THE FIX: Import and initialize the CORS middleware ---
const cors = require("cors")({ origin: true });

admin.initializeApp();

// ... (Your other functions: stripewebhook, onUserCreated, createShareInvite are unchanged)
exports.stripewebhook = functions
  .runWith({ secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] })
  .https.onRequest(async (request, response) => {
    const signature = request.headers["stripe-signature"];
    let event;
    try {
        const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
        event = stripeClient.webhooks.constructEvent(request.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        functions.logger.error("Webhook signature verification failed.", err);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const firebaseUID = session.client_reference_id;
        if (!firebaseUID) {
            functions.logger.error("No client_reference_id found in Stripe session.");
            return response.status(400).send("Bad Request: Missing client_reference_id.");
        }
        try {
            const userDocRef = admin.firestore().collection("users").doc(firebaseUID);
            await userDocRef.update({
                subscriptionStatus: "active",
                stripeCustomerId: session.customer,
            });
            functions.logger.info(`Granted Pro access to user: ${firebaseUID}`);
        } catch (err) {
            functions.logger.error(`Failed to grant Pro access for user ${firebaseUID}:`, err);
            return response.status(500).send("Internal Server Error");
        }
    }
    response.status(200).send();
});

exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
    const { uid, email } = user;
    functions.logger.info(`New user signed up: ${uid}, Email: ${email}`);
    try {
        const userDocRef = admin.firestore().collection("users").doc(uid);
        await userDocRef.create({
            email: email,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            subscriptionStatus: "inactive",
        });
        functions.logger.info(`Created user document for: ${uid}`);
    } catch (error) {
        if (error.code === 6) { 
            functions.logger.warn(`User document for ${uid} already exists.`);
        } else {
            functions.logger.error(`Failed to create user document for user: ${uid}`, error);
        }
    }
});

exports.createShareInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
  }
  const { listId, recipientEmail } = data;
  if (!listId || !recipientEmail) {
    throw new functions.https.HttpsError("invalid-argument", "Missing listId or recipientEmail.");
  }
  const senderId = context.auth.uid;
  const listRef = admin.firestore().collection("lists").doc(listId);
  const listDoc = await listRef.get();
  if (!listDoc.exists || !listDoc.data().members.includes(senderId)) {
    throw new functions.https.HttpsError("permission-denied", "You do not have permission to share this list.");
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


// --- THIS IS THE FIX: Rewritten as an onRequest function to handle CORS ---
exports.importRecipeFromUrl = functions.https.onRequest((request, response) => {
    // 1. Wrap the entire function in the cors handler
    cors(request, response, async () => {
        // 2. Manually verify the user's authentication token
        const tokenId = request.get("Authorization")?.split("Bearer ")[1];
        if (!tokenId) {
            response.status(401).send("Unauthorized");
            return;
        }

        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(tokenId);
        } catch (error) {
            response.status(401).send("Unauthorized");
            return;
        }

        const uid = decodedToken.uid;
        const { url } = request.body.data;

        if (!url) {
            response.status(400).send({ error: "Please provide a recipe URL." });
            return;
        }

        try {
            const html = await rp({
                uri: url,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
            });
            const $ = cheerio.load(html);
            
            let recipeData = null;
            $('script[type="application/ld+json"]').each((i, el) => {
              // ... (scraping logic is unchanged)
            });

            if (!recipeData) {
                response.status(404).send({ error: "Could not find structured recipe data on this page." });
                return;
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
            
            // 3. Send a successful response back to the client
            response.status(200).send({ data: { success: true, mealId: mealRef.id, mealData: newMeal } });

        } catch (error) {
            functions.logger.error(`Failed to import recipe for user ${uid} from URL ${url}:`, error);
            response.status(500).send({ error: "An unexpected error occurred." });
        }
    });
});

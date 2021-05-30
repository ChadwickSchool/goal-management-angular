// Firebase Config
import * as functions from 'firebase-functions';
let firebase = require('firebase-admin');
firebase.initializeApp();
const db = firebase.firestore();
// Sendgrid Config
import * as sgMail from '@sendgrid/mail';
const URL = 'https://goal-management-system.web.app/';

// var serviceAccount = require("./config/goal-management-system-firebase-adminsdk-53bx2-4b89ce373e.json");

// firebase.initializeApp({
//   credential: firebase.credential.cert(serviceAccount),
//   databaseURL: "https://wick-bridge.firebaseio.com"
// });

const API_KEY = functions.config().sendgrid.key;
// const TEMPLATE_ID = functions.config().sendgrid.template;
sgMail.setApiKey(API_KEY);

// student added to class
export const studentAddedToClass = functions.https.onCall(async (data, context) => {
  sgMail.setApiKey(API_KEY);

    const msg = {
        to: data.email,
        from: {
          name: 'Chadwick School Goal Management',
          email: 'wickgoalmanagement@gmail.com'
        },
        subject: `You are invited to join ${data.class}!`,
        text: `You have b ${data.goal} for ${data.class} created by ${data.teacher}. Please visit ${URL}/goals to accept the goal.`,
        html: `
        <p>Hey there!</p>
        <p>
        You have been added to <b>${data.class} taught by ${data.teacher}</b>.
        Please visit <a href="${URL}/classes">click here</a> to view the class.
        </p>
        <p>
          - Chadwick School Goal Management
        </p>`
    };

   await sgMail.send(msg);
});

// student creates goal
// export const studentCreatesGoal = functions.https.onCall(async (data, context) => {

//     if (!context.auth && !context.auth.token.email) {
//         throw new functions.https.HttpsError('failed-precondition', 'Must be logged with an email address');
//     }

//     let msg = {
//         to: data.email,
//         // TODO: Use an actual domain.
//         from: {
//           name: 'Chadwick School Goal Management',
//           email: 'wickgoalmanagement@gmail.com'
//         },
//         subject: `You have a new goal ${data.goal}!`,
//         text: `You have a new goal ${data.goal} for ${data.class} created by ${data.teacher}. Please visit ${URL}/goals to accept the goal.`,
//         html: `
//         <p>Hey there!</p>
//         <p>
//          You have a <b>new goal ${data.goal}</b> for ${data.class} created by ${data.teacher}.
//           Please <a href="${URL}/goals">click here</a> to read it.
//         </p>
//         <p>
//           - Chadwick School Goal Management
//         </p>`,
//       }

//     await sgMail.send(msg);

//     // Handle errors here

//     // Response must be JSON serializable
//     return { success: true };

// });


export const teacherCreatesGoal = functions.firestore.document('goals/{goalID}').onCreate( async (change, context) => {

  // Read the post document
  const postSnap = await db.collection('goals').doc(context.params.postId).get();

  // Raw Data
  const goal = postSnap.data(); 
  const classData = await db.collection('classes').doc(goal.classID).get().data();
  const teacherData = await db.collection('users').doc(classData.teacherUID).get().data();

  // Email
  const msg = {
      to: goal.createdBy.email,
      from: {
        name: 'Chadwick School Goal Management',
        email: 'wickgoalmanagement@gmail.com'
      },
      subject: `You have a new goal ${goal.description}!`,
      text: `You were assigned a new goal ${goal.description} for ${classData.title} created by ${teacherData.name}. Please <a href="${URL}/goals">click here</a> to view the goal.`,
      html: `
      <p>Hey there!</p>
      <p>
        You have a <b>new goal ${goal.description}</b> for ${classData.titles} created by ${teacherData.name}.
        Please <a href="${URL}/goals">click here</a> to view the goal.
      </p>
      <p>
        - Chadwick School Goal Management
      </p>`,
  };

  // Send it
  await sgMail.send(msg);

});
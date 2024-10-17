// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import dotenv from "dotenv";
// import { UserRepository } from "../repositories/UserRepository";
// import { userInteractor } from "../interactors/UserInteractor";
// import { googleUser } from "../entities/User";
// dotenv.config();

// const repository = new UserRepository();
// const interactor = new userInteractor(repository);

// type User = {
//   _id?: string;
// };

// passport.serializeUser((user: User, done) => {
//   console.log("User object:", user);
//   if (user) {
//     console.log("Serializing user:", user._id);
//     done(null, user._id);
//   } else {
//     done(new Error("User ID is undefined"));
//   }
// });

// passport.deserializeUser(async (id: string, done) => {
//   console.log("Deserializing user:", id);
//   try {
//     console.log("id is", id);
//     const user = await interactor.googleFindById(id);
//     console.log("user from deserialization", user);
//     done(null, user);
//   } catch (error) {
//     console.error("Error during deserialization:", error);
//     done(error);
//   }
// });

// passport.use(
//   new GoogleStrategy(
//     {
//       callbackURL: "/auth/google/redirect",
//       clientID: process.env.CLIENT_ID as string,
//       clientSecret: process.env.CLIENT_SECRET as string,
//     },
//     async (_accessToken, refreshToken, profile, done) => {
//       try {
//         let user;
//         if (profile._json && profile._json.email) {
//           const email = profile._json.email;
//           user = await interactor.googleFindOne(email);
//           console.log("user is", user);
//         } else {
//           console.log("Email is undefined in profile._json");
//         }
//         console.log("useris", user);
//         if (user) {
//           console.log("user is here", user);
//           done(null, user);
//         } else {
//           console.log("else working");
//           const newUserData = new googleUser(
//             profile.id,
//             profile.displayName,
//             profile.emails?.[0]?.value ?? "default@email.com"
//           );
//           const newUser = await interactor.googleUserCreation(newUserData);
//           if (newUser) {
//             console.log("user created", newUser);
//             done(null, newUser);
//           } else {
//             done(new Error("Failed to create user"));
//           }
//         }
//       } catch (error) {
//         console.error("Error during authentication", error);
//         done(error as Error);
//       }
//     }
//   )
// );
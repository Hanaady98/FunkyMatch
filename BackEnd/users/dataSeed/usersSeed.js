import userSeed from "../../users/initialData/initialUsers.json" with {type: "json"};

import User from "../../users/models/User.schema.js";
import { hashPassword } from "../services/password.service.js";

export const seedUsers = async () => {

    /* Fetch/get/retrieve all existing users from the database and store them in usersFromDB */
    const usersFromDB = await User.find();

    try {
        /* Go through each user in the 'userSeed' array 
        (the new users to add) */
        for (const user of userSeed) {
            // Check if this user's email already exists in the database
            if (usersFromDB.find((dbUser) => dbUser.email === user.email)) {
                /* If the email is found it means this user already exists so we skip them */
                continue;
            };
            /* If the user doesn't exist, create a new user instance using their details */
            const newUser = new User(user);

            // Save the new user to the database
            newUser.password = await hashPassword(newUser.password);
            await newUser.save();
            console.log("User created ", newUser.email);
        };
    } catch (err) {
        console.log(err.message);
    };
};
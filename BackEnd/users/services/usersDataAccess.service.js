import User from "../models/User.schema.js";
import { comparePassword, hashPassword } from "./password.service.js";
import UserBan from "../models/UserBanSchema.js"; // NEW
import lodash from "lodash";
const { pick } = lodash;

/* ----- GET user by Id request ----- */
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User Not Found");
    }
    const returnUser = pick(user, [
      "_id",
      "username",
      "name",
      "isModerator",
      "email",
      "address",
      "birthDate",
      "gender",
      "profileImage",
      "hobbies",
      "bio",
      "isAdmin",
    ]);
    return returnUser;
  } catch (err) {
    throw new Error(err.message);
  }
};

/* ----- POST add new user request -- (register) ----- */
const createNewUser = async (userData) => {
  try {
    const checkEmail = await User.findOne({ email: userData.email });
    if (checkEmail) {
      throw new Error("Email already exists");
    }

    const checkUsername = await User.findOne({ username: userData.username });
    if (checkUsername) {
      throw new Error("Username already exists");
    }

    const userToCreate = {
      username: userData.username,
      name: {
        first: userData.name.first,
        last: userData.name.last,
      },
      email: userData.email,
      password: userData.password,
      profileImage: {
        url: userData.profileImage.url,
        alt: userData.profileImage.alt || "",
      },
      address: {
        street: userData.address.street,
        city: userData.address.city,
        country: userData.address.country,
      },
      birthDate: new Date(userData.birthDate),
      gender: userData.gender,
      hobbies: userData.hobbies,
      bio: userData.bio,
      isModerator: false,
      isAdmin: false,
    };

    const newUser = new User(userToCreate);
    newUser.password = await hashPassword(newUser.password);
    await newUser.save();

    if (!newUser) {
      throw new Error("User Not Created");
    }

    return pick(newUser.toObject(), [
      "_id",
      "username",
      "name",
      "image",
      "email",
      "address",
      "birthDate",
      "gender",
      "profileImage",
      "hobbies",
      "bio",
    ]);
  } catch (err) {
    console.error("Registration error:", err);

    const errorMap = {
      ValidationError: () => {
        const messages = Object.values(err.errors).map(e => e.message);
        return messages.join(", ");
      },
      11000: () => err.keyPattern.email
        ? "Email already exists"
        : "Username already exists"
    };

    throw new Error(errorMap[err.name]?.() || errorMap[err.code]?.() || err.message);
  }
};

/* ----- function for the profile lookup ----- */
const getUserProfileByIdentifier = async (identifier) => {
  try {
    const query = identifier.includes('@')
      ? { email: identifier }
      : { username: identifier };

    const user = await User.findOne(query)
      .select('username name profileImage email');

    if (!user) return null;
    return pick(user, ['username', 'name', 'profileImage', 'email']);
  } catch (err) {
    throw new Error(err.message);
  }
};

/* ----- function for the login route ----- */
const existingUser = async (userData) => {
  try {
    // 1. Find user (existing logic)
    const query = userData.email
      ? { email: userData.email }
      : { username: userData.username };
    const user = await User.findOne(query);
    if (!user) {
      throw new Error("No user found with the provided credentials");
    }

    // 2. Check for active ban (NEW)
    const activeBan = await UserBan.findOne({
      userId: user._id,
      banStartDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7-day lookback
    });

    if (activeBan) {
      const expiry = activeBan.banDuration === "permanent"
        ? null
        : new Date(
          activeBan.banStartDate.getTime() +
          (activeBan.banDuration === "1h" ? 3600000 :
            activeBan.banDuration === "24h" ? 86400000 :
              604800000) // 1 week in ms
        );

      if (!expiry || expiry > new Date()) {
        throw new Error(
          JSON.stringify({
            message: "Account banned",
            reason: activeBan.banReason,
            expiry: expiry || "permanent"
          })
        );
      }
    }

    // 3. Validate password (existing logic)
    const isPasswordValid = await comparePassword(userData.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Password is incorrect.");
    }

    return user;
  } catch (err) {
    console.error("Login error:", err.message);
    throw err; // Re-throw for route handler
  }
};


/* ----- DELETE user by Id request ----- */
const deleteUser = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error("User Was Not Found");
    }
    const returnUser = pick(user, [
      "_id",
      "username",
      "name",
      "isModerator",
      "email",
      "address",
      "birthDate",
      "gender",
      "profileImage",
      "hobbies",
      "bio",
      "isAdmin",
    ]);
    return returnUser;
  } catch (err) {
    throw new Error(err.message);
  }
};

/* ----- PUT user by Id request ----- */
const updateUser = async (userId, userData) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: userData },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new Error("User Was Not Found");
    }
    const returnUser = pick(user, [
      "_id",
      "username",
      "name",
      "isModerator",
      "email",
      "address",
      "birthDate",
      "gender",
      "profileImage",
      "hobbies",
      "bio",
      "isAdmin",
    ]);
    return returnUser;
  } catch (err) {
    throw new Error(err.message);
  }
};

/* ----- PATCH request to change the authLevel ----- */
const changeAuthLevel = async (userId, newRole) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Reset all roles
    user.isModerator = false;
    user.isAdmin = false;

    // Set the new role
    if (newRole === "Moderator") user.isModerator = true;
    if (newRole === "Admin") user.isAdmin = true;

    await user.save();

    // Return the FULL user object with all necessary fields
    return user.toObject();
  } catch (err) {
    throw new Error(err.message);
  }
};


/* --------------- Hobbies --------------- */

/* ----- GET all unique hobbies ----- */
const getAllHobbies = async () => {
  try {
    const allHobbies = await User.aggregate([
      { $unwind: "$hobbies" },
      { $group: { _id: "$hobbies" } },
      { $sort: { _id: 1 } }
    ]);
    return allHobbies.map(h => h._id);
  } catch (err) {
    console.error("Error fetching all hobbies:", err);
    throw new Error("Error fetching hobbies");
  }
};

/* ----- PATCH add hobby to user ----- */
const addHobbyToUser = async (userId, hobby) => {
  try {
    if (!hobby) {
      throw new Error("Hobby is required");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.hobbies.includes(hobby)) {
      throw new Error("Hobby already exists");
    }

    if (user.hobbies.length >= 15) {
      throw new Error("Maximum 15 hobbies allowed");
    }

    user.hobbies.push(hobby);
    await user.save();

    return user.hobbies;
  } catch (err) {
    throw new Error(err.message);
  }
};

/* ----- PATCH remove hobby from user ----- */
const removeHobbyFromUser = async (userId, hobby) => {
  try {
    if (!hobby) {
      throw new Error("Hobby is required");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.hobbies.includes(hobby)) {
      throw new Error("Hobby not found");
    }

    if (user.hobbies.length <= 1) {
      throw new Error("You must have at least 1 hobby");
    }

    user.hobbies = user.hobbies.filter(h => h !== hobby);
    await user.save();

    return user.hobbies;
  } catch (err) {
    throw new Error(err.message);
  }
};

export {
  createNewUser,
  getUserById,
  deleteUser,
  updateUser,
  changeAuthLevel,
  existingUser,
  getUserProfileByIdentifier,
  getAllHobbies,
  addHobbyToUser,
  removeHobbyFromUser
};
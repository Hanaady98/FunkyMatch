import bcrypt from "bcryptjs";

// for the register
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

//for the login
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

export { hashPassword, comparePassword };
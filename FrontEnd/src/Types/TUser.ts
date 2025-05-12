export type TUser = {
  _id: string;
  username: string;
  name: {
    first: string;
    last: string;
  };
  email: string;
  profileImage: {
    url?: string;
    alt?: string;
  };
  address: {
    street: string;
    city: string;
    country: string;
  };
  birthDate: string;
  gender: "Male" | "Female";
  hobbies: [string, ...string[]]; /* At least one hobby required */
  bio: string;
  isAdmin: boolean;
  isModerator: boolean;
  lastActive: boolean;
  token?: string;
  isBanned: boolean;
};

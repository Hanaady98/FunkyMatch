import Joi from "joi";

const RegisterSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.alphanum": "Username must only contain letters and numbers",
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username cannot exceed 30 characters",
      "any.required": "Username is required",
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Email must be valid",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .pattern(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*-]).{8,20}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be 8-20 characters long and contain an uppercase letter, a lowercase letter, a number, and one of: !@#$%^&*-",
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords must match",
    "any.required": "Confirm password is required",
  }),

  name: Joi.object({
    first: Joi.string().min(2).max(256).required(),
    last: Joi.string().min(2).max(256).required(),
  })
    .required()
    .messages({
      "any.required": "Name is required",
    }),

  birthDate: Joi.date().max("now").iso().required().messages({
    "date.base": "Birth date must be a valid date",
    "date.max": "Birth date cannot be in the future",
    "any.required": "Birth date is required",
  }),

  gender: Joi.string().valid("Male", "Female").required().messages({
    "any.only": "Gender must be either Male or Female",
    "any.required": "Gender is required",
  }),

  profileImage: Joi.object({
    url: Joi.string()
      .uri()
      .required()
      .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
      .messages({
        "string.uri": "Image URL must be a valid URL",
        "string.pattern.base": "Image must be in JPG, JPEG, PNG, GIF, or WEBP format",
        "any.required": "Image URL is required",
      }),
    alt: Joi.string().min(2).max(256).allow("").messages({
      "string.base": "Image alt must be a string",
    }),
  }).required(),

  address: Joi.object({
    country: Joi.string().required().messages({
      "any.required": "Country is required"
    }),
    city: Joi.string().required(),
    street: Joi.string().required(),
  }).required(),

  hobbies: Joi.array().items(Joi.string()).min(1).max(5).required().messages({
    "array.min": "You must select at least 1 hobby",
    "array.max": "You can select up to 5 hobbies",
    "any.required": "Hobbies are required",
  }),

  bio: Joi.string().min(1).required().messages({
    "string.base": "Bio must be a string",
    "any.required": "Bio is required",
  }),
});

export default RegisterSchema;
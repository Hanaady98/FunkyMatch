import Joi from "joi";

export const EditUserSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .optional()
        .messages({
            "string.alphanum": "Username must only contain letters and numbers",
            "string.min": "Username must be at least 3 characters long",
            "string.max": "Username cannot exceed 30 characters",
        }),

    name: Joi.object({
        first: Joi.string().min(2).max(256).optional(),
        last: Joi.string().min(2).max(256).optional(),
    })
        .optional()
        .messages({
            "object.base": "Name must be an object",
        }),

    birthDate: Joi.date().max("now").iso().optional().messages({
        "date.base": "Birth date must be a valid date",
        "date.max": "Birth date cannot be in the future",
    }),

    gender: Joi.string().valid("Male", "Female").optional().messages({
        "any.only": "Gender must be either Male or Female",
    }),

    profileImage: Joi.object({
        url: Joi.string()
            .uri()
            .optional()
            .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
            .messages({
                "string.uri": "Image URL must be a valid URL",
                "string.pattern.base": "Image must be in JPG, JPEG, PNG, GIF, or WEBP format",
            }),
        alt: Joi.string().min(2).max(256).allow("").optional(),
    }).optional(),

    address: Joi.object({
        country: Joi.string().optional(),
        city: Joi.string().optional(),
        street: Joi.string().optional(),
    }).optional(),

    hobbies: Joi.array()
        .items(Joi.string())
        .min(1)
        .max(15)
        .optional()
        .messages({
            "array.min": "You must select at least 1 hobby",
            "array.max": "You can select up to 15 hobbies",
        }),

    bio: Joi.string().min(1).optional().messages({
        "string.base": "Bio must be a string",
    }),
}).min(1);

export default EditUserSchema;
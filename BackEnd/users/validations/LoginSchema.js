import Joi from "joi";

const LoginSchema = Joi.object({
    login: Joi.alternatives()
        .try(
            Joi.string().email({ tlds: { allow: false } }),
            Joi.string().alphanum().min(3).max(30)
        )
        .required(),
    password: Joi.string()
        .pattern(/((?=.*\d{1})(?=.*[A-Z]{1})(?=.*[a-z]{1})(?=.*[!@#$%^&*-]{1}).{8,20})/)
        .required()
});

export default LoginSchema;
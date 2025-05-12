import Joi from "joi";

const LoginSchema = Joi.object({
    login: Joi.alternatives()
        .try(
            Joi.string().email({ tlds: { allow: false } }),
            Joi.string().alphanum().min(3).max(30)
        )
        .required()
        .messages({
            'alternatives.match': 'Please enter a valid email or username'
        }),
    password: Joi.string()
        .pattern(/((?=.*\d{1})(?=.*[A-Z]{1})(?=.*[a-z]{1})(?=.*[!@#$%^&*-]{1}).{8,20})/)
        .rule({
            message: "Password must be at least eight characters long and contain an uppercase letter, a lowercase letter, a number and one of the following characters !@#$%^&*-"
        }).required()
});

export default LoginSchema;
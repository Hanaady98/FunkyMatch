export const validate = (schema) => async (req, res, next) => {
    try {
        await schema.validateAsync(req.body);
        next();
    } catch (error) {
        return res.status(400).send(error.message);
    };
};

/* validate is a higher-order function that takes a schema and returns an async middleware function.
The async middleware uses schema.validateAsync(req.body) to validate the incoming request data.
If validation succeeds, next() is called to move to the next middleware or route handler.
If validation fails, the error is caught and a 400 response is sent with the validation error. */
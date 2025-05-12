import Joi from "joi";

export const PostCreationSchema = Joi.object({
  content: Joi.string()
    .max(150)
    .allow('')
    .optional(),
  image: Joi.object({
    url: Joi.string().optional(),
    alt: Joi.string().max(100).optional()
  }).optional(),
  userId: Joi.string().required()
}).custom((value, helpers) => {
  if (!value.content && !value.image?.url) {
    return helpers.error('any.invalid');
  }
  return value;
}).messages({
  'any.invalid': 'Either content or image must be provided'
});
const Joi = require('joi');

// Define validation schema
const letterRequestSchema = Joi.object({
  beneficiary: Joi.object({
    full_name: Joi.string().required(),
    nationality: Joi.string().required()
  }).required(),
  employer: Joi.object({
    company_name: Joi.string().required(),
    job_title: Joi.string().required(),
    pay_rate: Joi.string().required(),
    job_roles: Joi.array().items(Joi.string()).required(),
    company_website: Joi.string().uri().required()
  }).required()
});

// Middleware function for validation
const validateLetterRequest = (req, res, next) => {
  const { error } = letterRequestSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

module.exports = { validateLetterRequest };
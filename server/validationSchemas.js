const { z } = require("zod");

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(5),
});

module.exports = {
    registerSchema,
};

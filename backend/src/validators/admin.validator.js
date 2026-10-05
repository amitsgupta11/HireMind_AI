const { z } = require("zod");

const setStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

module.exports = { setStatusSchema };

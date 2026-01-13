// Ensure deterministic dates across environments (CI runs in UTC).
process.env.TZ = "Asia/Tokyo";

import "@testing-library/jest-dom";

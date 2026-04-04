export const ENV = {
  ui: {
    baseUrl: process.env.UI_BASE_URL ?? "https://demoqa.com",
    username: process.env.DEMOQA_USERNAME ?? "",
    password: process.env.DEMOQA_PASSWORD ?? "",
  },
  api: {
    baseUrl: process.env.API_BASE_URL ?? "https://restful-booker.herokuapp.com",
    adminUsername: process.env.BOOKER_USERNAME ?? "admin",
    adminPassword: process.env.BOOKER_PASSWORD ?? "password123",
  },
};

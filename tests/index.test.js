// tests/index.test.js
import { handler } from "../src/index.js";
import https from "https";

// Mock environment variable
process.env.RECAPTCHA_SECRET = "dummy-secret";

// Mock HTTPS request
jest.mock("https", () => ({
  request: jest.fn(),
}));

describe("captcha-auth-lambda", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if token is missing", async () => {
    const event = { body: JSON.stringify({}) };
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ message: "Token missing" });
  });

  it("should return 200 if CAPTCHA verification succeeds", async () => {
    // Set up mock HTTPS response
    https.request.mockImplementation((options, callback) => {
      const res = new MockResponse(JSON.stringify({ success: true }));
      callback(res);
      return new MockRequest();
    });

    const event = { body: JSON.stringify({ token: "valid-token" }) };
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ message: "CAPTCHA verification passed." });
  });

  it("should return 403 if CAPTCHA verification fails", async () => {
    https.request.mockImplementation((options, callback) => {
      const res = new MockResponse(JSON.stringify({ success: false }));
      callback(res);
      return new MockRequest();
    });

    const event = { body: JSON.stringify({ token: "invalid-token" }) };
    const result = await handler(event);

    expect(result.statusCode).toBe(403);
    expect(JSON.parse(result.body)).toEqual({ message: "CAPTCHA verification failed." });
  });
});

// Mock request/response streams
class MockResponse {
  constructor(data) {
    this.data = data;
  }

  on(event, callback) {
    if (event === "data") callback(this.data);
    if (event === "end") callback();
  }
}

class MockRequest {
  write() {}
  end() {}
  on() {}
}

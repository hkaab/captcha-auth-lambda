# 🛡️ CAPTCHA Auth Lambda

A lightweight, serverless solution to protect your APIs using CAPTCHA verification. This AWS Lambda function validates CAPTCHA tokens (e.g. from Google reCAPTCHA) to prevent bot access, and can be integrated with API Gateway as a custom authorizer or middleware.

## 🚀 Features

- 🔒 CAPTCHA token verification (Google reCAPTCHA v2/v3 compatible)
- ☁️ Built to run on AWS Lambda (Node.js)
- ⚙️ Easy integration with API Gateway
- 🌐 Lightweight and fast – ideal for microservices and serverless APIs

## 📁 Project Structure

```

.
├── src/
│   └── index.js         # Main Lambda handler
├── package.json         # NPM dependencies and scripts
└── README.md            # Project documentation

```

## 🧪 Usage

### 1. Prerequisites

- AWS account with Lambda and API Gateway access
- Google reCAPTCHA site key and secret key

### 2. Setup

Clone the repo and install dependencies:

```bash
git clone https://github.com/hkaab/captcha-auth-lambda.git
cd captcha-auth-lambda
npm install
````

### 3. Configuration

Update your environment variables in AWS Lambda:

| Variable           | Description                      |
| ------------------ | -------------------------------- |
| `RECAPTCHA_SECRET` | Your Google reCAPTCHA secret key |

### 4. Deployment

You can deploy the function using AWS Console, Serverless Framework, or Terraform. Here’s a simple AWS CLI example:

```bash
zip function.zip index.js node_modules/
aws lambda create-function \
  --function-name captcha-auth-lambda \
  --runtime nodejs18.x \
  --handler src/index.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::<your-account-id>:role/<your-lambda-role>
```

### 5. Sample Request

Send a request containing the CAPTCHA token:

```json
{
  "token": "your-client-captcha-token"
}
```


## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.

---

## 🙌 Contributions

Issues and pull requests are welcome! Feel free to fork this project and contribute.

---

## 📫 Contact

Created by [@hkaab](https://github.com/hkaab) – reach out if you have questions or ideas!

```

---

Let me know if you want this tailored for a different CAPTCHA provider, runtime (e.g., Python), or if you're using frameworks like Serverless or SAM for deployment. I can also create badges, add examples, or set up CI/CD steps if needed.
```

# 💰 Ledger-Based Banking API

A secure Node.js backend that simulates core banking operations using a **double-entry ledger system**, **idempotent transactions**, and **MongoDB transactions** for atomicity and consistency.

---

# 🚀 Features

* 🔐 JWT-based authentication
* 🏦 Multiple accounts per user
* 💸 Fund transfers between accounts
* 📒 Double-entry ledger (DEBIT / CREDIT)
* ♻️ Idempotent transactions (no duplicate transfers)
* ⚡ MongoDB transactions (atomic operations)
* 📧 Email notifications on transfers
* 🧠 Balance derived from ledger (no stored balance)

---

# 🧱 Tech Stack

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* Nodemailer

---

# 📁 Project Structure

```
src/
│
├── controllers/
├── models/
├── routes/
├── services/
├── middlewares/
│
├── app.js
└── server.js
```

---

# ⚙️ Setup Instructions

## 1. Clone the repository

```
git clone <your-repo-url>
cd <repo-name>
```

---

## 2. Install dependencies

```
npm install
```

---

## 3. Create `.env` file

  Copy from `.env.example`:

  ```
  cp .env.example .env
  ```

  Fill values:

    ```
    PORT=3000
    MONGO_URI=mongodb://127.0.0.1:27017/banking_app
    JWT_SECRET=your_secret_key

    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password

    SYSTEM_ACCOUNT_ID=your_system_account_id
    ```

  ---

## 4. Start server

```
npm start
```

---

# 🔄 API Flow (End-to-End)

---

## 🟢 1. Register User

```
POST /api/auth/register
```

---

## 🟢 2. Login User

```
POST /api/auth/login
```

👉 Copy JWT token

---

## 🟢 3. Create Accounts

```
POST /api/accounts
Authorization: Bearer TOKEN
```

👉 Create at least 2 accounts

---

## 🔴 4. Create System Account (Manual Step)

Insert manually in MongoDB:

```json
{
  "_id": ObjectId("64fa00000000000000000001"),
  "user": null,
  "status": "ACTIVE",
  "currency": "INR"
}
```

👉 Copy `_id` → paste into `.env` as `SYSTEM_ACCOUNT_ID`

---

## 🟡 5. Add Initial Funds

```
POST /api/transactions/system/initial-funds
```

Body:

```json
{
  "toAccount": "ACCOUNT_ID",
  "amount": 10000,
  "idempotencyKey": "init-1"
}
```

---

## 🔵 6. Transfer Funds

```
POST /api/transactions/transfer
Authorization: Bearer TOKEN
```

Body:

```json
{
  "fromAccount": "ACCOUNT_A",
  "toAccount": "ACCOUNT_B",
  "amount": 500,
  "idempotencyKey": "txn-1"
}
```

---

# 🧠 Core Concepts

---

## 📒 Double-Entry Ledger

Each transaction creates:

* 1 DEBIT entry (sender)
* 1 CREDIT entry (receiver)

👉 Ensures financial correctness

---

## ♻️ Idempotency

Same request with same key:

```json
"idempotencyKey": "txn-1"
```

👉 Will NOT create duplicate transactions

---

## ⚡ MongoDB Transactions

All operations run inside a session:

* Transaction record
* Debit entry
* Credit entry

👉 Either ALL succeed or ALL fail

---

## 💰 Balance Calculation

Balance is NOT stored.

It is calculated:

```
balance = totalCredits - totalDebits
```

---

# ⚠️ Known Limitations

* ❌ No concurrency locking (race conditions possible)
* ❌ No currency validation
* ❌ No account ownership checks
* ❌ System account setup is manual
* ❌ No rate limiting

---

# 🔮 Future Improvements

* Add account ownership validation
* Prevent race conditions (locking / atomic balance)
* Auto-create system account
* Add transaction history APIs
* Add pagination & filters
* Add Redis for caching/idempotency
* Add role-based access control

---

# 🧪 Testing Tips

* Always verify ledger entries after transaction
* Check balance using aggregation
* Test duplicate requests (idempotency)
* Simulate insufficient balance

---

# 💣 Important Notes

* `.env` is NOT included in repo
* Never commit secrets
* Rotate credentials if leaked

---

# 🧠 Learning Outcome

This project demonstrates:

* Real-world transaction handling
* Financial data consistency
* Backend system design principles
* Safe money transfer logic

---

# 👨‍💻 Author

Shubham Modi

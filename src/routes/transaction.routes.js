const {Router} = require('express');

const transactionRoutes = Router();

const transactionController = require('../controllers/transaction.controller')
const authMiddleware = require('../Middlewares/auth.middleware');

/* 
 * POST /api/transactions/
 * Create a new transaction
*/

// console.log(transactionController);
transactionRoutes.post(
  '/transfer',
  authMiddleware.authMiddleware,
  transactionController.createTransaction
);

/*
  * POST /api/transactions/system/initial-funds
  * Create Initial funds transaction from system user
*/

transactionRoutes.post('/system/initial-funds', transactionController.createInitialFundsTransaction);




module.exports = transactionRoutes;
const transactionModel = require('../models/transaction.model')
const ledgerModel = require('../models/ledger.model')
const emailService = require('../services/email.services')
const accountModel = require('../models/account.model');
const mongoose = require('mongoose');


/* 
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW
    
    * 1. Validate a request
    * 2. Validate a idempotency key
    * 3. Check account status
    * 4. Derive sender balance from ledger entries
    * 5. Create transaction (PENDING)
    * 6. Create ledger entry for sender (DEBIT)
    * 7. Create ledger entry for receiver (CREDIT)
    * 8. Update transaction status to COMPLETED
    * 9. Commit MongoDB session
    * 10. Send email notification
*/

async function createTransaction(req, res) {

  /*
   * 1. Validate A Request 
   */

  const {fromAccount, toAccount, amount, idempotencyKey} = req.body;

  if(!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({message: "can't process, All field is required (fromAccount, toAccount, amount, idempotencyKey)"});
  }

  const fromUserAccount = await accountModel.findOne({_id: fromAccount});
  const toUserAccount = await accountModel.findOne({_id: toAccount});

  if(!fromUserAccount || !toUserAccount) {
    return res.status(400).json({message: "Invalid fromAccount or toAccount"});
  }

  /*
   * 2. Validate Idempotency Key
   */
  const isTransactionAlreadyExist = await transactionModel.findOne({idempotencyKey: idempotencyKey});

  if(isTransactionAlreadyExist) {
    if(isTransactionAlreadyExist.status === "COMPLETED"){
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: "isTransactinoAlreadyExists"
      })
    }

    if(isTransactionAlreadyExist.status === "PENDING"){
      return res.status(200).json({
        message: "Transaction is already processing"
      })
    }

    if(isTransactionAlreadyExist.status === "FAILED"){
      return res.status(500).json({
        message: "Transaction processing failed, please retry"
      })
    }

    if(isTransactionAlreadyExist.status === "REVERSED"){
      res.status(500).json({
        message: "Transaction is reversed, please retry"
      });


    }
  }


  /*
   * 3 - Check Account Status
   */

  if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
    return res.status(500).json({
      message: "Either fromAccount or toAccount is not ACTIVE or toAccount is not ACTIVE"
    })
  }

  /*
    * 4. Derive sender balance from ledger entries
  */
  const balance = await fromUserAccount.getBalance();

  if(balance < amount){
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
    })
  }

  /*
    * 5. Create transaction (PENDING) - 9
   */

  const session = await mongoose.startSession();
  session.startTransaction()

  const transaction = await transactionModel.create({
    fromAccount,
    toAccount, 
    amount,
    idempotencyKey,
    status: "PENDING"
  }, {session})

  const debitLedgerEntry = await ledgerModel.create({
    account: fromAccount,
    amount: amount,
    transaction: transaction._id,
    type: "DEBIT"
  }, {session})

  const creditLedgerEntry = await ledgerModel.create({
    account: toAccount,
    amount: amount,
    transaction: transaction._id,
    type: "CREDIT"
  }, {session})

  transaction.status = "COMPLETED"
  await transaction.save({session})

  await session.commitTransaction()
  session.endSession();
  
  
  /*
    * 10. Send email notification
  */
  
  await emailService.sendTransactionEmail(req.user.email, req.user.name, fromAccount, toAccount, amount)

  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction: transaction
  })

} 

async function createInitialFundsTransaction(req, res){
  const {toAccount, amount, idempotencyKey} = req.body;

  if(!toAccount || !amount || !idempotencyKey){
    return res.status(402).json({
      message: "All the fields should be there (toAccount, amount, idempotencyKey)"
    })
  }

  const toUserAccount = await accountModel.findOne({_id: toAccount, })

  if(!toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAccount"
    })
  }

  const fromUserAccount = await accountModel.findOne({
    systemUser: true,
    user: user._id
  })

  if(!fromUserAccount){
    return res.status(400).json({
      message: "System user account not found"
    })
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = await transactionModel.create({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING"
  }, { session })

  const debitLedgerEntry = await ledgerModel.create({
    account: fromUserAccount._id,
    amount: amount,
    transaction: transaction._id,
    type: "DEBIT"
  }, { session })

  const creditLedgerEntry = await ledgerModel.create({
    account: toAccount,
    amount: amount,
    transaction: transaction._id,
    type: "CREDIT"
  }, { session })

  transaction.status = "COMPLETED"
  await transaction.save({ session })

  await session.commitTransaction()
  session.endSession()

  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction: transaction
  })

}


module.exports = {
  createTransaction,
  createInitialFundsTransaction
}
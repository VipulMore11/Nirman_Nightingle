from algosdk import transaction

def create_atomic_buy(buyer, seller, asset_id, amount, price):

    params = algod_client.suggested_params()

    pay_txn = transaction.PaymentTxn(
        sender=buyer,
        receiver=seller,
        amt=price,
        sp=params
    )

    asset_txn = transaction.AssetTransferTxn(
        sender=seller,
        receiver=buyer,
        amt=amount,
        index=asset_id,
        sp=params
    )

    gid = transaction.calculate_group_id([pay_txn, asset_txn])

    pay_txn.group = gid
    asset_txn.group = gid

    return [pay_txn, asset_txn]
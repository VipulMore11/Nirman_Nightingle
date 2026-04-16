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


def create_atomic_sell(seller, buyer, asset_id, amount, price):
    """
    Create atomic transactions for selling an asset.
    
    Args:
        seller: Seller wallet address (string)
        buyer: Buyer wallet address (string)
        asset_id: Algorand asset ID (integer)
        amount: Number of units to transfer (integer)
        price: Total payment amount in microAlgos (integer)
    
    Returns:
        List of two transactions: [AssetTransferTxn, PaymentTxn]
    """
    params = algod_client.suggested_params()

    # Seller transfers asset to buyer
    asset_txn = transaction.AssetTransferTxn(
        sender=seller,
        receiver=buyer,
        amt=amount,
        index=asset_id,
        sp=params
    )

    # Buyer sends payment to seller
    pay_txn = transaction.PaymentTxn(
        sender=buyer,
        receiver=seller,
        amt=price,
        sp=params
    )

    # Group transactions
    gid = transaction.calculate_group_id([asset_txn, pay_txn])

    asset_txn.group = gid
    pay_txn.group = gid

    return [asset_txn, pay_txn]
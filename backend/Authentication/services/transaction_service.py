from algosdk import transaction
from algosdk import transaction
from .algorand_service import algod_client

def create_atomic_buy(buyer, seller, asset_id, quantity, price):

    params = algod_client.suggested_params()

    # Payment txn (buyer → seller)
    payment_txn = transaction.PaymentTxn(
        sender=buyer,
        receiver=seller,
        amt=int(price),  # microAlgos
        sp=params
    )

    # asset transfer txn (seller → buyer)
    asset_txn = transaction.AssetTransferTxn(
        sender=seller,
        receiver=buyer,
        amt=int(quantity),
        index=asset_id,
        sp=params
    )

    # 🔗 Group them
    gid = transaction.calculate_group_id([payment_txn, asset_txn])

    payment_txn.group = gid
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
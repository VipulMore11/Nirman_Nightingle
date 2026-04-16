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

    return [payment_txn, asset_txn]


def create_atomic_sell(seller, buyer, asset_id, quantity, price):
    """
    Creates an atomic sell transaction.
    Seller transfers ASA to buyer, buyer pays seller.
    
    This mirrors create_atomic_buy - same transaction structure,
    but with clear sell-perspective parameter names.
    """
    params = algod_client.suggested_params()

    # Payment txn (buyer → seller)
    payment_txn = transaction.PaymentTxn(
        sender=buyer,
        receiver=seller,
        amt=int(price),  # microAlgos
        sp=params
    )

    # Asset transfer txn (seller → buyer)
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

    return [payment_txn, asset_txn]

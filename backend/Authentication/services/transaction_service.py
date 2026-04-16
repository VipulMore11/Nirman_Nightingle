from algosdk import transaction
from algosdk import encoding
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


def create_asa_on_blockchain(asset):
    """
    Generate ASA creation transaction for seller to sign.
    
    Returns transaction bytes that need to be signed with seller's Pera wallet
    and submitted to Algorand testnet.
    
    Args:
        asset: Asset model instance
        
    Returns:
        dict: Contains transaction bytes and metadata for signing
        {
            'txn_bytes': '...',  # Base64-encoded transaction bytes
            'asset_name': '...',
            'total_supply': int,
            'creator_wallet': '...'
        }
        
    Raises:
        Exception: If asset data is invalid
    """
    try:
        import base64
        from .algorand_service import create_asa_txn
        
        # Validate asset has required fields
        if not asset.creator_wallet:
            raise ValueError("Asset creator_wallet is required")
        
        if not asset.title:
            raise ValueError("Asset title is required")
        
        if not asset.total_supply:
            raise ValueError("Asset total_supply is required")
        
        # Create ASA transaction
        asa_txn = create_asa_txn(
            creator_address=asset.creator_wallet,
            asset_name=asset.title,
            unit_name=asset.title[:8],
            total=int(asset.total_supply)
        )
        
        # Encode transaction to bytes
        txn_bytes = encoding.msgpack_encode(asa_txn)
        
        # Convert to base64 for safe transmission
        if isinstance(txn_bytes, str):
            txn_bytes = txn_bytes.encode('utf-8')
        
        txn_base64 = base64.b64encode(txn_bytes).decode('utf-8')
        
        return {
            'txn_bytes': txn_base64,
            'asset_id': asset.id,
            'asset_name': asset.title,
            'total_supply': int(asset.total_supply),
            'creator_wallet': asset.creator_wallet
        }
        
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise ValueError(f"Failed to create ASA transaction: {str(e)}")


def submit_asa_to_blockchain(signed_txn_base64):
    """
    Submit signed ASA creation transaction to Algorand testnet.
    Waits for confirmation and returns the real ASA ID.
    
    Args:
        signed_txn_base64: Base64-encoded signed transaction from Pera wallet
        
    Returns:
        int: Real ASA ID from blockchain
        
    Raises:
        ValueError: If submission fails or times out
    """
    try:
        import base64
        import time
        
        # Decode signed transaction
        signed_txn_bytes = base64.b64decode(signed_txn_base64)
        
        # Submit to testnet
        txn_id = algod_client.send_transaction(signed_txn_bytes)
        
        # Wait for confirmation (max 10 rounds)
        confirmed_txn = None
        for i in range(10):
            try:
                confirmed_txn = algod_client.pending_transaction_info(txn_id)
                if confirmed_txn.get("confirmed-round"):
                    break
            except Exception:
                pass
            
            time.sleep(1)
        
        if not confirmed_txn or "asset-index" not in confirmed_txn:
            raise ValueError(f"Transaction {txn_id} failed or timed out")
        
        # Extract the real ASA ID from the confirmed transaction
        asa_id = confirmed_txn["asset-index"]
        
        return asa_id
        
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise ValueError(f"Failed to submit ASA to blockchain: {str(e)}")

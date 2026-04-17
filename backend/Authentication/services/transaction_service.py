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
        
        print(f"[DEBUG] ========== create_asa_on_blockchain START ==========")
        
        # Create ASA transaction (unsigned)
        asa_txn = create_asa_txn(
            creator_address=asset.creator_wallet,
            asset_name=asset.title,
            unit_name=asset.title[:8],
            total=int(asset.total_supply)
        )
        
        print(f"[DEBUG] ASA transaction created successfully")
        print(f"[DEBUG] Transaction type: {type(asa_txn)}")
        
        # ✅ Use encoding to properly serialize the transaction
        from algosdk import encoding
        
        # encoding.msgpack_encode() returns Base64-encoded transaction string
        txn_base64 = encoding.msgpack_encode(asa_txn)
        
        print(f"[DEBUG] ✅ Got transaction using encoding.msgpack_encode()")
        print(f"[DEBUG] txn_base64 type: {type(txn_base64)}")
        print(f"[DEBUG] txn_base64 length: {len(txn_base64)}")
        print(f"[DEBUG] txn_base64 first 50 chars: {txn_base64[:50]}")
        print(f"[DEBUG] ========== create_asa_on_blockchain END ==========")
        
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


# services/transaction_service.py

def submit_asa_to_blockchain(signed_txn_base64: str) -> int:
    """
    Submit signed ASA creation transaction to testnet using the Algorand SDK.
    Returns the ASA ID.
    """
    import base64
    import time
    from algosdk.error import AlgodHTTPError

    print(f"[DEBUG] ========== submit_asa_to_blockchain START ==========")
    
    # Decode base64 with comprehensive error handling
    print(f"[DEBUG] Received signed_txn_base64 type: {type(signed_txn_base64)}")
    print(f"[DEBUG] Received signed_txn_base64 length: {len(signed_txn_base64)}")
    print(f"[DEBUG] First 50 chars: {repr(str(signed_txn_base64)[:50])}")
    print(f"[DEBUG] Last 20 chars: {repr(str(signed_txn_base64)[-20:])}")
    
    try:
        # Convert to string and strip whitespace
        b64_str = str(signed_txn_base64).strip()
        
        # Remove ALL whitespace characters (spaces, newlines, tabs, etc.)
        b64_str = ''.join(b64_str.split())
        print(f"[DEBUG] After whitespace removal: {len(b64_str)} chars")
        
        # Try decoding with current length
        try:
            signed_txn_bytes = base64.b64decode(b64_str, validate=False)
            print(f"[DEBUG] ✅ Decoded successfully (no padding needed)")
        except (ValueError, TypeError) as first_attempt_err:
            print(f"[DEBUG] First decode attempt failed: {str(first_attempt_err)}")
            
            # Add padding and try again
            remainder = len(b64_str) % 4
            if remainder:
                padding_needed = 4 - remainder
                b64_str = b64_str + ('=' * padding_needed)
                print(f"[DEBUG] Added {padding_needed} padding chars, retrying...")
                try:
                    signed_txn_bytes = base64.b64decode(b64_str, validate=False)
                    print(f"[DEBUG] ✅ Decoded successfully after padding")
                except Exception as padded_err:
                    print(f"[ERROR] Decode failed even with padding: {str(padded_err)}")
                    # Try without validation at all
                    print(f"[DEBUG] Attempting decode without validation...")
                    try:
                        signed_txn_bytes = base64.b64decode(b64_str)
                        print(f"[DEBUG] ✅ Decoded with fallback method")
                    except Exception as fallback_err:
                        raise ValueError(f"All Base64 decode attempts failed: {str(fallback_err)}")
            else:
                raise ValueError(f"Base64 decode failed and no padding needed: {str(first_attempt_err)}")
        
        print(f"[DEBUG] Decoded signed txn bytes length: {len(signed_txn_bytes)}")
        print(f"[DEBUG] First 20 bytes (hex): {signed_txn_bytes[:20].hex()}")
        
    except (ValueError, TypeError) as decode_err:
        print(f"[ERROR] Base64 decode failed: {type(decode_err).__name__}: {str(decode_err)}")
        print(f"[ERROR] Input was: {str(signed_txn_base64)[:100]}...")
        print(f"[ERROR] Full input length: {len(signed_txn_base64)}")
        raise ValueError(f"Invalid Base64 encoding: {str(decode_err)}")
    
    # Validate msgpack encoding before submission
    try:
        from algosdk import encoding
        decoded_txn = encoding.msgpack_decode(signed_txn_bytes)
        print(f"[DEBUG] ✅ Msgpack validation successful")
    except Exception as validate_err:
        print(f"[DEBUG] Msgpack validation warning: {str(validate_err)}")

    # CRITICAL: send_raw_transaction() expects a Base64-encoded STRING, not raw bytes!
    # It will base64-decode internally, so we pass the Base64 string we already have
    print(f"[DEBUG] Converting raw bytes back to Base64 for send_raw_transaction()...")
    b64_for_submission = base64.b64encode(signed_txn_bytes).decode('utf-8')
    print(f"[DEBUG] Base64 for submission length: {len(b64_for_submission)}")
    
    # Submit using send_raw_transaction which will base64-decode it internally
    try:
        txn_id = algod_client.send_raw_transaction(b64_for_submission)
        print(f"[DEBUG] ✅ Transaction submitted with ID: {txn_id}")
    except AlgodHTTPError as e:
        print(f"[ERROR] Algorand node rejected transaction: {str(e)}")
        raise ValueError(f"Algorand node rejected transaction: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error submitting transaction: {type(e).__name__}: {str(e)}")
        raise ValueError(f"Failed to submit transaction: {str(e)}")

    # Wait for confirmation (max 10 rounds)
    confirmed_txn = None
    for i in range(10):
        try:
            confirmed_txn = algod_client.pending_transaction_info(txn_id)
            if confirmed_txn.get("confirmed-round"):
                print(f"[DEBUG] Confirmed in round {confirmed_txn['confirmed-round']}")
                break
        except Exception as poll_err:
            print(f"[DEBUG] Poll attempt {i} failed: {poll_err}")
        time.sleep(1)

    if not confirmed_txn:
        raise ValueError(f"Transaction {txn_id} timed out after 10 rounds")

    if "asset-index" not in confirmed_txn:
        raise ValueError("Transaction failed – no asset-index in confirmation")

    asa_id = confirmed_txn["asset-index"]
    print(f"[DEBUG] ASA created with ID: {asa_id}")
    return asa_id
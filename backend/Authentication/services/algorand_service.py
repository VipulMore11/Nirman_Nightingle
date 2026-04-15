from algosdk.v2client import algod

ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""

algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)

from algosdk import transaction

def create_asa_txn(creator_address, asset_name, unit_name, total):

    params = algod_client.suggested_params()

    txn = transaction.AssetConfigTxn(
        sender=creator_address,
        sp=params,
        total=total,
        decimals=0,
        unit_name=unit_name,
        asset_name=asset_name,
        manager=creator_address,
        reserve=creator_address,
        freeze=creator_address,
        clawback=creator_address
    )

    return txn

def opt_in_txn(user_address, asset_id):

    params = algod_client.suggested_params()

    txn = transaction.AssetTransferTxn(
        sender=user_address,
        receiver=user_address,
        amt=0,
        index=asset_id,
        sp=params
    )

    return txn
"""
Blockchain interactions using Web3.py
Handles ERC-20 balance checks and governance contract calls.
"""
import logging
from decimal import Decimal
from typing import Optional, Tuple

from web3 import Web3
from web3.contract import Contract
from django.conf import settings

logger = logging.getLogger(__name__)


class BlockchainService:
    """
    Encapsulates Web3 interactions with blockchain.
    """

    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER_URL))
        if not self.w3.is_connected():
            logger.warning("Web3 provider not connected")

    def get_balance_at_block(
        self,
        token_address: str,
        wallet_address: str,
        block_number: Optional[int] = None
    ) -> Decimal:
        """
        Fetch token balance of a wallet at a specific block (for voting snapshot).
        
        Args:
            token_address: ERC-20 contract address
            wallet_address: User's wallet address
            block_number: Block number for snapshot (None = latest)
            
        Returns:
            Token balance as Decimal (in wei)
        """
        try:
            token_address = self._validate_address(token_address)
            wallet_address = self._validate_address(wallet_address)

            # Standard ERC-20 balanceOf ABI
            erc20_abi = [
                {
                    "constant": True,
                    "inputs": [{"name": "_owner", "type": "address"}],
                    "name": "balanceOf",
                    "outputs": [{"name": "balance", "type": "uint256"}],
                    "type": "function",
                }
            ]

            contract = self.w3.eth.contract(
                address=token_address,
                abi=erc20_abi
            )

            block = block_number or "latest"
            balance = contract.functions.balanceOf(wallet_address).call(
                block_identifier=block
            )
            
            return Decimal(str(balance))

        except Exception as e:
            logger.error(f"Error fetching balance: {str(e)}")
            raise

    def get_total_supply(
        self,
        token_address: str,
        block: Optional[int] = None
    ) -> Decimal:
        """
        Fetch total token supply from contract.
        
        Args:
            token_address: ERC-20 contract address
            block: Optional block number (None = latest)
            
        Returns:
            Total supply as Decimal (in wei)
        """
        try:
            token_address = self._validate_address(token_address)

            erc20_abi = [
                {
                    "constant": True,
                    "inputs": [],
                    "name": "totalSupply",
                    "outputs": [{"name": "", "type": "uint256"}],
                    "type": "function",
                }
            ]

            contract = self.w3.eth.contract(
                address=token_address,
                abi=erc20_abi
            )

            block_identifier = block or "latest"
            supply = contract.functions.totalSupply().call(
                block_identifier=block_identifier
            )
            
            return Decimal(str(supply))

        except Exception as e:
            logger.error(f"Error fetching total supply: {str(e)}")
            raise

    def get_vote(
        self,
        proposal_id: int,
        voter_address: str
    ) -> Tuple[Optional[bool], Optional[Decimal]]:
        """
        Fetch vote from governance contract.
        
        Args:
            proposal_id: ID of the proposal
            voter_address: Address of the voter
            
        Returns:
            Tuple of (support: bool, weight: Decimal) or (None, None) if no vote
        """
        try:
            voter_address = self._validate_address(voter_address)
            
            governance_contract = self._get_governance_contract()
            
            # Call getVote function
            vote = governance_contract.functions.getVote(
                proposal_id,
                voter_address
            ).call()
            
            # Returns (support: bool, weight: uint256)
            if vote and len(vote) >= 2:
                return vote[0], Decimal(str(vote[1]))
            
            return None, None

        except Exception as e:
            logger.error(f"Error fetching vote: {str(e)}")
            return None, None

    def cast_vote(
        self,
        proposal_id: int,
        choice: bool,
        private_key: str
    ) -> str:
        """
        Send a vote transaction to the governance contract.
        
        Args:
            proposal_id: ID of the proposal
            choice: True for YES, False for NO
            private_key: Private key of voter
            
        Returns:
            Transaction hash
        """
        try:
            governance_contract = self._get_governance_contract()
            account = self.w3.eth.account.from_key(private_key)
            
            # Build transaction
            tx = governance_contract.functions.vote(
                proposal_id,
                choice
            ).build_transaction({
                'from': account.address,
                'nonce': self.w3.eth.get_transaction_count(account.address),
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
            })
            
            # Sign and send
            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            logger.info(f"Vote transaction sent: {tx_hash.hex()}")
            return tx_hash.hex()

        except Exception as e:
            logger.error(f"Error casting vote: {str(e)}")
            raise

    def record_veto(
        self,
        proposal_id: int,
        owner_key: str
    ) -> str:
        """
        Send a veto transaction to the governance contract.
        
        Args:
            proposal_id: ID of the proposal
            owner_key: Private key of owner
            
        Returns:
            Transaction hash
        """
        try:
            governance_contract = self._get_governance_contract()
            account = self.w3.eth.account.from_key(owner_key)
            
            tx = governance_contract.functions.veto(proposal_id).build_transaction({
                'from': account.address,
                'nonce': self.w3.eth.get_transaction_count(account.address),
                'gas': 150000,
                'gasPrice': self.w3.eth.gas_price,
            })
            
            signed_tx = self.w3.eth.account.sign_transaction(tx, owner_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            logger.info(f"Veto transaction sent: {tx_hash.hex()}")
            return tx_hash.hex()

        except Exception as e:
            logger.error(f"Error executing veto: {str(e)}")
            raise

    def get_veto_count(
        self,
        owner_address: str,
        year: int
    ) -> int:
        """
        Count vetoes by owner in a specific calendar year.
        Scans blockchain events for Vetoed events.
        
        Args:
            owner_address: Address of the owner
            year: Calendar year to check
            
        Returns:
            Count of vetoes in that year
        """
        try:
            owner_address = self._validate_address(owner_address)
            governance_contract = self._get_governance_contract()
            
            # Get events - simplified approach
            # In production, you'd need proper event filtering
            events = governance_contract.events.Vetoed.get_logs()
            
            veto_count = 0
            for event in events:
                # Parse event timestamp to check year
                # This is a simplified placeholder
                # In production, batch query events with block ranges
                pass
            
            return veto_count

        except Exception as e:
            logger.error(f"Error counting vetoes: {str(e)}")
            return 0

    def get_snapshot_block(self, proposal_id: int) -> Optional[int]:
        """
        Fetch the block number when voting for this proposal started.
        
        Args:
            proposal_id: ID of the proposal
            
        Returns:
            Block number or None
        """
        try:
            governance_contract = self._get_governance_contract()
            
            # Assumes contract stores snapshot block for each proposal
            snapshot = governance_contract.functions.getSnapshotBlock(
                proposal_id
            ).call()
            
            return snapshot if snapshot > 0 else None

        except Exception as e:
            logger.error(f"Error fetching snapshot block: {str(e)}")
            return None

    def get_current_block(self) -> int:
        """Get the current block number from the blockchain."""
        try:
            return self.w3.eth.block_number
        except Exception as e:
            logger.error(f"Error fetching current block: {str(e)}")
            raise

    # ---- Private helper methods ----

    def _validate_address(self, address: str) -> str:
        """Validate and checksum an Ethereum address."""
        if not self.w3.is_address(address):
            raise ValueError(f"Invalid address: {address}")
        return self.w3.to_checksum_address(address)

    def _get_governance_contract(self) -> Contract:
        """
        Returns the governance contract instance.
        Uses contract ABI based on assumptions about the contract interface.
        """
        governance_abi = [
            {
                "type": "function",
                "name": "vote",
                "inputs": [
                    {"name": "proposalId", "type": "uint256"},
                    {"name": "support", "type": "bool"},
                ],
                "outputs": [],
                "stateMutability": "nonpayable",
            },
            {
                "type": "function",
                "name": "veto",
                "inputs": [{"name": "proposalId", "type": "uint256"}],
                "outputs": [],
                "stateMutability": "nonpayable",
            },
            {
                "type": "function",
                "name": "getVote",
                "inputs": [
                    {"name": "proposalId", "type": "uint256"},
                    {"name": "voter", "type": "address"},
                ],
                "outputs": [
                    {"name": "support", "type": "bool"},
                    {"name": "weight", "type": "uint256"},
                ],
                "stateMutability": "view",
            },
            {
                "type": "function",
                "name": "getSnapshotBlock",
                "inputs": [{"name": "proposalId", "type": "uint256"}],
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
            },
            {
                "type": "event",
                "name": "VoteCast",
                "inputs": [
                    {"name": "voter", "type": "address", "indexed": True},
                    {"name": "proposalId", "type": "uint256", "indexed": True},
                    {"name": "support", "type": "bool"},
                    {"name": "weight", "type": "uint256"},
                ],
            },
            {
                "type": "event",
                "name": "Vetoed",
                "inputs": [
                    {"name": "proposalId", "type": "uint256", "indexed": True},
                ],
            },
        ]

        return self.w3.eth.contract(
            address=self._validate_address(settings.GOVERNANCE_CONTRACT_ADDRESS),
            abi=governance_abi
        )


# Create a singleton instance
blockchain_service = BlockchainService()

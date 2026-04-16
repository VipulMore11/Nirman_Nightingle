"""
Mock Web3 client for testing without a real blockchain.
Simulates ERC-20 contract and governance contract interactions.
"""
from decimal import Decimal
from datetime import datetime
from typing import Dict, Optional, Tuple, List


class MockWeb3:
    """
    Simulates Web3 provider and contract interactions.
    """
    
    def __init__(self):
        """Initialize mock Web3 with default test data."""
        # Mock balances: {wallet_address: {block_number: balance}}
        self.balances: Dict[str, Dict[int, Decimal]] = {}
        
        # Fixed total supply
        self.total_supply = Decimal('1000000000000000000000000')  # 1M tokens
        
        # Vote records: {(proposal_id, voter): (choice, weight)}
        self.votes: Dict[Tuple[int, str], Tuple[bool, Decimal]] = {}
        
        # Veto records: {(proposal_id, owner): timestamp}
        self.vetoes: Dict[Tuple[int, str], datetime] = {}
        
        # Recorded calls for verification
        self.call_history: List[Dict] = []

    def set_balance(
        self,
        address: str,
        balance: Decimal,
        block_number: int = 'latest'
    ) -> None:
        """
        Set token balance for an address at a specific block.
        
        Args:
            address: Wallet address
            balance: Token balance in wei
            block_number: Block number (int) or 'latest'
        """
        if address not in self.balances:
            self.balances[address] = {}
        
        # Store for specific block
        if isinstance(block_number, int):
            self.balances[address][block_number] = balance
        
        # Always store in 'latest'
        self.balances[address]['latest'] = balance

    def get_balance_at_block(
        self,
        token_address: str,
        wallet_address: str,
        block_number: Optional[int] = None
    ) -> Decimal:
        """
        Simulate ERC-20 balanceOf at a specific block.
        """
        self.call_history.append({
            'function': 'get_balance_at_block',
            'token': token_address,
            'wallet': wallet_address,
            'block': block_number
        })
        
        if wallet_address not in self.balances:
            return Decimal('0')
        
        block = block_number or 'latest'
        
        # If requesting specific block, return that balance
        if isinstance(block, int):
            # Return exact block if set, else latest
            if block in self.balances[wallet_address]:
                return self.balances[wallet_address][block]
        
        # Return latest
        return self.balances[wallet_address].get('latest', Decimal('0'))

    def get_total_supply(
        self,
        token_address: str,
        block: Optional[int] = None
    ) -> Decimal:
        """Simulate ERC-20 totalSupply."""
        self.call_history.append({
            'function': 'get_total_supply',
            'token': token_address,
            'block': block
        })
        return self.total_supply

    def set_total_supply(self, supply: Decimal) -> None:
        """Set the total supply."""
        self.total_supply = supply

    def get_current_block(self) -> int:
        """Return current mock block number."""
        self.call_history.append({'function': 'get_current_block'})
        return 12345

    def record_vote(
        self,
        proposal_id: int,
        voter_address: str,
        choice: bool,
        weight: Decimal
    ) -> None:
        """
        Record a vote (simulates voting on-chain).
        
        Args:
            proposal_id: Proposal ID
            voter_address: Voter wallet
            choice: True for YES, False for NO
            weight: Vote weight (balance at snapshot)
        """
        self.call_history.append({
            'function': 'record_vote',
            'proposal_id': proposal_id,
            'voter': voter_address,
            'choice': choice,
            'weight': weight
        })
        self.votes[(proposal_id, voter_address)] = (choice, weight)

    def get_vote(
        self,
        proposal_id: int,
        voter_address: str
    ) -> Tuple[Optional[bool], Optional[Decimal]]:
        """
        Get recorded vote for a proposal.
        Returns (choice, weight) or (None, None) if not voted.
        """
        self.call_history.append({
            'function': 'get_vote',
            'proposal_id': proposal_id,
            'voter': voter_address
        })
        
        if (proposal_id, voter_address) in self.votes:
            choice, weight = self.votes[(proposal_id, voter_address)]
            return choice, weight
        return None, None

    def record_veto(
        self,
        proposal_id: int,
        owner_address: str,
        timestamp: datetime
    ) -> None:
        """Record a veto."""
        self.call_history.append({
            'function': 'record_veto',
            'proposal_id': proposal_id,
            'owner': owner_address,
            'timestamp': timestamp
        })
        self.vetoes[(proposal_id, owner_address)] = timestamp

    def get_veto_count(
        self,
        owner_address: str,
        year: int
    ) -> int:
        """
        Get count of vetoes by owner in a specific calendar year.
        """
        self.call_history.append({
            'function': 'get_veto_count',
            'owner': owner_address,
            'year': year
        })
        
        count = 0
        for (prop_id, owner), timestamp in self.vetoes.items():
            if owner == owner_address and timestamp.year == year:
                count += 1
        return count

    def clear_history(self) -> None:
        """Clear call history for assertion testing."""
        self.call_history = []

    def assert_function_called(self, function_name: str) -> None:
        """Assert that a function was called."""
        for call in self.call_history:
            if call.get('function') == function_name:
                return
        raise AssertionError(f"{function_name} was not called")

    def assert_function_not_called(self, function_name: str) -> None:
        """Assert that a function was NOT called."""
        for call in self.call_history:
            if call.get('function') == function_name:
                raise AssertionError(f"{function_name} was called but should not have been")

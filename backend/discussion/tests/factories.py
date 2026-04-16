"""
Factory Boy factories for creating test data.
Provides easy creation of Company, Proposal, User, Comment, VoteRecord instances.
"""
import factory
from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone
from django.contrib.auth import get_user_model

from discussion.models import Company, Proposal, Comment, VoteRecord

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    """Factory for creating User instances with wallet addresses."""
    
    class Meta:
        model = User
    
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    username = factory.Sequence(lambda n: f"user{n}")
    password = "testpass123"
    wallet_address = factory.Sequence(lambda n: f"0x{n:040d}")
    is_active = True

    @factory.post_generation
    def set_password(obj, create, extracted, **kwargs):
        """Set password after user creation."""
        obj.set_password(obj.password)
        if create:
            obj.save()


class CompanyFactory(factory.django.DjangoModelFactory):
    """Factory for creating Company instances."""
    
    class Meta:
        model = Company
    
    name = factory.Sequence(lambda n: f"Company {n}")
    token_address = factory.Sequence(lambda n: f"0x{ord('a') + (n % 26) * 2:040x}")
    owner_address = factory.Sequence(lambda n: f"0x{n:040x}")
    total_supply = Decimal('1000000000000000000000000')  # 1M tokens


class ProposalFactory(factory.django.DjangoModelFactory):
    """Factory for creating Proposal instances."""
    
    class Meta:
        model = Proposal
    
    company = factory.SubFactory(CompanyFactory)
    title = factory.Sequence(lambda n: f"Proposal {n}")
    description = factory.Sequence(lambda n: f"Description for proposal {n}")
    proposer_address = factory.LazyAttribute(lambda obj: UserFactory().wallet_address)
    status = 'DRAFT'
    created_at = factory.LazyFunction(timezone.now)

    @factory.lazy_attribute
    def voting_start(self):
        """Set voting_start 3 days from creation."""
        return self.created_at + timedelta(days=3)

    @factory.lazy_attribute
    def voting_end(self):
        """Set voting_end 10 days from creation."""
        return self.created_at + timedelta(days=10)


class DraftProposalFactory(ProposalFactory):
    """Factory for DRAFT status proposals."""
    status = 'DRAFT'
    discussion_end = None
    voting_start = None
    voting_end = None


class DiscussionProposalFactory(ProposalFactory):
    """Factory for DISCUSSION status proposals."""
    status = 'DISCUSSION'
    discussion_end = factory.LazyFunction(
        lambda: timezone.now() + timedelta(days=3)
    )
    voting_start = None
    voting_end = None


class VotingProposalFactory(ProposalFactory):
    """Factory for VOTING status proposals."""
    status = 'VOTING'
    snapshot_block = 12345
    discussion_end = factory.LazyFunction(
        lambda: timezone.now() - timedelta(days=3)
    )
    voting_start = factory.LazyFunction(
        lambda: timezone.now() - timedelta(hours=1)
    )
    voting_end = factory.LazyFunction(
        lambda: timezone.now() + timedelta(days=6)
    )


class PassedProposalFactory(ProposalFactory):
    """Factory for PASSED status proposals."""
    status = 'PASSED'
    snapshot_block = 12345
    discussion_end = factory.LazyFunction(
        lambda: timezone.now() - timedelta(days=10)
    )
    voting_start = factory.LazyFunction(
        lambda: timezone.now() - timedelta(days=7)
    )
    voting_end = factory.LazyFunction(
        lambda: timezone.now() - timedelta(days=1)
    )
    yes_votes_weight = Decimal('200000000000000000000000')  # 20% (> NO)
    no_votes_weight = Decimal('100000000000000000000000')   # 10% (> 16% quorum)
    quorum_reached = True


class FailedProposalFactory(ProposalFactory):
    """Factory for FAILED status proposals."""
    status = 'FAILED'
    snapshot_block = 12345
    discussion_end = factory.LazyFunction(
        lambda: timezone.now() - timedelta(days=10)
    )
    voting_start = factory.LazyFunction(
        lambda: timezone.now() - timedelta(days=7)
    )
    voting_end = factory.LazyFunction(
        lambda: timezone.now() - timedelta(days=1)
    )
    yes_votes_weight = Decimal('100000000000000000000000')   # 10% (< NO)
    no_votes_weight = Decimal('200000000000000000000000')    # 20% (> 16% quorum)
    quorum_reached = True


class DiedProposalFactory(ProposalFactory):
    """Factory for DIED status proposals."""
    status = 'DIED'
    snapshot_block = 12345
    discussion_end = factory.LazyFunction(
        lambda: timezone.now() - timedelta(days=20)
    )
    voting_start = factory.LazyFunction(
        lambda: timezone.now() - timedelta(days=17)
    )
    voting_end = factory.LazyFunction(
        lambda: timezone.now() - timedelta(days=3)
    )
    extension_count = 2
    yes_votes_weight = Decimal('100000000000000000000000')   # 10% (not 16%)
    no_votes_weight = Decimal('50000000000000000000000')     # 5%
    quorum_reached = False


class VetoedProposalFactory(ProposalFactory):
    """Factory for VETOED status proposals."""
    status = 'VETOED'
    snapshot_block = 12345
    discussion_end = factory.LazyFunction(
        lambda: timezone.now() - timedelta(days=10)
    )
    voting_start = factory.LazyFunction(
        lambda: timezone.now() - timedelta(days=7)
    )
    voting_end = factory.LazyFunction(
        lambda: timezone.now() - timedelta(days=1)
    )
    veto_date = factory.LazyFunction(timezone.now)


class CommentFactory(factory.django.DjangoModelFactory):
    """Factory for creating Comment instances."""
    
    class Meta:
        model = Comment
    
    proposal = factory.SubFactory(DiscussionProposalFactory)
    author_address = factory.LazyAttribute(lambda obj: UserFactory().wallet_address)
    content = factory.Faker('text', max_nb_chars=200)
    created_at = factory.LazyFunction(timezone.now)


class VoteRecordFactory(factory.django.DjangoModelFactory):
    """Factory for creating VoteRecord instances."""
    
    class Meta:
        model = VoteRecord
    
    proposal = factory.SubFactory(VotingProposalFactory)
    voter_address = factory.LazyAttribute(lambda obj: UserFactory().wallet_address)
    choice = 'YES'
    weight = Decimal('100000000000000000000000')  # 10% of total supply
    tx_hash = factory.Sequence(lambda n: f"0x{n:064x}")
    created_at = factory.LazyFunction(timezone.now)


class YesVoteFactory(VoteRecordFactory):
    """Factory for YES votes."""
    choice = 'YES'
    voter_address = factory.LazyAttribute(lambda obj: UserFactory().wallet_address)


class NoVoteFactory(VoteRecordFactory):
    """Factory for NO votes."""
    choice = 'NO'
    voter_address = factory.LazyAttribute(lambda obj: UserFactory().wallet_address)


# Test data generators for common scenarios

def create_test_company(
    name: str = "Test Company",
    total_supply: Decimal = Decimal('1000000000000000000000000')
) -> Company:
    """Create a test company with given parameters."""
    return CompanyFactory(name=name, total_supply=total_supply)


def create_large_holder_user(
    company: Company,
    percentage: Decimal = Decimal('10'),
    wallet: str = None
) -> User:
    """
    Create a user who holds the given percentage.
    
    Args:
        company: Company instance
        percentage: Percentage of total supply (default 10%)
        wallet: Custom wallet address (optional)
    
    Returns:
        User instance
    """
    user = UserFactory(wallet_address=wallet)
    return user


def create_small_holder_user(
    company: Company,
    percentage: Decimal = Decimal('1'),
    wallet: str = None
) -> User:
    """
    Create a user who holds less than 5%.
    
    Args:
        company: Company instance
        percentage: Percentage of total supply (default 1%)
        wallet: Custom wallet address (optional)
    
    Returns:
        User instance
    """
    user = UserFactory(wallet_address=wallet)
    return user


def create_owner_user(
    company: Company,
    wallet: str = None
) -> User:
    """
    Create the owner user with company owner address.
    
    Args:
        company: Company instance
        wallet: Custom wallet address (defaults to company.owner_address)
    
    Returns:
        User instance
    """
    address = wallet or company.owner_address
    user = UserFactory(wallet_address=address)
    return user

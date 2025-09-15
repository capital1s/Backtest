# pylint: skip-file
import factory
from faker import Faker

fake = Faker()


class TradeFactory(factory.Factory):
    class Meta:
        model = dict

    id = factory.Sequence(lambda n: n)
    ticker = factory.LazyFunction(lambda: fake.currency_code())
    shares = factory.LazyFunction(lambda: fake.random_int(min=1, max=1000))
    price = factory.LazyFunction(
        lambda: round(fake.pyfloat(
            left_digits=3, right_digits=2, positive=True), 2)
    )
    side = factory.LazyFunction(
        lambda: fake.random_element(elements=("buy", "sell")))
    timestamp = factory.LazyFunction(lambda: fake.iso8601())


# Example usage:
# trades = TradeFactory.create_batch(1000)

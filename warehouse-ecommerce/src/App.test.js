import { render, screen } from '@testing-library/react';
import CartSummary from './components/CartSummary';

test('shows cart item when cart key and product id are equivalent strings', () => {
  render(
    <CartSummary
      cart={{ '737628064502': 2 }}
      products={[{ id: '737628064502', name: 'Rice', pricePerUnit: 10, image: 'x' }]}
      onRemoveFromCart={() => {}}
      onClearCart={() => {}}
      onCheckout={() => {}}
    />
  );

  expect(screen.getByText('Rice')).toBeInTheDocument();
  expect(screen.getByText(/2 × R10.00/)).toBeInTheDocument();
});

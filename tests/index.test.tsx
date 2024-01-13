/**
 * @jest-environment jsdom
 */
import { CartProvider, Discount, Item, Shipping, useCart } from '../src';
import { describe, expect, test } from '@jest/globals';
import { act } from '@testing-library/react-hooks';
import { renderHook } from '@testing-library/react';
import React from 'react';

const exampleProducts = [
    {
        id: 'test1',
        name: 'Test product',
        description: 'This is the description',
        price: 1000,
    } as Item,
    {
        id: 'test2',
        name: 'Test product1',
        description: 'This is the description',
        price: 2000,
    } as Item,
];

const exampleDiscounts = [
    {
        id: 'discount1',
        code: 'AMOUNT_DISCOUNT',
        type: 'amount',
        value: 2000,
    } as Discount,
    {
        id: 'discount2',
        code: 'PERCENT_DISCOUNT',
        type: 'percent',
        value: 1000,
    } as Discount,
];

const exampleShipping = {
    description: 'Flat rate shipping',
    cost: 1000,
} as Shipping;

describe('react-shoppingcart tests', () => {
    test('sets cartId', () => {
        const customCartId = 'custom-cart-id';
        const wrapper = ({ children }: any) => (
            <CartProvider cartId={customCartId}>{children}</CartProvider>
        );
        const { result } = renderHook(() => useCart(), { wrapper });

        expect(result.current.cartId).toEqual(customCartId);
    });

    test('Check default cartId', () => {
        const wrapper = ({ children }: any) => (
            <CartProvider>{children}</CartProvider>
        );
        const { result } = renderHook(() => useCart(), { wrapper });

        expect(result.current.cartId).toEqual('react-shoppingcart');
    });

    test('sets cart metadata', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });

        const metadata = {
            customerId: '1234',
            notes: 'Leave on door step',
        };

        act(() => result.current.setMetadata(metadata));

        expect(result.current.metadata).toEqual(metadata);
    });

    test('Updates cart metadata', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });

        const metadata = {
            customerId: '12345',
            notes: 'Sign on delivery',
        };

        act(() => result.current.setMetadata(metadata));

        expect(result.current.metadata).toEqual(metadata);

        const newMetadata = {
            coupon: 'abc1234',
            notes: 'Not signature required',
            newValue: 'Test',
        };

        act(() => result.current.setMetadata(newMetadata));

        expect(result.current.metadata).toEqual(newMetadata);
    });

    test('Updates cart metadata', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });

        const metadata = {
            coupon: 'abc123',
            notes: 'Leave on door step',
        };

        act(() => result.current.setMetadata(metadata));

        expect(result.current.metadata).toEqual(metadata);

        act(() => result.current.clearMetadata());

        expect(result.current.metadata).toEqual({});
    });

    test('Add item', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add an item
        act(() => result.current.addItem(exampleProducts[0]));

        expect(result.current.items).toHaveLength(1);
        expect(result.current.totalNumberItems).toBe(1);
        expect(result.current.totalUniqueItems).toBe(1);
    });

    test('Add item with multiple quantity', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add an item with 5 quantity
        act(() => result.current.addItem(exampleProducts[0], 5));

        expect(result.current.items).toHaveLength(1);
        expect(result.current.totalNumberItems).toBe(5);
        expect(result.current.totalUniqueItems).toBe(1);
    });

    test('Add item with variant - Check uniqueness', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        const product = {
            id: 'test1',
            name: 'Test product',
            description: 'This is the description',
            price: 1000,
        } as Item;

        // Add an item
        act(() =>
            result.current.addItem({
                ...product,
                itemVariants: [
                    {
                        size: 'US10',
                    },
                ],
            }),
        );
        // Add the same item but change variant
        act(() =>
            result.current.addItem({
                ...product,
                itemVariants: [
                    {
                        size: 'US12',
                    },
                ],
            }),
        );

        // Check both items are in the cart
        expect(result.current.items).toHaveLength(2);
        expect(result.current.totalNumberItems).toBe(2);
        expect(result.current.totalUniqueItems).toBe(2);
    });

    test('Incease quantity by adding same item', async () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add two items
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[0]));

        expect(result.current.items.length).toBe(1);
        expect(result.current.totalNumberItems).toBe(2);
        expect(result.current.totalUniqueItems).toBe(1);
    });

    test('Get item', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add an item
        act(() => result.current.addItem(exampleProducts[0]));

        const getItem = result.current.getItem(exampleProducts[0]);

        expect(getItem.id).toBe(exampleProducts[0].id);
        expect(getItem.name).toBe(exampleProducts[0].name);
        expect(getItem.quantity).toBe(1);
    });

    test('Get item - Not in cart', () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add an item
        act(() => result.current.addItem(exampleProducts[0]));

        const getItem = result.current.getItem(exampleProducts[1]);

        expect(getItem).toBe(undefined);
    });

    test('Increase quantity', async () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add an item
        act(() => result.current.addItem(exampleProducts[0]));

        // Update quantity
        act(() =>
            result.current.updateItemQuantity(
                exampleProducts[0],
                'increase',
                2,
            ),
        );

        expect(result.current.items.length).toBe(1);
        expect(result.current.totalNumberItems).toBe(3);
        expect(result.current.totalUniqueItems).toBe(1);
    });

    test('Reduce quantity', async () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add an item
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[0]));

        expect(result.current.totalNumberItems).toBe(3);

        // Update quantity
        act(() =>
            result.current.updateItemQuantity(
                exampleProducts[0],
                'decrease',
                2,
            ),
        );

        expect(result.current.items).toHaveLength(1);
        expect(result.current.totalNumberItems).toBe(1);
        expect(result.current.totalUniqueItems).toBe(1);
    });

    test('Update quantity with negative quantity', async () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add an item
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[0]));

        expect(result.current.totalNumberItems).toBe(3);

        // Update quantity
        expect(() => {
            act(() =>
                result.current.updateItemQuantity(
                    exampleProducts[0],
                    'decrease',
                    -1,
                ),
            );
        }).toThrow('You must provide a positive `quantity` number');
    });

    test('Check item removed when reduced quantity on 1', async () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add an item
        act(() => result.current.addItem(exampleProducts[0]));

        expect(result.current.totalNumberItems).toBe(1);

        // Update quantity
        act(() =>
            result.current.updateItemQuantity(
                exampleProducts[0],
                'decrease',
                1,
            ),
        );

        expect(result.current.items).toHaveLength(0);
        expect(result.current.totalNumberItems).toBe(0);
        expect(result.current.totalUniqueItems).toBe(0);
        expect(result.current.cartTotal).toBe(0);
    });

    test('Remove item from cart', async () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add items
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[1]));

        expect(result.current.totalNumberItems).toBe(2);

        // Remove item
        act(() => result.current.removeItem(exampleProducts[0]));

        expect(result.current.items.length).toBe(1);
        expect(result.current.totalNumberItems).toBe(1);
        expect(result.current.totalUniqueItems).toBe(1);
        expect(result.current.cartTotal).toBe(exampleProducts[1].price);
    });

    test('Add amount discount', async () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add items
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[1]));

        expect(result.current.totalNumberItems).toBe(2);

        // Calc expected totals
        const totalBeforeDiscount =
            exampleProducts[0].price + exampleProducts[1].price;
        const netTotal = totalBeforeDiscount - exampleDiscounts[0].value;

        // Add discount
        act(() => result.current.addDiscount(exampleDiscounts[0]));

        expect(result.current.discount).toEqual(exampleDiscounts[0]);
        expect(result.current.totalDiscountAmount).toEqual(
            exampleDiscounts[0].value,
        );

        expect(result.current.cartNetTotal).toEqual(netTotal);
        expect(result.current.cartDiscountText).toEqual('$20.00 off');
        expect(result.current.cartTotal).toEqual(netTotal);
    });

    test('Add percent discount', async () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add items
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[1]));

        expect(result.current.totalNumberItems).toBe(2);

        // Calc expected totals
        const totalBeforeDiscount =
            exampleProducts[0].price + exampleProducts[1].price;
        const discountAmount =
            totalBeforeDiscount * (exampleDiscounts[1].value / 100 / 100);
        const netTotal = totalBeforeDiscount - discountAmount;

        // Add discount
        act(() => result.current.addDiscount(exampleDiscounts[1]));

        expect(result.current.discount).toEqual(exampleDiscounts[1]);
        expect(result.current.cartNetTotal).toEqual(netTotal);
        expect(result.current.cartDiscountText).toEqual('10% off');
        expect(result.current.cartTotal).toEqual(netTotal);
    });

    test('Remove discount', async () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add items
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[1]));

        expect(result.current.totalNumberItems).toBe(2);

        // Calc expected totals
        const totalBeforeDiscount =
            exampleProducts[0].price + exampleProducts[1].price;
        const discountAmount =
            totalBeforeDiscount * (exampleDiscounts[1].value / 100 / 100);
        const netTotal = totalBeforeDiscount - discountAmount;

        // Add discount
        act(() => result.current.addDiscount(exampleDiscounts[1]));

        // Check discounts
        expect(result.current.discount).toEqual(exampleDiscounts[1]);
        expect(result.current.cartNetTotal).toEqual(netTotal);
        expect(result.current.cartDiscountText).toEqual('10% off');
        expect(result.current.cartTotal).toEqual(netTotal);

        // Remove discount
        act(() => result.current.removeDiscount());

        // Check discounts are removed
        expect(result.current.discount).toEqual({});
        expect(result.current.cartNetTotal).toEqual(totalBeforeDiscount);
        expect(result.current.cartDiscountText).toEqual('');
        expect(result.current.cartTotal).toEqual(totalBeforeDiscount);
    });

    test('Add shipping value', async () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add items
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[1]));

        expect(result.current.totalNumberItems).toBe(2);

        // Calc expected totals
        const totalBeforeShipping =
            exampleProducts[0].price + exampleProducts[1].price;
        const shippingAmount = exampleShipping.cost;
        const totalCartValue = totalBeforeShipping + shippingAmount;

        // Add shipping
        act(() => result.current.addShipping(exampleShipping));

        expect(result.current.shipping).toEqual(exampleShipping);
        expect(result.current.totalShippingAmount).toEqual(shippingAmount);
        expect(result.current.cartNetTotal).toEqual(
            totalCartValue - shippingAmount,
        );
        expect(result.current.cartTotal).toEqual(totalCartValue);
    });

    test('Add and remove shipping value', async () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add items
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[1]));

        expect(result.current.totalNumberItems).toBe(2);

        // Calc expected totals
        const totalBeforeShipping =
            exampleProducts[0].price + exampleProducts[1].price;
        const shippingAmount = exampleShipping.cost;
        const totalCartValue = totalBeforeShipping + shippingAmount;

        // Add shipping
        act(() => result.current.addShipping(exampleShipping));

        expect(result.current.shipping).toEqual(exampleShipping);
        expect(result.current.cartTotal).toEqual(totalCartValue);

        // remove shipping
        act(() => result.current.removeShipping());

        expect(result.current.shipping).toEqual({});
        expect(result.current.cartTotal).toEqual(totalBeforeShipping);
    });

    test('Check cartTotal', async () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add an item
        act(() => result.current.addItem(exampleProducts[0]));
        expect(result.current.cartTotal).toBe(exampleProducts[0].price);

        // Add another item
        act(() => result.current.addItem(exampleProducts[0]));

        expect(result.current.totalNumberItems).toBe(2);
        expect(result.current.cartTotal).toEqual(exampleProducts[0].price * 2);
    });

    test('Check cartTotal with discount & shipping', async () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add a few items
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[1]));

        // Add discount
        act(() => result.current.addDiscount(exampleDiscounts[0]));

        // Add shipping
        act(() => result.current.addShipping(exampleShipping));

        const expectedCartItemsAmount =
            exampleProducts[0].price + exampleProducts[1].price;
        const expectedCartDiscount = exampleDiscounts[0].value;
        const expectedNetCartAmount =
            expectedCartItemsAmount - expectedCartDiscount;

        const expectedCartShipping = exampleShipping.cost;

        const expectedCartTotal =
            expectedCartItemsAmount -
            expectedCartDiscount +
            expectedCartShipping;

        expect(result.current.totalNumberItems).toBe(2);
        expect(result.current.cartNetTotal).toBe(expectedNetCartAmount);
        expect(result.current.totalDiscountAmount).toBe(expectedCartDiscount);
        expect(result.current.totalShippingAmount).toBe(exampleShipping.cost);
        expect(result.current.cartTotal).toEqual(expectedCartTotal);
    });

    test('Check empty cart', async () => {
        const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider,
        });
        act(() => result.current.emptyCart());

        // Add an item
        act(() => result.current.addItem(exampleProducts[0]));

        expect(result.current.items).toHaveLength(1);
        expect(result.current.totalNumberItems).toBe(1);
        expect(result.current.totalUniqueItems).toBe(1);

        // Empty cart
        act(() => result.current.emptyCart());

        expect(result.current.items).toHaveLength(0);
        expect(result.current.totalNumberItems).toBe(0);
        expect(result.current.totalUniqueItems).toBe(0);
        expect(result.current.cartTotal).toBe(0);
    });

    test('Check default currency USD', async () => {
        const wrapper = ({ children }: any) => (
            <CartProvider>{children}</CartProvider>
        );
        const { result } = renderHook(() => useCart(), {
            wrapper,
        });
        act(() => result.current.emptyCart());

        // Add an item
        act(() => result.current.addItem(exampleProducts[0]));

        expect(result.current.items).toHaveLength(1);
        expect(result.current.totalNumberItems).toBe(1);
        expect(result.current.totalUniqueItems).toBe(1);
        expect(result.current.currency).toBe('USD');
    });

    test('Check set currency', async () => {
        const wrapper = ({ children }: any) => (
            <CartProvider currency={'AUD'}>{children}</CartProvider>
        );
        const { result } = renderHook(() => useCart(), {
            wrapper,
        });
        act(() => result.current.emptyCart());

        // Add an item
        act(() => result.current.addItem(exampleProducts[0]));

        expect(result.current.items).toHaveLength(1);
        expect(result.current.totalNumberItems).toBe(1);
        expect(result.current.totalUniqueItems).toBe(1);
        expect(result.current.currency).toBe('AUD');
    });

    test('Check currency and local formatting', async () => {
        const wrapper = ({ children }: any) => (
            <CartProvider currency={'EUR'} locale={'de-DE'}>
                {children}
            </CartProvider>
        );
        const { result } = renderHook(() => useCart(), {
            wrapper,
        });
        act(() => result.current.emptyCart());

        // Add items
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[1]));

        expect(result.current.totalNumberItems).toBe(2);

        // Calc expected totals
        const totalBeforeDiscount =
            exampleProducts[0].price + exampleProducts[1].price;
        const netTotal = totalBeforeDiscount - exampleDiscounts[0].value;

        // Add discount
        act(() => result.current.addDiscount(exampleDiscounts[0]));

        expect(result.current.cartNetTotal).toEqual(netTotal);
        expect(result.current.cartDiscountText).toEqual('20,00 € off');
        expect(result.current.cartTotal).toEqual(netTotal);
    });

    test('Check set locale', async () => {
        const wrapper = ({ children }: any) => (
            <CartProvider locale={'en-AU'}>{children}</CartProvider>
        );
        const { result } = renderHook(() => useCart(), {
            wrapper,
        });
        act(() => result.current.emptyCart());

        // Add an item
        act(() => result.current.addItem(exampleProducts[0]));

        expect(result.current.items).toHaveLength(1);
        expect(result.current.totalNumberItems).toBe(1);
        expect(result.current.totalUniqueItems).toBe(1);
        expect(result.current.locale).toBe('en-AU');
    });

    test('Check default locale', async () => {
        const wrapper = ({ children }: any) => (
            <CartProvider locale={'en-US'}>{children}</CartProvider>
        );
        const { result } = renderHook(() => useCart(), {
            wrapper,
        });
        act(() => result.current.emptyCart());

        // Add an item
        act(() => result.current.addItem(exampleProducts[0]));

        expect(result.current.items).toHaveLength(1);
        expect(result.current.totalNumberItems).toBe(1);
        expect(result.current.totalUniqueItems).toBe(1);
        expect(result.current.locale).toBe('en-US');
    });

    test('Check hook - Add item', async () => {
        const handleItemAdd = jest.fn();
        const wrapper = ({ children }: any) => (
            <CartProvider onItemAdd={cart => handleItemAdd(cart)}>
                {children}
            </CartProvider>
        );
        const { result } = renderHook(() => useCart(), { wrapper });
        act(() => result.current.emptyCart());

        // Add an item
        act(() => result.current.addItem(exampleProducts[0]));
        expect(handleItemAdd).toHaveBeenCalled();
    });

    test('Check hook - Update item', async () => {
        const handleUpdateItem = jest.fn();
        const wrapper = ({ children }: any) => (
            <CartProvider onItemUpdate={cart => handleUpdateItem(cart)}>
                {children}
            </CartProvider>
        );
        const { result } = renderHook(() => useCart(), { wrapper });
        act(() => result.current.emptyCart());

        // Add items
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[0]));

        // Update quantity
        act(() =>
            result.current.updateItemQuantity(
                exampleProducts[0],
                'decrease',
                1,
            ),
        );

        expect(handleUpdateItem).toHaveBeenCalled();
    });

    test('Check hook - empty cart', async () => {
        const handleEmptyCart = jest.fn();
        const wrapper = ({ children }: any) => (
            <CartProvider onEmptyCart={cart => handleEmptyCart(cart)}>
                {children}
            </CartProvider>
        );
        const { result } = renderHook(() => useCart(), { wrapper });
        act(() => result.current.emptyCart());

        expect(handleEmptyCart).toHaveBeenCalled();
    });

    test('Check hook - Remove item', async () => {
        const handleRemoveItem = jest.fn();
        const wrapper = ({ children }: any) => (
            <CartProvider onItemRemove={cart => handleRemoveItem(cart)}>
                {children}
            </CartProvider>
        );
        const { result } = renderHook(() => useCart(), { wrapper });
        act(() => result.current.emptyCart());

        // Remove item
        act(() => result.current.removeItem(exampleProducts[0]));

        expect(handleRemoveItem).toHaveBeenCalled();
    });

    test('Check hook - Metadata update', async () => {
        const handleMetadataUpdate = jest.fn();
        const wrapper = ({ children }: any) => (
            <CartProvider onMetadataUpdate={cart => handleMetadataUpdate(cart)}>
                {children}
            </CartProvider>
        );
        const { result } = renderHook(() => useCart(), { wrapper });
        act(() => result.current.emptyCart());

        const metadata = {
            coupon: 'abc1234',
            notes: 'Leave out the back',
            newValue: 'Test',
        };

        // Update metadata
        act(() => result.current.setMetadata(metadata));

        expect(handleMetadataUpdate).toHaveBeenCalled();
    });

    test('Check hook - Discount addded', async () => {
        const handleDiscountAdd = jest.fn();
        const wrapper = ({ children }: any) => (
            <CartProvider onDiscountAdd={cart => handleDiscountAdd(cart)}>
                {children}
            </CartProvider>
        );
        const { result } = renderHook(() => useCart(), { wrapper });
        act(() => result.current.emptyCart());

        // Add items
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[0]));

        // Add discount
        act(() => result.current.addDiscount(exampleDiscounts[0]));

        expect(handleDiscountAdd).toHaveBeenCalled();
    });

    test('Check hook - Discount removed', async () => {
        const handleDiscountRemoved = jest.fn();
        const wrapper = ({ children }: any) => (
            <CartProvider
                onDiscountRemove={cart => handleDiscountRemoved(cart)}
            >
                {children}
            </CartProvider>
        );
        const { result } = renderHook(() => useCart(), { wrapper });
        act(() => result.current.emptyCart());

        // Add items
        act(() => result.current.addItem(exampleProducts[0]));
        act(() => result.current.addItem(exampleProducts[0]));

        // Remove discount
        act(() => result.current.removeDiscount());

        expect(handleDiscountRemoved).toHaveBeenCalled();
    });

    test('Check hook - Shipping added', async () => {
        const handleShippingAdded = jest.fn();
        const wrapper = ({ children }: any) => (
            <CartProvider onShippingAdd={cart => handleShippingAdded(cart)}>
                {children}
            </CartProvider>
        );
        const { result } = renderHook(() => useCart(), { wrapper });
        act(() => result.current.emptyCart());

        // Add Shipping
        act(() => result.current.addShipping(exampleShipping));

        expect(handleShippingAdded).toHaveBeenCalled();
    });

    test('Check hook - Shipping removed', async () => {
        const handleShippingRemoved = jest.fn();
        const wrapper = ({ children }: any) => (
            <CartProvider
                onShippingRemove={cart => handleShippingRemoved(cart)}
            >
                {children}
            </CartProvider>
        );
        const { result } = renderHook(() => useCart(), { wrapper });
        act(() => result.current.emptyCart());

        // Add Shipping
        act(() => result.current.addShipping(exampleShipping));

        // Remove Shipping
        act(() => result.current.removeShipping());

        expect(handleShippingRemoved).toHaveBeenCalled();
    });
});

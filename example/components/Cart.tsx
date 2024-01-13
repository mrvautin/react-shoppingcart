import React from 'react';
import { Item, Discount, Shipping, useCart } from '@mrvautin/react-shoppingcart';

export default function Cart() {
    const {
        items,
        addItem,
        cartTotal,
        getItem,
        removeItem,
        emptyCart,
        updateItemQuantity,
        cartNetTotal,
        totalItemsAmount,
        totalDiscountAmount,
        cartDiscountText,
        shipping,
        addShipping,
        removeShipping,
        totalShippingAmount,
        discount,
        addDiscount,
        removeDiscount,
    } = useCart();

    // Demo products
    const products = [
        {
            id: 'shoes',
            name: 'Shoes',
            price: 1000,
        } as Item,
        {
            id: 'jacket',
            name: 'Jacket',
            price: 2000,
        } as Item,
        {
            id: 'pants',
            name: 'Pants',
            price: 3000,
        } as Item,
    ];

    // Discounts
    const amtDiscount = {
        id: "discount1",
        code: "AMOUNT_DISCOUNT",
        type: "amount",
        value: 2000,
    } as Discount;
    const percentDiscount = {
        id: "discount2",
        code: "PERCENT_DISCOUNT",
        type: "percent",
        value: 1000,
    } as Discount;

    const shippingCode = {
        description: 'Flat rate shipping',
        cost: 1000,
    } as Shipping;

    function removeFromCart(item: any) {
        removeItem(item);
    }

    function reduceQuantity(item: any) {
        updateItemQuantity(item, 'decrease', 1);
    }

    function removeCart() {
        emptyCart();
    }

    function applyDiscount(type: string) {
        if (type === "amount") {
          addDiscount(amtDiscount);
        }
        if (type === "percent") {
          addDiscount(percentDiscount);
        }
    }

    function applyShipping() {
        addShipping(shippingCode);
    }

    function clearShipping() {
        removeShipping();
    }

    function getDiscounts() {
        if (!discount || !discount.code) {
            return;
        }
        return (
          <>
            <tr>
              <td className="font-bold" colSpan={4}>
                Discount ({cartDiscountText}):
              </td>
              <td>{formatAmount(totalDiscountAmount)}</td>
            </tr>
          </>
        );
    }

    function getShipping() {
        if (!shipping || !shipping.cost) {
            return;
        }
        return (
            <>
                <tr>
                    <td className="font-bold" colSpan={4}>
                    Shipping costs:
                    </td>
                    <td>{formatAmount(totalShippingAmount)}</td>
                </tr>
            </>
        );
    }

    function showCartAdjustments() {
        const adjustments = [];
        if (discount && discount.code) {
            adjustments.push(getDiscounts());
        }
        if (shipping && shipping.cost) {
            adjustments.push(getShipping());
        }
        if (adjustments.length > 0) {
            return <>{adjustments}</>;
        }
        return;
    }

    function clearDiscounts() {
        removeDiscount();
    }

    function formatAmount(amt: any) {
        const currency = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });
        return currency.format(amt / 100);
    }

    return (
        <div className="pure-g pure-u-1">
            <div className="pure-g">
                <div className="pure-u-1">
                    <h1>react-shoppingcart demo</h1>
                </div>
                <div className="pure-u-1">
                    <button
                        className="pure-button button-error"
                        onClick={() => removeCart()}
                    >
                        Empty cart
                    </button>
                    <button
                        className="pure-button button-error"
                        onClick={() => clearDiscounts()}
                    >
                        Remove discounts
                    </button>
                    <button
                        className="pure-button button-error"
                        onClick={() => clearShipping()}
                    >
                        Remove shipping
                    </button>
                </div>
                <div className="pure-u-1">
                    <button
                        className="pure-button button-success"
                        onClick={() => applyDiscount("amount")}
                    >
                        Add $20.00 discount
                    </button>
                    <button
                        className="pure-button button-success"
                        onClick={() => applyDiscount("percent")}
                    >
                        Add 10% discount
                    </button>
                    <button
                        className="pure-button button-success"
                        onClick={() => applyShipping()}
                    >
                        Add Shipping
                    </button>
                </div>
                <div className="pure-u-1">
                    <h3>Products</h3>
                </div>
                <div className="pure-u-1-2">
                    <table className="pure-table pure-table-bordered">
                        <thead className="font-bold">
                            <tr>
                                <td>ID</td>
                                <td>Name</td>
                                <td>Price</td>
                                <td>Action</td>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={"product-" + index}>
                                    <td>{product.id}</td>
                                    <td>{product.name}</td>
                                    <td>{formatAmount(product.price)}</td>
                                    <td>
                                        <button
                                            className="pure-button button-success"
                                            onClick={() => addItem(product)}
                                        >
                                            Add item
                                        </button>
                                        <button
                                            className="pure-button button-error"
                                            onClick={() => {
                                                const checkItem = getItem(product);
                                                if(checkItem){
                                                    reduceQuantity(product)
                                                }
                                            }}
                                        >
                                            Reduce quantity
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="pure-g">
                <div className="pure-u-1">
                    <h3>Cart</h3>
                </div>
                <div className="pure-u-1-2">
                    <table className="pure-table pure-table-bordered">
                        <thead className="font-bold">
                            <tr>
                                <td>ID</td>
                                <td>Name</td>
                                <td>Quantity</td>
                                <td>Total</td>
                                <td>Action</td>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.cartId}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatAmount(item.itemTotal)}</td>
                                    <td>
                                        <button
                                            className="pure-button button-error"
                                            onClick={() => removeFromCart(item)}
                                        >
                                            Remove item
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {showCartAdjustments()}
                            <tr>
                                <td className="font-bold" colSpan={4}>
                                    Items total:
                                </td>
                                <td>{formatAmount(totalItemsAmount)}</td>
                            </tr>
                            <tr>
                                <td className="font-bold" colSpan={4}>
                                    Net total:
                                </td>
                                <td>{formatAmount(cartNetTotal)}</td>
                            </tr>
                            <tr>
                                <td className="font-bold" colSpan={4}>
                                    Cart total:
                                </td>
                                <td>{formatAmount(cartTotal)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

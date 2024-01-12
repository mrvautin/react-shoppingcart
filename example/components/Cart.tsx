import React from 'react';
import { useCart } from '@mrvautin/react-shoppingcart';

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
        cartDiscountTotal,
        cartDiscountText,
        discount,
        addDiscount,
        removeDiscount,
        locale,
    } = useCart();

    // Demo products
    const products = [
        {
            id: 'shoes',
            name: 'Shoes',
            price: 1000,
        },
        {
            id: 'jacket',
            name: 'Jacket',
            price: 2000,
        },
        {
            id: 'pants',
            name: 'Pants',
            price: 3000,
        },
    ];

    // Discounts
    const amtDiscount = {
        id: "discount1",
        code: "AMOUNT_DISCOUNT",
        type: "amount",
        value: 2000,
    } as any;
    const percentDiscount = {
        id: "discount2",
        code: "PERCENT_DISCOUNT",
        type: "percent",
        value: 1000,
    } as any;

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

    function showDiscounts() {
        if (discount && !discount.code) {
          return;
        }
        return (
          <>
            <tr>
              <td className="font-bold" colSpan={4}>
                Discount ({cartDiscountText}):
              </td>
              <td>{formatAmount(cartDiscountTotal)}</td>
            </tr>
            <tr>
              <td className="font-bold" colSpan={4}>
                Net total:
              </td>
              <td>{formatAmount(cartNetTotal)}</td>
            </tr>
          </>
        );
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
                            {products.map(product => (
                                <tr key={product.id}>
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
                                <tr key={item.id}>
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
                            <tr>
                                <td className="font-bold" colSpan={4}>
                                    Cart total:
                                </td>
                                <td>{formatAmount(cartTotal)}</td>
                            </tr>
                            {showDiscounts()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

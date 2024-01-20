import React, { useState, useEffect } from 'react';
import { Item, Discount, Shipping, useCart } from '@mrvautin/react-shoppingcart';
import Variants from './Variants';

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

    const initialProducts: Item[] = [];
    const [products, setProducts] = useState(initialProducts);
    useEffect(() => {
        fetch('/api/products')
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            setProducts(data);
          });
      }, []);

    // Check for products
    if (products && products.length === 0) {
        return <></>;
    }

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
            <tr key="discountRow">
                <td className="fw-bold" colSpan={5}>
                    Discount ({cartDiscountText}):
                </td>
                <td>{formatAmount(totalDiscountAmount)}</td>
            </tr>
        );
    }

    function getShipping() {
        if (!shipping || !shipping.cost) {
            return;
        }
        return (
            <tr key="shippingRow">
                <td className="fw-bold" colSpan={5}>
                    Shipping costs:
                </td>
                <td>{formatAmount(totalShippingAmount)}</td>
            </tr>
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

    function setVariant(productId: string, variantId: string, value: string) {
        const updatedProducts = products.map((item: Item) => {
            if (item.id === productId) {
                item.itemVariants = item.itemVariants.map((variant: any) => {
                    const tempVariant = Object.assign({}, variant);
                    if (tempVariant.id == variantId) {
                        tempVariant.selectedValue = value;
                    }
                    return tempVariant;
                });
            }

            return item;
        });

        setProducts(updatedProducts);
    }

    function printVariant(item: Item) {
        if (!item.itemVariants) {
            return (
                <td></td>
            );
        }
        const variants: any[] = [];
        item.itemVariants.map((variant: any) => (
            variants.push((
                <div key={variant.id}>{variant.title}: {variant.selectedValue}</div>
            ))
        ));
        if (variants.length > 0) {
            return (
                <td>
                    {variants}
                </td>
            );
        }
        return (
            <td></td>
        );
    }

    return (
        <div className="container">
            <div className="row">
                <h1>react-shoppingcart demo</h1>
            </div>
            <div className="row text-center">
                <div className="p-2 col-4">
                    <button
                        className="btn btn-danger"
                        onClick={() => removeCart()}
                    >
                        Empty cart
                    </button>
                </div>
                <div className="p-2 col-4">
                    <button
                        className="btn btn-danger"
                        onClick={() => clearDiscounts()}
                    >
                        Remove discounts
                    </button>
                </div>
                <div className="p-2 col-4">
                    <button
                        className="btn btn-danger"
                        onClick={() => clearShipping()}
                    >
                        Remove shipping
                    </button>
                </div>
            </div>
            <div className="row text-center">
                <div className="p-2 col-4">
                    <button
                        className="btn btn-success"
                        onClick={() => applyDiscount("amount")}
                    >
                        Add $20.00 discount
                    </button>
                </div>
                <div className="p-2 col-4">
                    <button
                        className="btn btn-success"
                        onClick={() => applyDiscount("percent")}
                    >
                        Add 10% discount
                    </button>
                </div>
                <div className="p-2 col-4">
                    <button
                        className="btn btn-success"
                        onClick={() => applyShipping()}
                    >
                        Add Shipping
                    </button>
                </div>
            </div>
            <div className="row">
                <h3>Products</h3>
            </div>
            <div className="row">
                <table className="table table-bordered">
                    <thead className="fw-bold">
                        <tr>
                            <td>ID</td>
                            <td>Name</td>
                            <td>Price</td>
                            <td>Variants</td>
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
                                    <Variants 
                                        product={product}
                                        onSelectVariant={(productId: string, variant: any, value: string) => {
                                            setVariant(productId, variant.id, value);
                                        }}
                                    ></Variants>
                                </td>
                                <td>
                                    <div className="d-grid gap-2">
                                        <button
                                            className="btn btn-success"
                                            onClick={() => addItem(product)}
                                            type="button"
                                        >
                                            Add item
                                        </button>
                                        <button
                                            className="btn btn-warning"
                                            onClick={() => {
                                                const checkItem = getItem(product);
                                                if(checkItem){
                                                    reduceQuantity(product)
                                                }
                                            }}
                                            type="button"
                                        >
                                            Reduce quantity
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="row pt-3">
                <h3>Cart</h3>
            </div>
            <div className="row">
                <table className="table table-bordered">
                    <thead className="fw-bold">
                        <tr>
                            <td>ID</td>
                            <td>Name</td>
                            <td>Quantity</td>
                            <td>Variants</td>
                            <td>Total</td>             
                            <td>Action</td>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.itemId}>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                {printVariant(item)}
                                <td>{formatAmount(item.itemTotal)}</td>
                                <td>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => removeFromCart(item)}
                                    >
                                        Remove item
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {showCartAdjustments()}
                        <tr key="itemsTotal">
                            <td className="fw-bold" colSpan={5}>
                                Items total:
                            </td>
                            <td>{formatAmount(totalItemsAmount)}</td>
                        </tr>
                        <tr key="netTotal">
                            <td className="fw-bold" colSpan={5}>
                                Net total:
                            </td>
                            <td>{formatAmount(cartNetTotal)}</td>
                        </tr>
                        <tr key="cartTotal">
                            <td className="fw-bold" colSpan={5}>
                                Cart total:
                            </td>
                            <td>{formatAmount(cartTotal)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div >
    );
}

<p align="center">
  <img align="center" src="./logo.png" style="height: 150px;" />
</p>
<h1 align="center">react-shoppingcart
</h1>
<h4 align="center">
A React Context provider for quickly and easily building a shopping cart using Next.js or any other React framework.
</h4>

<p align="center">
  <a href="https://npmjs.org/package/@mrvautin/react-shoppingcart">
    <img src="https://img.shields.io/npm/v/@mrvautin/react-shoppingcart.svg" alt="Version" />
  </a>
  <a href="https://npmjs.org/package/@mrvautin/react-shoppingcart">
    <img src="https://img.shields.io/npm/dw/@mrvautin/react-shoppingcart.svg" alt="Downloads/week" />
  </a>
    <a href="https://github.com/mrvautin/react-shoppingcart/blob/main/package.json">
    <img src="https://img.shields.io/npm/l/@mrvautin/react-shoppingcart.svg" alt="License" />
  </a>
  <a href="https://github.com/mrvautin/react-shoppingcart/network/members">
    <img src="https://img.shields.io/github/forks/mrvautin/react-shoppingcart" alt="Forks on GitHub" />
  </a>
  <a href="https://github.com/mrvautin/react-shoppingcart/stargazers">
    <img src="https://img.shields.io/github/stars/mrvautin/react-shoppingcart" alt="Forks on GitHub" />
  </a>
</p>

- Persistent local storage using React Context
- Works with Next, Gatsby, React
- Supports hooks to listen for events
- Written in Typescript
- Supports discount codes
- Supports product variants - Size, colour etc
- Supports cart metadata


## Install

`npm`:

```bash
npm install @mrvautin/react-shoppingcart --save
```

`yarn`:
```bash
yarn add @mrvautin/react-shoppingcart 
```

# Getting started

## Add the `Context`

Wrap your app in the `<CartProvider>` (eg: Add to your `_app.tsx`):

``` js
import type { AppProps } from 'next/app';
import { CartProvider } from '@mrvautin/react-shoppingcart';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <CartProvider>
            <Component {...pageProps} />
        </CartProvider>
    );
}
```

| Prop                | Required | Description                                                                                   |
| ------------------- | -------- | --------------------------------------------------------------------------------------------- | 
| `cartId`            | _No_     | `cartId` for your cart storage. If nothing is supplied, `react-shoppingcart` is used.         |
| `onItemAdd`         | _No_     | Triggered an item is added to your cart using `addItem`.                                      |
| `onItemUpdate`      | _No_     | Triggered when items are updated in your cart using `updateItemQuantity()`.                   |
| `onItemRemove`      | _No_     | Triggered on items are removed from your cart using `removeItem()`.                           |
| `onDiscountAdd`     | _No_     | Triggered when a discount is added using `addDiscount()`.                                     | 
| `onDiscountRemove`  | _No_     | Triggered when a discount is removed using `removeDiscount()`.                                |
| `onEmptyCart`       | _No_     | Triggered on `emptyCart()` is called.                                                         |
| `onMetadataUpdate`  | _No_     | Triggered when `metadata` is changed in your cart using `setMetadata()` or `clearMetadata()`. |
| `currency        `  | _No_     | Used to set the `currency` formatting of the discount. Defaults to `USD`.                     |
| `locale          `  | _No_     | Used to set the `locale` formatting of the discount. Defaults to `en-US`.                     |


### Listening to a hook

You may want to use hooks to check your backend server for things like:

- A `discount` code is valid and not expired
- The `price` of an item is correct
- The `cartTotal` matches your expected value in database

Available Hooks are: `onItemAdd`, `onItemUpdate`, `onItemRemove`, `onDiscountAdd`, `onDiscountRemove`, `onEmptyCart` and `onMetadataUpdate`.

On the `<CartProvider>` you can add any hooks you need to listen on:

``` js
import type { AppProps } from 'next/app';
import { CartProvider } from '@mrvautin/react-shoppingcart';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <CartProvider onItemAdd={cart => alert(cart)}>
            {children}
        </CartProvider>
    );
}
```

> Keeping in mind that any cart values can be altered by the user by changing their `localstorage`.

## Add to your `Component`

``` js
import { useCart } from '@mrvautin/react-shoppingcart';
...
const {
    items,
    addItem,
    removeItem,
    getItem,
    updateItemQuantity,
    discount,
    addDiscount,
    removeDiscount,
    emptyCart,
    setMetadata,
    clearMetadata,
    metadata,
    totalItems,
    totalUniqueItems,
    cartTotal,
    cartDiscountTotal,
    cartDiscountText,
    cartNetTotal,
} = useCart();
```

# Usage

## addItem

The first argument is a product object to add to the cart. Minimum values required are:

| Prop                | Required  | Description                                                                                   |
| ------------------- | --------- | --------------------------------------------------------------------------------------------- | 
| `id`                | _Yes_     | `id` for the item being added to the cart                                                     |
| `name`              | _Yes_     | `name` for the items.                                                                         |
| `price       `      | _Yes_     | `price` formatted in whole number. Eg: `$10.00` would be `1000`.                              |

The second arguement is an option `quantity`. If not supplied, `1` is added by default.

``` js
const product = {
    id: 'shoes1',
    name: 'Running shoes',
    price: 1000,
}
<button
    onClick={() => addItem(product)}
/>

// Adding 5 items
<button
    onClick={() => addItem(product, 5)}
/>
```

> Note: If the exact same item (eg: Same `id` and `itemVariants` - if supplied) is added twice, the quantity for the item is increased by `1`. 

## removeItem

Used to remove an item from the cart. 

``` js
const product = {
    id: 'shoes1',
    name: 'Running shoes',
    price: 1000,
}
<button
    onClick={() => addItem(product)}
/>

// Adding 5 items
<button
    onClick={() => addItem(product, 5)}
/>
```

> Note: If using `itemVariants`, you will need to supply the same `id` amd `itemVariants`. 

## getItem

Used to get an item which has been already added to the cart. 

``` js
const product = {
    id: 'shoes1',
    name: 'Running shoes',
    price: 1000,
}
<button
    onClick={() => getItem(product)}
/>
```

> Note: If using `itemVariants`, you will need to supply the same `id` amd `itemVariants`. 

## items

`items` is an array property which stores a list of `items` in the cart.

``` js
// You can loop the items
<div>
    <h1>Cart</h1>
    {items.map((item) => (
        <div key={item.id}>
            <div>Name: {item.name} - Quantity: {item.quantity}</div>
        </div>
    ))}
</div>
```

## itemVariants

``` js
const product = {
    id: 'shoes1',
    name: 'Running shoes',
    price: 1000,
    itemVariants: [
        {
            size: 'US11'
        },
        {
            color: 'white'
        }
    ],
}
<button
    onClick={() => addItem(product)}
>
```

> Note this function allows for a single product ID to be used per product but multiple variations to it. For instance, you may have a single product with an ID of `shoes1` but it may have an `itemVariants` of `size` of `US11` in the example above. This allows the same product to be added to the cart multiple times despite having a different variant set.

## updateItemQuantity

Used to update the quantity of an item already in the cart.

``` js
const product = {
    id: 'shoes1',
    name: 'Running shoes',
    price: 1000,
    itemVariants: [
        {
            size: 'US11'
        },
        {
            color: 'white'
        }
    ],
}
<button
    onClick={() => updateItemQuantity(product, 'increase', 2)}
>
```

## removeItem

Used to remove an item already in the cart.

``` js
const product = {
    id: 'shoes1',
    name: 'Running shoes',
    price: 1000,
    itemVariants: [
        {
            size: 'US11'
        },
        {
            color: 'white'
        }
    ],
}
<button
    onClick={() => removeItem(product)}
>
```

> Note: If using `itemVariants` ensure the same `id` and `itemVariants` are supplied in the `removeItem()` call.

## discount

`discount` returns an object if a discount is applied else it returns an empty object `{}`.

## addDiscount

Used to add a `discount` to the cart. You will want to ensure this discount is allowed and valid on your backend. You can do this by listening on the `onDiscountAdd` event to validate and remove if required.

| Prop                | Required  | Description                                                                                    |
| ------------------- | --------- | ---------------------------------------------------------------------------------------------- | 
| `id`                | _Yes_     | `id` for the discount                                                                          |
| `code`              | _Yes_     | `code` for the discount being added. This would be what is advised to the customer and entered at checkout.                                                                                                                          |
| `type       `       | _Yes_     | `type` of discount. Allowed values are: `amount` and `percent`.                                |
| `value       `      | _Yes_     | `value` to be discounted in whole number. Eg: `1000`` is `$10.00` discount or `10%` depending on type. |


``` js
const discount = {
    id: 'discount1',
    code: 'AMOUNT_DISCOUNT',
    type: 'amount',
    value: 2000,
}
<button
    onClick={() => addDiscount(discount)}
>
```

## removeDiscount

Used to remove a `discount` from the cart. 

``` js
const discount = {
    id: 'discount1',
    code: 'AMOUNT_DISCOUNT',
    type: 'amount',
    value: 2000,
}
<button
    onClick={() => removeDiscount()}
>
```

## emptyCart

Used to completely empty the cart including `items`, `discounts` and `metadata`. 

``` js
<button
    onClick={() => emptyCart()}
>
```

## setMetadata

Used to add `metadata` to the cart. This could be used to store an order ID, customer ID or notes about shipping etc.

``` js
const metadata = {
    customerId: '1234',
    notes: 'Leave on door step',
};
<button
    onClick={() => setMetadata(metadata)}
>
```

## clearMetadata

Used to clear whetever `metadata` is currently set on the cart.

``` js
<button
    onClick={() => clearMetadata()}
>
```

## metadata

Returns whatever `metadata` is currently set on the cart.

## totalItems

Returns the total items in the cart. This adds the quantity of all items in the cart to give a total number of items being purchased.

## totalUniqueItems

Returns the total unique items in the cart. This ignores the quantity and simply counts all unique products in the cart.

## cartTotal

Returns the total value in the cart. This calculates the total price by adding all items (considering their quantity) to come to a grand total. The value is in whole number. Eg: `1000` is `$10.00`.

## cartDiscountTotal

This value is `0` by default. If a discount is added, the total discount is caluculated and stored in this value. Eg: If the discount is a percent, this value will store the total discounted `$` based on the set `%`. 

## cartDiscountText

This value stores a nice discount value which can be displayed on the cart. Eg: If the discount is set to $20.00 then the text will be: `$20.00 off`. Depending on the `currency` and `locale` set, this same text in `Euro` will be: `20,00 € off`.

## cartNetTotal

This value stores the net total taking into account any discounts. Eg: This value is: `cartTotal` - `cartDiscountTotal` = `cartNetTotal`.

# Example

An example `Next.js` project is stored in `/example`. You can see the basics of using the component in this example project.

1. Enter directory: `cd example`
2. Install: `yarn install`
3. Start up Next.js: `yarn run dev`
4. Visit the example: `http://localhost:3000`

# Tests

Running tests with:

`yarn run test`
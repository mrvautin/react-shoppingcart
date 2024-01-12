import React, { createContext } from 'react';
import { deepClone, formatCurrency, hash } from './helpers';

import cartStorage from './storage';

const defaultCartId = 'react-shoppingcart';
const defaultCurrency = 'USD';
const defaultLocale = 'en-US';
let cartIdentifier: string;
let cartCurrency: string;
let cartLocale: string;

export interface Item {
    id: string;
    price: number;
    quantity?: number;
    itemTotal?: number;
    itemId?: string;
    [key: string]: any;
}

export interface Discount {
    id: string;
    code: string;
    type: DiscountTypes;
    value: number;
}

export interface Metadata {
    [key: string]: any;
}

export interface Storage {
    items: Item[];
    discount: Discount;
    metadata: Metadata;
}

type UpdateDirection = 'increase' | 'decrease';
type DiscountTypes = 'amount' | 'percent';

export interface CartProviderState {
    items: Item[];
    discount?: Discount;
    addItem: (item: Item, quantity?: number) => void;
    removeItem: (item: Item) => void;
    updateItemQuantity: (
        item: Item,
        direction: UpdateDirection,
        quantity: number,
    ) => void;
    addDiscount: (discount: Discount) => void;
    removeDiscount: () => void;
    emptyCart: () => void;
    getItem: (item: any) => any | undefined;
    setMetadata: (metadata: Metadata) => void;
    clearMetadata: () => void;
    metadata?: Metadata;
    totalItems: () => void;
    totalUniqueItems: () => void;
    cartTotal: () => void;
    cartDiscountTotal: number;
    cartDiscountText: string;
    cartNetTotal: number;
    cartId: string;
    currency: string;
    locale: string;
}

export type Actions =
    | { type: 'ADD_ITEM'; payload: Item }
    | { type: 'REMOVE_ITEM'; itemId: Item['itemId'] }
    | { type: 'UPDATE_ITEM'; itemId: Item['itemId']; payload: object }
    | { type: 'ADD_DISCOUNT'; payload: Discount }
    | { type: 'REMOVE_DISCOUNT' }
    | { type: 'EMPTY_CART' }
    | { type: 'CLEAR_CART_META' }
    | { type: 'SET_CART_META'; payload: Metadata };

export const initialState: any = {
    items: [],
    discount: {},
    totalItems: 0,
    totalUniqueItems: 0,
    cartDiscountTotal: 0,
    cartDiscountText: '',
    cartNetTotal: 0,
    cartTotal: 0,
    currency: 'USD',
    locale: 'en-US',
    cartId: defaultCartId,
};

// Create and export context
const CartContext = createContext<CartProviderState | undefined>(initialState);
export const useCart = () => {
    const context = React.useContext(CartContext);

    if (!context) {
        throw new Error('Expected to be wrapped in a CartProvider');
    }

    return context;
};

const reducer = (state: CartProviderState, action: Actions) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const items = [...state.items, action.payload];
            return updateState(state, items);
        }

        case 'UPDATE_ITEM': {
            const items = state.items.map((item: Item) => {
                if (item.itemId !== action.itemId) {
                    return item;
                }

                return {
                    ...item,
                    ...action.payload,
                };
            });

            return updateState(state, items);
        }

        case 'REMOVE_ITEM': {
            const items = state.items.filter(
                (i: Item) => i.itemId !== action.itemId,
            );

            return updateState(state, items);
        }

        case 'ADD_DISCOUNT': {
            const updatedState = {
                ...state,
                discount: {
                    ...action.payload,
                },
            };

            return updateState(updatedState, state.items);
        }

        case 'REMOVE_DISCOUNT': {
            return updateState(
                {
                    ...state,
                    discount: {},
                },
                state.items,
            );
        }

        case 'EMPTY_CART': {
            return initialState;
        }

        case 'CLEAR_CART_META': {
            return {
                ...state,
                metadata: {},
            };
        }

        case 'SET_CART_META': {
            return {
                ...state,
                metadata: {
                    ...action.payload,
                },
            };
        }
        default:
            return state;
    }
};

const updateState = (state = initialState, items: Item[]) => {
    const totalUniqueItems = getTotalUniqueItems(items);

    return {
        ...initialState,
        ...state,
        items: getItemTotals(items),
        discount: state.discount,
        totalItems: getTotalItems(items),
        totalUniqueItems,
        cartDiscountTotal: calculateDiscount(items, state.discount),
        cartDiscountText: getDiscountText(state.discount),
        cartNetTotal: calculateNetTotal(items, state.discount),
        cartTotal: getCartTotal(items),
    };
};

// Gets the total unique items not considering quantity
const getTotalUniqueItems = (items: Item[]) => items.length;

const getItemTotals = (items: Item[]) =>
    items.map(item => ({
        ...item,
        itemTotal: item.price * item.quantity!,
    }));

// Gets the cart total amount
const getCartTotal = (items: Item[]) => {
    return items.reduce(
        (total, item) => total + item.quantity! * item.price,
        0,
    );
};

// Gets the cart net amount minus the discount applied
const calculateNetTotal = (items: Item[], discount: Discount) => {
    const totalCartAmount = items.reduce(
        (total, item) => total + item.quantity! * item.price,
        0,
    );

    // If discount applied, minute discount from the total
    if (discount.code) {
        return totalCartAmount - calculateDiscount(items, discount);
    }

    return totalCartAmount;
};

// Gets the cart total amount
const getDiscountText = (discount: Discount) => {
    // If discount applied, minute discount from the total
    if (discount.code) {
        // type if amount, return '$2.00 off' formatted string
        if (discount.type === 'amount') {
            return `${formatCurrency(
                discount.value / 100,
                cartLocale,
                cartCurrency,
            )} off`;
        }

        // If type is percent, return '20% off' formatted string
        if (discount.type === 'percent') {
            return `${discount.value / 100}% off`;
        }
    }

    return '';
};

// Gets total amount of items adding quantity of each
const getTotalItems = (items: Item[]) => {
    return items.reduce((sum: number, item: Item) => sum + item.quantity!, 0);
};

// Gets total amount of items adding quantity of each
const calculateDiscount = (items: Item[], discount: Discount) => {
    const totalCartAmount = items.reduce(
        (total, item) => total + item.quantity! * item.price,
        0,
    );

    // If a discount is found
    if (discount.code) {
        // If type is amount, minus the value from the total cart
        if (discount.type === 'amount') {
            return discount.value;
        }

        // If type is percent, calc the % of the total and return
        if (discount.type === 'percent') {
            return totalCartAmount * (discount.value / 100 / 100);
        }
    }

    // No discount, return zero
    return 0;
};

// Gerates a hash of the item.id and item.itemVariants. This allows
// for a single item ID with various variants for that product
const generateHash = (item: { id: any; itemVariants: any }) => {
    const itemToHash = {
        id: item.id,
        itemVariants: item.itemVariants,
    };
    return hash(itemToHash);
};

export const CartProvider: React.FC<{
    children?: React.ReactNode;
    cartId?: string;
    currency?: string;
    locale?: string;
    items?: Item[];
    onItemAdd?: (payload: object) => void;
    onItemUpdate?: (payload: object) => void;
    onItemRemove?: (payload: object) => void;
    onDiscountAdd?: (payload: object) => void;
    onDiscountRemove?: (payload: object) => void;
    onEmptyCart?: (payload: object) => void;
    onMetadataUpdate?: (payload: object) => void;
    storage?: (
        key: string,
        initialValue: string,
    ) => [string, (value: Function | string) => void];
}> = ({
    children,
    cartId,
    currency,
    locale,
    onItemAdd,
    onItemUpdate,
    onItemRemove,
    onDiscountAdd,
    onDiscountRemove,
    onEmptyCart,
    onMetadataUpdate,
    storage = cartStorage,
}) => {
    cartIdentifier = cartId ? cartId : defaultCartId;
    cartCurrency = currency ? currency : defaultCurrency;
    cartLocale = locale ? locale : defaultLocale;
    const [cartState, setCart] = storage(
        cartIdentifier,
        JSON.stringify({
            ...initialState,
            cartId: cartIdentifier,
            currency: cartCurrency,
            locale: cartLocale,
            items: [],
            discount: {},
            metadata: {},
        }),
    );

    const [state, dispatch] = React.useReducer(reducer, JSON.parse(cartState));
    React.useEffect(() => {
        setCart(JSON.stringify(state));
    }, [state, setCart]);

    // Adds an item to the cart
    const addItem = (item: Item, quantity = 1) => {
        const newItem = deepClone(item);
        const itemHash = generateHash(newItem as any);

        // Validate input
        if (!item.id) {
            throw new Error('You must provide an `id` for new items');
        }
        if (!item.price) {
            throw new Error('You must provide a `price` for new items');
        }
        if (quantity < 1) {
            return;
        }

        // If item is not already in cart
        const currentItem = state.items.find(
            (i: Item) => i.itemId === itemHash,
        );
        if (!currentItem) {
            const payload = { ...item, itemId: itemHash, quantity };

            dispatch({ type: 'ADD_ITEM', payload });
            onItemAdd && onItemAdd(state.items);
            return;
        }

        // If item is in cart, update existing item
        const payload = {
            ...currentItem,
            quantity: currentItem.quantity + quantity,
        };
        dispatch({
            type: 'UPDATE_ITEM',
            itemId: currentItem.itemId,
            payload,
        });

        onItemUpdate && onItemUpdate(state.items);
    };

    // Removes an item to the cart
    const removeItem = (item: Item) => {
        if (!item) {
            throw new Error('You must provide an item to remove');
        }

        const newItem = deepClone(item);
        const itemHash = generateHash(newItem as any);

        dispatch({ type: 'REMOVE_ITEM', itemId: itemHash });
        onItemRemove && onItemRemove(state.items);
    };

    // Updates the item quantity. Direction can be 'increase' or 'decrease', quantity is an integer
    const updateItemQuantity = (
        item: Item,
        direction: string,
        quantity: number,
    ) => {
        // Check quantity is a positive number
        if (quantity < 1) {
            throw new Error('You must provide a positive `quantity` number');
        }

        const itemCopy = deepClone(item);
        const itemHash = generateHash(itemCopy as any);

        const directions = ['increase', 'decrease'];
        if (!directions.includes(direction)) {
            throw new Error(
                'Direction not supported. Only `increase` and `decrease` are allowed.',
            );
        }

        // Check if item already exists in cart
        const currentItem = state.items.find(
            (itemCheck: Item) => itemCheck.itemId === itemHash,
        );
        if (!currentItem) {
            throw new Error(
                'Item not found. Please privide an existing item to update',
            );
        }

        // If quantity is already one and being decreased, we remove it
        if (direction === 'decrease') {
            const netQuantity = currentItem.quantity - quantity;
            if (netQuantity < 1) {
                onItemRemove && onItemRemove(item);
                dispatch({ type: 'REMOVE_ITEM', itemId: currentItem.itemId });
                return;
            }
        }

        // Get quantity if increasing or decreasing
        let newQuantity = 0;
        if (direction === 'increase') {
            newQuantity = currentItem.quantity + quantity;
        }
        if (direction === 'decrease') {
            newQuantity = currentItem.quantity - quantity;
        }
        const payload = { ...currentItem, quantity: newQuantity };
        dispatch({
            type: 'UPDATE_ITEM',
            itemId: currentItem.itemId,
            payload,
        });

        onItemUpdate && onItemUpdate(payload);
    };

    // Adds a discount to the cart
    const addDiscount = (discount: Discount) => {
        if (!discount) {
            throw new Error('Please provide a discount to add.');
        }

        dispatch({
            type: 'ADD_DISCOUNT',
            payload: discount,
        });

        onDiscountAdd && onDiscountAdd(discount);
    };

    // Remove a discount from the cart
    const removeDiscount = () => {
        dispatch({
            type: 'REMOVE_DISCOUNT',
        });

        onDiscountRemove && onDiscountRemove({});
    };

    // Sets and updates the cart metadata
    const setMetadata = (metadata: Metadata) => {
        if (!metadata) {
            throw new Error(
                'Please provide metadata to update or set value to `{}`.',
            );
        }

        dispatch({
            type: 'SET_CART_META',
            payload: metadata,
        });

        onMetadataUpdate && onMetadataUpdate(metadata);
    };

    // Clears the set metadata
    const clearMetadata = () => {
        dispatch({
            type: 'CLEAR_CART_META',
        });

        onMetadataUpdate && onMetadataUpdate({});
    };

    // Removes all items from the cart
    const emptyCart = () => {
        dispatch({ type: 'EMPTY_CART' });

        onEmptyCart && onEmptyCart(state.items);
    };

    // Checks if item is in cart and returns it
    const getItem = (item: Item) => {
        const itemCopy = deepClone(item);
        const itemHash = generateHash(itemCopy as any);
        return state.items.find((i: Item) => i.itemId === itemHash);
    };

    return (
        <CartContext.Provider
            value={{
                ...state,
                addItem,
                removeItem,
                getItem,
                updateItemQuantity,
                setMetadata,
                clearMetadata,
                addDiscount,
                removeDiscount,
                emptyCart,
                currency: !currency ? 'USD' : currency,
                locale: !locale ? 'en-US' : locale,
                cartId: !cartId ? defaultCartId : cartId,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

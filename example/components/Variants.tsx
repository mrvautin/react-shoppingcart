import React from 'react';
import { Item, useCart } from '@mrvautin/react-shoppingcart';

type Props = {
    product: Item;
    onSelectVariant: Function;
};

type Variant = {
    id: string;
    name: string;
    title: string;
    values: string[];
}

export default function Variants(props: Props) {
    const {
    } = useCart();


    // Get the current selected variant value
    const getVariantValue = (id: string) => {
        const variant = props.product.itemVariants.find((value: Variant) => value.id === id);
        if (!variant) {
            return;
        }
        return variant.selectedValue;
    };

    // Get variant options
    const variantOptions = (id: string, values: string[]) => {
        const options = [];
        for (const option of values) {
            options.push(<option key={id + '-' + option}>{option}</option>);
        }
        return options;
    };

    const productVariants = (productId: string, variants: Variant[]) => {
        if (variants && variants.length > 0) {
            const variantElements = [];
            for (const variant of variants) {
                variantElements.push(
                    <div data-test-id={variant.id} key={variant.id}>
                        <div className="pb-2 fw-bold">{variant.title}:</div>
                        <select
                            className="form-control mb-4 productVariant"
                            onChange={event =>
                                props.onSelectVariant(productId, variant, event.target.value)
                            }
                            value={getVariantValue(variant.id)}
                        >
                            {variantOptions(variant.id, variant.values)}
                        </select>
                    </div>,
                );
            }
            return variantElements;
        }
        return;
    };

    return (
        <div>
            {productVariants(props.product.id, props.product.itemVariants)}
        </div>
    );
}

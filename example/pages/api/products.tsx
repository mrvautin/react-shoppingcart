import type { NextApiRequest, NextApiResponse } from 'next';

// Demo products
const demoProducts = [
    {
        id: 'shoes',
        name: 'Shoes',
        price: 1000,
        itemVariants: [
            {
                id: '1',
                name: 'test',
                title: 'Size',
                values: [
                    'US9', 'US10', 'US11'
                ],
                selectedValue: 'US9',
            }
        ]
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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests allowed' });
        return;
    }
    try {
        res.status(200).json(demoProducts);
    } catch (ex) {
        console.log('err', ex);
        res.status(400).json({
            error: 'Failed to get products',
        });
    }
}

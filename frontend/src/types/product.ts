export type Tag =
    | 'ELECTRONICS'
    | 'FOOD'
    | 'COLLECTIBLES'
    | 'FASHION'
    | 'JEWELRY'
    | 'ART'
    | 'VEHICLES'
    | 'SPORTS'
    | 'GARDENING'
    | 'GAMES'
    | 'ONLINE_ITEM'
    | 'OTHERS';

export interface ProductRequest {
    productName: string;
    description?: string;
    quantity: number;
    productImageUrl?: string;
    tags?: Tag[];
}

export interface ProductResponse {
    id: number;
    productName: string;
    description?: string;
    quantity: number;
    productImageUrl?: string;
    tags?: Tag[];
    createdAt: string;
}
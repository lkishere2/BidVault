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
    | 'OTHER';

export interface ProductRequest {
    productName: string;
    description?: string;
    quantity: number;          // Đã khớp với Integer bên Backend
    productImageUrl?: string;
    tags?: Tag[];              // JSON gửi lên sẽ là mảng chuỗi, tự động map sang Set<Tag> ở Spring Boot
}

export interface ProductResponse {
    id: number;
    productName: string;
    description?: string;
    quantity: number;
    productImageUrl?: string;
    tags?: Tag[];              // Đồng bộ nhận về danh sách tag
    createdAt: string;         // Khớp với LocalDateTime từ Backend dưới dạng ISO String
}
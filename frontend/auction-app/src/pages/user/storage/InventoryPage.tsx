import React, { useState, useEffect, useCallback } from 'react';
import type { ProductRequest, ProductResponse, Tag } from '../../../types/product';
import productApi from '../../../api/productApi';
import { InventoryHeader } from './InventoryHeader';
import { InventoryFilters } from './InventoryFilters';
import { ProductGrid } from './ProductGrid';
import { ProductModal } from './ProductModal';
import { InventoryPagination } from './InventoryPagination';

export const InventoryPage: React.FC = () => {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Pagination & Filters
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [selectedTags, setSelectedTags] = useState<Set<Tag>>(new Set());

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            // 1. Safely format the tags for Spring Boot (comma-separated string)
            const tagsParam = selectedTags.size > 0 ? Array.from(selectedTags).join(',') : undefined;

            const res = await productApi.getStorage({
                page,
                size: 12,
                keyword: keyword || undefined,
                tags: tagsParam,
            });

            // 2. Safely extract the response (handles both raw Axios responses and pre-parsed data)
            const responseData = res.data ? res.data : res;

            // 3. Spring Boot Page structures put the array inside 'content'
            const productsList = responseData.content ? responseData.content : responseData;

            // Ensure we are setting an array to avoid map() crashes in the Grid
            setProducts(Array.isArray(productsList) ? productsList : []);
            setTotalPages(responseData.totalPages || 1);

        } catch (error) {
            console.error("Failed to fetch products:", error);
            setProducts([]); // Clear the grid if it fails
        } finally {
            setIsLoading(false);
        }
    }, [page, keyword, selectedTags]);

    useEffect(() => {
        // Simple debounce for search
        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchProducts]);

    const handleToggleTag = (tag: Tag) => {
        const newTags = new Set(selectedTags);
        if (newTags.has(tag)) newTags.delete(tag);
        else newTags.add(tag);
        setSelectedTags(newTags);
        setPage(0); // Reset page on filter change
    };

    const handleSaveProduct = async (data: ProductRequest) => {
        try {
            if (editingProduct) {
                await productApi.editProduct(editingProduct.id, data);
            } else {
                await productApi.addProduct(data);
            }
            fetchProducts();
        } catch (error) {
            console.error("Failed to save product", error);
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await productApi.deleteProduct(id);
            fetchProducts();
        } catch (error) {
            console.error("Failed to delete product", error);
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product: ProductResponse) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-white p-6 md:p-12 font-sans">
            <div className="max-w-7xl mx-auto">
                <InventoryHeader onAddClick={openAddModal} />

                <InventoryFilters
                    keyword={keyword}
                    setKeyword={(k) => { setKeyword(k); setPage(0); }}
                    selectedTags={selectedTags}
                    toggleTag={handleToggleTag}
                />

                <ProductGrid
                    products={products}
                    isLoading={isLoading}
                    onEdit={openEditModal}
                    onDelete={handleDeleteProduct}
                />

                <InventoryPagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProduct}
                editingProduct={editingProduct}
            />
        </div>
    );
};
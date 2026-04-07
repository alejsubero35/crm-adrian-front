import React from 'react';
import { useBusinessTierContext } from '../BusinessTierProvider';
import ProductService from '../../../services/ProductService';

export default function LimitAlert() {
    const { tier, limits } = useBusinessTierContext();
    const [productCount, setProductCount] = React.useState(0);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchCount = async () => {
            try {
                const token = localStorage.getItem('token') || undefined;
                const rawUser = localStorage.getItem('user');
                if (!rawUser) return;

                let parsedUser = null;
                try {
                    parsedUser = JSON.parse(rawUser);
                } catch {
                    parsedUser = null;
                }

                const tenantId = parsedUser?.tenant_id ?? parsedUser?.tenant?.id ?? null;
                if (!tenantId) return;

                const count = await ProductService.getProductCount(tenantId, token);
                setProductCount(count);
            } catch (error) {
                console.error('Error fetching product count:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCount();
    }, []);

    if (loading || !limits.max_products) return null;

    const percentage = (productCount / limits.max_products) * 100;

    if (percentage >= 90) {
        return (
            <div className="alert alert-danger">
                ¡Alerta! Has alcanzado el {Math.round(percentage)}% de tu límite de productos ({productCount}/{limits.max_products})
            </div>
        );
    } else if (percentage >= 75) {
        return (
            <div className="alert alert-warning">
                Advertencia: Has usado el {Math.round(percentage)}% de tu límite de productos
            </div>
        );
    }

    return null;
}

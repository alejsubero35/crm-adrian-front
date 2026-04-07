import { createContext, useContext, useEffect, useState } from 'react';
import businessTierService from '../../services/businessTierService';

export const BusinessTierContext = createContext({
    tier: 'basic',
    enabledFeatures: [],
    limits: {},
    loading: false,
    error: null,
});

export default function BusinessTierProvider({ children }) {
    const [tierData, setTierData] = useState({
        tier: 'basic',
        enabledFeatures: [],
        limits: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTierData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const data = await businessTierService.getBusinessTierData(token);
                setTierData({
                    tier: data.tier,
                    enabledFeatures: data.enabledFeatures,
                    limits: data?.limits ?? {}
                });
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadTierData();
    }, []);

    return (
        <BusinessTierContext.Provider value={{ ...tierData, loading, error }}>
            {children}
        </BusinessTierContext.Provider>
    );
}

export function useBusinessTierContext() {
    return useContext(BusinessTierContext);
}

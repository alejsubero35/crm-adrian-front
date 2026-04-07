import React, { useState } from 'react';
import { useBusinessTierContext } from '../BusinessTierProvider';
import businessTierService from '../../../services/businessTierService';

export default function TierSelector() {
    const { tier, loading, error, setTierData } = useBusinessTierContext();
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);

    const handleTierChange = async (newTier) => {
        try {
            setUpdating(true);
            setUpdateError(null);
            const token = localStorage.getItem('token');
            const updatedData = await businessTierService.updateBusinessTier(newTier, token);
            setTierData(updatedData);
        } catch (err) {
            setUpdateError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div>Cargando niveles...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="tier-selector">
            <h3>Nivel Actual: {tier.toUpperCase()}</h3>

            <select
                value={tier}
                onChange={(e) => handleTierChange(e.target.value)}
                disabled={updating}
            >
                <option value="basic">Básico</option>
                <option value="medium">Intermedio</option>
                <option value="advanced">Avanzado</option>
            </select>

            {updating && <p>Actualizando nivel...</p>}
            {updateError && <p className="error">{updateError}</p>}
        </div>
    );
}

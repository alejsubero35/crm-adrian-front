import React from 'react';
import { useBusinessTierContext } from '../BusinessTierProvider';

export default function FeatureLock({ featureName, children }) {
    const { enabledFeatures } = useBusinessTierContext();

    if (!enabledFeatures.includes(featureName)) {
        return (
            <div className="feature-lock">
                <div className="lock-message">
                    Esta función requiere el nivel premium
                </div>
            </div>
        );
    }

    return children;
}

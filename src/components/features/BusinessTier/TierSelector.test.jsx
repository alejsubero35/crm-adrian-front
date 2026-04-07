import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BusinessTierContext } from '../BusinessTierProvider';
import TierSelector from './TierSelector';

const mockContext = {
    tier: 'basic',
    loading: false,
    error: null,
    setTierData: jest.fn()
};

describe('TierSelector', () => {
    it('muestra el nivel actual', () => {
        render(
            <BusinessTierContext.Provider value={mockContext}>
                <TierSelector />
            </BusinessTierContext.Provider>
        );
        expect(screen.getByText('Nivel Actual: BASIC')).toBeInTheDocument();
    });

    it('permite cambiar de nivel', () => {
        render(
            <BusinessTierContext.Provider value={mockContext}>
                <TierSelector />
            </BusinessTierContext.Provider>
        );

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'medium' } });

        expect(select.value).toBe('medium');
    });
});

import React from 'react';
import { useBusinessTierContext } from '../BusinessTierProvider';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function UsageDashboard() {
    const { limits = {} } = useBusinessTierContext();

    // Datos de ejemplo - en producción vendrían de una API
    const usageData = [
        { name: 'Productos', used: 45, limit: limits.max_products || 50 },
        { name: 'Usuarios', used: 8, limit: limits.max_users || 10 },
        { name: 'Almacenes', used: 2, limit: limits.max_warehouses || 3 }
    ];

    return (
        <div className="usage-dashboard">
            <h3>Supervisión de Consumo</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usageData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                        dataKey="used"
                        fill="#8884d8"
                        name="En uso"
                    />
                    <Bar
                        dataKey="limit"
                        fill="#82ca9d"
                        name="Límite"
                    />
                </BarChart>
            </ResponsiveContainer>

            <div className="usage-stats">
                {usageData.map(item => (
                    <div key={item.name} className="usage-item">
                        <span>{item.name}: </span>
                        <strong>{item.used}/{item.limit}</strong>
                        <span> ({Math.round((item.used / item.limit) * 100)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

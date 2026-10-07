import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const BrokerContext = createContext();

export const BrokerProvider = ({ children }) => {
    const [broker, setBroker] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshBrokerData = async () => {
    setLoading(true); // ← add this so BrokerLayout shows spinner during refresh
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/brokerProfile`, { 
            withCredentials: true 
        });
        setBroker(res.data);
    } catch (err) {
        console.error("Context Error:", err);
        setBroker(null);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        refreshBrokerData();
    }, []);

    return (
        <BrokerContext.Provider value={{ broker, loading, refreshBrokerData }}>
            {children}
        </BrokerContext.Provider>
    );
};

export const useBroker = () => useContext(BrokerContext);
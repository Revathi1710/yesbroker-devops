import React from 'react';
import { useBroker } from '../context/BrokerContext';

import { ShieldAlert, Headset } from 'lucide-react';



const BrokerLayout = ({ children }) => {
    const { broker, loading } = useBroker();

    if (loading) return (
        <div className="vh-100 d-flex justify-content-center align-items-center">
            <div className="spinner-border text-danger" role="status"></div>
        </div>
    );

    return (
        <div className="">
           
            <main className="flex-grow-1 bg-light min-vh-100 ">
                {broker?.active ? (
                    // If active, show the actual page (Dashboard, Properties, etc.)
                    children 
                ) : (
                    // If NOT active, show this restriction screen
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="card border-0 shadow-sm p-5 text-center" style={{ maxWidth: '500px', borderRadius: '20px' }}>
                            <ShieldAlert size={60} className="text-warning mx-auto mb-3" />
                            <h3 className="fw-bold">Activation Pending</h3>
                            <p className="text-muted">
                                Hello <strong>{broker?.name}</strong>, your account is currently being verified. 
                                Access to property management and your website will be enabled shortly.
                            </p>
                            <a href="mailto:admin@yesbroker.com" className="btn btn-danger rounded-pill px-4">
                                <Headset size={18} className="me-2" /> Contact Admin
                            </a>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BrokerLayout;
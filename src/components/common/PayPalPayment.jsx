import React, { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { paypalApi } from '../../api/endpoints';

export default function PayPalPayment({ registrationId, onApprove, onError }) {
    const [{ isPending }] = usePayPalScriptReducer();
    const [loading, setLoading] = useState(false);

    const createOrder = async () => {
        try {
            setLoading(true);
            const res = await paypalApi.createOrder(registrationId);
            if (res.data.success) {
                return res.data.order.id;
            } else {
                throw new Error(res.data.message || "Failed to create order");
            }
        } catch (err) {
            console.error("PayPal Order Error:", err);
            onError(err.message || "Could not initialize PayPal order");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const onCapture = async (data) => {
        try {
            console.log("PayPal Capture data:", data);
            setLoading(true);
            const res = await paypalApi.captureOrder(data.orderID);
            if (res.data.success) {
                onApprove(res.data.registration);
            } else {
                throw new Error(res.data.message || "Failed to capture payment");
            }
        } catch (err) {
            console.error("PayPal Capture Error:", err);
            onError(err.message || "Payment capture failed");
        } finally {
            setLoading(false);
        }
    };

    if (isPending) return <div className="animate-pulse bg-slate-100 h-24 rounded-lg w-full flex items-center justify-center">Loading PayPal...</div>;

    return (
        <div className="relative min-h-[150px]">
            {loading && (
                <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
            )}
            <PayPalButtons 
                style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                createOrder={createOrder}
                onApprove={onCapture}
                onError={(err) => {
                    console.error("PayPal Button Error:", err);
                    onError("An error occurred during the PayPal process. Please try again.");
                }}
            />
        </div>
    );
}

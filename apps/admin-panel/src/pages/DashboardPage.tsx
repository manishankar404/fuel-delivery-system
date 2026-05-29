import {
  useEffect,
  useState,
} from 'react';

import {
  getAllOrders,
  updateOrderStatus,
} from '../services/orderService';

export default function DashboardPage() {
  const [orders, setOrders] =
    useState<any[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders =
    async () => {
      try {
        const data =
          await getAllOrders();

        setOrders(data);
      } catch (error) {
        console.log(error);
      }
    };

  const handleStatusUpdate =
    async (
      orderId: string,
      status: string
    ) => {
      try {
        await updateOrderStatus(
          orderId,
          status
        );

        loadOrders();
      } catch (error: any) {
        alert(error.message);
      }
    };

  return (
    <div
      style={{
        padding: 40,
      }}
    >
      <h1>
        Admin Dashboard
      </h1>

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border:
              '1px solid #ccc',
            padding: 20,
            marginBottom: 16,
          }}
        >
          <h3>
            {
              order.fuel_types
                ?.name
            }
          </h3>

          <p>
            Customer:
            {' '}
            {
              order.profiles
                ?.email
            }
          </p>

          <p>
            Quantity:
            {' '}
            {
              order.quantity_liters
            }
            L
          </p>

          <p>
            Status:
            {' '}
            {order.status}
          </p>

          <button
            onClick={() =>
              handleStatusUpdate(
                order.id,
                'approved'
              )
            }
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}
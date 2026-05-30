import {
  useEffect,
  useState,
  useCallback,
  startTransition,
} from 'react';

import { supabase } from '../lib/supabase';

import {
  getAllOrders,
  updateOrderStatus,
} from '../services/orderService';

import {
  sendPushNotification,
} from '../services/notificationService';

import {
  getProfilePushToken,
} from '../services/profileService';

import {
  getDeliveryAgents,
  assignDeliveryAgent,
} from '../services/deliveryAgentService';

import OrderStatusBadge from '../components/OrderStatusBadge';

interface Order {
  id: string;

  customer_id: string;

  quantity_liters: number;

  status: string;

  fuel_types?: {
    name: string;
  };

  profiles?: {
    email: string;
  };
}

export default function DashboardPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  interface DeliveryAgent {
  id: string;

  vehicle_number: string;

  profiles?: {
    full_name: string;

    email: string;
  }[];
}

const [deliveryAgents,
  setDeliveryAgents] =
  useState<
    DeliveryAgent[]
  >([]);

  const loadOrders =
    useCallback(async () => {
      try {
        const data =
          await getAllOrders();

        startTransition(() => {
          setOrders(data || []);
        });
      } catch (error) {
        console.log(error);
      }
    }, []);

    const loadDeliveryAgents =
      useCallback(async () => {
        try {
          const data =
            await getDeliveryAgents();

          setDeliveryAgents(
            data || []
          );
        } catch (error) {
          console.log(error);
        }
      }, []);

      useEffect(() => {
        loadOrders();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDeliveryAgents();
        const channel =
          supabase.channel(
            'admin-orders'
          );

  channel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      () => {
        loadOrders();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(
      channel
    );
  };
}, [
  loadOrders,
  loadDeliveryAgents,
]);

  const handleStatusUpdate =
    async (
      orderId: string,
      customerId: string,
      status: string
    ) => {
      try {
        await updateOrderStatus(
          orderId,
          status
        );

        const pushToken =
          await getProfilePushToken(
            customerId
          );

        if (pushToken) {
          await sendPushNotification(
            pushToken,

            'Order Update',

            `Your order status is now: ${status}`
          );
        }

        loadOrders();
      } catch (error) {
        console.log(error);

        alert(
          'Failed to update order'
        );
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
            borderRadius: 10,
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
            }L
          </p>

          <p>
            Status: <OrderStatusBadge status={order.status} />
          </p>

          <button
            onClick={() =>
              handleStatusUpdate(
                order.id,
                order.customer_id,
                'approved'
              )
            }
            style={{
              padding:
                '10px 16px',
              cursor: 'pointer',
            }}
          >
            Approve
          </button>
          {deliveryAgents.map(
            (agent) => (
              <button
                key={agent.id}
                onClick={() =>
                  assignDeliveryAgent(
                    order.id,
                    agent.id
                  )
                }
                style={{
                  marginLeft: 8,
                }}
              >
                Assign to{' '}
                {
                  agent.profiles?.[0]
                    ?.full_name
                }
              </button>
            )
          )}
        </div>
      ))}
    </div>
  );
}

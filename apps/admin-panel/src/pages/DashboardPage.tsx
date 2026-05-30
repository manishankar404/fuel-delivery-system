import {
  useEffect,
  useState,
  useCallback,
  startTransition,
} from 'react';

import './DashboardPage.css';

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

import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardMetricCard from '../components/dashboard/DashboardMetricCard';
import OrderCard, {
  type OrderCardData,
} from '../components/dashboard/OrderCard';
import type {
  DeliveryAgentOption,
} from '../components/dashboard/OrderActions';

import {
  getOrderStatusBadgeMeta,
} from '../shared/orderStatus';

interface Order {
  id: string;

  customer_id: string;

  quantity_liters: number;

  status: unknown;

  fuel_types?: {
    name: string;
  };

  profiles?: {
    email: string;
  };

  assigned_delivery_agent_id?: string | null;
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

  const [isLoadingOrders, setIsLoadingOrders] =
    useState<boolean>(true);

  const [isLoadingAgents, setIsLoadingAgents] =
    useState<boolean>(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [busyOrderIds, setBusyOrderIds] =
    useState<Record<string, boolean>>({});

  const [lastUpdatedAt, setLastUpdatedAt] =
    useState<Date | null>(null);

  const loadOrders =
    useCallback(async () => {
      try {
        setIsLoadingOrders(true);
        setErrorMessage(null);
        const data =
          await getAllOrders();

        startTransition(() => {
          setOrders(data || []);
        });

        setLastUpdatedAt(new Date());
      } catch (error) {
        console.log(error);
        setErrorMessage(
          'Failed to load orders.'
        );
      } finally {
        setIsLoadingOrders(false);
      }
    }, []);

    const loadDeliveryAgents =
      useCallback(async () => {
        try {
          setIsLoadingAgents(true);
          setErrorMessage(null);
          const data =
            await getDeliveryAgents();

          setDeliveryAgents(
            data || []
          );
        } catch (error) {
          console.log(error);
          setErrorMessage(
            'Failed to load delivery agents.'
          );
        } finally {
          setIsLoadingAgents(false);
        }
      }, []);

      useEffect(() => {
        queueMicrotask(() => {
          void loadOrders();
          void loadDeliveryAgents();
        });
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

  const agentOptions: DeliveryAgentOption[] =
    deliveryAgents.map((agent) => {
      const name =
        agent.profiles?.[0]
          ?.full_name ||
        agent.profiles?.[0]
          ?.email ||
        agent.vehicle_number ||
        agent.id;

      return {
        id: agent.id,
        displayName: name,
      };
    });

  const metrics = (() => {
    const totalOrders = orders.length;
    const totalLiters = orders.reduce(
      (sum, o) => sum + (o.quantity_liters || 0),
      0
    );

    const byStatus: Record<string, number> =
      {};

    for (const order of orders) {
      const statusKey =
        getOrderStatusBadgeMeta(
          order.status
        ).status;
      byStatus[statusKey] =
        (byStatus[statusKey] ?? 0) + 1;
    }

    return {
      totalOrders,
      totalLiters,
      pending: byStatus.pending ?? 0,
      approved: byStatus.approved ?? 0,
      assigned: byStatus.assigned ?? 0,
      out_for_delivery:
        byStatus.out_for_delivery ??
        0,
      delivered: byStatus.delivered ?? 0,
    };
  })();

  const setBusy =
    useCallback(
      (orderId: string, busy: boolean) => {
        setBusyOrderIds((prev) => ({
          ...prev,
          [orderId]: busy,
        }));
      },
      []
    );

  const handleStatusUpdate = useCallback(
    async (
      orderId: string,
      customerId: string,
      status: string
    ) => {
      try {
        setBusy(orderId, true);
        await updateOrderStatus(orderId, status);

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
      } finally {
        setBusy(orderId, false);
      }
    },
    [loadOrders, setBusy]
  );

  const handleApprove =
    useCallback((orderId: string, customerId: string) => {
      return handleStatusUpdate(orderId, customerId, 'approved');
    }, [handleStatusUpdate]);

  const handleAssign =
    useCallback(
      async (
        orderId: string,
        agentId: string
      ) => {
        try {
          setBusy(orderId, true);
          await assignDeliveryAgent(
            orderId,
            agentId
          );
          loadOrders();
        } catch (error) {
          console.log(error);
          alert(
            'Failed to assign delivery agent'
          );
        } finally {
          setBusy(orderId, false);
        }
      },
      [loadOrders, setBusy]
    );

  const orderCards: OrderCardData[] =
    orders.map((o) => ({
      id: o.id,
      customerId: o.customer_id,
      customerEmail:
        o.profiles?.email ?? null,
      fuelTypeName:
        o.fuel_types?.name ?? null,
      quantityLiters:
        o.quantity_liters,
      status: o.status,
      assignedDeliveryAgentId:
        o.assigned_delivery_agent_id ??
        null,
    }));

  const updatedLabel =
    lastUpdatedAt
      ? `Updated ${lastUpdatedAt.toLocaleTimeString()}`
      : 'Updated —';

  return (
    <div className="admDashPage">
      <DashboardHeader
        title="Operations Dashboard"
        subtitle="Approve new orders, assign delivery agents, and monitor progress in realtime."
        right={
          <>
            <div className="admSectionMeta">{isLoadingOrders ? 'Updating…' : updatedLabel}</div>
            <button className="admBtn" type="button" onClick={loadOrders}>
              Refresh
            </button>
          </>
        }
      />

      {errorMessage ? <div className="admErrorState">{errorMessage}</div> : null}

      <section className="admMetrics" aria-label="Dashboard metrics">
        <DashboardMetricCard label="Total Orders" value={metrics.totalOrders} />
        <DashboardMetricCard label="Pending" value={metrics.pending} />
        <DashboardMetricCard label="Approved" value={metrics.approved} />
        <DashboardMetricCard label="Assigned" value={metrics.assigned} />
        <DashboardMetricCard label="Out for delivery" value={metrics.out_for_delivery} />
        <DashboardMetricCard label="Delivered" value={metrics.delivered} hint={`${metrics.totalLiters} L total`} />
      </section>

      <section className="admSection" aria-label="Orders">
        <div className="admSectionHeader">
          <h2 className="admSectionTitle">Orders</h2>
          <div className="admSectionMeta">
            Agents: {isLoadingAgents ? 'Loading…' : agentOptions.length}
            {' • '}
            Total liters: {metrics.totalLiters}
          </div>
        </div>

        {isLoadingOrders ? (
          <div className="admEmptyState">Loading orders…</div>
        ) : orderCards.length === 0 ? (
          <div className="admEmptyState">No orders yet.</div>
        ) : (
          <div className="admOrdersGrid">
            {orderCards.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                deliveryAgents={agentOptions}
                isBusy={Boolean(busyOrderIds[order.id])}
                onApprove={handleApprove}
                onAssign={handleAssign}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

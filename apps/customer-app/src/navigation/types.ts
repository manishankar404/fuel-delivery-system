export type AppStackParamList = {
  Home: undefined;
  CreateOrder: undefined;
  OrderHistory:
    | {
        initialTab?: 'active' | 'delivered';
        highlightOrderId?: string;
      }
    | undefined;
  LiveTracking: { orderId: string };
};

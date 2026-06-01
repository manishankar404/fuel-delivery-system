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
  Orders: {
    initialTab?: 'active' | 'delivered';
    highlightOrderId?: string;
  } | undefined;
  Tracking: undefined;
  Products: undefined;
  Profile: undefined;
  Wallet: undefined;
};

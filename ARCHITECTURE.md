# Fuel Delivery System Architecture

Apps:

* customer-app (React Native Expo)
* delivery-agent-app (React Native Expo)
* admin-panel (React + Vite)

Backend:

* Supabase

Core Systems:

* authentication
* realtime subscriptions
* delivery assignment
* live tracking
* order timeline history
* role-based workflows

Database Tables:

* profiles
* orders
* delivery_agents
* fuel_types
* order_status_history

Tracking:

* delivery_agents stores live coordinates
* customer tracks assigned delivery agent only

Current Workflow:
Customer
→ creates order
→ admin approves
→ admin assigns delivery agent
→ delivery agent updates status
→ customer tracks live delivery

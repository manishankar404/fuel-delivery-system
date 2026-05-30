# AI Development Rules

* Use TypeScript everywhere
* Keep service logic inside /services
* Keep Supabase queries inside service layer
* Avoid inline database queries in UI components
* Reuse existing components whenever possible
* Maintain realtime compatibility
* Preserve Expo SDK compatibility
* Do not install packages unless necessary
* Keep customer-app, admin-panel, and delivery-agent-app separated
* Prefer reusable hooks and components
* Avoid breaking existing workflows
* Maintain current project folder structure
* Use async/await consistently
* Do not use any unless unavoidable
* Keep logistics workflow statuses consistent:
  pending
  approved
  assigned
  out_for_delivery
  delivered

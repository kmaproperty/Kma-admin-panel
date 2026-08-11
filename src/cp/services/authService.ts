// Slim stub of seller's authService — only the types consumed by the
// postProperty module. Auth itself is handled by the admin panel's own
// flows; the KMA Internal CP session is wired in addKmaProperty.jsx.

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  channelPartnerCode?: string | null;
}

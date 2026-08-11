// Admin panel uses its own ProtectedRoute auth. Render children unconditionally.
export default function SellerGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

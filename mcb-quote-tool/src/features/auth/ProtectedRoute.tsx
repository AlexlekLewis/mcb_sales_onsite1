import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

// Set to true to bypass auth during development
const DEV_BYPASS_AUTH = true;

export function ProtectedRoute() {
    const { session, loading } = useAuth();
    const location = useLocation();

    // Skip auth check in dev mode
    if (DEV_BYPASS_AUTH) {
        return <Outlet />;
    }

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="animate-spin text-brand-orange" size={48} />
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}

// Optional: Protected Admin Route?
// The user said "anyone can access admin routes".
// Maybe separate Admin Only route?
// For now, any Authenticated User.

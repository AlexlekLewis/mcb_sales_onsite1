import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { QuotesList } from './features/quoting/QuotesList';
import { CreateQuoteV2 } from './features/quoting/CreateQuoteV2';
import { QuoteDetails } from './features/quoting/QuoteDetails';
import { VoiceRecorder } from './features/tools/VoiceRecorder';
import { CameraCapture } from './features/tools/CameraCapture';
import { Dashboard } from './features/dashboard/Dashboard';
import { ClientsList } from './features/clients/ClientsList';
import { AddClient } from './features/clients/AddClient';
import { ClientDetails } from './features/clients/ClientDetails';

import { AdminLayout } from './components/layout/AdminLayout';
import { ProductList } from './features/admin/products/ProductList';
import { ProductForm } from './features/admin/products/ProductForm';
import { FabricList } from './features/admin/fabrics/FabricList';
import { FabricForm } from './features/admin/fabrics/FabricForm';
import { PriceGroupList } from './features/admin/price-groups/PriceGroupList';

import { ExtrasList } from './features/admin/extras/ExtrasList';
import { InstallationRates } from './features/admin/pages/InstallationRates';
import { DiscountManager } from './features/admin/discounts/DiscountManager';
import { QuoteSummarySettings } from './features/admin/settings/QuoteSummarySettings';

import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { Login } from './features/auth/Login';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute />}>
                        {/* Admin Routes - Standalone AdminLayout */}
                        <Route path="/admin/*" element={
                            <AdminLayout>
                                <Routes>
                                    <Route index element={<ProductList />} />
                                    <Route path="products" element={<ProductList />} />
                                    <Route path="products/new" element={<ProductForm />} />
                                    <Route path="products/:id" element={<ProductForm />} />
                                    <Route path="fabrics" element={<FabricList />} />
                                    <Route path="fabrics/new" element={<FabricForm />} />
                                    <Route path="fabrics/:id" element={<FabricForm />} />
                                    <Route path="price-groups" element={<PriceGroupList />} />
                                    <Route path="extras" element={<ExtrasList />} />
                                    <Route path="installation" element={<InstallationRates />} />
                                    <Route path="discounts" element={<DiscountManager />} />
                                    <Route path="quote-summary-settings" element={<QuoteSummarySettings />} />
                                </Routes>
                            </AdminLayout>
                        } />

                        {/* Main App Routes - AppLayout with SlimSidebar */}
                        <Route path="/*" element={
                            <AppLayout>
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/quotes" element={<QuotesList />} />
                                    <Route path="/quotes/new" element={<CreateQuoteV2 />} />
                                    <Route path="/quotes/:id" element={<QuoteDetails />} />
                                    <Route path="/clients" element={<ClientsList />} />
                                    <Route path="/clients/new" element={<AddClient />} />
                                    <Route path="/clients/:id/edit" element={<AddClient />} />
                                    <Route path="/clients/:id" element={<ClientDetails />} />
                                    <Route path="/voice-notes" element={<VoiceRecorder />} />
                                    <Route path="/site-photos" element={<CameraCapture />} />

                                    {/* Fallback */}
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </AppLayout>
                        } />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;


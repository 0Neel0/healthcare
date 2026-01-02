import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AppointmentBooking from './pages/AppointmentBooking';
import AppointmentSuccess from './pages/AppointmentSuccess';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard'; // Overview
import Inventory from './pages/admin/Inventory';
import Billing from './pages/admin/Billing';
import Staff from './pages/admin/Staff';
import Wards from './pages/admin/Wards';
import Lab from './pages/admin/Lab';
import EMR from './pages/admin/EMR';
import Reports from './pages/admin/Reports';
import Patients from './pages/admin/Patients';
import Doctors from './pages/admin/Doctors';
import Appointments from './pages/admin/Appointments';
import PharmacyDashboard from './pages/admin/PharmacyDashboard';
import BloodBank from './pages/admin/BloodBank';
import OTDashboard from './pages/admin/OTDashboard';
import RosterScheduler from './pages/admin/RosterScheduler';
import PredictiveAnalytics from './pages/admin/PredictiveAnalytics';
import QueueDisplay from './pages/public/QueueDisplay';
import InsuranceDashboard from './pages/admin/InsuranceDashboard';
import WardMap from './pages/admin/WardMap';

import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

import PatientLayout from './components/layout/PatientLayout';
import PatientDashboard from './pages/patient/PatientDashboard';
import MyAppointments from './pages/patient/MyAppointments';
import MyMedicalRecords from './pages/patient/MyMedicalRecords';
import SummarizeReport from './pages/patient/SummarizeReport';
import DocumentQA from './pages/patient/DocumentQA'; // New Component
import MyLabReports from './pages/patient/MyLabReports';
import MyBilling from './pages/patient/MyBilling';
import MyProfile from './pages/patient/MyProfile';
import MyClaims from './pages/patient/MyClaims'; // Imported MyClaims
// Placeholder for Profile Completion - I will need to create this file next
import PatientProfileCompletion from './pages/patient/PatientProfileCompletion';

// Doctor Dashboard
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorScheduler from './pages/doctor/DoctorScheduler';
import MedicalImaging from './pages/doctor/MedicalImaging';
import Telemedicine from './pages/Telemedicine';

import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import GlobalCallListener from './components/chat/GlobalCallListener';

function App() {
  return (
    <SocketProvider>
      <Router>
        <GlobalCallListener />
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public Queue Display */}
          <Route path="/queue" element={<QueueDisplay />} />

          {/* Protected User Routes */}
          <Route path="/book-appointment" element={
            <ProtectedRoute allowedRoles={['patient', 'admin']}>
              <AppointmentBooking />
            </ProtectedRoute>
          } />
          <Route path="/appointment/:id" element={
            <ProtectedRoute>
              <AppointmentSuccess />
            </ProtectedRoute>
          } />

          {/* Patient Portal */}
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="complete-profile" element={<PatientProfileCompletion />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="emr" element={<MyMedicalRecords />} />
            <Route path="emr" element={<MyMedicalRecords />} />
            <Route path="summarize" element={<SummarizeReport />} />
            <Route path="qa" element={<DocumentQA />} />
            <Route path="lab" element={<MyLabReports />} />
            <Route path="billing" element={<MyBilling />} />
            <Route path="claims" element={<MyClaims />} />
            <Route path="profile" element={<MyProfile />} />
          </Route>

          {/* Doctor Dashboard */}
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <ErrorBoundary>
                <DoctorDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          } />

          <Route path="/doctor/medical-imaging" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <MedicalImaging />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/doctor/schedule" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <ErrorBoundary>
                <DoctorScheduler />
              </ErrorBoundary>
            </ProtectedRoute>
          } />

          {/* Telemedicine Suite (Shared) */}
          <Route path="/telemedicine" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Telemedicine />
              </ErrorBoundary>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="pharmacy" element={<PharmacyDashboard />} />
            <Route path="blood-bank" element={<BloodBank />} />
            <Route path="ot" element={<OTDashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="billing" element={<Billing />} />
            <Route path="staff" element={<Staff />} />
            <Route path="staff-roster" element={<RosterScheduler />} />
            <Route path="ai-analytics" element={<PredictiveAnalytics />} />
            <Route path="insurance" element={<InsuranceDashboard />} />
            <Route path="wards-map" element={<WardMap />} />
            <Route path="wards" element={<Wards />} />
            <Route path="lab" element={<Lab />} />
            <Route path="emr" element={<EMR />} />
            <Route path="reports" element={<Reports />} />
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;

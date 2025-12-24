import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import PatientRegistration from './pages/PatientRegistration';
import AppointmentBooking from './pages/AppointmentBooking';
import AppointmentSuccess from './pages/AppointmentSuccess';
import AdminLogin from './pages/AdminLogin';
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

import PatientLogin from './pages/PatientLogin';

import ProtectedRoute from './components/auth/ProtectedRoute';

import PatientLayout from './components/layout/PatientLayout';
import PatientDashboard from './pages/patient/PatientDashboard';
import MyAppointments from './pages/patient/MyAppointments';
import MyMedicalRecords from './pages/patient/MyMedicalRecords';
import MyLabReports from './pages/patient/MyLabReports';
import MyBilling from './pages/patient/MyBilling';
import MyProfile from './pages/patient/MyProfile';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PatientLogin />} /> {/* Main User Login */}
        <Route path="/register" element={<PatientRegistration />} />

        {/* Protected User Routes */}
        <Route path="/book-appointment" element={
          <ProtectedRoute>
            <AppointmentBooking />
          </ProtectedRoute>
        } />
        <Route path="/appointment/:id" element={
          <ProtectedRoute>
            <AppointmentSuccess />
          </ProtectedRoute>
        } />

        {/* Patient Portal (New) */}
        <Route path="/patient" element={
          <ProtectedRoute>
            <PatientLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="emr" element={<MyMedicalRecords />} />
          <Route path="lab" element={<MyLabReports />} />
          <Route path="billing" element={<MyBilling />} />
          <Route path="profile" element={<MyProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="billing" element={<Billing />} />
          <Route path="staff" element={<Staff />} />
          <Route path="wards" element={<Wards />} />
          <Route path="lab" element={<Lab />} />
          <Route path="emr" element={<EMR />} />
          <Route path="reports" element={<Reports />} />
          {/* Redirect legacy route if needed or keep existing pages mapped */}
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

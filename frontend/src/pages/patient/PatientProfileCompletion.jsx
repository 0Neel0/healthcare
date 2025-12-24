import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { UserPlus, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import FormField from '../../components/forms/FormField';
import patientService from '../../services/patientService';

const PatientProfileCompletion = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            // Pre-fill fields if we have them
            setValue('name', storedUser.name);
            setValue('email', storedUser.email);
            setValue('phone', storedUser.phone);
        }
    }, [setValue]);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError('');

            const patientData = {
                ...data,
                birthDate: new Date(data.birthDate),
                treatmentConsent: true,
                disclosureConsent: true,
                privacyConsent: true,
            };

            // Call update instead of create
            await patientService.registerPatient(user._id, patientData); // Assuming registerPatient is the update-full-profile endpoint

            // Update local storage
            const updatedUser = { ...user, ...patientData };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            toast.success('Profile completed successfully!');
            navigate('/patient/dashboard');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update profile. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gradient mb-6">Personal details</h2>
                        {/* Name/Email/Phone pre-filled but editable or locked? Let's keep editable but required */}
                        <FormField label="Full Name" name="name" register={register} error={errors.name} required />
                        <FormField label="Email" name="email" type="email" register={register} error={errors.email} disabled />
                        <FormField label="Phone" name="phone" type="tel" register={register} error={errors.phone} required />
                        <FormField label="Date of Birth" name="birthDate" type="date" register={register} error={errors.birthDate} required />
                        <FormField
                            label="Gender"
                            name="gender"
                            type="select"
                            options={['Male', 'Female', 'Other']}
                            register={register}
                            error={errors.gender}
                            required
                        />
                        <FormField label="Address" name="address" type="textarea" register={register} error={errors.address} required />
                        <FormField label="Occupation" name="occupation" register={register} error={errors.occupation} />
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gradient mb-6">Emergency Contact</h2>
                        <FormField label="Emergency Contact Name" name="emergencyContactName" register={register} error={errors.emergencyContactName} required />
                        <FormField label="Emergency Contact Number" name="emergencyContactNumber" type="tel" register={register} error={errors.emergencyContactNumber} required />
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gradient mb-6">Medical Information</h2>
                        <FormField label="Primary Physician" name="primaryPhysician" register={register} error={errors.primaryPhysician} required />
                        <FormField label="Allergies" name="allergies" type="textarea" placeholder="List any allergies..." register={register} error={errors.allergies} />
                        <FormField label="Current Medications" name="currentMedication" type="textarea" placeholder="List current medications..." register={register} error={errors.currentMedication} />
                        <FormField label="Family Medical History" name="familyMedicalHistory" type="textarea" placeholder="Any family medical history..." register={register} error={errors.familyMedicalHistory} />
                        <FormField label="Past Medical History" name="pastMedicalHistory" type="textarea" placeholder="Any past medical conditions..." register={register} error={errors.pastMedicalHistory} />
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gradient mb-6">Insurance & Consent</h2>
                        <FormField label="Insurance Provider" name="insuranceProvider" register={register} error={errors.insuranceProvider} required />
                        <FormField label="Insurance Policy Number" name="insurancePolicyNumber" register={register} error={errors.insurancePolicyNumber} required />

                        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                            <h3 className="font-semibold text-gray-900 mb-2">Consent Agreements</h3>
                            <p className="text-sm text-gray-600">
                                By submitting this form, you consent to treatment, disclosure of medical information, and our privacy policy.
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <div className="container mx-auto px-4 py-12 max-w-3xl flex-grow">
                <div className="glass-effect rounded-3xl p-8 animate-scale-in">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
                            <UserPlus className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Profile</h1>
                        <p className="text-gray-600">Please provide your medical details to continue</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            {[1, 2, 3, 4].map((step) => (
                                <div key={step} className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step <= currentStep
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-glow'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {step < currentStep ? <CheckCircle2 className="w-6 h-6" /> : step}
                                    </div>
                                    <div className="text-xs mt-2 text-gray-600 font-medium">
                                        {step === 1 && 'Personal'}
                                        {step === 2 && 'Emergency'}
                                        {step === 3 && 'Medical'}
                                        {step === 4 && 'Insurance'}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 animate-fade-in">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {renderStep()}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Previous</span>
                            </Button>

                            {currentStep < totalSteps ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center space-x-2"
                                >
                                    <span>Next</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    variant="success"
                                    disabled={loading}
                                    className="flex items-center space-x-2"
                                >
                                    <span>{loading ? 'Submitting...' : 'Complete Profile'}</span>
                                    <CheckCircle2 className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PatientProfileCompletion;

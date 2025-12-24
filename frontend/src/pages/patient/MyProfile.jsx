import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Save, RefreshCw } from 'lucide-react';
import { patientService } from '../../services/patientService';
import FormField from '../../components/forms/FormField';
import Button from '../../components/ui/Button';

const MyProfile = () => {
    const user = JSON.parse(localStorage.getItem('patientUser') || '{}');
    const [loading, setLoading] = useState(false);

    // We initialize form with local storage data. 
    // Ideally we fetch fresh data on mount, but local storage is faster for this demo.
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            emergencyContactName: user.emergencyContactName,
            emergencyContactNumber: user.emergencyContactNumber
        }
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const updatedProfile = await patientService.updatePatient(user._id, data);

            // Update Local Storage
            const fullUser = { ...user, ...updatedProfile };
            localStorage.setItem('patientUser', JSON.stringify(fullUser));

            alert('Profile Updated Successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

            <div className="glass-effect rounded-2xl p-8 border border-slate-200">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                        <User size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
                        <p className="text-slate-500">Patient ID: <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{user._id}</span></p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Full Name" name="name" register={register} error={errors.name} required />
                        <FormField label="Email" name="email" type="email" register={register} error={errors.email} disabled /> {/* Email usually requires verif to change */}
                        <FormField label="Phone" name="phone" type="tel" register={register} error={errors.phone} required />
                        <FormField label="Address" name="address" register={register} error={errors.address} required />
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Contact Name" name="emergencyContactName" register={register} error={errors.emergencyContactName} />
                            <FormField label="Contact Number" name="emergencyContactNumber" type="tel" register={register} error={errors.emergencyContactNumber} />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <Button type="submit" variant="primary" disabled={loading} className="flex items-center gap-2">
                            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MyProfile;

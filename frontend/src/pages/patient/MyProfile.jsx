import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Save, RefreshCw } from 'lucide-react';
import { patientService } from '../../services/patientService';
import FormField from '../../components/forms/FormField';
import Button from '../../components/ui/Button';

const MyProfile = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Helper to get image URL
    const getProfileImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:4000${path}`;
    };

    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(getProfileImageUrl(user.profilePicture));
    const [selectedFile, setSelectedFile] = useState(null);

    // We initialize form with local storage data. 
    // Ideally we fetch fresh data on mount, but local storage is faster for this demo.
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            description: user.description || '',
            emergencyContactName: user.emergencyContactName,
            emergencyContactNumber: user.emergencyContactNumber
        }
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();

            // Append all text fields
            Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
            });

            // Append file if selected
            if (selectedFile) {
                formData.append('profilePicture', selectedFile);
            }

            const updatedProfile = await patientService.updatePatient(user._id, formData);

            // Update Local Storage
            const fullUser = { ...user, ...updatedProfile };

            // Ensure profilePicture is saved with full path or as received
            if (updatedProfile.profilePicture) {
                fullUser.profilePicture = updatedProfile.profilePicture;
            }

            localStorage.setItem('patientUser', JSON.stringify(fullUser)); // Update legacy key just in case
            localStorage.setItem('user', JSON.stringify(fullUser)); // Update unified key

            // Update preview if it was a file upload
            if (updatedProfile.profilePicture) {
                setImagePreview(getProfileImageUrl(updatedProfile.profilePicture));
            }

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
                    <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 overflow-hidden border-2 border-brand-200">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={32} />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
                        <p className="text-slate-500">Patient ID: <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{user._id}</span></p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('fileInput').click()}>
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-brand-100 flex items-center justify-center text-brand-500">
                                        <User size={48} />
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-semibold">Change Photo</span>
                            </div>
                        </div>
                        <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Full Name" name="name" register={register} error={errors.name} required />
                        <FormField label="Email" name="email" type="email" register={register} error={errors.email} disabled />
                        <FormField label="Phone" name="phone" type="tel" register={register} error={errors.phone} required />
                        <FormField label="Address" name="address" register={register} error={errors.address} required />
                    </div>

                    <div className="w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-1">About Me (Bio)</label>
                        <textarea
                            {...register('description')}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none resize-none h-32"
                            placeholder="Tell us a bit about yourself..."
                        ></textarea>
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

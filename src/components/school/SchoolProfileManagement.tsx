import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Building2, MapPin, Mail, Phone, MessageSquareQuote, Upload, Save, Check } from 'lucide-react';

type SchoolProfileManagementProps = {
  schoolId: string;
  onBack: () => void;
  onUpdateSuccess?: () => Promise<void>;
};

const SchoolProfileManagement: React.FC<SchoolProfileManagementProps> = ({ 
  schoolId, 
  onBack, 
  onUpdateSuccess 
}) => {
  const [schoolName, setSchoolName] = useState('');
  const [schoolSlogan, setSchoolSlogan] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [schoolCrest, setSchoolCrest] = useState<File | null>(null);
  const [currentCrestUrl, setCurrentCrestUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .eq('id', schoolId)
          .single();

        if (error) throw error;

        if (data) {
          setSchoolName(data.name || '');
          setSchoolSlogan(data.slogan || '');
          setSchoolAddress(data.address || '');
          setSchoolEmail(data.email || '');
          setSchoolPhone(data.phone || '');
          setCurrentCrestUrl(data.crest_url || null);
        }
      } catch (err) {
        setError('Failed to load school data. Please try again.');
        console.error('Error fetching school data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (schoolId) {
      fetchSchoolData();
    }
  }, [schoolId]);

  const handleCrestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSchoolCrest(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Handle crest upload if a new one is selected
      let crestUrl = currentCrestUrl;
      
      if (schoolCrest) {
        try {
          // Upload the school crest to Supabase Storage
          const fileExt = schoolCrest.name.split('.').pop();
          const fileName = `${schoolId}-${Date.now()}.${fileExt}`;
          const filePath = `school-crests/${fileName}`;

          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('school-assets')
            .upload(filePath, schoolCrest);

          if (uploadError) {
            console.error('Error uploading crest:', uploadError);
            // Continue without updating the image
          } else if (uploadData) {
            // Get the public URL for the uploaded image
            const { data: publicUrlData } = supabase.storage
              .from('school-assets')
              .getPublicUrl(filePath);

            crestUrl = publicUrlData.publicUrl;
          }
        } catch (uploadErr) {
          console.error('Error uploading crest:', uploadErr);
          // Continue without updating the image
        }
      }

      // Update the school details in the database
      const { error: updateError } = await supabase
        .from('schools')
        .update({
          name: schoolName,
          slogan: schoolSlogan,
          address: schoolAddress,
          email: schoolEmail,
          phone: schoolPhone,
          crest_url: crestUrl,
        })
        .eq('id', schoolId);

      if (updateError) throw updateError;

      setSuccessMessage('School profile updated successfully!');
      
      // Update the current crest URL if a new one was uploaded
      if (crestUrl !== currentCrestUrl) {
        setCurrentCrestUrl(crestUrl);
      }
      
      // Clear the file input
      setSchoolCrest(null);
      setPreviewUrl(null);
      
      // Notify parent component of successful update
      if (onUpdateSuccess) {
        await onUpdateSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setSaving(false);
      
      // Auto-hide success message after 3 seconds
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2 text-gray-600">Loading school profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          School Profile Management
        </h2>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-md flex items-center">
          <Check className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32 overflow-hidden rounded-full border-2 border-gray-200">
            {(currentCrestUrl || previewUrl) ? (
              <img 
                src={previewUrl || currentCrestUrl || ''} 
                alt="School crest" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-100">
                <Building2 className="w-16 h-16 text-gray-400" />
              </div>
            )}
            
            <label 
              htmlFor="crest-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Upload className="w-8 h-8 text-white" />
            </label>
            <input 
              id="crest-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleCrestChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
            School Name
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="schoolName"
              name="schoolName"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g. Springfield Elementary School"
            />
          </div>
        </div>

        <div>
          <label htmlFor="schoolSlogan" className="block text-sm font-medium text-gray-700">
            School Slogan
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MessageSquareQuote className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="schoolSlogan"
              name="schoolSlogan"
              value={schoolSlogan}
              onChange={(e) => setSchoolSlogan(e.target.value)}
              className="block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g. Nurturing Minds, Building Futures"
            />
          </div>
        </div>

        <div>
          <label htmlFor="schoolAddress" className="block text-sm font-medium text-gray-700">
            School Address
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
            <textarea
              id="schoolAddress"
              name="schoolAddress"
              required
              value={schoolAddress}
              onChange={(e) => setSchoolAddress(e.target.value)}
              rows={3}
              className="block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g. 123 Education Street, Springfield, ST 12345"
            />
          </div>
        </div>

        <div>
          <label htmlFor="schoolEmail" className="block text-sm font-medium text-gray-700">
            School Email
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="schoolEmail"
              name="schoolEmail"
              value={schoolEmail}
              onChange={(e) => setSchoolEmail(e.target.value)}
              className="block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g. info@yourschool.edu"
            />
          </div>
        </div>

        <div>
          <label htmlFor="schoolPhone" className="block text-sm font-medium text-gray-700">
            School Phone Number
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Phone className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="schoolPhone"
              name="schoolPhone"
              value={schoolPhone}
              onChange={(e) => setSchoolPhone(e.target.value)}
              className="block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g. (123) 456-7890"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="flex justify-center items-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SchoolProfileManagement;

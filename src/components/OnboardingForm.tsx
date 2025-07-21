import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, MapPin, MessageSquareQuote, Upload, Mail, Phone } from 'lucide-react';

type OnboardingFormProps = {
  userId: string;
  onSuccess: () => void;
};

const OnboardingForm: React.FC<OnboardingFormProps> = ({ userId, onSuccess }) => {
  const [schoolName, setSchoolName] = useState('');
  const [schoolSlogan, setSchoolSlogan] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [schoolCrest, setSchoolCrest] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
    setError(null);

    try {
      // Create school entry even without a crest
      let crestUrl = '';
      
      if (schoolCrest) {
        try {
          // Upload the school crest to Supabase Storage
          const fileExt = schoolCrest.name.split('.').pop();
          const fileName = `${userId}-${Date.now()}.${fileExt}`;
          const filePath = `school-crests/${fileName}`;

          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('school-assets')
            .upload(filePath, schoolCrest);

          if (uploadError) {
            console.error('Error uploading crest:', uploadError);
            // Continue without image
          } else if (uploadData) {
            // Get the public URL for the uploaded image
            const { data: publicUrlData } = supabase.storage
              .from('school-assets')
              .getPublicUrl(filePath);

            crestUrl = publicUrlData.publicUrl;
          }
        } catch (uploadErr) {
          console.error('Error uploading crest:', uploadErr);
          // Continue without image
        }
      }

      // Insert the school details into the database
      const { error: insertError } = await supabase
        .from('schools')
        .insert({
          name: schoolName,
          slogan: schoolSlogan,
          address: schoolAddress,
          email: schoolEmail,
          phone: schoolPhone,
          crest_url: crestUrl,
          user_id: userId
        });

      if (insertError) throw insertError;

      // Update the user's onboarding status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ has_completed_onboarding: true })
        .eq('id', userId);

      if (updateError) throw updateError;

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">School Onboarding</h1>
        <p className="mt-2 text-gray-600">
          Please provide details about your school to complete the setup
        </p>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
            School Name
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
            <input
              id="schoolName"
              name="schoolName"
              type="text"
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
              id="schoolSlogan"
              name="schoolSlogan"
              type="text"
              required
              value={schoolSlogan}
              onChange={(e) => setSchoolSlogan(e.target.value)}
              className="block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g. Empowering Minds, Shaping Futures"
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
          <label htmlFor="schoolCrest" className="block text-sm font-medium text-gray-700">
            School Crest
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {previewUrl ? (
                <div className="flex flex-col items-center">
                  <img 
                    src={previewUrl} 
                    alt="School crest preview" 
                    className="h-32 w-auto object-contain mb-4"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSchoolCrest(null);
                      setPreviewUrl(null);
                    }}
                    className="text-sm text-red-600 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleCrestChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            School crest is optional. You can add it later if you don't have one now.
          </p>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Complete Setup"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingForm;
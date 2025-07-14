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
      <div className="glass-card p-8 text-center glass-fade-in">
        <div className="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2 text-text-glass-secondary">Loading school profile...</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 glass-fade-in">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="glass-button glass-button-secondary mr-3 p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-text-glass-primary">
          School Profile Management
        </h2>
      </div>

      {error && (
        <div className="glass-alert glass-alert-error mb-4">
          <p className="text-text-glass-primary text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="glass-alert glass-alert-success mb-4">
          <div className="flex items-center">
            <Check className="w-5 h-5 mr-2 text-text-glass-primary" />
            <p className="text-text-glass-primary text-sm">{successMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-center mb-6 glass-slide-up">
          <div className="relative w-32 h-32 overflow-hidden rounded-full glass-border">
            {(currentCrestUrl || previewUrl) ? (
              <img 
                src={previewUrl || currentCrestUrl || ''} 
                alt="School crest" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full glass-bg-subtle">
                <Building2 className="w-16 h-16 text-text-glass-secondary" />
              </div>
            )}
            
            <label 
              htmlFor="crest-upload" 
              className="absolute inset-0 flex items-center justify-center glass-bg-dark opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-full"
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

        <div className="glass-slide-up" style={{ animationDelay: '0.1s' }}>
          <label htmlFor="schoolName" className="block text-sm font-medium text-text-glass-primary mb-2">
            School Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Building2 className="w-5 h-5 text-text-glass-secondary" />
            </div>
            <input
              type="text"
              id="schoolName"
              name="schoolName"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="glass-input pl-10"
              placeholder="e.g. Springfield Elementary School"
            />
          </div>
        </div>

        <div className="glass-slide-up" style={{ animationDelay: '0.2s' }}>
          <label htmlFor="schoolSlogan" className="block text-sm font-medium text-text-glass-primary mb-2">
            School Slogan
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MessageSquareQuote className="w-5 h-5 text-text-glass-secondary" />
            </div>
            <input
              type="text"
              id="schoolSlogan"
              name="schoolSlogan"
              value={schoolSlogan}
              onChange={(e) => setSchoolSlogan(e.target.value)}
              className="glass-input pl-10"
              placeholder="e.g. Nurturing Minds, Building Futures"
            />
          </div>
        </div>

        <div className="glass-slide-up" style={{ animationDelay: '0.3s' }}>
          <label htmlFor="schoolAddress" className="block text-sm font-medium text-text-glass-primary mb-2">
            School Address
          </label>
          <div className="relative">
            <div className="absolute top-3 left-0 flex items-center pl-3 pointer-events-none">
              <MapPin className="w-5 h-5 text-text-glass-secondary" />
            </div>
            <textarea
              id="schoolAddress"
              name="schoolAddress"
              required
              value={schoolAddress}
              onChange={(e) => setSchoolAddress(e.target.value)}
              rows={3}
              className="glass-input pl-10 resize-none"
              placeholder="e.g. 123 Education Street, Springfield, ST 12345"
            />
          </div>
        </div>

        <div className="glass-slide-up" style={{ animationDelay: '0.4s' }}>
          <label htmlFor="schoolEmail" className="block text-sm font-medium text-text-glass-primary mb-2">
            School Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="w-5 h-5 text-text-glass-secondary" />
            </div>
            <input
              type="email"
              id="schoolEmail"
              name="schoolEmail"
              value={schoolEmail}
              onChange={(e) => setSchoolEmail(e.target.value)}
              className="glass-input pl-10"
              placeholder="e.g. info@yourschool.edu"
            />
          </div>
        </div>

        <div className="glass-slide-up" style={{ animationDelay: '0.5s' }}>
          <label htmlFor="schoolPhone" className="block text-sm font-medium text-text-glass-primary mb-2">
            School Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Phone className="w-5 h-5 text-text-glass-secondary" />
            </div>
            <input
              type="tel"
              id="schoolPhone"
              name="schoolPhone"
              value={schoolPhone}
              onChange={(e) => setSchoolPhone(e.target.value)}
              className="glass-input pl-10"
              placeholder="e.g. (123) 456-7890"
            />
          </div>
        </div>

        <div className="glass-slide-up" style={{ animationDelay: '0.6s' }}>
          <button
            type="submit"
            disabled={saving}
            className="glass-button glass-button-primary w-full flex justify-center items-center"
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

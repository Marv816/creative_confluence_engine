import { useState, useEffect } from 'react';
import { Upload, DollarSign, FileAudio, Image as ImageIcon, Tag, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { producerProfilesService, marketplaceSoundsService, marketplaceLicensesService, marketplaceStorageService } from '../../services/marketplaceService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';


import FileUploadZone from './components/FileUploadZone';
import MetadataForm from './components/MetadataForm';
import LicensingConfiguration from './components/LicensingConfiguration';
import AudioPreview from './components/AudioPreview';
import UploadProgress from './components/UploadProgress';

export default function ProducerUploadStudio() {
  const { user } = useAuth();
  const [producerProfile, setProducerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [audioFile, setAudioFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(null);

  const [soundData, setSoundData] = useState({
    title: '',
    description: '',
    sound_type: 'beat',
    genre: '',
    bpm: '',
    key_signature: '',
    mood_tags: [],
    instrument_tags: [],
    status: 'published'
  });

  const [licenses, setLicenses] = useState([
    {
      license_type: 'lease',
      price: 29.99,
      usage_terms: 'Standard lease with distribution rights',
      distribution_limit: 5000,
      streaming_limit: 500000,
      allows_radio: true,
      allows_music_video: true,
      allows_profit_performances: true,
      is_available: true
    }
  ]);

  useEffect(() => {
    loadProducerProfile();
  }, [user]);

  const loadProducerProfile = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const profile = await producerProfilesService?.getByUserId(user?.id);
        setProducerProfile(profile);
      }
    } catch (err) {
      console.error('Failed to load producer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioFileChange = (file) => {
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioPreviewUrl(url);
  };

  const handleCoverImageChange = (file) => {
    setCoverImage(file);
    const url = URL.createObjectURL(file);
    setCoverPreviewUrl(url);
  };

  const handleSoundDataChange = (key, value) => {
    setSoundData(prev => ({ ...prev, [key]: value }));
  };

  const handleLicenseChange = (index, key, value) => {
    setLicenses(prev => {
      const updated = [...prev];
      updated[index] = { ...updated?.[index], [key]: value };
      return updated;
    });
  };

  const addLicense = () => {
    setLicenses(prev => [
      ...prev,
      {
        license_type: 'exclusive',
        price: 299.99,
        usage_terms: 'Full exclusive rights',
        distribution_limit: null,
        streaming_limit: null,
        allows_radio: true,
        allows_music_video: true,
        allows_profit_performances: true,
        is_available: true
      }
    ]);
  };

  const removeLicense = (index) => {
    setLicenses(prev => prev?.filter((_, i) => i !== index));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!audioFile) {
          setError('Please upload an audio file');
          return false;
        }
        break;
      case 2:
        if (!soundData?.title || !soundData?.genre) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
      case 3:
        if (licenses?.length === 0) {
          setError('Please add at least one license');
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(4, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      if (!producerProfile) {
        throw new Error('Producer profile not found. Please create a profile first.');
      }

      // Upload audio file
      setUploadProgress(20);
      const audioUpload = await marketplaceStorageService?.uploadAudio(audioFile, producerProfile?.id);
      
      // Upload cover image if provided
      setUploadProgress(40);
      let coverImageUrl = null;
      if (coverImage) {
        const imageUpload = await marketplaceStorageService?.uploadImage(coverImage, 'covers');
        coverImageUrl = imageUpload?.url;
      }

      // Create sound record
      setUploadProgress(60);
      const sound = await marketplaceSoundsService?.create({
        ...soundData,
        producer_id: producerProfile?.id,
        audio_url: audioUpload?.url,
        cover_image_url: coverImageUrl,
        bpm: soundData?.bpm ? parseInt(soundData?.bpm) : null
      });

      // Create licenses
      setUploadProgress(80);
      for (const license of licenses) {
        await marketplaceLicensesService?.create({
          ...license,
          sound_id: sound?.id
        });
      }

      setUploadProgress(100);
      setSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (err) {
      setError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setAudioFile(null);
    setCoverImage(null);
    setAudioPreviewUrl(null);
    setCoverPreviewUrl(null);
    setSoundData({
      title: '',
      description: '',
      sound_type: 'beat',
      genre: '',
      bpm: '',
      key_signature: '',
      mood_tags: [],
      instrument_tags: [],
      status: 'published'
    });
    setLicenses([{
      license_type: 'lease',
      price: 29.99,
      usage_terms: 'Standard lease with distribution rights',
      distribution_limit: 5000,
      streaming_limit: 500000,
      allows_radio: true,
      allows_music_video: true,
      allows_profit_performances: true,
      is_available: true
    }]);
    setCurrentStep(1);
    setSuccess(false);
    setUploadProgress(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!producerProfile) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Producer Profile Required</h2>
            <p className="text-gray-400 mb-6">
              You need to create a producer profile before uploading sounds to the marketplace.
            </p>
            <Button className="bg-cyan-500 text-black hover:bg-cyan-400">
              Create Producer Profile
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      {/* Hero Section */}
      <section className="pt-32 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-500/10 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            Producer Upload <span className="text-purple-500">Studio</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Upload your beats, samples, and sounds to the marketplace. Set your pricing and start earning.
          </p>
        </div>
      </section>
      {/* Upload Wizard */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: 'Upload Files' },
                { num: 2, label: 'Metadata' },
                { num: 3, label: 'Licensing' },
                { num: 4, label: 'Review' }
              ]?.map((step, index) => (
                <div key={step?.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep >= step?.num
                        ? 'bg-purple-500 text-white' :'bg-white/5 text-gray-500 border border-white/10'
                    }`}>
                      {step?.num}
                    </div>
                    <span className={`mt-2 text-sm ${
                      currentStep >= step?.num ? 'text-white' : 'text-gray-500'
                    }`}>
                      {step?.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`flex-1 h-0.5 ${
                      currentStep > step?.num ? 'bg-purple-500' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-500 text-sm">Sound uploaded successfully!</p>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <UploadProgress progress={uploadProgress} />
          )}

          {/* Step Content */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 backdrop-blur-sm">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileAudio className="h-6 w-6 text-purple-500" />
                    Upload Audio File
                  </h3>
                  <FileUploadZone
                    accept="audio/*"
                    onFileSelect={handleAudioFileChange}
                    file={audioFile}
                    label="Drop your audio file here or click to browse"
                    description="Supported formats: MP3, WAV, FLAC, OGG (Max 50MB)"
                  />
                  {audioPreviewUrl && (
                    <AudioPreview audioUrl={audioPreviewUrl} title={soundData?.title || 'Preview'} />
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <ImageIcon className="h-6 w-6 text-purple-500" />
                    Cover Image (Optional)
                  </h3>
                  <FileUploadZone
                    accept="image/*"
                    onFileSelect={handleCoverImageChange}
                    file={coverImage}
                    preview={coverPreviewUrl}
                    label="Drop cover image here or click to browse"
                    description="Recommended: 1000x1000px, JPG or PNG (Max 5MB)"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Tag className="h-6 w-6 text-purple-500" />
                  Sound Metadata
                </h3>
                <MetadataForm
                  soundData={soundData}
                  onChange={handleSoundDataChange}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-purple-500" />
                    Licensing & Pricing
                  </h3>
                  <Button
                    size="sm"
                    onClick={addLicense}
                    className="bg-purple-500 text-white hover:bg-purple-400"
                  >
                    Add License
                  </Button>
                </div>
                <LicensingConfiguration
                  licenses={licenses}
                  onChange={handleLicenseChange}
                  onRemove={removeLicense}
                />
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Review & Submit</h3>
                <div className="space-y-6">
                  {/* Sound Info */}
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Sound Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Title:</span>
                        <span className="text-white font-medium">{soundData?.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white font-medium capitalize">{soundData?.sound_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Genre:</span>
                        <span className="text-white font-medium">{soundData?.genre}</span>
                      </div>
                      {soundData?.bpm && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">BPM:</span>
                          <span className="text-white font-medium">{soundData?.bpm}</span>
                        </div>
                      )}
                      {soundData?.key_signature && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Key:</span>
                          <span className="text-white font-medium">{soundData?.key_signature}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Licenses */}
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Licenses ({licenses?.length})</h4>
                    <div className="space-y-2">
                      {licenses?.map((license, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded">
                          <span className="text-white font-medium capitalize">{license?.license_type}</span>
                          <span className="text-purple-500 font-bold">${license?.price?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Files */}
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Files</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Audio:</span>
                        <span className="text-white font-medium">{audioFile?.name}</span>
                      </div>
                      {coverImage && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cover:</span>
                          <span className="text-white font-medium">{coverImage?.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex gap-4">
            {currentStep > 1 && (
              <Button
                variant="ghost"
                onClick={handlePrevStep}
                disabled={uploading}
                className="flex-1 text-white border-white/10"
              >
                Previous
              </Button>
            )}
            {currentStep < 4 ? (
              <Button
                onClick={handleNextStep}
                disabled={uploading}
                className="flex-1 bg-purple-500 text-white hover:bg-purple-400"
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={uploading}
                className="flex-1 bg-purple-500 text-white hover:bg-purple-400 font-bold"
              >
                {uploading ? 'Uploading...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Upload to Marketplace
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
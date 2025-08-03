"use client"
import { useState, useEffect, useRef } from 'react';

// Re-creating the Tailwind config for use in the component
const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        'primary': '#00A2E8',
        'primary-dark': '#00468C',
        'primary-light': '#E6F7FF',
      },
    },
  },
};

const STEPS = [
  { id: 1, title: 'Welcome' },
  { id: 2, title: 'Subject & Level' },
  { id: 3, title: 'Class & Bundle' },
  { id: 4, title: 'Bio & Experience' },
  { id: 5, title: 'Location & Mode' },
  { id: 6, title: 'Languages' },
  { id: 7, title: 'Safety' },
  { id: 8, title: 'Photo' },
  { id: 9, title: 'Pricing' },
];

const SUBJECTS = [
  { value: 'music', icon: 'fas fa-music', name: 'Music' },
  { value: 'maths', icon: 'fas fa-calculator', name: 'Maths' },
  { value: 'art', icon: 'fas fa-palette', name: 'Art & Craft' },
  { value: 'languages', icon: 'fas fa-globe', name: 'Languages' },
  { value: 'coding', icon: 'fas fa-code', name: 'Coding' },
  { value: 'philosophy', icon: 'fas fa-brain', name: 'Philosophy' },
];

const LANGUAGES = [
  { value: 'spanish', name: 'Spanish' },
  { value: 'french', name: 'French' },
  { value: 'hindi', name: 'Hindi' },
  { value: 'urdu', name: 'Urdu' },
  { value: 'punjabi', name: 'Punjabi' },
  { value: 'arabic', name: 'Arabic' },
  { value: 'mandarin', name: 'Mandarin' },
  { value: 'german', name: 'German' },
];

const OnBoarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    teachingRole: 'both',
    subjects: [],
    levels: [],
    ageGroups: [],
    classTypes: [],
    title: '',
    aboutLessons: '',
    aboutYou: '',
    city: '',
    postcode: '',
    teachingModes: [],
    languages: ['english'],
    photo: null,
    dbsCheck: false,
    pricing: {
      oneOnOne: 0,
      group: 0,
    },
  });
  const [customSubject, setCustomSubject] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const languageSelectRef = useRef(null);

  const totalSteps = STEPS.length;
  const currentStepTitle = STEPS.find(step => step.id === currentStep)?.title || '';
  const progressBarWidth = `${((currentStep) / totalSteps) * 100}%`;

  useEffect(() => {
    // Mimic the progress saved functionality with a debounced effect
    const savedData = localStorage.getItem('onboardingForm');
    if (savedData) {
      setOnboardingData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    // Add event listeners for keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && e.ctrlKey && currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && e.ctrlKey && currentStep > 1) {
        setCurrentStep(prev => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, totalSteps]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'radio') {
      setOnboardingData({ ...onboardingData, [name]: value });
    } else if (type === 'checkbox') {
      let newArray = onboardingData[name];
      if (checked) {
        newArray = [...newArray, value];
      } else {
        newArray = newArray.filter(item => item !== value);
      }
      setOnboardingData({ ...onboardingData, [name]: newArray });
    } else {
      setOnboardingData({ ...onboardingData, [name]: value });
    }
  };

  const handleSubjectSelect = (subjectValue) => {
    let newSubjects;
    if (onboardingData.subjects.includes(subjectValue)) {
      newSubjects = onboardingData.subjects.filter(s => s !== subjectValue);
    } else {
      newSubjects = [...onboardingData.subjects, subjectValue];
    }
    setOnboardingData({ ...onboardingData, subjects: newSubjects });
  };
  
  const handleAddCustomSubject = (e) => {
    e.preventDefault();
    if (customSubject.trim() !== '') {
      setOnboardingData({ ...onboardingData, subjects: [...onboardingData.subjects, customSubject.trim()] });
      setCustomSubject('');
    }
  };

  const handleAddLanguage = () => {
    if (selectedLanguage && !onboardingData.languages.includes(selectedLanguage)) {
      setOnboardingData({ ...onboardingData, languages: [...onboardingData.languages, selectedLanguage] });
      setSelectedLanguage('');
      if (languageSelectRef.current) {
        languageSelectRef.current.value = '';
      }
    }
  };

  const handleRemoveLanguage = (languageToRemove) => {
    setOnboardingData({
      ...onboardingData,
      languages: onboardingData.languages.filter(lang => lang !== languageToRemove),
    });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // The rendering logic for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
              <i className="fas fa-chalkboard-teacher text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Let's build your teaching profile</h1>
            <p className="text-lg text-gray-600 mb-8">
              Welcome to Roots & Wings! We'll guide you through creating an amazing mentor profile that attracts the right students.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm your teaching role</h3>
              <div className="space-y-3 text-left">
                <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="teachingRole"
                    value="individual"
                    className="w-4 h-4 text-primary focus:ring-primary"
                    checked={onboardingData.teachingRole === 'individual'}
                    onChange={handleInputChange}
                  />
                  <span className="text-gray-700">Individual mentor (1-on-1 and small groups)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="teachingRole"
                    value="workshop"
                    className="w-4 h-4 text-primary focus:ring-primary"
                    checked={onboardingData.teachingRole === 'workshop'}
                    onChange={handleInputChange}
                  />
                  <span className="text-gray-700">Workshop leader (special events and masterclasses)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="teachingRole"
                    value="both"
                    className="w-4 h-4 text-primary focus:ring-primary"
                    checked={onboardingData.teachingRole === 'both'}
                    onChange={handleInputChange}
                  />
                  <span className="text-gray-700">Both (recommended for maximum opportunities)</span>
                </label>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <span role="img" aria-label="clock">⏱️</span> This process takes about 10 minutes and your progress is automatically saved
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-primary-light rounded-lg p-6 sticky top-4">
                <h3 className="font-semibold text-primary-dark mb-3"><span role="img" aria-label="lightbulb">💡</span> Good to Know</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Most popular: Music, Maths, Languages, Art</li>
                  <li>• You can teach multiple subjects</li>
                  <li>• Choose levels you're comfortable with</li>
                  <li>• Age groups help students find you easily</li>
                </ul>
              </div>
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What would you like to teach?</h2>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select your subjects</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SUBJECTS.map(subject => (
                    <label key={subject.value} className="subject-option cursor-pointer">
                      <input
                        type="checkbox"
                        className="hidden"
                        value={subject.value}
                        checked={onboardingData.subjects.includes(subject.value)}
                        onChange={() => handleSubjectSelect(subject.value)}
                      />
                      <div
                        className={`subject-card p-3 border-2 rounded-lg text-center transition-colors ${
                          onboardingData.subjects.includes(subject.value)
                            ? 'border-primary bg-primary-light'
                            : 'border-gray-200 hover:border-primary'
                        }`}
                      >
                        <i className={`${subject.icon} text-primary mb-2`}></i>
                        <div className="text-sm font-medium">{subject.name}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <form onSubmit={handleAddCustomSubject}>
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        placeholder="Add another subject..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                      />
                      <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">Add</button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4"><span role="img" aria-label="graduation cap">🎓</span> Teaching levels</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary focus:ring-primary"
                        name="levels"
                        value="beginner"
                        checked={onboardingData.levels.includes('beginner')}
                        onChange={handleInputChange}
                      />
                      <span>Beginner</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary focus:ring-primary"
                        name="levels"
                        value="intermediate"
                        checked={onboardingData.levels.includes('intermediate')}
                        onChange={handleInputChange}
                      />
                      <span>Intermediate</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary focus:ring-primary"
                        name="levels"
                        value="advanced"
                        checked={onboardingData.levels.includes('advanced')}
                        onChange={handleInputChange}
                      />
                      <span>Advanced</span>
                    </label>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4"><span role="img" aria-label="people">👥</span> Age groups</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary focus:ring-primary"
                        name="ageGroups"
                        value="children"
                        checked={onboardingData.ageGroups.includes('children')}
                        onChange={handleInputChange}
                      />
                      <span>Children (5-12)</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary focus:ring-primary"
                        name="ageGroups"
                        value="teens"
                        checked={onboardingData.ageGroups.includes('teens')}
                        onChange={handleInputChange}
                      />
                      <span>Teens (13-17)</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary focus:ring-primary"
                        name="ageGroups"
                        value="adults"
                        checked={onboardingData.ageGroups.includes('adults')}
                        onChange={handleInputChange}
                      />
                      <span>Adults (18+)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      // case 3:
      //   return (
      //     <>
      //       <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose your class types</h2>
      //       <p className="text-gray-600 mb-8">Select the teaching formats you'd like to offer. You can always add more later.</p>
      //       <div className="space-y-4">
      //         <div className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
      //           <label className="flex items-start space-x-4 cursor-pointer">
      //             <input
      //               type="checkbox"
      //               className="w-5 h-5 text-primary focus:ring-primary mt-1"
      //               name="classTypes"
      //               value="oneOnOne"
      //               checked={onboardingData.classTypes.includes('oneOnOne')}
      //               onChange={handleInputChange}
      //             />
      //             <div className="flex-1">
      //               <h3 className="text-lg font-semibold text-gray-900">One-on-one sessions</h3>
      //               <p className="text-gray-600 mt-1">Personalized lessons tailored to individual student needs</p>
      //               <div className="mt-3 text-sm text-primary">Most popular choice • Highest earning potential</div>
      //             </div>
      //           </label>
      //         </div>
      //         <div className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
      //           <label className="flex items-start space-x-4 cursor-pointer">
      //             <input
      //               type="checkbox"
      //               className="w-5 h-5 text-primary focus:ring-primary mt-1"
      //               name="classTypes"
      //               value="weekendBatch"
      //               checked={onboardingData.classTypes.includes('weekendBatch')}
      //               onChange={handleInputChange}
      //             />
      //             <div className="flex-1">
      //               <h3 className="text-lg font-semibold text-gray-900">Weekend Group Batch</h3>
      //               <p className="text-gray-600 mt-1">Saturday & Sunday sessions over multiple weeks</p>
      //             </div>
      //           </label>
      //         </div>
      //         <div className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
      //           <label className="flex items-start space-x-4 cursor-pointer">
      //             <input
      //               type="checkbox"
      //               className="w-5 h-5 text-primary focus:ring-primary mt-1"
      //               name="classTypes"
      //               value="weekdayBatch"
      //               checked={onboardingData.classTypes.includes('weekdayBatch')}
      //               onChange={handleInputChange}
      //             />
      //             <div className="flex-1">
      //               <h3 className="text-lg font-semibold text-gray-900">Weekday Group Batch</h3>
      //               <p className="text-gray-600 mt-1">Monday to Friday intensive courses</p>
      //             </div>
      //           </label>
      //         </div>
      //         <div className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
      //           <label className="flex items-start space-x-4 cursor-pointer">
      //             <input
      //               type="checkbox"
      //               className="w-5 h-5 text-primary focus:ring-primary mt-1"
      //               name="classTypes"
      //               value="workshops"
      //               checked={onboardingData.classTypes.includes('workshops')}
      //               onChange={handleInputChange}
      //             />
      //             <div className="flex-1">
      //               <h3 className="text-lg font-semibold text-gray-900">Special Workshops</h3>
      //               <p className="text-gray-600 mt-1">One-time events, masterclasses, and special occasions</p>
      //               <div className="mt-3 text-sm text-green-600">Great for building your reputation • Flexible scheduling</div>
      //             </div>
      //           </label>
      //         </div>
      //       </div>
      //     </>
      //   );
      case 4:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell students about yourself</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-lg font-semibold text-gray-900 mb-3"><span role="img" aria-label="pencil">✏️</span> Title of your ad</label>
                <textarea
                  id="title"
                  name="title"
                  rows="2"
                  placeholder="Write a compelling headline that summarizes what you offer..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  minLength="50"
                  value={onboardingData.title}
                  onChange={handleInputChange}
                ></textarea>
                <div className="mt-2 text-sm text-gray-500">Minimum 50 characters</div>
              </div>
              {/* <div>
                <label htmlFor="aboutLessons" className="block text-lg font-semibold text-gray-900 mb-3"><span role="img" aria-label="sparkles">✨</span> About your lessons</label>
                <p className="text-gray-600 mb-3">Describe your teaching methodology, materials you use, and what a typical lesson looks like</p>
                <textarea
                  id="aboutLessons"
                  name="aboutLessons"
                  rows="4"
                  placeholder="Share your teaching approach, lesson structure, materials you provide..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  minLength="100"
                  value={onboardingData.aboutLessons}
                  onChange={handleInputChange}
                ></textarea>
                <div className="mt-2 text-sm text-gray-500">Minimum 100 characters</div>
              </div> */}
              <div>
                <label htmlFor="aboutYou" className="block text-lg font-semibold text-gray-900 mb-3"><span role="img" aria-label="person">🧑</span> About you</label>
                <p className="text-gray-600 mb-3">Share your qualifications, experience, passion, and personal message to students</p>
                <textarea
                  id="aboutYou"
                  name="aboutYou"
                  rows="5"
                  placeholder="Tell students about your background, qualifications, why you love teaching..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  minLength="150"
                  value={onboardingData.aboutYou}
                  onChange={handleInputChange}
                ></textarea>
                <div className="mt-2 text-sm text-gray-500">Minimum 150 characters</div>
              </div>
            </div>
          </>
        );
      case 5:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Where would you like to teach?</h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4"><span role="img" aria-label="pin">📍</span> Your location</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={onboardingData.city}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="Region"
                  placeholder="Region"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={onboardingData.postcode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Choose your teaching modes</h3>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary focus:ring-primary"
                    name="teachingModes"
                    value="atHome"
                    checked={onboardingData.teachingModes.includes('atHome')}
                    onChange={handleInputChange}
                  />
                  <span className="font-medium"><span role="img" aria-label="house">🏠</span> At my home</span>
                </label>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary focus:ring-primary"
                    name="teachingModes"
                    value="travel"
                    checked={onboardingData.teachingModes.includes('travel')}
                    onChange={handleInputChange}
                  />
                  <span className="font-medium"><span role="img" aria-label="car">🚗</span> I can travel</span>
                </label>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary focus:ring-primary"
                    name="teachingModes"
                    value="online"
                    checked={onboardingData.teachingModes.includes('online')}
                    onChange={handleInputChange}
                  />
                  <span className="font-medium"><span role="img" aria-label="globe">🌐</span> Online lessons</span>
                </label>
              </div>
            </div>
          </>
        );
      case 6:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Languages you speak</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">English</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Default</span>
              </div>
              <div id="added-languages">
                {onboardingData.languages.filter(lang => lang !== 'english').map(lang => (
                  <div key={lang} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-2">
                    <span className="font-medium capitalize">{lang}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(lang)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add another language</label>
                <div className="flex space-x-3">
                  <select
                    id="language-select"
                    ref={languageSelectRef}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    <option value="">Select a language...</option>
                    {LANGUAGES.filter(lang => !onboardingData.languages.includes(lang.value)).map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      case 7:
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your safety and ours</h2>
            <p className="text-gray-600 mb-8">Roots & Wings is committed to creating a safe environment. Please confirm the following:</p>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-primary focus:ring-primary mt-1"
                  name="dbsCheck"
                  checked={onboardingData.dbsCheck}
                  onChange={handleInputChange}
                />
                <div className="flex-1">
                  <label htmlFor="dbsCheck" className="text-lg font-semibold text-gray-900 cursor-pointer">I have a valid DBS check (or equivalent)</label>
                  <p className="text-sm text-gray-600 mt-1">
                    This is required for teaching students under 18. You will be asked to upload proof later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add a profile photo</h2>
            <p className="text-gray-600 mb-8">A clear, friendly photo helps students connect with you. </p>
            <div className="w-48 h-48 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-6 overflow-hidden">
              {onboardingData.photo ? (
                <img src={onboardingData.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <i className="fas fa-camera text-gray-500 text-3xl"></i>
              )}
            </div>
            <label className="inline-block px-6 py-3 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-dark transition-colors">
              Upload Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setOnboardingData({ ...onboardingData, photo: e.target.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
        );
      case 9:
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Set your pricing</h2>
            <p className="text-gray-600 mb-8">Set fair prices for your lessons. You can adjust these later.</p>
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">One-on-one sessions</h3>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <i className="fas fa-dollar-sign"></i>
                  </span>
                  <input
                    type="number"
                    name="pricing-one-on-one"
                    placeholder="Price per hour"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                    value={onboardingData.pricing.oneOnOne}
                    onChange={(e) => setOnboardingData({ ...onboardingData, pricing: { ...onboardingData.pricing, oneOnOne: e.target.value } })}
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Group sessions</h3>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <i className="fas fa-dollar-sign"></i>
                  </span>
                  <input
                    type="number"
                    name="pricing-group"
                    placeholder="Price per student per hour"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                    value={onboardingData.pricing.group}
                    onChange={(e) => setOnboardingData({ ...onboardingData, pricing: { ...onboardingData.pricing, group: e.target.value } })}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
               
                <div className="flex-1">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-primary focus:ring-primary mt-1"
                  name="firstsessionfree"
                  checked={onboardingData.firstsessionfree}
                  onChange={handleInputChange}
                />
                  <label htmlFor="firstsessionfree" className="p-2 text-lg font-semibold text-gray-900 cursor-pointer">First Session Free</label>
                </div>
              </div>

            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <style>{`
        body { background-color: ${tailwindConfig.theme.extend.colors['gray-50']}; }
        @keyframes slideIn {
            from { transform: translateX(20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .step-content.active {
            animation: slideIn 0.5s ease-out;
        }
      `}</style>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-dark">Roots & Wings</h1>
              <span className="ml-4 text-gray-500">Mentor Onboarding</span>
            </div>
            <button className="text-gray-500 hover:text-gray-700" onClick={() => window.history.back()}>
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Step <span id="current-step">{currentStep}</span> of <span id="total-steps">{totalSteps}</span></span>
              <div className="text-sm text-gray-500" id="step-title">{currentStepTitle}</div>
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <i className="fas fa-save mr-1 text-green-500"></i>
              Progress saved
            </div>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {STEPS.map(step => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300
                  ${step.id <= currentStep ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'}`}
                >
                  {step.id}
                </div>
                {step.id < totalSteps && <div className="w-6 h-0.5 bg-gray-300"></div>}
              </div>
            ))}
          </div>

          <div className="w-full bg-gray-300 rounded-full h-3 mt-4">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: progressBarWidth }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-96">
          <div className={`step-content p-8 active`}>
            {renderStepContent()}
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-arrow-left mr-2"></i> Previous
          </button>
          <button
            onClick={nextStep}
            disabled={currentStep === totalSteps}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === totalSteps ? 'Submit' : 'Next'} <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnBoarding;

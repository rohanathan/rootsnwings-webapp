import { useState, useEffect } from 'react';
import axios from 'axios';

const ChildSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSelectChild, 
  classData,
  user,
  userRoles 
}) => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Configuration
  const API_BASE_URL = 'https://rootsnwings-api-944856745086.europe-west2.run.app';

  // Fetch children when modal opens
  useEffect(() => {
    if (isOpen && user && userRoles.includes('parent')) {
      fetchChildren();
    }
  }, [isOpen, user, userRoles]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${API_BASE_URL}/young-learners?parent_uid=${user.uid}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      setChildren(response.data?.profiles || []);
    } catch (error) {
      console.error('Error fetching children:', error);
      setError('Failed to load children profiles');
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = (child) => {
    onSelectChild({
      youngLearnerName: child.fullName,
      parentId: user.uid,
      studentId: user.uid, // Parent acts as the booking student
    });
    onClose();
  };

  const handleParentSelect = () => {
    // For parent enrolling themselves (adult classes)
    onSelectChild({
      parentId: null,
      youngLearnerName: null,
      studentId: user.uid,
    });
    onClose();
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Who is this class for?
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {classData?.title || 'Class enrollment'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-3">
              {/* Option to enroll parent (for adult classes) */}
              {classData?.ageGroup === 'adult' && userRoles.includes('student') && (
                <button
                  onClick={handleParentSelect}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Myself</div>
                      <div className="text-sm text-gray-600">Enroll as an adult learner</div>
                    </div>
                  </div>
                </button>
              )}

              {/* Children options */}
              {children.length > 0 ? (
                children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => handleChildSelect(child)}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-semibold text-sm">
                          {getInitials(child.fullName)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {child.fullName} ({calculateAge(child.dateOfBirth)})
                        </div>
                        <div className="text-sm text-gray-600">
                          {child.interests?.join(', ') || 'Young learner'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    👶
                  </div>
                  <p className="text-gray-600 mb-4">No children added yet</p>
                  <button
                    onClick={() => {
                      onClose();
                      window.location.href = '/user/younglearner';
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    ➕ Add Your First Child
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildSelectionModal;
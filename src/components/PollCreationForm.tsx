// Poll Creation Form Component
// Form for creating new community polls

import React from 'react';

interface PollFormData {
  question: string;
  poll_type: 'single_choice' | 'multiple_choice';
  options: string[];
  max_choices?: number;
  is_anonymous: boolean;
  voting_deadline?: string;
  require_explanation: boolean;
}

interface PollCreationFormProps {
  onSubmit: (data: PollFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function PollCreationForm({ onSubmit, onCancel, isSubmitting = false }: PollCreationFormProps) {
  const [formData, setFormData] = React.useState<PollFormData>({
    question: '',
    poll_type: 'single_choice',
    options: ['', ''],
    max_choices: undefined,
    is_anonymous: true,
    voting_deadline: '',
    require_explanation: false,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate question
    if (!formData.question.trim()) {
      newErrors.question = 'Poll question is required';
    }

    // Validate options
    const nonEmptyOptions = formData.options.filter(opt => opt.trim().length > 0);
    if (nonEmptyOptions.length < 2) {
      newErrors.options = 'At least 2 options are required';
    }

    // Check for duplicate options
    const uniqueOptions = new Set(nonEmptyOptions.map(opt => opt.trim().toLowerCase()));
    if (uniqueOptions.size !== nonEmptyOptions.length) {
      newErrors.options = 'Options must be unique';
    }

    // Validate max_choices for multiple choice
    if (formData.poll_type === 'multiple_choice' && formData.max_choices) {
      if (formData.max_choices < 1 || formData.max_choices > nonEmptyOptions.length) {
        newErrors.max_choices = `Max choices must be between 1 and ${nonEmptyOptions.length}`;
      }
    }

    // Validate voting deadline
    if (formData.voting_deadline) {
      const deadline = new Date(formData.voting_deadline);
      if (isNaN(deadline.getTime())) {
        newErrors.voting_deadline = 'Invalid date format';
      } else if (deadline <= new Date()) {
        newErrors.voting_deadline = 'Voting deadline must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clean up form data
    const cleanedData = {
      ...formData,
      question: formData.question.trim(),
      options: formData.options.filter(opt => opt.trim().length > 0).map(opt => opt.trim()),
      voting_deadline: formData.voting_deadline || undefined,
      max_choices: formData.poll_type === 'multiple_choice' ? formData.max_choices : undefined,
    };

    try {
      await onSubmit(cleanedData);
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, ''],
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt),
    }));
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // Minimum 5 minutes from now
    return now.toISOString().slice(0, 16); // Format for datetime-local input
  };

  return (
    <div className="poll-creation-form bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Poll</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Poll Question */}
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
            Poll Question <span className="text-red-500">*</span>
          </label>
          <textarea
            id="question"
            value={formData.question}
            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
            placeholder="What would you like to ask the community?"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.question ? 'border-red-300' : 'border-gray-300'
            }`}
            rows={3}
            disabled={isSubmitting}
          />
          {errors.question && (
            <p className="mt-1 text-sm text-red-600">{errors.question}</p>
          )}
        </div>

        {/* Poll Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poll Type <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="poll_type"
                value="single_choice"
                checked={formData.poll_type === 'single_choice'}
                onChange={(e) => setFormData(prev => ({ ...prev, poll_type: e.target.value as 'single_choice' }))}
                className="mr-2"
                disabled={isSubmitting}
              />
              <span className="text-sm">Single Choice (users can select one option)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="poll_type"
                value="multiple_choice"
                checked={formData.poll_type === 'multiple_choice'}
                onChange={(e) => setFormData(prev => ({ ...prev, poll_type: e.target.value as 'multiple_choice' }))}
                className="mr-2"
                disabled={isSubmitting}
              />
              <span className="text-sm">Multiple Choice (users can select multiple options)</span>
            </label>
          </div>
        </div>

        {/* Max Choices (for multiple choice) */}
        {formData.poll_type === 'multiple_choice' && (
          <div>
            <label htmlFor="max_choices" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Choices (optional)
            </label>
            <input
              id="max_choices"
              type="number"
              value={formData.max_choices || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                max_choices: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              placeholder="Leave empty for unlimited"
              min="1"
              max={formData.options.filter(opt => opt.trim()).length}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.max_choices ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.max_choices && (
              <p className="mt-1 text-sm text-red-600">{errors.max_choices}</p>
            )}
          </div>
        )}

        {/* Poll Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poll Options <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-800 p-2"
                    disabled={isSubmitting}
                    title="Remove option"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {errors.options && (
            <p className="mt-1 text-sm text-red-600">{errors.options}</p>
          )}
          
          <button
            type="button"
            onClick={addOption}
            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
            disabled={isSubmitting || formData.options.length >= 10}
          >
            + Add Option
          </button>
        </div>

        {/* Voting Deadline */}
        <div>
          <label htmlFor="voting_deadline" className="block text-sm font-medium text-gray-700 mb-2">
            Voting Deadline (optional)
          </label>
          <input
            id="voting_deadline"
            type="datetime-local"
            value={formData.voting_deadline}
            onChange={(e) => setFormData(prev => ({ ...prev, voting_deadline: e.target.value }))}
            min={getMinDateTime()}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.voting_deadline ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.voting_deadline && (
            <p className="mt-1 text-sm text-red-600">{errors.voting_deadline}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Leave empty for no deadline
          </p>
        </div>

        {/* Poll Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Poll Settings</h3>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_anonymous}
              onChange={(e) => setFormData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
              className="mr-2"
              disabled={isSubmitting}
            />
            <span className="text-sm">Anonymous voting (recommended)</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.require_explanation}
              onChange={(e) => setFormData(prev => ({ ...prev, require_explanation: e.target.checked }))}
              className="mr-2"
              disabled={isSubmitting}
            />
            <span className="text-sm">Require explanation for votes</span>
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  );
}
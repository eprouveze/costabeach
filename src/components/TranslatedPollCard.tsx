// Translated Poll Card Component
// Enhanced poll card with multilingual support and translation features

import React from 'react';
import { Language } from '@prisma/client';

interface LocalizedPoll {
  id: string;
  question: string;
  description?: string;
  poll_type: 'single_choice' | 'multiple_choice';
  status: 'draft' | 'active' | 'closed';
  is_anonymous: boolean;
  voting_deadline?: Date;
  created_at: Date;
  language: Language;
  options: LocalizedPollOption[];
}

interface LocalizedPollOption {
  id: string;
  option_text: string;
  option_order: number;
}

interface PollStatistics {
  poll_id: string;
  total_votes: number;
  option_results: OptionResult[];
}

interface OptionResult {
  option_id: string;
  option_text: string;
  vote_count: number;
  percentage: number;
}

interface TranslationInfo {
  available_languages: Language[];
  has_translation: boolean;
  is_original: boolean;
  completeness: {
    percentage: number;
    missing_languages: Language[];
  };
}

interface TranslatedPollCardProps {
  poll: LocalizedPoll;
  statistics?: PollStatistics;
  hasVoted?: boolean;
  canVote?: boolean;
  canTranslate?: boolean;
  currentLanguage: Language;
  translationInfo?: TranslationInfo;
  onVote?: (optionIds: string[], explanation?: string) => Promise<void>;
  onRequestTranslation?: (targetLanguages: Language[]) => Promise<void>;
  onLanguageChange?: (language: Language) => void;
  showResults?: boolean;
  showTranslationControls?: boolean;
}

export function TranslatedPollCard({
  poll,
  statistics,
  hasVoted = false,
  canVote = true,
  canTranslate = false,
  currentLanguage,
  translationInfo,
  onVote,
  onRequestTranslation,
  onLanguageChange,
  showResults = false,
  showTranslationControls = false,
}: TranslatedPollCardProps) {
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [explanation, setExplanation] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isRequestingTranslation, setIsRequestingTranslation] = React.useState(false);

  // RTL support for Arabic
  const isRTL = currentLanguage === 'arabic';

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (poll.poll_type === 'single_choice') {
      setSelectedOptions(checked ? [optionId] : []);
    } else {
      if (checked) {
        const maxChoices = poll.options.length; // Simplified for now
        if (selectedOptions.length < maxChoices) {
          setSelectedOptions([...selectedOptions, optionId]);
        } else {
          setError(`You can select a maximum of ${maxChoices} options`);
          return;
        }
      } else {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      }
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedOptions.length === 0) {
      setError('Please select at least one option');
      return;
    }

    setIsSubmitting(true);
    try {
      await onVote?.(selectedOptions, explanation.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestTranslation = async () => {
    if (!translationInfo || !onRequestTranslation) return;

    setIsRequestingTranslation(true);
    try {
      await onRequestTranslation(translationInfo.completeness.missing_languages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request translation');
    } finally {
      setIsRequestingTranslation(false);
    }
  };

  const getOptionResult = (optionId: string) => {
    return statistics?.option_results.find(result => result.option_id === optionId);
  };

  const formatDeadline = (deadline: Date) => {
    return deadline.toLocaleDateString(
      currentLanguage === 'arabic' ? 'ar-EG' : 'fr-FR',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const isExpired = poll.voting_deadline && poll.voting_deadline <= new Date();
  const showVotingInterface = !hasVoted && canVote && poll.status === 'active' && !isExpired && !showResults;

  return (
    <div className={`poll-card border rounded-lg p-6 bg-white shadow-sm ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Poll Header */}
      <div className="poll-header mb-4">
        {/* Language and Translation Controls */}
        {showTranslationControls && translationInfo && (
          <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Language Selector */}
            {translationInfo.available_languages.length > 1 && onLanguageChange && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Language:</span>
                <select
                  value={currentLanguage}
                  onChange={(e) => onLanguageChange(e.target.value as Language)}
                  className="text-xs border rounded px-2 py-1"
                >
                  {translationInfo.available_languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang === 'french' ? 'Français' : 'العربية'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Translation Status */}
            <div className="flex items-center gap-2">
              {!translationInfo.has_translation && translationInfo.is_original && (
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                  Original
                </span>
              )}
              
              {translationInfo.has_translation && !translationInfo.is_original && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                  Translated
                </span>
              )}

              {/* Translation Request Button */}
              {canTranslate && translationInfo.completeness.missing_languages.length > 0 && (
                <button
                  onClick={handleRequestTranslation}
                  disabled={isRequestingTranslation}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
                  title={`Request translation to: ${translationInfo.completeness.missing_languages.join(', ')}`}
                >
                  {isRequestingTranslation ? 'Requesting...' : '+ Translate'}
                </button>
              )}
            </div>

            {/* Translation Completeness */}
            <div className="text-xs text-gray-500">
              {translationInfo.completeness.percentage}% translated
            </div>
          </div>
        )}

        <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
          {poll.question}
        </h3>

        {poll.description && (
          <p className={`text-sm text-gray-600 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
            {poll.description}
          </p>
        )}
        
        <div className={`flex flex-wrap items-center gap-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            poll.status === 'active' ? 'bg-green-100 text-green-800' :
            poll.status === 'closed' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
          </span>
          
          <span className="text-xs text-gray-500">
            {poll.poll_type === 'single_choice' ? 
              (currentLanguage === 'arabic' ? 'خيار واحد' : 'Choix unique') : 
              (currentLanguage === 'arabic' ? 'خيارات متعددة' : 'Choix multiples')
            }
          </span>
          
          {poll.is_anonymous && (
            <span className="text-xs text-gray-500">
              {currentLanguage === 'arabic' ? 'مجهول' : 'Anonyme'}
            </span>
          )}
          
          {poll.voting_deadline && (
            <span className="text-xs text-gray-500">
              {currentLanguage === 'arabic' ? 'الموعد النهائي: ' : 'Échéance: '}
              {formatDeadline(poll.voting_deadline)}
            </span>
          )}
        </div>
      </div>

      {/* Poll Options */}
      <div className="poll-options mb-4">
        {showVotingInterface ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-3 mb-4">
              {poll.options
                .sort((a, b) => a.option_order - b.option_order)
                .map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                      isRTL ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <input
                      type={poll.poll_type === 'single_choice' ? 'radio' : 'checkbox'}
                      name={poll.poll_type === 'single_choice' ? 'poll-option' : undefined}
                      value={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                      className={isRTL ? 'ml-3' : 'mr-3'}
                      disabled={isSubmitting}
                    />
                    <span className={`text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {option.option_text}
                    </span>
                  </label>
                ))}
            </div>

            {explanation && (
              <div className="mb-4">
                <label htmlFor="explanation" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {currentLanguage === 'arabic' ? 'التفسير' : 'Explication'}
                </label>
                <textarea
                  id="explanation"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder={currentLanguage === 'arabic' ? 'يرجى شرح اختيارك...' : 'Veuillez expliquer votre choix...'}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                  rows={3}
                  disabled={isSubmitting}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className={`text-sm text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || selectedOptions.length === 0}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 
                (currentLanguage === 'arabic' ? 'جاري الإرسال...' : 'Envoi en cours...') : 
                (currentLanguage === 'arabic' ? 'تصويت' : 'Voter')
              }
            </button>
          </form>
        ) : (
          // Show results or voted state
          <div className="space-y-3">
            {poll.options
              .sort((a, b) => a.option_order - b.option_order)
              .map((option) => {
                const result = getOptionResult(option.id);
                const percentage = result?.percentage || 0;
                
                return (
                  <div key={option.id} className="poll-result">
                    <div className={`flex justify-between items-center mb-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className={`text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {option.option_text}
                      </span>
                      {statistics && (
                        <span className="text-sm text-gray-600">
                          {result?.vote_count || 0} {currentLanguage === 'arabic' ? 'أصوات' : 'votes'} ({percentage.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                    {statistics && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${isRTL ? 'ml-auto' : ''}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Poll Footer */}
      <div className="poll-footer pt-4 border-t border-gray-200">
        <div className={`flex justify-between items-center text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <span>
            {currentLanguage === 'arabic' ? 'تم الإنشاء في ' : 'Créé le '}
            {poll.created_at.toLocaleDateString(currentLanguage === 'arabic' ? 'ar-EG' : 'fr-FR')}
          </span>
          
          {statistics && (
            <span>
              {statistics.total_votes} {currentLanguage === 'arabic' ? 'إجمالي الأصوات' : 'votes au total'}
            </span>
          )}
        </div>
        
        {hasVoted && (
          <div className={`mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 ${isRTL ? 'text-right' : 'text-left'}`}>
            ✓ {currentLanguage === 'arabic' ? 'لقد صوتت في هذا الاستطلاع' : 'Vous avez voté sur ce sondage'}
          </div>
        )}
        
        {isExpired && poll.status === 'active' && (
          <div className={`mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700 ${isRTL ? 'text-right' : 'text-left'}`}>
            ⏰ {currentLanguage === 'arabic' ? 'انتهت مهلة التصويت' : 'Le délai de vote est dépassé'}
          </div>
        )}
      </div>
    </div>
  );
}
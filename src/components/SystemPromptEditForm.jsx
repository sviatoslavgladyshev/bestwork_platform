import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SystemPromptEditForm.css';
import { motion, AnimatePresence } from 'framer-motion';

const SystemPromptEditForm = () => {
  const [promptType, setPromptType] = useState('');
  const [variables, setVariables] = useState([{ key: '', value: '' }]);
  const [promptTemplate, setPromptTemplate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const promptTypeOptions = [
    { value: 'email_analysis', label: 'Email Analysis' },
    { value: 'call_analysis', label: 'Call Analysis' },
    { value: 'social_media_analysis', label: 'Social Media Analysis' },
  ];

  const variableOptions = [
    { value: 'name', label: 'Name', supportedTypes: ['email_analysis', 'call_analysis'] },
    { value: 'company_name', label: 'Company Name', supportedTypes: ['email_analysis', 'call_analysis', 'social_media_analysis'] },
    { value: 'tone', label: 'Tone', supportedTypes: ['email_analysis', 'call_analysis', 'social_media_analysis'] },
    { value: 'recipient_role', label: 'Recipient Role', supportedTypes: ['email_analysis', 'call_analysis'] },
    { value: 'industry', label: 'Industry', supportedTypes: ['email_analysis', 'call_analysis', 'social_media_analysis'] },
    { value: 'email_purpose', label: 'Email Purpose', supportedTypes: ['email_analysis'] },
    { value: 'target_audience', label: 'Target Audience', supportedTypes: ['email_analysis', 'call_analysis', 'social_media_analysis'] },
    { value: 'urgency_level', label: 'Urgency Level', supportedTypes: ['email_analysis', 'call_analysis'] },
    { value: 'personalization_element', label: 'Personalization Element', supportedTypes: ['email_analysis', 'call_analysis'] },
    { value: 'brand_voice', label: 'Brand Voice', supportedTypes: ['email_analysis', 'call_analysis', 'social_media_analysis'] },
    { value: 'call_to_action', label: 'Call to Action', supportedTypes: ['email_analysis', 'social_media_analysis'] },
  ];

  const basePromptTemplates = {
    email_analysis:
      'Analyze this email{[if tone]} for {{tone}} tone{[endif]}{[if recipient_role]} addressed to {{recipient_role}}{[endif]}{[if company_name]} at {{company_name}}{[endif]}{[if name]} for {{name}}{[endif]}{[if industry]} in the {{industry}} industry{[endif]}{[if email_purpose]} for the purpose of {{email_purpose}}{[endif]}{[if target_audience]} targeting {{target_audience}}{[endif]}{[if urgency_level]} with {{urgency_level}} urgency{[endif]}{[if personalization_element]} including {{personalization_element}}{[endif]}{[if brand_voice]} reflecting a {{brand_voice}} brand voice{[endif]}{[if call_to_action]} with a {{call_to_action}} CTA{[endif]}.',
    call_analysis:
      'Analyze this call script{[if tone]} for {{tone}} tone{[endif]}{[if recipient_role]} addressed to {{recipient_role}}{[endif]}{[if company_name]} at {{company_name}}{[endif]}{[if name]} for {{name}}{[endif]}{[if industry]} in the {{industry}} industry{[endif]}{[if target_audience]} targeting {{target_audience}}{[endif]}{[if urgency_level]} with {{urgency_level}} urgency{[endif]}{[if personalization_element]} including {{personalization_element}}{[endif]}{[if brand_voice]} reflecting a {{brand_voice}} brand voice{[endif]}.',
    social_media_analysis:
      'Analyze this social media post{[if tone]} for {{tone}} tone{[endif]}{[if company_name]} for {{company_name}}{[endif]}{[if industry]} in the {{industry}} industry{[endif]}{[if target_audience]} targeting {{target_audience}}{[endif]}{[if brand_voice]} reflecting a {{brand_voice}} brand voice{[endif]}{[if call_to_action]} with a {{call_to_action}} CTA{[endif]}.',
  };

  useEffect(() => {
    if (!promptType) {
      setPromptTemplate('');
      setVariables([{ key: '', value: '' }]);
      return;
    }
    let generatedPrompt = basePromptTemplates[promptType] || '';
    variableOptions.forEach((option) => {
      const isSelected = variables.some((v) => v.key === option.value);
      if (isSelected) {
        generatedPrompt = generatedPrompt
          .replace(`{[if ${option.value}]}`, '')
          .replace(`{[endif]}`, '');
      } else {
        const regex = new RegExp(`\\[if ${option.value}\\][^\\[]*\\[endif\\]`, 'g');
        generatedPrompt = generatedPrompt.replace(regex, '');
      }
    });
    generatedPrompt = generatedPrompt.replace(/{[endif]}/g, '');

    // Replace variable placeholders with their values
    variables.forEach((variable) => {
      if (variable.key && variable.value) {
        const placeholder = `{{${variable.key}}}`;
        generatedPrompt = generatedPrompt.replace(placeholder, variable.value);
      }
    });

    setPromptTemplate(generatedPrompt.trim());
  }, [promptType, variables]);

  const handlePromptTypeChange = (value) => {
    setPromptType(value);
    setVariables([{ key: '', value: '' }]);
    setError(null);
    setSuccess(null);
  };

  const handleVariableChange = (index, field, value) => {
    const newVariables = [...variables];
    newVariables[index][field] = value;
    setVariables(newVariables);
    setError(null);
    setSuccess(null);
  };

  const addVariable = () => {
    setVariables([...variables, { key: '', value: '' }]);
    setError(null);
    setSuccess(null);
  };

  const removeVariable = (index) => {
    if (variables.length === 1) {
      setError('At least one variable is required.');
      return;
    }
    const newVariables = variables.filter((_, i) => i !== index);
    setVariables(newVariables);
    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    if (!promptType) return 'Please select a prompt type.';
    const variableKeys = variables.map((v) => v.key.trim());
    const uniqueKeys = new Set(variableKeys);
    if (uniqueKeys.size !== variableKeys.length) return 'Duplicate variable names are not allowed.';
    if (variableKeys.some((key) => !key)) return 'All variable names must be selected.';
    if (variables.some((v) => !v.value.trim())) return 'All variable values must be filled.';
    if (!promptTemplate.trim()) return 'Prompt template cannot be empty.';
    const variablePattern = /{{[a-zA-Z0-9_]+}}/g;
    const usedVariables = promptTemplate.match(variablePattern)?.map((v) => v.slice(2, -2)) || [];
    if (usedVariables.length) return `Unreplaced variables in prompt: ${usedVariables.join(', ')}.`;
    const invalidVariables = variableKeys.filter((key) => {
      const option = variableOptions.find((opt) => opt.value === key);
      return option && !option.supportedTypes.includes(promptType);
    });
    if (invalidVariables.length) return `Variables not supported for ${promptType}: ${invalidVariables.join(', ')}.`;
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const userEmail = 'test@example.com';
      const variablesObject = variables.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
      const response = await axios.post(
        'https://anstqgez36.execute-api.us-east-1.amazonaws.com/dev/update-system-prompt',
        { email: userEmail, promptType, variables: variablesObject, promptTemplate },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setSuccess(response.data.message);
      setPromptType('');
      setVariables([{ key: '', value: '' }]);
      setPromptTemplate('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update system prompt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableOptions = (currentIndex) => {
    const selectedKeys = variables
      .filter((_, index) => index !== currentIndex)
      .map((v) => v.key)
      .filter((key) => key);
    return variableOptions
      .filter((option) => !selectedKeys.includes(option.value) && option.supportedTypes.includes(promptType))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  return (
    <motion.div
      className="prompt-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="system-prompt-form"
    >
      <div className="prompt-form-header">
        <h3>Configure System Prompt</h3>
        <p className="header-subtitle">Customize your prompt with dynamic variables</p>
      </div>
      <form onSubmit={handleSubmit} className="prompt-form-content">
        <motion.div
          className="prompt-type-section card-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <label className="label-style" htmlFor="prompt-type-select">
            Prompt Type
          </label>
          <select
            id="prompt-type-select"
            value={promptType}
            onChange={(e) => handlePromptTypeChange(e.target.value)}
            className="prompt-type-select"
            aria-label="Select prompt type"
            data-testid="prompt-type-select"
          >
            <option value="" disabled>
              Select a prompt type
            </option>
            {promptTypeOptions.map((option) => (
              <option key={option.value} value={option.value} data-testid={`prompt-type-option-${option.value}`}>
                {option.label}
              </option>
            ))}
          </select>
        </motion.div>
        <motion.div
          className="variables-section card-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <label className="label-style">Variables</label>
          <AnimatePresence>
            {variables.map((variable, index) => {
              const availableOptions = getAvailableOptions(index);
              return (
                <motion.div
                  key={index}
                  className="variable-row"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  data-testid={`variable-row-${index}`}
                >
                  <select
                    value={variable.key || ''}
                    onChange={(e) => handleVariableChange(index, 'key', e.target.value)}
                    className="variable-select"
                    aria-label={`Variable name ${index + 1}`}
                    data-testid={`variable-select-${index}`}
                  >
                    <option value="" disabled>
                      Select a variable
                    </option>
                    {availableOptions.map((option) => (
                      <option key={option.value} value={option.value} data-testid={`variable-option-${option.value}`}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={variable.value || ''}
                    onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
                    placeholder="Enter value (e.g., Acme Corp)"
                    className="variable-input"
                    aria-label={`Variable value ${index + 1}`}
                    data-testid={`variable-input-${index}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeVariable(index)}
                    className="remove-variable-button"
                    disabled={variables.length === 1}
                    aria-label={`Remove variable ${index + 1}`}
                    data-testid={`remove-variable-button-${index}`}
                    title="Remove this variable"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <motion.button
            type="button"
            onClick={addVariable}
            className="add-variable-button"
            aria-label="Add new variable"
            disabled={variables.length >= getAvailableOptions(-1).length}
            data-testid="add-variable-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Add a new variable"
          >
            <span className="material-icons">add</span> Add Variable
          </motion.button>
        </motion.div>
        <motion.div
          className="prompt-section card-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <label className="label-style" htmlFor="prompt-template-textarea">
            Generated Prompt
          </label>
          <textarea
            id="prompt-template-textarea"
            value={promptTemplate}
            readOnly
            className="prompt-template-textarea"
            aria-label="Generated prompt template"
            data-testid="prompt-template-textarea"
          />
        </motion.div>
        <AnimatePresence>
          {error && (
            <motion.p
              className="error-text"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              data-testid="error-message"
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              className="success-text"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              data-testid="success-message"
            >
              {success}
            </motion.p>
          )}
        </AnimatePresence>
        <motion.div
          className="form-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
            aria-label="Save prompt and variables"
            data-testid="submit-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Save your prompt configuration"
          >
            {isSubmitting ? <span className="loading-spinner" /> : 'Save Prompt'}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default SystemPromptEditForm;
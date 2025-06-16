import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import './EditEmailForm.css';
import categoryEmailBlue from '/assets/envelope_blue_email_type.png';
import categoryEmailGrey from '/assets/envelope_grey_email_type.png';

const EditEmailForm = ({
  userEmail,
  handleBack,
  templates,
  setUserData,
  isPublishing,
  setIsPublishing,
  templateName,
  onTemplateNameChange,
}) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  // Ensure baseTemplateId is the clean UUID
  const baseTemplateId = id.split('#')[0];
  console.log('Parsed baseTemplateId from URL:', { id, baseTemplateId });

  // Find template by matching UUID prefix or full templateId
  const templateData = templates.find((t) => t.id === baseTemplateId || t.id.startsWith(baseTemplateId + '#')) || {};

  // Initialize state, avoiding duplicate documents
  const [formData, setFormData] = useState({
    id: baseTemplateId,
    title: templateData.title || templateData.name || templateName || '',
    description: templateData.description || '',
    category: templateData.category || '',
    scenarios: Array.isArray(templateData.scenarios)
      ? templateData.scenarios.filter((s) => s && typeof s === 'string')
      : templateData.scenario
      ? [templateData.scenario]
      : [],
    scenarioDetails: templateData.scenarioDetails || {
      [templateData.scenario || 'default']: {
        tone: templateData.tone || '',
        context: templateData.context || '',
        greeting: templateData.greeting || 'Hi',
        signature: templateData.signature || 'Best',
        documentType: templateData.document ? JSON.parse(templateData.document || '[]')[0]?.documentType || '' : '',
        documents: templateData.document ? JSON.parse(templateData.document || '[]') : [],
      },
    },
    responseLength: Number(templateData.responseLength) || 50,
  });

  console.log('EditEmailForm: Initialized with', { baseTemplateId, templateData, formData });

  const categorySettings = {
    'Client communications': { description: 'Emails for client interactions.' },
    'Project / status update': { description: 'Emails for project updates.' },
    'Cold sales pitch / activity': { description: 'Emails for cold outreach.' },
    'Custom': { description: 'Custom email categories.' },
  };

  if (!templateData.id && id) {
    setError('Template not found.');
    setShowCreateNew(true);
  }

  const validateForm = () => {
    if (!formData.title.trim()) return 'Template title is required';
    if (!formData.category) return 'Email category is required';
    if (formData.responseLength < 1) return 'Response length must be positive';
    if (!formData.scenarios || formData.scenarios.length === 0) return 'At least one scenario is required';
    return null;
  };

  const handleInputChange = (field, value) => {
    let newValue = value;
    if (field === 'responseLength') {
      const numValue = Number(value);
      newValue = isNaN(numValue) || numValue < 1 ? 50 : numValue;
    }
    setFormData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
    if (field === 'title' && onTemplateNameChange) {
      onTemplateNameChange({ target: { value: newValue } });
    }
    setError(null);
    setShowCreateNew(false);
  };

  const handleCategorySelect = (category) => {
    try {
      handleInputChange('category', category);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error selecting category:', err);
      setError('Failed to select category: ' + err.message);
    }
  };

  const handleScenarioDetailChange = (scenarioId, field, value) => {
    try {
      setFormData((prev) => ({
        ...prev,
        scenarioDetails: {
          ...prev.scenarioDetails,
          [scenarioId]: {
            ...prev.scenarioDetails[scenarioId] || {},
            [field]: value,
          },
        },
      }));
      setError(null);
      setShowCreateNew(false);
    } catch (err) {
      console.error('Error updating scenario details:', err);
      setError('Failed to update scenario details: ' + err.message);
    }
  };

  const handleDeleteDocument = async (scenarioId, s3Key) => {
    const confirmed = window.confirm('Are you sure you want to delete this document?');
    if (!confirmed) return;

    const doc = formData.scenarioDetails[scenarioId]?.documents.find((d) => d.s3Key === s3Key);
    if (!doc) {
      setError('Document not found.');
      return;
    }

    if (doc.isLocal) {
      setFormData((prev) => {
        const updatedScenarioDetails = { ...prev.scenarioDetails };
        if (updatedScenarioDetails[scenarioId]) {
          updatedScenarioDetails[scenarioId].documents = (
            updatedScenarioDetails[scenarioId].documents || []
          ).filter((d) => d.s3Key !== s3Key);
        }
        return {
          ...prev,
          scenarioDetails: updatedScenarioDetails,
        };
      });

      setUserData((prev) => ({
        ...prev,
        templates: prev.templates.map((t) =>
          t.id === formData.id || t.id.startsWith(formData.id + '#')
            ? {
                ...t,
                scenarioDetails: {
                  ...t.scenarioDetails,
                  [scenarioId]: {
                    ...t.scenarioDetails[scenarioId],
                    documents: (t.scenarioDetails[scenarioId]?.documents || []).filter(
                      (d) => d.s3Key !== s3Key
                    ),
                  },
                },
              }
            : t
        ),
      }));

      alert('Document removed successfully.');
    } else {
      try {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();

        const payload = {
          email: userEmail,
          templateId: formData.id,
          s3Key,
        };

        const response = await fetch(
          'https://2ofjdl14kg.execute-api.us-east-1.amazonaws.com/prod/delete-document',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete document');
        }

        setFormData((prev) => {
          const updatedScenarioDetails = { ...prev.scenarioDetails };
          if (updatedScenarioDetails[scenarioId]) {
            updatedScenarioDetails[scenarioId].documents = (
              updatedScenarioDetails[scenarioId].documents || []
            ).filter((d) => d.s3Key !== s3Key);
          }
          return {
            ...prev,
            scenarioDetails: updatedScenarioDetails,
          };
        });

        setUserData((prev) => ({
          ...prev,
          templates: prev.templates.map((t) =>
            t.id === formData.id || t.id.startsWith(formData.id + '#')
              ? {
                  ...t,
                  scenarioDetails: {
                    ...t.scenarioDetails,
                    [scenarioId]: {
                      ...t.scenarioDetails[scenarioId],
                      documents: (t.scenarioDetails[scenarioId]?.documents || []).filter(
                        (d) => d.s3Key !== s3Key
                      ),
                    },
                  },
                }
              : t
          ),
        }));

        alert('Document deleted successfully.');
      } catch (error) {
        console.error('Error deleting document:', error);
        setError('Failed to delete document: ' + error.message);
      }
    }
  };

  const handleUploadDocument = useCallback((scenarioId, event) => {
    const files = Array.from(event.target.files);
    if (!files.length) {
      setError('No files selected.');
      return;
    }

    // Reset file input
    event.target.value = null;

    console.log('Uploading documents for scenario:', { scenarioId, fileCount: files.length });

    const MAX_FILE_SIZE_MB = 10;
    const filePromises = files.map((file) =>
      new Promise((resolve, reject) => {
        if (file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
          reject(new Error(`File ${file.name} exceeds ${MAX_FILE_SIZE_MB} MB`));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          if (!reader.result || typeof reader.result !== 'string') {
            reject(new Error(`Failed to read file: ${file.name}`));
            return;
          }
          const base64Data = reader.result.split(',')[1];
          if (!base64Data) {
            reject(new Error(`Invalid base64 data for file: ${file.name}`));
            return;
          }
          const documentType = formData.scenarioDetails[scenarioId]?.documentType || '';
          const s3Key = `templates/${encodeURIComponent(userEmail)}/${formData.id}/${scenarioId}/${uuidv4()}-${encodeURIComponent(file.name)}`;
          resolve({
            name: encodeURIComponent(file.name),
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            base64Data,
            scenarioId,
            s3Key,
            documentType,
            isLocal: true,
          });
        };
        reader.onerror = () => reject(new Error(`Error reading file: ${file.name}`));
        reader.readAsDataURL(file);
      })
    );

    Promise.all(filePromises)
      .then((newDocuments) => {
        setFormData((prev) => {
          const updatedScenarioDetails = { ...prev.scenarioDetails };
          if (!updatedScenarioDetails[scenarioId]) {
            updatedScenarioDetails[scenarioId] = { documents: [] };
          }
          // Prevent duplicates by filtering out existing s3Keys
          const existingKeys = new Set(updatedScenarioDetails[scenarioId].documents?.map((doc) => doc.s3Key) || []);
          const uniqueNewDocs = newDocuments.filter((doc) => !existingKeys.has(doc.s3Key));
          updatedScenarioDetails[scenarioId].documents = [
            ...(updatedScenarioDetails[scenarioId].documents || []),
            ...uniqueNewDocs,
          ];
          console.log('Updated documents for scenario:', {
            scenarioId,
            documentCount: updatedScenarioDetails[scenarioId].documents.length,
            newDocs: uniqueNewDocs,
          });
          return {
            ...prev,
            scenarioDetails: updatedScenarioDetails,
          };
        });
        setError(null);
        setShowCreateNew(false);
      })
      .catch((err) => {
        console.error('Error uploading files:', err);
        setError(`Failed to process uploaded documents: ${err.message}`);
      });
  }, [formData, userEmail, setError, setShowCreateNew]);

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!formData.id) {
      setError('No template ID available.');
      return;
    }

    setIsPublishing(true);
    setLoading(true);
    const controller = new AbortController();

    try {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      const cleanBaseTemplateId = formData.id.split('#')[0];

      for (const scenarioId of formData.scenarios) {
        const constructedTemplateId = `${cleanBaseTemplateId}#${scenarioId}`;
        const scenarioDetails = formData.scenarioDetails[scenarioId] || {};

        const localDocuments = scenarioDetails.documents?.filter((doc) => doc.isLocal) || [];
        console.log('Preparing payload for scenario:', {
          scenarioId,
          documentCount: localDocuments.length,
          documents: localDocuments.map((doc) => ({ name: doc.name, s3Key: doc.s3Key, hasBase64: !!doc.base64Data })),
        });

        const payload = {
          email: userEmail,
          templateId: constructedTemplateId,
          title: formData.title,
          description: formData.description || undefined,
          category: formData.category || undefined,
          customCategoryDescription: undefined,
          scenarios: [scenarioId],
          customScenarioDescription: undefined,
          scenarioDetails: {
            [scenarioId]: {
              tone: scenarioDetails.tone || undefined,
              context: scenarioDetails.context || undefined,
              greeting: scenarioDetails.greeting || undefined,
              signature: scenarioDetails.signature || undefined,
              documentType: scenarioDetails.documentType || undefined,
              documents: localDocuments,
            },
          },
          responseLength: formData.responseLength.toString(),
        };

        console.log('handleSave: Sending payload:', JSON.stringify(payload, null, 2));

        const response = await fetch(
          'https://jke25qrxs8.execute-api.us-east-1.amazonaws.com/dev/save-email-template-edits',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save template');
        }

        const result = await response.json();
        console.log('Received response:', JSON.stringify(result, null, 2));

        // Update userData and mark documents as non-local after successful save
        setUserData((prev) => ({
          ...prev,
          templates: prev.templates.map((t) =>
            t.id === payload.templateId || t.id.startsWith(cleanBaseTemplateId + '#')
              ? {
                  ...t,
                  title: formData.title,
                  description: formData.description,
                  category: formData.category,
                  scenarios: [scenarioId],
                  scenarioDetails: {
                    ...t.scenarioDetails,
                    [scenarioId]: {
                      ...t.scenarioDetails?.[scenarioId],
                      tone: scenarioDetails.tone,
                      context: scenarioDetails.context,
                      greeting: scenarioDetails.greeting,
                      signature: scenarioDetails.signature,
                      documentType: scenarioDetails.documentType,
                      documents: scenarioDetails.documents?.map((doc) => ({
                        ...doc,
                        isLocal: false, // Mark as saved
                      })),
                    },
                  },
                  responseLength: formData.responseLength,
                }
              : t
          ),
          lastFetched: Date.now(),
        }));

        // Update formData to mark documents as non-local
        setFormData((prev) => ({
          ...prev,
          scenarioDetails: {
            ...prev.scenarioDetails,
            [scenarioId]: {
              ...prev.scenarioDetails[scenarioId],
              documents: prev.scenarioDetails[scenarioId]?.documents?.map((doc) => ({
                ...doc,
                isLocal: false,
              })) || [],
            },
          },
        }));
      }

      alert('Template saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Error saving template:', error);
      if (error.message.includes('Template not found')) {
        setError('The specified template does not exist. Would you like to create a new one?');
        setShowCreateNew(true);
      } else {
        setError('Failed to save template: ' + error.message);
      }
    } finally {
      setIsPublishing(false);
      setLoading(false);
    }

    return () => controller.abort();
  };

  const handleCreateNewTemplate = () => {
    navigate('/dashboard/template-creator', { state: { templateData: formData } });
  };

  if (!templates || templates.length === 0) {
    return (
      <div className="edit-email-container">
        <div className="edit-email-error">
          No templates available.
          <button onClick={handleCreateNewTemplate} className="edit-email-save-btn">
            Create New Template
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-email-container" role="form" aria-labelledby="edit-email-step-title">
      <div className="edit-email-left-aligned-container">
        <h2 className="edit-email-step-title" id="edit-email-step-title">
          Review and edit template
        </h2>
      </div>

      <div className="edit-email-scrollable-content">
        <div className="edit-email-centered-content">
          {error && (
            <div className="edit-email-error">
              {error}
              {showCreateNew && (
                <button onClick={handleCreateNewTemplate} className="edit-email-save-btn">
                  Create New Template
                </button>
              )}
            </div>
          )}
          {loading && (
            <div className="edit-email-loading" aria-live="polite">
              Processing...
            </div>
          )}

          <div className="edit-email-review-section">
            <div>
              <h3 className="edit-email-review-title">Title</h3>
              <input
                type="text"
                className="edit-email-review-input edit-email-title-review-input"
                placeholder="ENTER TEMPLATE TITLE"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                aria-label="Template title"
                required
              />
            </div>

            <div>
              <h3 className="edit-email-review-title">Description</h3>
              <textarea
                className="edit-email-review-input edit-email-description-review-input"
                placeholder="ADD A DESCRIPTION FOR YOUR TEMPLATE"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                aria-label="Template description"
              />
            </div>

            <div>
              <h3 className="edit-email-review-title">Email Category</h3>
              <div
                className="edit-email-review-card email-category"
                onClick={() => setIsModalOpen(true)}
                onKeyPress={(e) => e.key === 'Enter' && setIsModalOpen(true)}
                role="button"
                tabIndex={0}
                aria-label={`Select email category, current: ${formData.category || 'Not selected'}`}
              >
                <img
                  src={formData.category ? categoryEmailBlue : categoryEmailGrey}
                  alt="Category email icon"
                  className="edit-email-icon"
                />
                <div className="edit-email-review-type">{formData.category || 'Not selected'}</div>
                <div className="edit-email-description">
                  {categorySettings[formData.category]?.description || 'No description available'}
                </div>
              </div>
            </div>

            <div>
              <h3 className="edit-email-review-title">Scenarios</h3>
              {formData.scenarios.length > 0 ? (
                <div className="edit-email-review-grid">
                  {formData.scenarios.map((scenarioId, index) => {
                    const details = formData.scenarioDetails[scenarioId] || {};
                    return (
                      <div key={scenarioId} className="edit-email-review-card">
                        <div className="edit-email-review-subsection">
                          <div className="edit-email-review-type">Scenario ID</div>
                          <input
                            type="text"
                            className="edit-email-review-input"
                            value={scenarioId}
                            disabled
                            aria-label={`Scenario ID ${index + 1}`}
                          />
                        </div>
                        <div className="edit-email-review-subsection">
                          <div className="edit-email-review-type">Tone</div>
                          <input
                            type="text"
                            className="edit-email-review-input"
                            placeholder="ENTER TONE"
                            value={details.tone || ''}
                            onChange={(e) => handleScenarioDetailChange(scenarioId, 'tone', e.target.value)}
                            aria-label={`Tone for scenario ${index + 1}`}
                          />
                        </div>
                        <div className="edit-email-review-subsection">
                          <div className="edit-email-review-type">Document Type</div>
                          <input
                            type="text"
                            className="edit-email-review-input"
                            placeholder="ENTER DOCUMENT TYPE"
                            value={details.documentType || ''}
                            onChange={(e) => handleScenarioDetailChange(scenarioId, 'documentType', e.target.value)}
                            aria-label={`Document type for scenario ${index + 1}`}
                          />
                        </div>
                        <div className="edit-email-review-subsection">
                          <div className="edit-email-review-type">Documents</div>
                          <div className="edit-email-attachment-card">
                            <label
                              htmlFor={`file-upload-${scenarioId}`}
                              className="edit-email-attachment-label"
                            >
                              <div className="edit-email-attachment-info">
                                <div>Attach documents</div>
                                <div className="edit-email-description">
                                  Click to upload files (multiple allowed)
                                </div>
                              </div>
                            </label>
                            <input
                              id={`file-upload-${scenarioId}`}
                              type="file"
                              multiple
                              onChange={(e) => handleUploadDocument(scenarioId, e)}
                              className="edit-email-file-input"
                            />
                          </div>
                          {details.documents && details.documents.length > 0 ? (
                            details.documents.map((doc, docIndex) => (
                              <div
                                key={doc.s3Key} // Use s3Key as unique key
                                className="edit-email-review-document-card selected"
                                aria-label={`Document: ${decodeURIComponent(doc.name) || 'Unnamed Document'}`}
                              >
                                <a
                                  href={doc.presignedUrl || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="edit-email-document-name"
                                >
                                  {decodeURIComponent(doc.name) || 'Unnamed Document'}
                                </a>
                                <div className="edit-email-document-size">{doc.size || 'Unknown size'}</div>
                                {doc.documentType && (
                                  <div className="edit-email-document-type">
                                    Type: {doc.documentType}
                                  </div>
                                )}
                                <button
                                  className="edit-email-delete-document-btn"
                                  onClick={() => handleDeleteDocument(scenarioId, doc.s3Key)}
                                  aria-label={`Delete document ${decodeURIComponent(doc.name)}`}
                                >
                                  Delete
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="edit-email-description">No documents attached</div>
                          )}
                        </div>
                        <div className="edit-email-review-subsection">
                          <div className="edit-email-review-type">Context</div>
                          <textarea
                            className="edit-email-review-input"
                            placeholder="ENTER CONTEXT"
                            value={details.context || ''}
                            onChange={(e) => handleScenarioDetailChange(scenarioId, 'context', e.target.value)}
                            aria-label={`Context for scenario ${index + 1}`}
                          />
                        </div>
                        <div className="edit-email-review-subsection">
                          <div className="edit-email-review-type">Greeting</div>
                          <input
                            type="text"
                            className="edit-email-review-input"
                            placeholder="ENTER GREETING"
                            value={details.greeting || 'Hi'}
                            onChange={(e) => handleScenarioDetailChange(scenarioId, 'greeting', e.target.value)}
                            aria-label={`Greeting for scenario ${index + 1}`}
                          />
                        </div>
                        <div className="edit-email-review-subsection">
                          <div className="edit-email-review-type">Signature</div>
                          <input
                            type="text"
                            className="edit-email-review-input"
                            placeholder="ENTER SIGNATURE"
                            value={details.signature || 'Best'}
                            onChange={(e) => handleScenarioDetailChange(scenarioId, 'signature', e.target.value)}
                            aria-label={`Signature for scenario ${index + 1}`}
                          />
                        </div>
                        {index < formData.scenarios.length - 1 && (
                          <hr className="edit-email-section-divider" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="edit-email-description" aria-live="polite">
                  No scenarios defined
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="edit-email-modal-overlay" role="dialog" aria-labelledby="edit-email-modal-title">
          <div className="edit-email-modal">
            <h2 id="edit-email-modal-title" className="edit-email-modal-title">
              Select Email Category
            </h2>
            <div className="edit-email-modal-grid">
              {Object.keys(categorySettings).map((category) => (
                <div
                  key={category}
                  className={`edit-email-modal-item ${formData.category === category ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCategorySelect(category)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${category} category`}
                >
                  <img
                    src={formData.category === category ? categoryEmailBlue : categoryEmailGrey}
                    alt={`${category} email icon`}
                    className="edit-email-icon"
                  />
                  <div className="edit-email-email-type">{category}</div>
                  <div className="edit-email-description">
                    {categorySettings[category].description}
                  </div>
                </div>
              ))}
            </div>
            <p className="edit-email-modal-note">
              Choose the email type that best matches your needs.
            </p>
            <div className="edit-email-modal-buttons">
              <button
                className="edit-email-cancel-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Cancel category selection"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="edit-email-footer-container">
        <div className="edit-email-footer-text">
          *All replies are written to the drafts of your linked account
        </div>
        <div className="edit-email-navigation">
          <button
            className="edit-email-unique-back-btn"
            onClick={handleBack}
            aria-label="Go back"
          >
            Back
          </button>
          <button
            className="edit-email-save-btn"
            onClick={handleSave}
            disabled={isPublishing || loading}
            aria-label={isPublishing ? 'Saving template' : 'Save template changes'}
          >
            {isPublishing ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

EditEmailForm.propTypes = {
  userEmail: PropTypes.string.isRequired,
  handleBack: PropTypes.func.isRequired,
  templates: PropTypes.array.isRequired,
  setUserData: PropTypes.func.isRequired,
  isPublishing: PropTypes.bool.isRequired,
  setIsPublishing: PropTypes.func.isRequired,
  templateName: PropTypes.string,
  onTemplateNameChange: PropTypes.func,
};

EditEmailForm.defaultProps = {
  templateName: '',
  onTemplateNameChange: () => {},
};

export default EditEmailForm;
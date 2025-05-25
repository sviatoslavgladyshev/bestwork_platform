// TemplateInputForm.jsx
import React, { useState, useEffect, Component } from 'react';
import './TemplateInputForm.css';

// Error Boundary Component to catch and display errors in child components
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-message">
          <h3>System Malfunction Detected</h3>
          <p>{this.state.error?.message || 'Please retry or select a different category to proceed.'}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const TemplateInputForm = () => {
  // Predefined options for form dropdowns
  const categories = [
    'Announcement', 'Scheduling', 'Negotiation', 'Status report', 'Sales pitch',
    'Networking', 'Task assignment', 'Information Request', 'Follow-up',
    'Feedback Request', 'Complaint/Issue Report', 'Personal', 'Event Invitation', 'Other'
  ];
  const tones = [
    'Professional', 'Friendly', 'Grateful', 'Confident', 'Urgent', 'Apologetic', 'Collaborative'
  ];
  const sentiments = ['apologetic', 'urgent', 'neutral', 'negative', 'positive'];

  // Condition options for context rules, mapped to each category
  const conditionOptions = {
    'Announcement': ['launch', 'new', 'update', 'announce', 'news', 'event'],
    'Scheduling': ['meeting', 'call', 'schedule', 'available', 'confirm', 'reschedule'],
    'Negotiation': ['agree', 'disagree', 'offer', 'counter', 'terms', 'budget'],
    'Status report': ['progress', 'update', 'status', 'issue', 'delay', 'problem'],
    'Sales pitch': ['interest', 'inquiry', 'product', 'pitch', 'proposal', 'demo'],
    'Networking': ['connect', 'meet', 'network', 'follow-up', 'thank you', 'again'],
    'Task assignment': ['task', 'assignment', 'deadline', 'clarify', 'details', 'question'],
    'Information Request': ['information', 'details', 'clarify', 'response', 'provide', 'answer'],
    'Follow-up': ['follow-up', 'check', 'update', 'thank you', 'appreciate', 'again'],
    'Feedback Request': ['feedback', 'input', 'opinion', 'thank you', 'appreciate', 'response'],
    'Complaint/Issue Report': [
      'sorry', 'apologize', 'inconvenience', 'urgent', 'critical', 'immediately',
      'mistake', 'error', 'incorrect', 'follow-up', 'prevent', 'disappointed',
      'unhappy', 'schedule a call', 'meet', 'available'
    ],
    'Personal': ['personal', 'casual', 'friend', 'thank you', 'appreciate', 'gratitude'],
    'Event Invitation': ['invite', 'event', 'join', 'rsvp', 'confirm', 'attend'],
    'Other': ['general', 'inquiry', 'request', 'feedback', 'response']
  };

  // Category-specific settings with defaults, templates, and snippets
  const categorySettings = {
    'Announcement': {
      defaultTitle: 'Announcement Template',
      defaultTone: 'Professional',
      defaultResponseLength: 10,
      ruleTemplates: [
        {
          name: 'Launch Update',
          conditions: ['launch', 'new', 'update'],
          sentiment: 'positive',
          instructions: 'Announce the update enthusiastically and provide key details.'
        },
        {
          name: 'General Announcement',
          conditions: ['announce', 'news', 'event'],
          sentiment: 'neutral',
          instructions: 'Share the announcement clearly with a call to action.'
        }
      ],
      requirementSnippets: [
        'Ensure announcements are clear, concise, and highlight key points.',
        'Include a call to action and maintain a professional tone.'
      ],
      styleSnippets: [
        'Use formal language, structured format, and a professional closing.',
        'Highlight key points with bullet points for clarity.'
      ],
      emailExampleTemplates: [
        {
          name: 'Product Launch',
          value: 'Subject: Exciting Product Launch!\n\nDear Team,\nWe’re thrilled to announce our new product launch! Key features include...\nBest regards,\nSviatoslav'
        }
      ]
    },
    'Scheduling': {
      defaultTitle: 'Meeting Schedule Template',
      defaultTone: 'Collaborative',
      defaultResponseLength: 30,
      ruleTemplates: [
        {
          name: 'Meeting Request',
          conditions: ['meeting', 'call', 'schedule'],
          sentiment: 'neutral',
          instructions: 'Propose specific meeting times and confirm availability.'
        },
        {
          name: 'Urgent Meeting',
          conditions: ['urgent', 'asap', 'immediately'],
          sentiment: 'urgent',
          instructions: 'Acknowledge urgency and propose a meeting within 24 hours.'
        }
      ],
      requirementSnippets: [
        'Specify meeting times and ensure clarity in scheduling details.',
        'Responses should be polite and confirm next steps.'
      ],
      styleSnippets: [
        'Use bullet points for time suggestions and a formal closing.',
        'Keep responses concise and action-oriented.'
      ],
      emailExampleTemplates: [
        {
          name: 'Meeting Request',
          value: 'Subject: Re: Meeting Request\n\nDear John,\nI’m available for a call on:\n- Tuesday at 10 AM\n- Wednesday at 2 PM\nPlease confirm.\nBest regards,\nSviatoslav'
        }
      ]
    },
    'Negotiation': {
      defaultTitle: 'Negotiation Template',
      defaultTone: 'Professional',
      defaultResponseLength: 50,
      ruleTemplates: [
        {
          name: 'Agreement',
          conditions: ['agree', 'acceptable', 'deal'],
          sentiment: 'positive',
          instructions: 'Confirm agreement and outline next steps.'
        },
        {
          name: 'Counter-Offer',
          conditions: ['offer', 'counter', 'budget'],
          sentiment: 'neutral',
          instructions: 'Propose a counter-offer with clear justification.'
        }
      ],
      requirementSnippets: [
        'Responses must be precise, diplomatic, and address specific terms.',
        'Ensure clarity and professionalism in negotiations.'
      ],
      styleSnippets: [
        'Use formal language, reference specific terms, and maintain clarity.',
        'Structure responses with clear points and a professional closing.'
      ],
      emailExampleTemplates: [
        {
          name: 'Contract Terms',
          value: 'Subject: Re: Contract Terms\n\nDear Lisa,\nThe proposed terms are agreeable. Please send the final contract.\nBest regards,\nSviatoslav'
        }
      ]
    },
    'Status report': {
      defaultTitle: 'Status Update Template',
      defaultTone: 'Professional',
      defaultResponseLength: 50,
      ruleTemplates: [
        {
          name: 'Progress Update',
          conditions: ['progress', 'update', 'status'],
          sentiment: 'neutral',
          instructions: 'Provide a detailed update with key milestones.'
        },
        {
          name: 'Issue Report',
          conditions: ['issue', 'delay', 'problem'],
          sentiment: 'neutral',
          instructions: 'Acknowledge issues and outline resolution plans.'
        }
      ],
      requirementSnippets: [
        'Include factual, detailed updates with clear timelines.',
        'Ensure responses are professional and structured.'
      ],
      styleSnippets: [
        'Use structured formats with bullet points for clarity.',
        'Maintain a formal tone with concise updates.'
      ],
      emailExampleTemplates: [
        {
          name: 'Project Update',
          value: 'Subject: Re: Project Status\n\nDear Team,\nProgress update:\n- Milestone 1 completed\n- Next steps...\nBest regards,\nSviatoslav'
        }
      ]
    },
    'Sales pitch': {
      defaultTitle: 'Sales Pitch Template',
      defaultTone: 'Confident',
      defaultResponseLength: 50,
      ruleTemplates: [
        {
          name: 'Interest Inquiry',
          conditions: ['interest', 'inquiry', 'product'],
          sentiment: 'positive',
          instructions: 'Highlight product benefits and propose a demo.'
        },
        {
          name: 'Follow-Up Pitch',
          conditions: ['follow-up', 'pitch', 'proposal'],
          sentiment: 'neutral',
          instructions: 'Reinforce benefits and address concerns.'
        }
      ],
      requirementSnippets: [
        'Responses must be persuasive, clear, and highlight benefits.',
        'Include a strong call to action.'
      ],
      styleSnippets: [
        'Use engaging, structured language with a confident tone.',
        'Highlight key points with bullet points.'
      ],
      emailExampleTemplates: [
        {
          name: 'Product Pitch',
          value: 'Subject: Discover Our New Solution\n\nDear Client,\nOur product offers...\nLet’s schedule a demo!\nBest regards,\nSviatoslav'
        }
      ]
    },
    'Networking': {
      defaultTitle: 'Networking Template',
      defaultTone: 'Friendly',
      defaultResponseLength: 30,
      ruleTemplates: [
        {
          name: 'Connection Request',
          conditions: ['connect', 'meet', 'network'],
          sentiment: 'positive',
          instructions: 'Express interest in connecting and propose a meeting.'
        },
        {
          name: 'Follow-Up',
          conditions: ['follow-up', 'thank you', 'again'],
          sentiment: 'neutral',
          instructions: 'Thank for previous interaction and suggest next steps.'
        }
      ],
      requirementSnippets: [
        'Responses should be warm, professional, and concise.',
        'Encourage further engagement with a friendly tone.'
      ],
      styleSnippets: [
        'Use conversational language and a brief, warm closing.',
        'Keep responses short and engaging.'
      ],
      emailExampleTemplates: [
        {
          name: 'Networking Intro',
          value: 'Subject: Let’s Connect!\n\nHi Jane,\nI’d love to connect and discuss...\nBest,\nSviatoslav'
        }
      ]
    },
    'Task assignment': {
      defaultTitle: 'Task Assignment Template',
      defaultTone: 'Professional',
      defaultResponseLength: 30,
      ruleTemplates: [
        {
          name: 'Task Assignment',
          conditions: ['task', 'assignment', 'deadline'],
          sentiment: 'neutral',
          instructions: 'Assign the task with clear instructions and deadlines.'
        },
        {
          name: 'Clarification Request',
          conditions: ['clarify', 'details', 'question'],
          sentiment: 'neutral',
          instructions: 'Provide clarification and confirm next steps.'
        }
      ],
      requirementSnippets: [
        'Responses must be clear, actionable, and include deadlines.',
        'Ensure instructions are precise and professional.'
      ],
      styleSnippets: [
        'Use direct, structured language with a formal closing.',
        'Include bullet points for tasks and deadlines.'
      ],
      emailExampleTemplates: [
        {
          name: 'Task Assignment',
          value: 'Subject: New Task Assignment\n\nDear Team,\nPlease complete:\n- Task:...\n- Deadline:...\nBest regards,\nSviatoslav'
        }
      ]
    },
    'Information Request': {
      defaultTitle: 'Information Request Template',
      defaultTone: 'Professional',
      defaultResponseLength: 30,
      ruleTemplates: [
        {
          name: 'Info Request',
          conditions: ['information', 'details', 'clarify'],
          sentiment: 'neutral',
          instructions: 'Request specific information politely.'
        },
        {
          name: 'Response to Request',
          conditions: ['response', 'provide', 'answer'],
          sentiment: 'neutral',
          instructions: 'Provide requested details clearly and concisely.'
        }
      ],
      requirementSnippets: [
        'Responses must be specific, polite, and concise.',
        'Ensure clarity in requesting or providing information.'
      ],
      styleSnippets: [
        'Use formal, concise language with a professional closing.',
        'Structure responses clearly for readability.'
      ],
      emailExampleTemplates: [
        {
          name: 'Info Request',
          value: 'Subject: Request for Details\n\nDear John,\nCould you provide details on...\nBest regards,\nSviatoslav'
        }
      ]
    },
    'Follow-up': {
      defaultTitle: 'Follow-Up Template',
      defaultTone: 'Friendly',
      defaultResponseLength: 30,
      ruleTemplates: [
        {
          name: 'Follow-Up Check',
          conditions: ['follow-up', 'check', 'update'],
          sentiment: 'neutral',
          instructions: 'Politely check on previous communication and suggest next steps.'
        },
        {
          name: 'Thank You Follow-Up',
          conditions: ['thank you', 'appreciate', 'again'],
          sentiment: 'positive',
          instructions: 'Express gratitude and propose further engagement.'
        }
      ],
      requirementSnippets: [
        'Responses should be polite, concise, and encourage further interaction.',
        'Maintain a friendly and professional tone.'
      ],
      styleSnippets: [
        'Use conversational language and a warm closing.',
        'Keep responses brief and action-oriented.'
      ],
      emailExampleTemplates: [
        {
          name: 'Follow-Up',
          value: 'Subject: Re: Our Last Discussion\n\nHi Sarah,\nJust following up on...\nBest,\nSviatoslav'
        }
      ]
    },
    'Feedback Request': {
      defaultTitle: 'Feedback Request Template',
      defaultTone: 'Friendly',
      defaultResponseLength: 30,
      ruleTemplates: [
        {
          name: 'Feedback Request',
          conditions: ['feedback', 'input', 'opinion'],
          sentiment: 'neutral',
          instructions: 'Request feedback politely and provide clear instructions.'
        },
        {
          name: 'Thank You for Feedback',
          conditions: ['thank you', 'appreciate', 'response'],
          sentiment: 'positive',
          instructions: 'Thank for feedback and confirm next steps.'
        }
      ],
      requirementSnippets: [
        'Responses should be encouraging, clear, and concise.',
        'Use a friendly tone to invite feedback.'
      ],
      styleSnippets: [
        'Use warm, concise language with a friendly closing.',
        'Structure requests clearly for ease of response.'
      ],
      emailExampleTemplates: [
        {
          name: 'Feedback Request',
          value: 'Subject: We Value Your Feedback\n\nDear Client,\nCould you share your thoughts on...\nBest,\nSviatoslav'
        }
      ]
    },
    'Complaint/Issue Report': {
      defaultTitle: 'Complaint Response Template',
      defaultTone: 'Apologetic',
      defaultResponseLength: 10,
      ruleTemplates: [
        {
          name: 'Apologetic Rule',
          conditions: ['sorry', 'apologize', 'inconvenience'],
          sentiment: 'apologetic',
          instructions: 'Acknowledge the issue, apologize sincerely, offer a 25% discount on the next invoice, and outline resolution steps.'
        },
        {
          name: 'Urgent Issue Rule',
          conditions: ['urgent', 'critical', 'immediately'],
          sentiment: 'urgent',
          instructions: 'Acknowledge urgency, escalate to support team, provide a contact point with a 24-hour response commitment, and offer a 25% discount if applicable.'
        },
        {
          name: 'Neutral Error Rule',
          conditions: ['mistake', 'error', 'incorrect'],
          sentiment: 'neutral',
          instructions: 'Acknowledge the reported error, clarify its validity, outline corrective action or explain why it’s not an issue, avoid compensation unless confirmed.'
        },
        {
          name: 'Negative Follow-Up Rule',
          conditions: ['follow-up', 'prevent', 'disappointed', 'unhappy', 'schedule a call', 'meet', 'available'],
          sentiment: 'negative',
          instructions: 'Express empathy, address follow-up requests (e.g., preventive measures, scheduling), confirm any prior compensation (e.g., 25% discount), and propose or confirm meeting times if requested.'
        }
      ],
      requirementSnippets: [
        'Responses must be empathetic, actionable, and avoid admitting liability unless valid.',
        'Ensure clarity and professionalism in addressing issues.'
      ],
      styleSnippets: [
        'Use empathetic language, formal closing, and structured responses.',
        'Include specific issue references and resolution steps.'
      ],
      emailExampleTemplates: [
        {
          name: 'Service Issue',
          value: 'Subject: Re: Service Issue\n\nDear Customer,\nI’m truly sorry for the inconvenience caused by the service disruption. We’ve resolved the issue and applied a 25% discount to your next invoice. Please contact us if you need further assistance.\nBest regards,\nSviatoslav'
        },
        {
          name: 'Urgent Issue',
          value: 'Subject: Re: Urgent Issue\n\nDear Jane,\nI regret the critical issue you’ve faced. This has been escalated to our support team, and you’ll hear back within 24 hours. Please contact support@bestwork.ai. We’ve applied a 25% discount to your next invoice.\nBest regards,\nSviatoslav'
        },
        {
          name: 'Billing Error',
          value: 'Subject: Re: Billing Error\n\nDear Tom,\nThank you for reporting the billing issue. After review, the $99.99 charge aligns with your plan. Please share additional details for further investigation.\nBest regards,\nSviatoslav'
        },
        {
          name: 'Follow-Up',
          value: 'Subject: Re: Service Issue Follow-Up\n\nDear Sarah,\nI’m sorry for your continued concerns. We’ve implemented enhanced monitoring to prevent future issues and confirmed a 25% discount on your next invoice. I’m available for a call on Tuesday at 10 AM or Wednesday at 2 PM to discuss further.\nBest regards,\nSviatoslav'
        }
      ]
    },
    'Personal': {
      defaultTitle: 'Personal Note Template',
      defaultTone: 'Friendly',
      defaultResponseLength: 30,
      ruleTemplates: [
        {
          name: 'Personal Note',
          conditions: ['personal', 'casual', 'friend'],
          sentiment: 'positive',
          instructions: 'Use a warm, sincere tone and address personal matters.'
        },
        {
          name: 'Thank You Note',
          conditions: ['thank you', 'appreciate', 'gratitude'],
          sentiment: 'positive',
          instructions: 'Express gratitude warmly and suggest staying in touch.'
        }
      ],
      requirementSnippets: [
        'Responses should be warm, sincere, and concise.',
        'Maintain a friendly and personal tone.'
      ],
      styleSnippets: [
        'Use conversational language and a warm closing.',
        'Keep responses brief and heartfelt.'
      ],
      emailExampleTemplates: [
        {
          name: 'Personal Note',
          value: 'Subject: Catching Up\n\nHi John,\nIt was great seeing you! Let’s catch up soon.\nBest,\nSviatoslav'
        }
      ]
    },
    'Event Invitation': {
      defaultTitle: 'Event Invitation Template',
      defaultTone: 'Friendly',
      defaultResponseLength: 30,
      ruleTemplates: [
        {
          name: 'Event Invite',
          conditions: ['invite', 'event', 'join'],
          sentiment: 'positive',
          instructions: 'Extend a warm invitation with event details.'
        },
        {
          name: 'RSVP Follow-Up',
          conditions: ['rsvp', 'confirm', 'attend'],
          sentiment: 'neutral',
          instructions: 'Politely follow up on RSVP and confirm details.'
        }
      ],
      requirementSnippets: [
        'Responses should be clear, inviting, and include event details.',
        'Use a friendly tone to encourage attendance.'
      ],
      styleSnippets: [
        'Use warm, structured language with a friendly closing.',
        'Include event details clearly, possibly with bullet points.'
      ],
      emailExampleTemplates: [
        {
          name: 'Event Invitation',
          value: 'Subject: Join Our Event!\n\nDear Sarah,\nYou’re invited to our event on...\nRSVP by...\nBest,\nSviatoslav'
        }
      ]
    },
    'Other': {
      defaultTitle: 'General Template',
      defaultTone: 'Professional',
      defaultResponseLength: 30,
      ruleTemplates: [
        {
          name: 'Generic Response',
          conditions: ['general', 'response', 'inquiry'],
          sentiment: 'neutral',
          instructions: 'Provide a clear, professional response to the inquiry.'
        }
      ],
      requirementSnippets: [
        'Responses should be flexible, clear, and professional.',
        'Adapt to the context of the inquiry.'
      ],
      styleSnippets: [
        'Use formal, adaptable language with a professional closing.',
        'Ensure clarity and conciseness.'
      ],
      emailExampleTemplates: [
        {
          name: 'Generic Response',
          value: 'Subject: Re: Your Inquiry\n\nDear Client,\nThank you for reaching out. Here’s the information...\nBest regards,\nSviatoslav'
        }
      ]
    }
  };

  // State for form inputs
  const [formData, setFormData] = useState({
    email: 'sviatoslav@bestwork.ai',
    title: '',
    category: '',
    contextRules: [],
    customRequirements: '',
    customResponseStyle: '',
    emailExamples: [''],
    responseLength: 30,
    tone: ''
  });

  // State for tracking manual title edits
  const [isTitleEdited, setIsTitleEdited] = useState(false);

  // State for validation errors
  const [errors, setErrors] = useState({});

  // State for current step
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { label: 'Basic Info', fields: ['email', 'title', 'category', 'tone'] },
    { label: 'Context Rules', fields: ['contextRules'] },
    { label: 'Response Style', fields: ['customRequirements', 'customResponseStyle'] },
    { label: 'Email Examples', fields: ['emailExamples'] },
    { label: 'Review & Submit', fields: ['responseLength'] }
  ];

  // Update fields when category changes
  useEffect(() => {
    if (formData.category && categorySettings[formData.category]) {
      const settings = categorySettings[formData.category];
      setFormData((prev) => ({
        ...prev,
        tone: settings.defaultTone,
        responseLength: settings.defaultResponseLength,
        contextRules: prev.contextRules.length ? prev.contextRules : [],
        customRequirements: prev.customRequirements || settings.requirementSnippets[0],
        customResponseStyle: prev.customResponseStyle || settings.styleSnippets[0],
        emailExamples: prev.emailExamples.some(ex => ex.trim()) ? prev.emailExamples : [settings.emailExampleTemplates[0].value],
        title: isTitleEdited ? prev.title : settings.defaultTitle
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        tone: '',
        responseLength: 30,
        contextRules: [],
        customRequirements: '',
        customResponseStyle: '',
        emailExamples: [''],
        title: ''
      }));
      setIsTitleEdited(false);
    }
  }, [formData.category, isTitleEdited]);

  // Validation logic for each step
  const validateStep = (step) => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (step === 1) {
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.title) newErrors.title = 'Title is required';
      if (!formData.category) newErrors.category = 'Category is required';
      else if (!categories.includes(formData.category)) newErrors.category = 'Invalid category';
      if (!formData.tone) newErrors.tone = 'Tone is required';
      else if (!tones.includes(formData.tone)) newErrors.tone = 'Invalid tone';
    } else if (step === 2) {
      if (!formData.category) {
        newErrors.contextRules = 'Please select a category in Step 1';
      } else if (formData.contextRules.length === 0) {
        newErrors.contextRules = 'At least one context rule is required';
      } else {
        formData.contextRules.forEach((rule, index) => {
          if (!rule.conditions.length) {
            newErrors[`contextRules[${index}].conditions`] = 'At least one condition is required';
          }
          if (!rule.sentiment) {
            newErrors[`contextRules[${index}].sentiment`] = 'Sentiment is required';
          }
          if (!rule.instructions.trim()) {
            newErrors[`contextRules[${index}].instructions`] = 'Instructions are required';
          }
        });
      }
    } else if (step === 3) {
      if (!formData.customRequirements) newErrors.customRequirements = 'Custom requirements are required';
      if (!formData.customResponseStyle) newErrors.customResponseStyle = 'Custom response style is required';
    } else if (step === 4) {
      if (!formData.emailExamples.some(ex => ex.trim())) {
        newErrors.emailExamples = 'At least one non-empty email example is required';
      }
    } else if (step === 5) {
      if (formData.responseLength === '' || isNaN(formData.responseLength)) {
        newErrors.responseLength = 'Response length is required';
      } else if (formData.responseLength < 0 || formData.responseLength > 100) {
        newErrors.responseLength = 'Response length must be between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (name === 'title') {
      setIsTitleEdited(true);
    }
  };

  // Handle context rule template selection
  const handleRuleTemplateSelect = (template) => {
    console.log('Adding rule template:', template);
    setFormData((prev) => ({
      ...prev,
      contextRules: [...prev.contextRules, { ...template }]
    }));
  };

  // Handle condition toggle
  const toggleCondition = (index, condition) => {
    console.log(`Toggling condition ${condition} for rule ${index}`);
    setFormData((prev) => {
      const newRules = [...prev.contextRules];
      if (!newRules[index]) return prev;
      const conditions = newRules[index].conditions || [];
      newRules[index].conditions = conditions.includes(condition)
        ? conditions.filter(c => c !== condition)
        : [...conditions, condition];
      return { ...prev, contextRules: newRules };
    });
  };

  // Handle custom condition input
  const handleCustomCondition = (index, customCondition) => {
    if (customCondition.trim()) {
      console.log(`Adding custom condition ${customCondition} for rule ${index}`);
      setFormData((prev) => {
        const newRules = [...prev.contextRules];
        if (!newRules[index]) return prev;
        const conditions = newRules[index].conditions || [];
        if (!conditions.includes(customCondition.trim())) {
          newRules[index].conditions = [...conditions, customCondition.trim()];
        }
        return { ...prev, contextRules: newRules };
      });
    }
  };

  // Handle rule field changes
  const handleRuleChange = (index, field, value) => {
    console.log(`Changing rule ${index} ${field} to ${value}`);
    setFormData((prev) => {
      const newRules = [...prev.contextRules];
      if (!newRules[index]) return prev;
      newRules[index][field] = value;
      return { ...prev, contextRules: newRules };
    });
  };

  // Remove context rule
  const removeContextRule = (index) => {
    console.log(`Removing rule ${index}`);
    setFormData((prev) => ({
      ...prev,
      contextRules: prev.contextRules.filter((_, i) => i !== index)
    }));
  };

  // Handle email example changes
  const handleEmailExampleChange = (index, value) => {
    console.log(`Changing email example ${index} to ${value}`);
    setFormData((prev) => {
      const newExamples = [...prev.emailExamples];
      newExamples[index] = value;
      return { ...prev, emailExamples: newExamples };
    });
  };

  // Add new email example
  const addEmailExample = (template = '') => {
    console.log('Adding email example:', template);
    setFormData((prev) => ({
      ...prev,
      emailExamples: [...prev.emailExamples, template]
    }));
  };

  // Remove email example
  const removeEmailExample = (index) => {
    console.log(`Removing email example ${index}`);
    setFormData((prev) => ({
      ...prev,
      emailExamples: prev.emailExamples.filter((_, i) => i !== index)
    }));
  };

  // Navigation handlers
  const nextStep = () => {
    if (validateStep(currentStep)) {
      console.log(`Advancing to step ${currentStep + 1}`);
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      console.log('Validation failed for step', currentStep);
    }
  };

  const prevStep = () => {
    console.log(`Returning to step ${currentStep - 1}`);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      const payload = {
        email: { S: formData.email },
        templateId: { S: Date.now().toString() },
        category: { S: formData.category },
        contextRules: { S: JSON.stringify(formData.contextRules) },
        customRequirements: { S: formData.customRequirements },
        customResponseStyle: { S: formData.customResponseStyle },
        emailExamples: { L: formData.emailExamples.filter(ex => ex.trim()).map(ex => ({ S: ex })) },
        title: { S: formData.title },
        responseLength: { N: formData.responseLength.toString() },
        tone: { S: formData.tone }
      };
      console.log('Form Submitted:', JSON.stringify(payload, null, 2));
      alert('Template forged successfully! Check console for JSON payload.');
    } else {
      console.log('Submission failed due to validation errors');
      alert('Please correct errors to forge the template.');
    }
  };

  return (
    <div className="template-form-container">
      <h2 className="form-title">Template Forge: Craft Neon Responses</h2>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${(currentStep / steps.length) * 100}%` }}></div>
      </div>
      <div className="step-indicator">
        {steps.map((step, index) => (
          <div key={index} className={`step ${currentStep === index + 1 ? 'active' : currentStep > index + 1 ? 'completed' : ''}`}>
            <span className="step-number">{index + 1}</span>
            <span className="step-label">{step.label}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="template-form">
        {currentStep === 1 && (
          <div className="step-content">
            <h3 className="step-title">Core Data Input</h3>
            <p className="step-intro">
              Initialize your email template by entering essential details. These settings define the template’s identity and tone in the neon-lit system.
            </p>
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  User Email Address
                  <span
                    className="tooltip"
                    title=" настроить этот шаблон в вашей учетной записи. Используется для идентификации и уведомлений системы."
                  >
                    ?
                  </span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="например, user@neonforge.ai"
                  className="form-input neon-glow"
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Template Name
                  <span
                    className="tooltip"
                    title="Provide a unique, descriptive name for your template (e.g., 'Urgent Complaint Response') to identify it in the system."
                  >
                    ?
                  </span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Urgent Complaint Response Template"
                  className="form-input neon-glow"
                />
                {errors.title && <span className="error">{errors.title}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Email Category
                  <span
                    className="tooltip"
                    title="Select the type of email this template will handle (e.g., Complaint/Issue Report). This sets default rules, tones, and examples."
                  >
                    ?
                  </span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select neon-glow"
                >
                  <option value="">Select an email category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <span className="error">{errors.category}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="tone" className="form-label">
                  Response Tone
                  <span
                    className="tooltip"
                    title="Choose the tone for generated email responses (e.g., Professional, Friendly). This influences the language and style."
                  >
                    ?
                  </span>
                </label>
                <select
                  id="tone"
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  className="form-select neon-glow"
                  disabled={!formData.category}
                >
                  <option value="">Select a tone</option>
                  {tones.map((tone) => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
                {errors.tone && <span className="error">{errors.tone}</span>}
                {!formData.category && (
                  <span className="helper-text">Select a category first to enable tone selection.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content">
            <h3 className="step-title">Holographic Context Rules</h3>
            <p className="step-intro">
              Forge context rules to trigger tailored responses based on email content. Define conditions, sentiments, and instructions to guide the AI’s neon responses.
            </p>
            <div className="form-section">
              <ErrorBoundary>
                {!formData.category ? (
                  <div className="error-message">
                    <p>Select an email category in Step 1 to configure context rules.</p>
                  </div>
                ) : (
                  <>
                    <div className="rule-template-selector">
                      <label className="form-label">
                        Quick Rule Templates
                        <span
                          className="tooltip"
                          title="Select pre-configured rule templates to instantly add conditions, sentiments, and instructions tailored to your chosen category."
                        >
                          ?
                        </span>
                      </label>
                      <div className="template-buttons">
                        {(categorySettings[formData.category] || categorySettings['Other']).ruleTemplates.map((template, index) => (
                          <button
                            key={index}
                            type="button"
                            className="template-button neon-glow"
                            onClick={() => handleRuleTemplateSelect({
                              conditions: template.conditions,
                              sentiment: template.sentiment,
                              instructions: template.instructions
                            })}
                          >
                            {template.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    {formData.contextRules.length === 0 && (
                      <p className="helper-text">
                        No rules added yet. Click a template above or create a custom rule to start.
                      </p>
                    )}
                    {formData.contextRules.map((rule, index) => (
                      <div key={index} className="context-rule holographic-card">
                        <h4 className="rule-title">Rule {index + 1}: Contextual Trigger</h4>
                        <div className="form-group">
                          <label className="form-label">
                            Trigger Conditions
                            <span
                              className="tooltip"
                              title="Select or add keywords that trigger this rule when detected in an email (e.g., 'urgent', 'complaint'). Multiple conditions can be combined."
                            >
                              ?
                            </span>
                          </label>
                          <div className="condition-tags">
                            {(conditionOptions[formData.category] || conditionOptions['Other']).map((condition) => (
                              <button
                                key={condition}
                                type="button"
                                className={`condition-tag ${rule.conditions.includes(condition) ? 'selected' : ''}`}
                                onClick={() => toggleCondition(index, condition)}
                              >
                                {condition}
                              </button>
                            ))}
                          </div>
                          <div className="custom-condition">
                            <input
                              type="text"
                              placeholder="e.g., priority, escalation"
                              className="form-input neon-glow"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                  handleCustomCondition(index, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="add-condition-button neon-glow"
                              onClick={(e) => {
                                const input = e.target.previousSibling;
                                if (input.value.trim()) {
                                  handleCustomCondition(index, input.value);
                                  input.value = '';
                                }
                              }}
                            >
                              Add Condition
                            </button>
                          </div>
                          {errors[`contextRules[${index}].conditions`] && (
                            <span className="error">{errors[`contextRules[${index}].conditions`]}</span>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor={`sentiment-${index}`} className="form-label">
                            Response Sentiment
                            <span
                              className="tooltip"
                              title="Select the emotional tone for the response when this rule is triggered (e.g., apologetic for complaints, urgent for critical issues)."
                            >
                              ?
                            </span>
                          </label>
                          <select
                            id={`sentiment-${index}`}
                            value={rule.sentiment}
                            onChange={(e) => handleRuleChange(index, 'sentiment', e.target.value)}
                            className="form-select neon-glow"
                          >
                            <option value="">Select sentiment</option>
                            {sentiments.map((sent) => (
                              <option key={sent} value={sent}>{sent}</option>
                            ))}
                          </select>
                          {errors[`contextRules[${index}].sentiment`] && (
                            <span className="error">{errors[`contextRules[${index}].sentiment`]}</span>
                          )}
                        </div>
                        <div className="form-group instructions-group">
                          <label htmlFor={`instructions-${index}`} className="form-label">
                            Response Instructions
                            <span
                              className="tooltip"
                              title="Specify how the AI should craft the response for this rule (e.g., 'Apologize sincerely and offer a discount' or 'Propose meeting times')."
                            >
                              ?
                            </span>
                          </label>
                          <select
                            id={`instructions-template-${index}`}
                            onChange={(e) => handleRuleChange(index, 'instructions', e.target.value)}
                            className="form-select neon-glow"
                            value=""
                          >
                            <option value="">Select a template instruction</option>
                            {(categorySettings[formData.category] || categorySettings['Other']).ruleTemplates.map((template, i) => (
                              <option key={i} value={template.instructions}>{template.instructions.slice(0, 50) + '...'}</option>
                            ))}
                          </select>
                          <textarea
                            id={`instructions-${index}`}
                            value={rule.instructions}
                            onChange={(e) => handleRuleChange(index, 'instructions', e.target.value)}
                            placeholder="e.g., Acknowledge issue, apologize, and propose a solution."
                            rows="3"
                            className="form-textarea"
                          />
                          {errors[`contextRules[${index}].instructions`] && (
                            <span className="error">{errors[`contextRules[${index}].instructions`]}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="remove-rule neon-glow"
                          onClick={() => removeContextRule(index)}
                        >
                          Delete This Rule
                        </button>
                      </div>
                    ))}
                    {errors.contextRules && <span className="error">{errors.contextRules}</span>}
                  </>
                )}
              </ErrorBoundary>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content">
            <h3 className="step-title">Response Style Configuration</h3>
            <p className="step-intro">
              Define the stylistic and structural preferences for your email responses to ensure they align with your brand’s neon signature.
            </p>
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="customRequirements" className="form-label">
                  Response Requirements
                  <span
                    className="tooltip"
                    title="Specify mandatory rules for response generation (e.g., 'Include a call to action' or 'Avoid technical jargon'). These ensure consistency."
                  >
                    ?
                  </span>
                </label>
                <select
                  id="customRequirements-template"
                  onChange={(e) => handleChange({ target: { name: 'customRequirements', value: e.target.value } })}
                  className="form-select neon-glow"
                  value=""
                >
                  <option value="">Select a requirement template</option>
                  {(categorySettings[formData.category] || categorySettings['Other']).requirementSnippets.map((snippet, index) => (
                    <option key={index} value={snippet}>{snippet.slice(0, 50) + '...'}</option>
                  ))}
                </select>
                <textarea
                  id="customRequirements"
                  name="customRequirements"
                  value={formData.customRequirements}
                  onChange={handleChange}
                  placeholder="e.g., Responses must be concise and include a clear next step."
                  rows="3"
                  className="form-textarea"
                />
                {errors.customRequirements && <span className="error">{errors.customRequirements}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="customResponseStyle" className="form-label">
                  Stylistic Preferences
                  <span
                    className="tooltip"
                    title="Define the style and format of responses (e.g., 'Use bullet points for clarity' or 'Include a formal closing with signature')."
                  >
                    ?
                  </span>
                </label>
                <select
                  id="customResponseStyle-template"
                  onChange={(e) => handleChange({ target: { name: 'customResponseStyle', value: e.target.value } })}
                  className="form-select neon-glow"
                  value=""
                >
                  <option value="">Select a style template</option>
                  {(categorySettings[formData.category] || categorySettings['Other']).styleSnippets.map((snippet, index) => (
                    <option key={index} value={snippet}>{snippet.slice(0, 50) + '...'}</option>
                  ))}
                </select>
                <textarea
                  id="customResponseStyle"
                  name="customResponseStyle"
                  value={formData.customResponseStyle}
                  onChange={handleChange}
                  placeholder="e.g., Use formal language and structured format with bullet points."
                  rows="3"
                  className="form-textarea"
                />
                {errors.customResponseStyle && <span className="error">{errors.customResponseStyle}</span>}
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="step-content">
            <h3 className="step-title">Sample Email Blueprints</h3>
            <p className="step-intro">
              Provide example emails to guide the AI in crafting responses. Use pre-built templates or write custom samples to shape the output.
            </p>
            <div className="form-section">
              <div className="example-template-selector">
                <label className="form-label">
                  Add Sample Templates
                  <span
                    className="tooltip"
                    title="Select pre-written email examples tailored to your category to use as a starting point for your samples."
                  >
                    ?
                  </span>
                </label>
                <div className="template-buttons">
                  {(categorySettings[formData.category] || categorySettings['Other']).emailExampleTemplates.map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      className="template-button neon-glow"
                      onClick={() => addEmailExample(template.value)}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
              {formData.emailExamples.map((example, index) => (
                <div key={index} className="email-example holographic-card">
                  <label className="form-label">
                    Email Sample {index + 1}
                    <span
                      className="tooltip"
                      title="Write or edit a sample email that the AI will reference when generating responses for this template."
                    >
                      ?
                    </span>
                  </label>
                  <textarea
                    value={example}
                    onChange={(e) => handleEmailExampleChange(index, e.target.value)}
                    placeholder="e.g., Subject: Issue Resolution\n\nDear [Name],\nWe apologize for the inconvenience...\nBest regards,\n[Your Name]"
                    rows="4"
                    className="form-textarea"
                  />
                  {formData.emailExamples.length > 1 && (
                    <button
                      type="button"
                      className="remove-example neon-glow"
                      onClick={() => removeEmailExample(index)}
                    >
                      Delete Sample
                    </button>
                  )}
                </div>
              ))}
              {errors.emailExamples && <span className="error">{errors.emailExamples}</span>}
              <button
                type="button"
                className="add-example neon-glow"
                onClick={() => addEmailExample()}
              >
                Add Another Sample
              </button>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="step-content">
            <h3 className="step-title">Review & Forge Template</h3>
            <p className="step-intro">
              Review your template’s configuration and set the response length. Submit to forge it into the system for neon-powered email generation.
            </p>
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="responseLength" className="form-label">
                  Response Length Preference
                  <span
                    className="tooltip"
                    title="Adjust the desired length of generated responses (0% for short and concise, 100% for detailed and comprehensive)."
                  >
                    ?
                  </span>
                </label>
                <input
                  type="range"
                  id="responseLength"
                  name="responseLength"
                  value={formData.responseLength}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="form-slider"
                />
                <span className="slider-value">
                  {formData.responseLength}% (
                  {formData.responseLength <= 33 ? 'Short (brief and concise)' : 
                   formData.responseLength <= 66 ? 'Medium (balanced detail)' : 
                   'Long (detailed and comprehensive)'})
                </span>
                {errors.responseLength && <span className="error">{errors.responseLength}</span>}
              </div>
              <div className="review-section">
                <h4>Template Preview</h4>
                <p className="helper-text">
                  Verify the details below to ensure your template is ready for deployment.
                </p>
                <div className="preview-box">
                  <p><strong>User Email:</strong> {formData.email}</p>
                  <p><strong>Template Name:</strong> {formData.title}</p>
                  <p><strong>Category:</strong> {formData.category || 'Not selected'}</p>
                  <p><strong>Tone:</strong> {formData.tone || 'Not selected'}</p>
                  <p><strong>Context Rules:</strong> {formData.contextRules.length} rule(s) configured</p>
                  <p><strong>Response Requirements:</strong> {formData.customRequirements.slice(0, 50) + '...'}</p>
                  <p><strong>Stylistic Preferences:</strong> {formData.customResponseStyle.slice(0, 50) + '...'}</p>
                  <p><strong>Email Samples:</strong> {formData.emailExamples.length} sample(s) provided</p>
                  <p><strong>Response Length:</strong> {formData.responseLength}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="navigation-buttons">
          {currentStep > 1 && (
            <button type="button" className="nav-button back-button neon-glow" onClick={prevStep}>
              Back to Previous
            </button>
          )}
          {currentStep < steps.length && (
            <button type="button" className="nav-button next-button neon-glow" onClick={nextStep}>
              Proceed to Next
            </button>
          )}
          {currentStep === steps.length && (
            <button type="submit" className="nav-button submit-button neon-glow">
              Forge Template
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TemplateInputForm;
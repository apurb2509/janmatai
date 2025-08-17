import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Select from 'react-select';

const topics = [
  { value: 'ui_design', label: 'UI Design' },
  { value: 'ux_experience', label: 'User Experience' },
  { value: '3d_map', label: '3D Narrative Map' },
  { value: 'axiom_bot', label: 'AxiomBot Chatbot' },
  { value: 'data_ingestion', label: 'Data Ingestion' },
  { value: 'clustering_accuracy', label: 'Clustering Accuracy' },
  { value: 'performance', label: 'Performance & Speed' },
  { value: 'timeline_filter', label: 'Timeline Filter' },
  { value: 'authentication', label: 'Login/Authentication' },
  { value: 'feature_request', label: 'New Feature Request' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'data_sources', label: 'Data Sources' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'api_quota', label: 'API Quota Issues' },
  { value: 'branding', label: 'Branding & Logo' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'mobile_view', label: 'Mobile View' },
  { value: 'privacy', label: 'Privacy Concerns' },
  { value: 'security', label: 'Security' },
  { value: 'account_management', label: 'Account Management' },
  { value: 'email_notifications', label: 'Email Notifications' },
  { value: 'user_profile', label: 'User Profile' },
  { value: 'search_functionality', label: 'Search Functionality' },
  { value: 'share_options', label: 'Sharing Options' },
  { value: 'text_analysis', label: 'Text Analysis' },
  { value: 'translation', label: 'Translation & Language' },
  { value: 'visual_style', label: 'Visual Style' },
  { value: 'onboarding', label: 'Onboarding Process' },
  { value: 'third_party_integrations', label: 'Third-Party Integrations' },
  { value: 'general_feedback', label: 'General Feedback' },
].sort((a, b) => a.label.localeCompare(b.label));

const selectStyles = {
  control: (styles) => ({ ...styles, backgroundColor: 'rgba(20, 20, 20, 0.7)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#fff', minHeight: '50px' }),
  menu: (styles) => ({ ...styles, backgroundColor: '#1c1c1c', border: '1px solid #555', borderRadius: '8px' }),
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: isSelected ? '#FF00FF' : isFocused ? 'rgba(255, 0, 255, 0.2)' : '#1c1c1c',
    color: isSelected ? '#fff' : '#eee',
    ':active': { ...styles[':active'], backgroundColor: '#FF00FF' },
  }),
  multiValue: (styles) => ({ ...styles, background: 'linear-gradient(90deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2))', borderRadius: '6px' }),
  multiValueLabel: (styles) => ({ ...styles, color: '#fff', fontWeight: '500' }),
  multiValueRemove: (styles) => ({ ...styles, color: '#fff', ':hover': { backgroundColor: '#FF00FF', color: 'white' } }),
  input: (styles) => ({ ...styles, color: '#fff' }),
  placeholder: (styles) => ({ ...styles, color: 'rgba(255, 255, 255, 0.5)' }),
};

const FormWrapper = styled(motion.div)`
  background: rgba(20, 20, 20, 0.4);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem 4rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const Label = styled.label`
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  padding-left: 0.25rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(20, 20, 20, 0.7);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: #FF00FF;
    box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(20, 20, 20, 0.7);
  color: #fff;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: #FF00FF;
    box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const SubmitButton = styled(motion.button)`
  padding: 0.75rem 2rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(90deg, #FF00FF, #00FFFF);
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  text-shadow: 0 0 5px rgba(0,0,0,0.5);
`;

const ClearButton = styled(motion.button)`
  padding: 0.75rem 2rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: #ccc;
  font-weight: bold;
  cursor: pointer;
`;

const MessageDisplay = styled.div`
  min-height: 24px;
  text-align: center;
  font-size: 0.9rem;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
`;
const SuccessMessage = styled.div`
  color: #1dd1a1;
`;

export const SuggestionForm: React.FC = () => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [selectedTags, setSelectedTags] = useState<any[]>([]);
    const [suggestionText, setSuggestionText] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(true);

    const handleTagChange = (selectedOptions) => {
        if (selectedOptions.length > 3) {
            setError('Maximum 3 tags allowed.');
            setTimeout(() => setError(''), 3000);
            return;
        }
        setError('');
        setSelectedTags(selectedOptions);
    };

    const clearForm = () => {
        setName('');
        setAge('');
        setSelectedTags([]);
        setSuggestionText('');
        setError('');
        setSuccess('');
        setIsEditing(true);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (selectedTags.length < 1) {
            setError('Please select at least one description tag.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/submit-suggestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    age: Number(age) || null,
                    description_tags: selectedTags.map(tag => tag.value),
                    suggestion_text: suggestionText
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit.');
            }
            setSuccess(data.message);
            setIsEditing(false);
        } catch (err) {
            if (err instanceof SyntaxError) {
                setError("Received an invalid response from the server. Please check if the backend is running correctly.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        }
    };
    
    return (
        <FormWrapper>
            <Form onSubmit={handleSubmit}>
                <InputRow>
                    <InputGroup>
                        <Label htmlFor="name">Name (Optional)</Label>
                        <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} disabled={!isEditing} />
                    </InputGroup>
                    <InputGroup>
                        <Label htmlFor="age">Age (Optional)</Label>
                        <Input id="age" type="number" value={age} onChange={e => setAge(e.target.value)} disabled={!isEditing} />
                    </InputGroup>
                </InputRow>
                <InputGroup>
                    <Label htmlFor="tags">Description Tags (Select 1-3)</Label>
                    <Select
                        id="tags"
                        isMulti
                        options={topics}
                        value={selectedTags}
                        onChange={handleTagChange}
                        styles={selectStyles}
                        placeholder="Search and select tags..."
                        noOptionsMessage={() => 'No matching topics found'}
                        isDisabled={!isEditing}
                    />
                </InputGroup>
                <InputGroup>
                    <Label htmlFor="suggestion">Improvements / Suggestions</Label>
                    <TextArea id="suggestion" value={suggestionText} onChange={e => setSuggestionText(e.target.value)} required disabled={!isEditing} />
                </InputGroup>
                <MessageDisplay>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    {success && <SuccessMessage>{success}</SuccessMessage>}
                </MessageDisplay>
                <ButtonRow>
                    {isEditing ? (
                        <>
                            <ClearButton type="button" onClick={clearForm} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                Clear
                            </ClearButton>
                            <SubmitButton type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                Send Feedback
                            </SubmitButton>
                        </>
                    ) : (
                        <ClearButton type="button" onClick={() => setIsEditing(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            Edit
                        </ClearButton>
                    )}
                </ButtonRow>
            </Form>
        </FormWrapper>
    );
};

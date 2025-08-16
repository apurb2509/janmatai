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
  control: (styles) => ({ ...styles, backgroundColor: '#333', border: '1px solid #555', borderRadius: '8px', color: '#fff' }),
  menu: (styles) => ({ ...styles, backgroundColor: '#282828', border: '1px solid #555', borderRadius: '8px' }),
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: isSelected ? '#00FFFF' : isFocused ? '#444' : '#282828',
    color: isSelected ? '#000' : '#fff',
    ':active': { ...styles[':active'], backgroundColor: '#00FFFF' },
  }),
  multiValue: (styles) => ({ ...styles, backgroundColor: 'rgba(0, 255, 255, 0.2)', borderRadius: '6px' }),
  multiValueLabel: (styles) => ({ ...styles, color: '#00FFFF' }),
  multiValueRemove: (styles) => ({ ...styles, color: '#00FFFF', ':hover': { backgroundColor: '#00FFFF', color: 'black' } }),
  input: (styles) => ({ ...styles, color: '#fff' }),
  singleValue: (styles) => ({ ...styles, color: '#fff' }),
};

const FormWrapper = styled(motion.div)`
  background: rgba(40, 40, 40, 0.4);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem 4rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
`;

const InputRow = styled.div`
  display: flex;
  gap: 1rem;
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
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #555;
  background-color: #333;
  color: #fff;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #555;
  background-color: #333;
  color: #fff;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const SubmitButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: #00FFFF;
  color: #000;
  font-weight: bold;
  cursor: pointer;
`;

const ClearButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #555;
  background: transparent;
  color: #ccc;
  font-weight: bold;
  cursor: pointer;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 0.9rem;
  text-align: center;
`;
const SuccessMessage = styled.div`
  color: #1dd1a1;
  font-size: 0.9rem;
  text-align: center;
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
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        }
    };
    
    return (
        <FormWrapper>
            <Form>
                <InputRow>
                    <InputGroup>
                        <Label htmlFor="name">Name</Label>
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
                {error && <ErrorMessage>{error}</ErrorMessage>}
                {success && <SuccessMessage>{success}</SuccessMessage>}
                <ButtonRow>
                    {isEditing ? (
                        <>
                            <ClearButton type="button" onClick={clearForm} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                Clear
                            </ClearButton>
                            <SubmitButton type="submit" onClick={handleSubmit} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
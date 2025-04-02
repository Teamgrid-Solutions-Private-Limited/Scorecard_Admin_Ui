import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Stack, Typography, TextField, Grid, InputLabel,
  MenuItem, FormControl, Select, Button, ButtonGroup, Switch,
  Alert, CircularProgress
} from '@mui/material';
import { CloudUpload, DeleteForever, Add } from '@mui/icons-material';
import { Editor } from '@tinymce/tinymce-react';
import { styled } from '@mui/material/styles';

// Redux actions
import { getHouseById, updateHouse, createHouse } from '../redux/slice/houseSlice';
import {
  getHouseDataByHouseId,
  updateHouseData,
  createHouseData,
} from '../redux/slice/houseTermSlice';
import { clearVoteState } from '../redux/slice/voteSlice';
import { getAllTerms } from '../redux/slice/termSlice';

// Components
import SideMenu from './components/SideMenu';
import AppTheme from '/shared-theme/AppTheme';
import Copyright from './internals/components/Copyright';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const initialState = {
  name: '',
  btn: '',
  district: '',
  party: '',
  photo: '',
  photoPreview: '',
  termId: '',
  rating: '',
  summary: '',
  currentTerm: false,
  votes: [{ id: 1, voteId: '', score: '' }],
  activities: [{ id: 1, activityId: '', score: '' }]
};

// Sub-component for Representative Information Section
const RepresentativeInfo = ({ formData, handleChange, handleFileChange }) => (
  <Paper elevation={2} sx={{ width: '100%' }}>
    <Box sx={{ p: 5 }}>
      <Typography variant="h6" gutterBottom sx={{ pb: 3 }}>
        Representative's Information
      </Typography>
      <Grid container rowSpacing={2} columnSpacing={2} alignItems="center">
        <Grid item xs={2}>
          <InputLabel sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end', fontWeight: 700 }}>
            Representative's Name
          </InputLabel>
        </Grid>
        <Grid item xs={4}>
          <TextField
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={1}>
          <InputLabel sx={{ display: 'flex', justifyContent: 'end', fontWeight: 700 }}>
            Status
          </InputLabel>
        </Grid>
        <Grid item xs={5}>
          <ButtonGroup
            variant="outlined"
            name="btn"
            value={formData.btn}
            onChange={handleChange}
          >
            <Button>Active</Button>
            <Button>Former</Button>
          </ButtonGroup>
        </Grid>
        <Grid item xs={2}>
          <InputLabel sx={{ display: 'flex', justifyContent: 'end', fontWeight: 700 }}>
            State
          </InputLabel>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <Select
              name="district"
              value={formData.district}
              onChange={handleChange}
            >
              <MenuItem value="New York">New York</MenuItem>
              <MenuItem value="Chicago">Chicago</MenuItem>
              <MenuItem value="California">California</MenuItem>
              <MenuItem value="Nc">NC</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={1}>
          <InputLabel sx={{ display: 'flex', justifyContent: 'end', fontWeight: 700 }}>
            Party
          </InputLabel>
        </Grid>
        <Grid item xs={5}>
          <FormControl fullWidth>
            <Select
              name="party"
              value={formData.party}
              onChange={handleChange}
            >
              <MenuItem value="republican">Republican</MenuItem>
              <MenuItem value="democrat">Democrat</MenuItem>
              <MenuItem value="independent">Independent</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          <InputLabel sx={{ display: 'flex', justifyContent: 'end', fontWeight: 700 }}>
            Photo
          </InputLabel>
        </Grid>
        <Grid item xs={10}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {formData.photo ? (
              <img
                src={typeof formData.photo === 'string' ? formData.photo : formData.photoPreview}
                alt="Representative"
                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '8px' }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No photo uploaded
              </Typography>
            )}
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUpload />}
            >
              Upload
              <VisuallyHiddenInput
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  </Paper>
);

// Sub-component for Score Repeater
const ScoreRepeater = ({
  items,
  onAdd,
  onRemove,
  title,
  idField,
  scoreField,
  idOptions,
  scoreOptions
}) => (
  <>
    {items.map((item, index) => (
      <Grid container key={item.id} spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={2}>
          <InputLabel sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end', fontWeight: 700 }}>
            {index === 0 ? title : ''}
          </InputLabel>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <Select
              name={`${idField}-${item.id}`}
              value={item[idField]}
              onChange={(e) => onAdd(e, item.id, idField)}
            >
              {idOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={5}>
          <FormControl fullWidth>
            <Select
              name={`${scoreField}-${item.id}`}
              value={item[scoreField]}
              onChange={(e) => onAdd(e, item.id, scoreField)}
            >
              {scoreOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={1}>
          {items.length > 1 && (
            <Button onClick={() => onRemove(item.id)}>
              <DeleteForever color="error" />
            </Button>
          )}
        </Grid>
      </Grid>
    ))}
  </>
);

// Sub-component for Term Information Section
const TermInfo = ({
  formData,
  terms,
  handleChange,
  handleEditorChange,
  handleAddVote,
  handleRemoveVote,
  handleAddActivity,
  handleRemoveActivity
}) => {
  const voteOptions = [
    { value: 'vote1', label: 'Vote Option 1' },
    { value: 'vote2', label: 'Vote Option 2' },
  ];

  const scoreOptions = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
  ];

  const activityOptions = [
    { value: 'activity1', label: 'Activity 1' },
    { value: 'activity2', label: 'Activity 2' },
  ];

  return (
    <Paper elevation={2} sx={{ width: '100%', mb: 5 }}>
      <Box sx={{ p: 5 }}>
        <Typography variant="h6" gutterBottom sx={{ pb: 3 }}>
          Representative's Term Information
        </Typography>
        <Grid container rowSpacing={2} columnSpacing={2} alignItems="center">
          <Grid item xs={2}>
            <InputLabel sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end', fontWeight: 700 }}>
              Term
            </InputLabel>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <Select
                name="termId"
                value={formData.termId}
                onChange={handleChange}
              >
                <MenuItem value="" disabled>Select term</MenuItem>
                {terms?.map(term => (
                  <MenuItem key={term._id} value={term._id}>{term.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={1}>
            <InputLabel sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end', fontWeight: 700 }}>
              Rating
            </InputLabel>
          </Grid>
          <Grid item xs={5}>
            <FormControl fullWidth>
              <Select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
              >
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="F">F</MenuItem>
                <MenuItem value="B">B</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <InputLabel sx={{ display: 'flex', justifyContent: 'end', fontWeight: 700 }}>
              Term Summary
            </InputLabel>
          </Grid>
          <Grid item xs={10}>
            <Editor
              apiKey="nbxuqfjn2kwm9382tv3bi98nn95itbawmplf1l3x826f16u4"
              value={formData.summary}
              onEditorChange={(content) => handleEditorChange(content, 'summary')}
              init={{
                height: 250,
                menubar: false,
                plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'],
                toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <InputLabel sx={{ display: 'flex', justifyContent: 'end', fontWeight: 700 }}>
              Current Term
            </InputLabel>
          </Grid>
          <Grid item xs={10}>
            <Switch
              name="currentTerm"
              checked={formData.currentTerm}
              onChange={handleChange}
              color="warning"
            />
          </Grid>

          {/* Votes Section */}
          <Grid item xs={12}>
            <ScoreRepeater
              items={formData.votes}
              onAdd={(e, id, field) => {
                const updatedVotes = formData.votes.map(vote => 
                  vote.id === id ? { ...vote, [field]: e.target.value } : vote
                );
                handleChange({ target: { name: 'votes', value: updatedVotes } });
              }}
              onRemove={handleRemoveVote}
              title="Scored Vote"
              idField="voteId"
              scoreField="score"
              idOptions={voteOptions}
              scoreOptions={scoreOptions}
            />
            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Button variant="contained" startIcon={<Add />} onClick={handleAddVote}>
                Add Vote
              </Button>
            </Box>
          </Grid>

          {/* Activities Section */}
          <Grid item xs={12} sx={{ mt: 4 }}>
            <ScoreRepeater
              items={formData.activities}
              onAdd={(e, id, field) => {
                const updatedActivities = formData.activities.map(activity => 
                  activity.id === id ? { ...activity, [field]: e.target.value } : activity
                );
                handleChange({ target: { name: 'activities', value: updatedActivities } });
              }}
              onRemove={handleRemoveActivity}
              title="Tracked Activity"
              idField="activityId"
              scoreField="score"
              idOptions={activityOptions}
              scoreOptions={scoreOptions}
            />
            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Button variant="contained" startIcon={<Add />} onClick={handleAddActivity}>
                Add Activity
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

// Main Component
export default function AddRepresentative() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  
  // Redux state
  const { house: selectedHouse } = useSelector(state => state.house);
  const { houseData: selectedHouseData } = useSelector(state => state.houseData);
  const { terms } = useSelector(state => state.term);
  
  // Local state
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    if (id) {
      dispatch(getHouseById(id));
      dispatch(getHouseDataByHouseId(id));
    }
    dispatch(getAllTerms());
    
    return () => {
      dispatch(clearVoteState());
    };
  }, [id, dispatch]);

  // Pre-fill form when data loads - ONLY ONCE
  useEffect(() => {
    if ((selectedHouse || selectedHouseData) && !isInitialized) {
      const extractedState = selectedHouse?.district?.split(', ').pop() || '';
      const termId = selectedHouseData[0]?.termId?._id || selectedHouseData?.termId || '';
      
      setFormData({
        name: selectedHouse?.name || '',
        btn: selectedHouse?.btn || '',
        district: extractedState,
        party: selectedHouse?.party || '',
        photo: selectedHouse?.photo || '',
        termId,
        rating: selectedHouseData[0]?.rating || '',
        summary: selectedHouseData[0]?.summary || '',
        currentTerm: selectedHouseData[0]?.currentTerm || false,
        votes: selectedHouseData[0]?.votesScore?.map((vote, index) => ({
          id: index + 1,
          voteId: vote.voteId,
          score: vote.score
        })) || [{ id: 1, voteId: '', score: '' }],
        activities: selectedHouseData[0]?.activitiesScore?.map((activity, index) => ({
          id: index + 1,
          activityId: activity.activityId,
          score: activity.score
        })) || [{ id: 1, activityId: '', score: '' }]
      });
      
      setIsInitialized(true);
    }
  }, [selectedHouse, selectedHouseData, isInitialized]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditorChange = (content, fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: content }));
  };

  const handleAddVote = () => {
    setFormData(prev => ({
      ...prev,
      votes: [...prev.votes, { id: Date.now(), voteId: '', score: '' }]
    }));
  };

  const handleRemoveVote = (id) => {
    setFormData(prev => ({
      ...prev,
      votes: prev.votes.filter(item => item.id !== id)
    }));
  };

  const handleAddActivity = () => {
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, { id: Date.now(), activityId: '', score: '' }]
    }));
  };

  const handleRemoveActivity = (id) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter(item => item.id !== id)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isInitialized && id) return; // Prevent save before initialization
    
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Validate required fields
      if (!formData.name || !formData.termId) {
        throw new Error('Name and Term are required fields');
      }

      // Prepare house data
      const houseFormData = new FormData();
      houseFormData.append('name', formData.name);
      houseFormData.append('btn', formData.btn);
      houseFormData.append('district', formData.district);
      houseFormData.append('party', formData.party);
      if (formData.photo instanceof File) {
        houseFormData.append('photo', formData.photo);
      } else if (typeof formData.photo === 'string') {
        houseFormData.append('photo', formData.photo);
      }

      let houseId = id;
      
      // If we have an ID, we should only update, not create
      if (houseId) {
        // Update house
        await dispatch(updateHouse({ id: houseId, formData: houseFormData })).unwrap();
        
        // Prepare house term data
        const houseTermPayload = {
          houseId,
          termId: formData.termId,
          summary: formData.summary,
          rating: formData.rating,
          currentTerm: formData.currentTerm,
          votesScore: formData.votes.filter(v => v.voteId && v.score),
          activitiesScore: formData.activities.filter(a => a.activityId && a.score)
        };

        // Check if we have existing house data to update
        const existingHouseDataId = selectedHouseData[0]?._id || selectedHouseData?._id;
        if (existingHouseDataId) {
          await dispatch(updateHouseData({ id: existingHouseDataId, data: houseTermPayload })).unwrap();
        } else {
          throw new Error('Cannot update - no existing term data found for this representative');
        }
      } else {
        // No ID - create new entries
        const response = await dispatch(createHouse(houseFormData)).unwrap();
        houseId = response.id;

        // Prepare house term data
        const houseTermPayload = {
          houseId,
          termId: formData.termId,
          summary: formData.summary,
          rating: formData.rating,
          currentTerm: formData.currentTerm,
          votesScore: formData.votes.filter(v => v.voteId && v.score),
          activitiesScore: formData.activities.filter(a => a.activityId && a.score)
        };

        await dispatch(createHouseData(houseTermPayload)).unwrap();
      }

      setSubmitSuccess(true);
    } catch (error) {
      console.error('Save failed:', error);
      setSubmitError(error.message || 'Failed to save representative data');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isInitialized && id) {
    return (
      <AppTheme>
        <Box sx={{ display: 'flex' }}>
          <SideMenu />
          <Box component="main" sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </Box>
        </Box>
      </AppTheme>
    );
  }

  return (
    <AppTheme>
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Stack spacing={2} sx={{ alignItems: 'center', mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
            <Typography variant="h4" sx={{ pt: 5, color: 'text.secondary' }}>
              {id ? 'Edit Representative' : 'Add New Representative'} - SBA Scorecard Management System
            </Typography>

            {/* Status messages */}
            {submitError && <Alert severity="error" sx={{ width: '100%' }}>{submitError}</Alert>}
            {submitSuccess && <Alert severity="success" sx={{ width: '100%' }}>Representative saved successfully!</Alert>}

            <Stack direction="row" spacing={2} width="100%" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={isSubmitting || (id && !isInitialized)}
                sx={{ '&:hover': { backgroundColor: 'green' } }}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Save'}
              </Button>
              <Button variant="outlined">Fetch from Quorum</Button>
            </Stack>

            <RepresentativeInfo 
              formData={formData} 
              handleChange={handleChange} 
              handleFileChange={handleFileChange} 
            />

            <TermInfo
              formData={formData}
              terms={terms}
              handleChange={handleChange}
              handleEditorChange={handleEditorChange}
              handleAddVote={handleAddVote}
              handleRemoveVote={handleRemoveVote}
              handleAddActivity={handleAddActivity}
              handleRemoveActivity={handleRemoveActivity}
            />
            
            <Copyright sx={{ my: 4 }} />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}